/**
 * Turns case state into engine input, resolving every auto-derived value
 * against its manual override and recording where the value came from so the
 * UI can tag it (PRD 6.3 and 6.8: auto-filled values are marked with their
 * source and stay editable).
 */

import {
  DEFAULT_FACILITY_FIX_ERROR_NM,
  DEFAULT_SPEED_CORRECTION_FACTOR,
  DEFAULT_LEEWAY_ERROR_KT,
  DEFAULT_TARGET_FIX_ERROR_NM,
  FIX_ERROR_BY_CRAFT,
  FIX_ERROR_BY_NAVIGATION,
  fatigueCorrectionFactor,
  getLeewayEntry,
  getSweepWidthTable,
  leewayErrorForObject,
  speedCorrectionFactor,
  lookupSweepWidth,
  safetyFactorForStage,
  weatherCorrectionFactor,
  type AssetCalculationInput,
  type CaseCalculationInput,
  type WeatherObjectClass,
} from '../engine';
import type { AssetState, CaseState, Override } from './types';
import { translator, type Translator } from './i18n';

/**
 * Provenance labels are prose and so are translated, but the selectors stay
 * pure functions of their arguments: the translator comes in as a parameter
 * rather than being read from a store. English is the default so a caller
 * that has no opinion - the engine tests, a script - still gets readable
 * labels, and the UI passes the user's language in.
 */
const EN = translator('en');

/** getSweepWidthTable throws on an unknown id; the platform lookup must not. */
function sweepTableOrUndefined(id: string) {
  try {
    return getSweepWidthTable(id);
  } catch {
    return undefined;
  }
}

export interface Resolved {
  /** The value the engine will use. */
  value: number;
  /** The table or formula value, before any override. */
  autoValue: number;
  /** True when no override is set, so the auto value is in force. */
  isAuto: boolean;
  /** Where the auto value came from, for the "Auto-filled from ..." tag. */
  sourceLabel: string;
  /** Set when the source gives a rule rather than a number: needs attention. */
  warning?: string;
}

export function resolve(
  autoValue: number,
  override: Override,
  sourceLabel: string,
  warning?: string,
): Resolved {
  return {
    value: override ?? autoValue,
    autoValue,
    isAuto: override === null,
    sourceLabel,
    warning: override === null ? warning : undefined,
  };
}

/** Drift time in hours: distress time to search start time, or an override. */
export function resolveDriftTime(c: CaseState, t: Translator = EN): Resolved {
  const from = Date.parse(c.distressTimeIso);
  const to = Date.parse(c.searchStartTimeIso);
  const auto =
    Number.isFinite(from) && Number.isFinite(to) ? Math.max(0, (to - from) / 3_600_000) : 0;
  return resolve(auto, c.driftTimeOverride, t('source.distressToStart'));
}

export interface FixErrorOption {
  id: string;
  label: string;
  /** Heading for the select menu. */
  group: string;
  /** Short source reference for the "auto-filled from" tag and the report. */
  tableRef: string;
  errorNm?: number;
  rule?: string;
  /** The source asterisks this row: evaluate upward according to circumstances. */
  evaluateUpward?: boolean;
}

/** Every fix-error entry the app offers, from both Appendix D-6 tables. */
export function fixErrorOptions(t: Translator = EN): FixErrorOption[] {
  return [
    ...FIX_ERROR_BY_NAVIGATION.map((e) => ({
      id: e.id,
      label: t.data(e.label),
      group: t('group.navMeans'),
      tableRef: 'Table D-6:1',
      errorNm: e.errorNm,
      rule: e.rule === undefined ? undefined : t.data(e.rule),
      evaluateUpward: e.evaluateUpward,
    })),
    ...FIX_ERROR_BY_CRAFT.map((e) => ({
      id: `craft:${e.id}`,
      label: t.data(e.label),
      group: t('group.navUnknown'),
      tableRef: 'Table D-6:2',
      errorNm: e.errorNm,
    })),
  ];
}

function resolveFixError(
  sourceId: string,
  override: Override,
  fallbackNm: number,
  t: Translator,
): Resolved {
  const option = fixErrorOptions(t).find((o) => o.id === sourceId);
  if (!option) return resolve(fallbackNm, override, t('source.manualEntry'));
  const source = t('source.fixError', { label: option.label, table: option.tableRef });
  if (option.errorNm !== undefined && option.evaluateUpward) {
    return resolve(option.errorNm, override, source, t('source.fixEvaluateUpward'));
  }
  if (option.errorNm === undefined) {
    // The source gives a rule, not a number (INS, VOR, TACAN). Fall back to
    // the manual's practical default and tell the planner to work the rule.
    return resolve(
      fallbackNm,
      override,
      source,
      t('source.fixErrorRule', { label: option.label, rule: option.rule ?? '' }),
    );
  }
  return resolve(option.errorNm, override, source);
}

/** X: drifting start point error, nm. */
export const resolveX = (c: CaseState, t: Translator = EN): Resolved =>
  resolveFixError(c.xSourceId, c.xOverride, DEFAULT_TARGET_FIX_ERROR_NM, t);

/** Y: search facility position error, nm. */
export const resolveY = (c: CaseState, t: Translator = EN): Resolved =>
  resolveFixError(c.ySourceId, c.yOverride, DEFAULT_FACILITY_FIX_ERROR_NM, t);

/**
 * LWe: leeway error, kt.
 *
 * Measured per craft type by Allen & Plourde where the source has a confident
 * row for the chosen search object, and the flat manual default where it does
 * not. The warning carries the caveat the source itself raises: a value taken
 * from a printed floor rather than a measurement is a minimum, not a figure.
 */
export function resolveLwe(c: CaseState, t: Translator = EN): Resolved {
  const entry = leewayErrorForObject(c.leewayObjectId);
  if (!entry) {
    return resolve(DEFAULT_LEEWAY_ERROR_KT, c.lweOverride, t('source.lweDefault'));
  }
  return resolve(
    entry.lweKt,
    c.lweOverride,
    t('source.lweTable', { ref: entry.ref }),
    entry.syxIsFloor ? t('source.lweFloor', { syx: entry.syxCmS }) : undefined,
  );
}

/** fs: optimal search / safety factor. */
export const resolveFs = (c: CaseState, t: Translator = EN): Resolved =>
  resolve(safetyFactorForStage(c.searchStage), c.fsOverride, t('source.safetyTable'));

export interface ResolvedLeeway {
  multiplier: Resolved;
  modifier: Resolved;
  divergenceAngleDeg: Resolved;
}

export function resolveLeeway(c: CaseState, t: Translator = EN): ResolvedLeeway {
  const entry = getLeewayEntry(c.leewayObjectId);
  const source = t('source.leewayTable');
  return {
    multiplier: resolve(entry.multiplier, c.leewayMultiplierOverride, source),
    modifier: resolve(entry.modifier, c.leewayModifierOverride, source),
    divergenceAngleDeg: resolve(entry.divergenceAngleDeg, c.leewayDivergenceOverride, source),
  };
}

export interface ResolvedAsset {
  asset: AssetState;
  w0: Resolved;
  fw: Resolved;
  ff: Resolved;
  fv: Resolved;
  /** The weather class in force, and whether it came from the case. */
  weatherClass: WeatherObjectClass;
  weatherClassIsAuto: boolean;
  /** True when W0 was interpolated between two visibility columns. */
  w0Interpolated: boolean;
  /** True when fv was interpolated between two printed search speeds. */
  fvInterpolated: boolean;
  /** Footnote from the sweep width table row, where the source has one. */
  w0Note?: string;
}

export function resolveAsset(asset: AssetState, c: CaseState, t: Translator = EN): ResolvedAsset {
  let autoW0 = 0;
  let interpolated = false;
  let note: string | undefined;
  let sourceLabel = t('source.sweepWidthTable');
  try {
    const lookup = lookupSweepWidth(asset.sweepTableId, asset.sweepObject, c.visibilityKm);
    autoW0 = lookup.w0;
    interpolated = lookup.interpolated;
    note = lookup.note === undefined ? undefined : t.data(lookup.note);
    sourceLabel = t('source.sweepWidthFrom', {
      table: lookup.sourceTable,
      platform: t.data(getSweepWidthTable(asset.sweepTableId).label),
    });
  } catch {
    // The chosen table has no row for the chosen object: leave W0 at 0 so the
    // planner sees the gap rather than a fabricated number.
    sourceLabel = t('source.noTableRow');
  }

  // The class belongs to the search object, so the case answers it and the
  // facility inherits unless it has been deliberately overridden.
  const weatherClass = asset.weatherObjectClassOverride ?? c.weatherObjectClass;
  // Table D-5:8 covers aircraft only, and only for maritime search objects.
  const platform = sweepTableOrUndefined(asset.sweepTableId)?.platform;
  const speedPlatform =
    platform === 'fixed-wing-water'
      ? 'fixed-wing'
      : platform === 'helicopter-water'
        ? 'helicopter'
        : null;
  const speed = speedCorrectionFactor(speedPlatform, asset.speedKt, asset.sweepObject);

  const weather = weatherCorrectionFactor(
    c.windSpeedKt,
    weatherClass,
    c.seaHeightM ?? undefined,
  );

  return {
    asset,
    w0: resolve(
      autoW0,
      asset.w0Override,
      sourceLabel,
      interpolated ? t('source.interpolated', { km: c.visibilityKm }) : undefined,
    ),
    fw: resolve(
      weather.factor,
      asset.fwOverride,
      t('source.weatherBand', {
        band: t.data(weather.band.label),
        drivenBy: weather.drivenBy === 'sea' ? t('drivenBy.sea') : t('drivenBy.wind'),
      }),
    ),
    ff: resolve(
      fatigueCorrectionFactor(asset.crewFatigued),
      asset.ffOverride,
      asset.crewFatigued ? t('source.fatigueTired') : t('source.fatigueRested'),
    ),
    fv: resolve(
      speed.factor,
      asset.fvOverride,
      speed.noRow ? t('source.fvNoRow') : t('source.fvTable', { row: t.data(speed.row ?? '') }),
      speed.interpolated ? t('source.fvInterpolated', { speed: asset.speedKt }) : undefined,
    ),
    fvInterpolated: speed.interpolated,
    weatherClass,
    weatherClassIsAuto: asset.weatherObjectClassOverride === null,
    w0Interpolated: interpolated,
    w0Note: note,
  };
}

export const DEFAULT_FV = DEFAULT_SPEED_CORRECTION_FACTOR;

export interface DerivedCase {
  driftTime: Resolved;
  leeway: ResolvedLeeway;
  lwe: Resolved;
  x: Resolved;
  y: Resolved;
  fs: Resolved;
  assets: ResolvedAsset[];
  engineInput: CaseCalculationInput;
}

export function deriveCase(c: CaseState, t: Translator = EN): DerivedCase {
  const driftTime = resolveDriftTime(c, t);
  const leeway = resolveLeeway(c, t);
  const x = resolveX(c, t);
  const y = resolveY(c, t);
  const fs = resolveFs(c, t);
  const lwe = resolveLwe(c, t);
  const assets = c.assets.map((a) => resolveAsset(a, c, t));

  const engineAssets: AssetCalculationInput[] = assets.map((r) => ({
    id: r.asset.id,
    name: r.asset.name,
    w0Nm: r.w0.value,
    fw: r.fw.value,
    fv: r.fv.value,
    ff: r.ff.value,
    speedKt: r.asset.speedKt,
    enduranceHours: r.asset.enduranceHours,
  }));

  const engineInput: CaseCalculationInput = {
    drift: {
      startPoint: c.startPoint,
      driftTimeHours: driftTime.value,
      wind: { speedKt: c.windSpeedKt, fromDirectionDeg: c.windFromDirectionDeg },
      leeway: {
        multiplier: leeway.multiplier.value,
        modifier: leeway.modifier.value,
        divergenceAngleDeg: leeway.divergenceAngleDeg.value,
      },
      currents: {
        tidal: { speedKt: c.currents.tidal.speedKt, setDirectionDeg: c.currents.tidal.setDirectionDeg },
        sea: { speedKt: c.currents.sea.speedKt, setDirectionDeg: c.currents.sea.setDirectionDeg },
        wind: { speedKt: c.currents.wind.speedKt, setDirectionDeg: c.currents.wind.setDirectionDeg },
        other: { speedKt: c.currents.other.speedKt, setDirectionDeg: c.currents.other.setDirectionDeg },
      },
      applyDivergence: c.applyDivergence,
    },
    errors: {
      aswdveKt: c.windSteadiness === 'steady' ? 0.3 : 0.5,
      currentErrors: {
        tidalKt: c.currents.tidal.errorKt,
        seaKt: c.currents.sea.errorKt,
        windKt: c.currents.wind.errorKt,
        otherKt: c.currents.other.errorKt,
      },
      lweKt: lwe.value,
      xNm: x.value,
      yNm: y.value,
    },
    datumTypeOverride: c.datumTypeOverride,
    lineEndPoint: c.lineEndPoint,
    fs: fs.value,
    assets: engineAssets,
    poc: c.poc,
    pod: c.pod,
  };

  return { driftTime, leeway, lwe, x, y, fs, assets, engineInput };
}

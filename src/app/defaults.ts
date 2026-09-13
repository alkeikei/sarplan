import { DEFAULT_CURRENT_ERROR_KT } from '../engine';
import type { AssetState, CaseState, CurrentState } from './types';

/** Overlay colours for search facility track lines, one per asset. */
export const ASSET_COLOURS = [
  '#2DD4BF',
  '#38BDF8',
  '#F472B6',
  '#FBBF24',
  '#A78BFA',
  '#4ADE80',
];

export const newId = (): string =>
  globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** PRD 14: default 0.3 kt of error per current component when nothing better exists. */
const emptyCurrent = (): CurrentState => ({
  speedKt: 0,
  setDirectionDeg: 0,
  errorKt: DEFAULT_CURRENT_ERROR_KT,
});

export function newAsset(index: number, name = `Facility ${index + 1}`): AssetState {
  return {
    id: newId(),
    name,
    sweepTableId: 'vessel-14ft',
    sweepObject: 'Life raft, 6 person',
    w0Override: null,
    weatherObjectClassOverride: null,
    fwOverride: null,
    fvOverride: null,
    crewFatigued: false,
    ffOverride: null,
    speedKt: 15,
    enduranceHours: 6,
    colour: ASSET_COLOURS[index % ASSET_COLOURS.length],
  };
}

function roundToHour(d: Date): string {
  const c = new Date(d);
  c.setUTCMinutes(0, 0, 0);
  return c.toISOString().slice(0, 16);
}

export function newCase(name = 'Untitled case', firstAssetName?: string): CaseState {
  const now = new Date();
  const distress = new Date(now.getTime() - 5 * 3600 * 1000);
  return {
    id: newId(),
    name,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),

    distressType: 'lkp',
    leewayObjectId: 'dbraft-4-6-general',
    weatherObjectClass: 'small',
    leewayMultiplierOverride: null,
    leewayModifierOverride: null,
    leewayDivergenceOverride: null,
    applyDivergence: true,

    startPoint: { lat: -6.0, lon: 106.5 },
    lineEndPoint: null,
    distressTimeIso: roundToHour(distress),
    searchStartTimeIso: roundToHour(now),
    driftTimeOverride: null,

    windSpeedKt: 15,
    windFromDirectionDeg: 90,
    windProvenance: { kind: 'manual' },
    windSteadiness: 'steady',
    seaHeightM: null,
    visibilityKm: 20,
    currents: {
      tidal: emptyCurrent(),
      sea: emptyCurrent(),
      wind: emptyCurrent(),
      other: emptyCurrent(),
    },
    lweOverride: null,

    xSourceId: 'gps',
    xOverride: null,
    ySourceId: 'gps',
    yOverride: null,

    datumTypeOverride: null,
    searchStage: 'initial',
    fsOverride: null,

    assets: [newAsset(0, firstAssetName)],

    poc: 0.8,
    pod: 0.7,
  };
}

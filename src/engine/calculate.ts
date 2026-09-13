/**
 * The full ISPM chain, run end to end in the order PRD section 14 sets out.
 *
 *   1. drift          leeway + total water current -> datum(s), DD
 *   2. error          TWCe -> Dve -> De -> E -> SR -> datum type
 *   3. effort         W -> Z -> Zta -> fz -> Zr -> Zrc
 *   4. area           Ro -> Ao -> Co -> So
 *   5. success        POS = POC x POD, POSc
 *   6. geometry       rectangles, error circles, track legs for the map
 *
 * Pure function of its input. No I/O, no clock, no randomness, so a saved
 * case replays to identical numbers.
 */

import { optimalCoverageFactor, optimalSearchArea, optimalSearchRadius, optimalTrackSpacing } from './area';
import { computeDrift, type DriftInput, type DriftResult } from './drift';
import {
  cumulativeRelativeEffort,
  correctedSweepWidth,
  effortFactor,
  relativeEffort,
  searchEffort,
  totalAvailableEffort,
} from './effort';
import {
  driftError,
  driftVelocityError,
  selectDatumType,
  separationRatio,
  totalProbableError,
  totalWaterCurrentError,
} from './error';
import { displace, distanceNm, midpoint, type LatLon } from './geo';
import { axisBetween, circlePolygon, rectangle, trackLegs, type Rectangle, type TrackPlan } from './geometry';
import { cumulativeProbabilityOfSuccess, probabilityOfSuccess } from './pos';
import { searchCondition, type SearchCondition } from './tables/safetyFactor';
import type { DatumType, WaterCurrentErrors } from './types';

export interface AssetCalculationInput {
  id: string;
  name: string;
  /** W0: uncorrected sweep width, nm. */
  w0Nm: number;
  /** fw: weather correction factor. */
  fw: number;
  /** fv: speed correction factor. Defaults to 1 in the app; see tables. */
  fv: number;
  /** ff: fatigue correction factor. */
  ff: number;
  /** V: search speed, kt. */
  speedKt: number;
  /** T: search endurance, hours. */
  enduranceHours: number;
}

export interface ErrorInput {
  /** ASWDve: probable drift velocity error from the average surface wind, kt. */
  aswdveKt: number;
  /** Probable error of each water current component, kt. */
  currentErrors: WaterCurrentErrors;
  /** LWe: leeway error, kt. */
  lweKt: number;
  /** X: drifting start point error, nm. */
  xNm: number;
  /** Y: search facility position error, nm. */
  yNm: number;
}

export interface CaseCalculationInput {
  drift: DriftInput;
  errors: ErrorInput;
  /** Manual datum type override (PRD 6.4). Null or absent = auto-select. */
  datumTypeOverride?: DatumType | null;
  /**
   * Far end of the drifting start line, for a line datum. When present the
   * line is drifted with the same drift vector as the start point and DD
   * becomes the length of the drifted line.
   */
  lineEndPoint?: LatLon | null;
  /** DD for a line datum when no line end point is placed on the map, nm. */
  lineLengthNm?: number;
  /** fs: optimal search / safety factor. */
  fs: number;
  assets: AssetCalculationInput[];
  /** Zr from earlier searches on this case, for Zrc. */
  priorRelativeEfforts?: number[];
  /** POC for this search, fraction 0-1. */
  poc?: number;
  /** POD for this search, fraction 0-1. Manual entry: the curve is not digitised. */
  pod?: number;
  /** POS from earlier searches on this case, for POSc. */
  priorPos?: number[];
}

export interface AssetCalculationResult {
  id: string;
  name: string;
  /** W: corrected sweep width, nm. */
  wNm: number;
  /** Z: search effort, nm^2. */
  zNm2: number;
  /** So: optimal track spacing, nm. */
  soNm: number;
  /** Share of Zta this facility contributes, fraction 0-1. */
  effortShare: number;
}

export interface DatumResult {
  datumType: DatumType;
  autoDatumType: DatumType;
  overridden: boolean;
  /** Datum reached drifting straight downwind. */
  datumCentre: LatLon;
  datumLeft: LatLon;
  datumRight: LatLon;
  /** Centre of the combined search area. */
  datumMidpoint: LatLon;
  /** DD used downstream, nm: divergence distance, or the drifted line length. */
  ddNm: number;
  srValue: number;
}

export interface ErrorResult {
  /** TWCe, kt. */
  twceKt: number;
  /** Dve, kt. */
  dveKt: number;
  /** De, nm. */
  deNm: number;
  /** E, nm. */
  eNm: number;
  xNm: number;
  yNm: number;
}

export interface EffortResult {
  /** Zta, nm^2. */
  ztaNm2: number;
  /** fz, nm^2. */
  fz: number;
  /** L, nm. Line datum only. */
  lNm?: number;
  /** Zr for this search. */
  zr: number;
  /** Zrc across every search to date, this one included. */
  zrc: number;
  searchCondition: SearchCondition;
}

export interface AreaResult {
  /** Ro, nm. */
  roNm: number;
  /** Ao, nm^2. */
  aoNm2: number;
  /** Co. */
  co: number;
  subAreas: { label: string; widthNm: number; lengthNm: number; areaNm2: number }[];
}

export interface SuccessResult {
  poc?: number;
  pod?: number;
  pos?: number;
  posCumulative?: number;
}

/**
 * One leg of the drift: where the object started and where it ended up.
 *
 * The distance is carried here rather than re-derived by whatever draws it,
 * because the divergence cases have two tracks of different lengths and
 * measuring them again in the UI would be a second implementation of
 * something the drift chain has already worked out.
 */
export interface DriftTrack {
  label: string;
  points: LatLon[];
  /** Distance covered along the track, nm. */
  distanceNm: number;
}

export interface MapGeometry {
  startPoint: LatLon;
  lineEndPoint?: LatLon;
  driftTrack: DriftTrack[];
  errorCircles: { label: string; centre: LatLon; radiusNm: number; polygon: LatLon[] }[];
  searchRectangles: Rectangle[];
  /** Track legs per asset, per rectangle. */
  tracksByAsset: { assetId: string; assetName: string; plans: TrackPlan[] }[];
}

export interface CaseCalculationResult {
  drift: DriftResult;
  datum: DatumResult;
  error: ErrorResult;
  effort: EffortResult;
  area: AreaResult;
  assets: AssetCalculationResult[];
  success: SuccessResult;
  geometry: MapGeometry;
}

export function calculateCase(input: CaseCalculationInput): CaseCalculationResult {
  // 1. Drift.
  const drift = computeDrift(input.drift);

  // 2. Error chain.
  const twceKt = totalWaterCurrentError(input.errors.currentErrors);
  const dveKt = driftVelocityError(input.errors.aswdveKt, twceKt, input.errors.lweKt);
  const deNm = driftError(dveKt, input.drift.driftTimeHours);
  const eNm = totalProbableError(input.errors.xNm, deNm, input.errors.yNm);

  const srValue = separationRatio(drift.ddNm, eNm);
  const autoDatumType = selectDatumType(drift.ddNm, srValue);
  const datumType = input.datumTypeOverride ?? autoDatumType;

  // A line datum drifts the whole start line, so DD becomes the drifted line
  // length rather than the leeway divergence distance.
  const driftedLineEnd =
    input.lineEndPoint != null ? displace(input.lineEndPoint, drift.displacementCentre) : null;

  const ddNm =
    datumType === 'line'
      ? driftedLineEnd != null
        ? distanceNm(drift.datumCentre, driftedLineEnd)
        : (input.lineLengthNm ?? 0)
      : drift.ddNm;

  // 3. Effort.
  const { fz, lNm } = effortFactor(datumType, eNm, ddNm);

  const assetEfforts = input.assets.map((a) => {
    const wNm = correctedSweepWidth(a.w0Nm, a.fw, a.fv, a.ff);
    return { asset: a, wNm, zNm2: searchEffort(wNm, a.speedKt, a.enduranceHours) };
  });
  const ztaNm2 = totalAvailableEffort(assetEfforts.map((a) => a.zNm2));
  const zr = relativeEffort(ztaNm2, fz);
  const zrc = cumulativeRelativeEffort([...(input.priorRelativeEfforts ?? []), zr]);

  // PRD 14: the IAMSAR fs graph has one curve for ideal conditions and one for
  // normal. With the stepped safety factor table fs does not change, but the
  // condition is reported so a planner can read the right curve by hand.
  const worst = assetEfforts.reduce(
    (acc, { asset }) => ({
      fw: Math.min(acc.fw, asset.fw),
      fv: Math.min(acc.fv, asset.fv),
      ff: Math.min(acc.ff, asset.ff),
    }),
    { fw: Infinity, fv: Infinity, ff: Infinity },
  );
  const condition: SearchCondition = assetEfforts.length
    ? searchCondition(worst.fw, worst.fv, worst.ff)
    : 'ideal';

  // 4. Area, coverage, track spacing.
  const roNm = optimalSearchRadius(input.fs, eNm);
  const { aoNm2, subAreas } = optimalSearchArea(datumType, roNm, ddNm, lNm);
  const co = optimalCoverageFactor(ztaNm2, aoNm2);

  const assets: AssetCalculationResult[] = assetEfforts.map(({ asset, wNm, zNm2 }) => ({
    id: asset.id,
    name: asset.name,
    wNm,
    zNm2,
    soNm: optimalTrackSpacing(wNm, co),
    effortShare: ztaNm2 === 0 ? 0 : zNm2 / ztaNm2,
  }));

  // 5. Probability of success.
  const pos =
    input.poc !== undefined && input.pod !== undefined
      ? probabilityOfSuccess(input.poc, input.pod)
      : undefined;
  const success: SuccessResult = {
    poc: input.poc,
    pod: input.pod,
    pos,
    posCumulative:
      pos !== undefined
        ? cumulativeProbabilityOfSuccess([...(input.priorPos ?? []), pos])
        : input.priorPos?.length
          ? cumulativeProbabilityOfSuccess(input.priorPos)
          : undefined,
  };

  // 6. Map geometry.
  const geometry = buildGeometry({
    input,
    drift,
    datumType,
    ddNm,
    eNm,
    roNm,
    lNm,
    driftedLineEnd,
    assets,
  });

  return {
    drift,
    datum: {
      datumType,
      autoDatumType,
      overridden: input.datumTypeOverride != null && input.datumTypeOverride !== autoDatumType,
      datumCentre: drift.datumCentre,
      datumLeft: drift.datumLeft,
      datumRight: drift.datumRight,
      datumMidpoint: drift.datumMidpoint,
      ddNm,
      srValue,
    },
    error: { twceKt, dveKt, deNm, eNm, xNm: input.errors.xNm, yNm: input.errors.yNm },
    effort: { ztaNm2, fz, lNm, zr, zrc, searchCondition: condition },
    area: { roNm, aoNm2, co, subAreas },
    assets,
    success,
    geometry,
  };
}

function buildGeometry(args: {
  input: CaseCalculationInput;
  drift: DriftResult;
  datumType: DatumType;
  ddNm: number;
  eNm: number;
  roNm: number;
  lNm?: number;
  driftedLineEnd: LatLon | null;
  assets: AssetCalculationResult[];
}): MapGeometry {
  const { input, drift, datumType, ddNm, eNm, roNm, lNm, driftedLineEnd, assets } = args;
  const start = input.drift.startPoint;
  const side = 2 * roNm;

  const searchRectangles: Rectangle[] = [];
  const errorCircles: MapGeometry['errorCircles'] = [];
  const driftTrack: DriftTrack[] = [];
  const track = (label: string, points: LatLon[]): DriftTrack => ({
    label,
    points,
    distanceNm: points
      .slice(1)
      .reduce((sum, p, i) => sum + distanceNm(points[i], p), 0),
  });

  switch (datumType) {
    case 'single-point': {
      const axisDeg = drift.driftVectorCentre.directionDeg;
      searchRectangles.push(rectangle('Search area', drift.datumCentre, axisDeg, side, side));
      errorCircles.push(errorCircle('Probable error E', drift.datumCentre, eNm));
      driftTrack.push(track('Drift track', [start, drift.datumCentre]));
      break;
    }

    case 'leeway-divergence': {
      const { axisDeg, centre } = axisBetween(drift.datumLeft, drift.datumRight);
      searchRectangles.push(rectangle('Combined search area', centre, axisDeg, side + ddNm, side));
      errorCircles.push(
        errorCircle('Probable error E (left datum)', drift.datumLeft, eNm),
        errorCircle('Probable error E (right datum)', drift.datumRight, eNm),
      );
      driftTrack.push(
        track('Drift track (left of downwind)', [start, drift.datumLeft]),
        track('Drift track (right of downwind)', [start, drift.datumRight]),
      );
      break;
    }

    case 'widely-diverging': {
      const { axisDeg } = axisBetween(drift.datumLeft, drift.datumRight);
      searchRectangles.push(
        rectangle('Area A (left divergence datum)', drift.datumLeft, axisDeg, side, side),
        rectangle('Area B (right divergence datum)', drift.datumRight, axisDeg, side, side),
      );
      errorCircles.push(
        errorCircle('Probable error E (left datum)', drift.datumLeft, eNm),
        errorCircle('Probable error E (right datum)', drift.datumRight, eNm),
      );
      driftTrack.push(
        track('Drift track (left of downwind)', [start, drift.datumLeft]),
        track('Drift track (right of downwind)', [start, drift.datumRight]),
      );
      break;
    }

    case 'line': {
      const far = driftedLineEnd ?? drift.datumCentre;
      const axisDeg =
        driftedLineEnd != null
          ? axisBetween(drift.datumCentre, driftedLineEnd).axisDeg
          : drift.driftVectorCentre.directionDeg;
      const centre = driftedLineEnd != null ? midpoint(drift.datumCentre, far) : drift.datumCentre;
      searchRectangles.push(
        rectangle('Line search area', centre, axisDeg, lNm ?? ddNm + 2 * eNm, side),
      );
      errorCircles.push(errorCircle('Probable error E', drift.datumCentre, eNm));
      driftTrack.push(track('Drift track', [start, drift.datumCentre]));
      if (input.lineEndPoint && driftedLineEnd) {
        driftTrack.push(track('Drift track (line end point)', [input.lineEndPoint, driftedLineEnd]));
      }
      break;
    }
  }

  return {
    startPoint: start,
    lineEndPoint: input.lineEndPoint ?? undefined,
    driftTrack,
    errorCircles,
    searchRectangles,
    tracksByAsset: assets.map((a) => ({
      assetId: a.id,
      assetName: a.name,
      plans: searchRectangles.map((r) => trackLegs(r, a.soNm)),
    })),
  };
}

function errorCircle(label: string, centre: LatLon, radiusNm: number) {
  return { label, centre, radiusNm, polygon: circlePolygon(centre, radiusNm) };
}

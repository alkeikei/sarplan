/**
 * Drift: leeway, total water current, drift vector, and the resulting datums.
 *
 * Chain, per PRD sections 6.4 and 14:
 *   leeway speed  = multiplier x wind speed +/- modifier   (Table D-5:1)
 *   leeway set    = downwind, +/- the divergence angle
 *   TWC           = vector sum of tidal, sea, wind and other water currents
 *   drift vector  = leeway vector + TWC
 *   datum         = drifting start point + drift vector x drift time
 *   DD            = distance between the two leeway-divergence datums
 */

import {
  distanceNm,
  displace,
  midpoint,
  scaleVector,
  sumVectors,
  type LatLon,
  type PolarVector,
} from './geo';
import { normaliseBearing, reciprocal } from './units';
import type { CurrentInput, LeewayCoefficients, WaterCurrents, WindInput } from './types';

/**
 * Leeway speed in knots, from the source formula
 * leeway speed = (multiplier x wind speed) +/- modifier.
 *
 * Several table rows carry a negative modifier, which can drive a small
 * result below zero in light winds; leeway speed is clamped at zero because a
 * negative leeway (drifting upwind) is not physical.
 */
export function leewaySpeedKt(coef: LeewayCoefficients, windSpeedKt: number): number {
  return Math.max(0, coef.multiplier * windSpeedKt + coef.modifier);
}

/** The direction leeway carries an object: downwind, i.e. the wind reciprocal. */
export function downwindDirectionDeg(wind: WindInput): number {
  return reciprocal(wind.fromDirectionDeg);
}

export interface LeewayVectors {
  speedKt: number;
  downwindDeg: number;
  divergenceAngleDeg: number;
  /** Straight downwind: the single-point-datum leeway vector. */
  centre: PolarVector;
  /** Divergence angle applied anticlockwise of downwind. */
  left: PolarVector;
  /** Divergence angle applied clockwise of downwind. */
  right: PolarVector;
}

export function leewayVectors(coef: LeewayCoefficients, wind: WindInput): LeewayVectors {
  const speedKt = leewaySpeedKt(coef, wind.speedKt);
  const downwindDeg = downwindDirectionDeg(wind);
  return {
    speedKt,
    downwindDeg,
    divergenceAngleDeg: coef.divergenceAngleDeg,
    centre: { magnitude: speedKt, directionDeg: downwindDeg },
    left: {
      magnitude: speedKt,
      directionDeg: normaliseBearing(downwindDeg - coef.divergenceAngleDeg),
    },
    right: {
      magnitude: speedKt,
      directionDeg: normaliseBearing(downwindDeg + coef.divergenceAngleDeg),
    },
  };
}

const asVector = (c: CurrentInput): PolarVector => ({
  magnitude: c.speedKt,
  directionDeg: c.setDirectionDeg,
});

/** Vector sum of the four water current components. */
export function totalWaterCurrent(currents: WaterCurrents): PolarVector {
  return sumVectors([
    asVector(currents.tidal),
    asVector(currents.sea),
    asVector(currents.wind),
    asVector(currents.other),
  ]);
}

export interface DriftInput {
  /** LKP, EIP, or the previous search's datum. */
  startPoint: LatLon;
  /** Distress time to search start time, hours. */
  driftTimeHours: number;
  wind: WindInput;
  leeway: LeewayCoefficients;
  currents: WaterCurrents;
  /**
   * Whether to split the datum by the leeway divergence angle. False collapses
   * the case to a single point datum (DD = 0) regardless of the table angle.
   */
  applyDivergence: boolean;
}

export interface DriftResult {
  leeway: LeewayVectors;
  totalWaterCurrent: PolarVector;
  /** Drift velocity straight downwind, kt and degrees true. */
  driftVectorCentre: PolarVector;
  driftVectorLeft: PolarVector;
  driftVectorRight: PolarVector;
  /** Displacement over the drift time, nm. */
  displacementCentre: PolarVector;
  displacementLeft: PolarVector;
  displacementRight: PolarVector;
  /** Datum reached by drifting straight downwind. */
  datumCentre: LatLon;
  /** Anticlockwise divergence datum. Equals datumCentre when divergence is off. */
  datumLeft: LatLon;
  /** Clockwise divergence datum. Equals datumCentre when divergence is off. */
  datumRight: LatLon;
  /** Divergence distance between the two divergence datums, nm. Zero if off. */
  ddNm: number;
  /** Midpoint of the two divergence datums; the centre of a combined area. */
  datumMidpoint: LatLon;
  divergenceApplied: boolean;
}

export function computeDrift(input: DriftInput): DriftResult {
  const leeway = leewayVectors(input.leeway, input.wind);
  const twc = totalWaterCurrent(input.currents);
  const t = input.driftTimeHours;

  const useDivergence = input.applyDivergence && input.leeway.divergenceAngleDeg !== 0;

  const driftVectorCentre = sumVectors([twc, leeway.centre]);
  const driftVectorLeft = useDivergence ? sumVectors([twc, leeway.left]) : driftVectorCentre;
  const driftVectorRight = useDivergence ? sumVectors([twc, leeway.right]) : driftVectorCentre;

  const displacementCentre = scaleVector(driftVectorCentre, t);
  const displacementLeft = scaleVector(driftVectorLeft, t);
  const displacementRight = scaleVector(driftVectorRight, t);

  const datumCentre = displace(input.startPoint, displacementCentre);
  const datumLeft = useDivergence ? displace(input.startPoint, displacementLeft) : datumCentre;
  const datumRight = useDivergence ? displace(input.startPoint, displacementRight) : datumCentre;

  const ddNm = useDivergence ? distanceNm(datumLeft, datumRight) : 0;

  return {
    leeway,
    totalWaterCurrent: twc,
    driftVectorCentre,
    driftVectorLeft,
    driftVectorRight,
    displacementCentre,
    displacementLeft,
    displacementRight,
    datumCentre,
    datumLeft,
    datumRight,
    ddNm,
    datumMidpoint: useDivergence ? midpoint(datumLeft, datumRight) : datumCentre,
    divergenceApplied: useDivergence,
  };
}

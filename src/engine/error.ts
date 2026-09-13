/**
 * Probable error chain, PRD section 14.
 *
 *   TWCe = sqrt(TCe^2 + SCe^2 + WCe^2 + OWCe^2)
 *   Dve  = sqrt(ASWDve^2 + TWCe^2 + LWe^2)
 *   De   = Dve x drift time
 *   E    = sqrt(X^2 + De^2 + Y^2)
 *   SR   = DD / E
 */

import type { DatumType, WaterCurrentErrors } from './types';

const rss = (...terms: number[]): number =>
  Math.sqrt(terms.reduce((sum, t) => sum + t * t, 0));

/** TWCe: total water current error, kt. */
export function totalWaterCurrentError(e: WaterCurrentErrors): number {
  return rss(e.tidalKt, e.seaKt, e.windKt, e.otherKt);
}

/**
 * Dve: drift velocity error, kt.
 * @param aswdveKt probable error from the average surface wind
 * @param twceKt   total water current error
 * @param lweKt    leeway error
 */
export function driftVelocityError(aswdveKt: number, twceKt: number, lweKt: number): number {
  return rss(aswdveKt, twceKt, lweKt);
}

/** De: drift error, nm. */
export function driftError(dveKt: number, driftTimeHours: number): number {
  return dveKt * driftTimeHours;
}

/**
 * E: total probable error, nm.
 * @param xNm  drifting start point error
 * @param deNm drift error
 * @param yNm  search facility position error
 */
export function totalProbableError(xNm: number, deNm: number, yNm: number): number {
  return rss(xNm, deNm, yNm);
}

/** SR = DD / E. Zero when there is no divergence distance. */
export function separationRatio(ddNm: number, eNm: number): number {
  if (ddNm === 0) return 0;
  if (eNm === 0) return Infinity;
  return ddNm / eNm;
}

/** The SR threshold that splits one combined area from two independent ones. */
export const WIDELY_DIVERGING_SR_THRESHOLD = 4;

/**
 * Datum type from DD and SR, per PRD section 14:
 *   DD = 0   -> single point datum
 *   SR < 4   -> leeway divergence datum, one combined search area
 *   SR >= 4  -> widely diverging datums, two independent search areas
 *
 * A line datum is not derived from SR: it is chosen when the drifting start
 * point is a track line rather than a point, so it only ever arrives here as
 * an explicit override.
 */
export function selectDatumType(ddNm: number, srValue: number): DatumType {
  if (ddNm === 0) return 'single-point';
  return srValue >= WIDELY_DIVERGING_SR_THRESHOLD ? 'widely-diverging' : 'leeway-divergence';
}

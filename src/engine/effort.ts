/**
 * Search effort, PRD section 14.
 *
 *   W   = W0 x fw x fv x ff
 *   Z   = W x V x T
 *   Zta = Z(f-1) + Z(f-2) + ...
 *   fz  = E^2                 for point-type datums
 *   fz  = E x L, L = DD + 2E  for a line datum
 *   Zr  = Zta / fz
 *   Zrc = Zr-1 + Zr-2 + ... + Zr-i
 */

import type { DatumType } from './types';

/** W: corrected sweep width, nm. */
export function correctedSweepWidth(w0Nm: number, fw: number, fv: number, ff: number): number {
  return w0Nm * fw * fv * ff;
}

/** Z: search effort for one facility, nm^2. W in nm, V in kt, T in hours. */
export function searchEffort(wNm: number, speedKt: number, enduranceHours: number): number {
  return wNm * speedKt * enduranceHours;
}

/** Zta: total available search effort across every assigned facility, nm^2. */
export function totalAvailableEffort(effortsNm2: number[]): number {
  return effortsNm2.reduce((sum, z) => sum + z, 0);
}

export interface EffortFactorResult {
  /** fz, nm^2. */
  fz: number;
  /** L, nm. Defined for a line datum only. */
  lNm?: number;
}

/**
 * fz: effort factor. Point-type datums use E^2; a line datum uses E x L with
 * L = DD + 2E, where DD is the length of the drifted line.
 */
export function effortFactor(datumType: DatumType, eNm: number, ddNm: number): EffortFactorResult {
  if (datumType === 'line') {
    const lNm = ddNm + 2 * eNm;
    return { fz: eNm * lNm, lNm };
  }
  return { fz: eNm * eNm };
}

/** Zr: relative effort, dimensionless. */
export function relativeEffort(ztaNm2: number, fz: number): number {
  if (fz === 0) return Infinity;
  return ztaNm2 / fz;
}

/** Zrc: cumulative relative effort across every search to date, this one included. */
export function cumulativeRelativeEffort(relativeEfforts: number[]): number {
  return relativeEfforts.reduce((sum, zr) => sum + zr, 0);
}

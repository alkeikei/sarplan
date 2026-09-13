/**
 * Optimal search area and track spacing, PRD section 14.
 *
 *   Ro = fs x E
 *   Ao = 4Ro^2                 single point datum
 *   Ao = 4Ro^2 + 2 x Ro x DD   leeway divergence datum (SR < 4), one area
 *   Ao = 4Ro^2 each            widely diverging datums (SR >= 4), two areas
 *   Ao = 2 x Ro x L            line datum
 *   Co = Zta / Ao
 *   So = W / Co, per facility, using that facility's own corrected W
 */

import type { DatumType } from './types';

/** Ro: optimal search radius, nm. */
export function optimalSearchRadius(fs: number, eNm: number): number {
  return fs * eNm;
}

export interface SubAreaSize {
  label: string;
  /** nm, across the short axis of this sub-area. */
  widthNm: number;
  /** nm, along the long axis of this sub-area. */
  lengthNm: number;
  areaNm2: number;
}

export interface OptimalSearchAreaResult {
  /** Ao: total optimal search area, nm^2. Both halves for widely diverging. */
  aoNm2: number;
  /** One entry for a single area, two for widely diverging datums. */
  subAreas: SubAreaSize[];
}

/**
 * Ao by datum type.
 * @param ddNm divergence distance; for a line datum, the drifted line length
 * @param lNm  L = DD + 2E, required for a line datum only
 */
export function optimalSearchArea(
  datumType: DatumType,
  roNm: number,
  ddNm: number,
  lNm?: number,
): OptimalSearchAreaResult {
  const side = 2 * roNm;

  switch (datumType) {
    case 'single-point':
      return {
        aoNm2: 4 * roNm * roNm,
        subAreas: [
          { label: 'Search area', widthNm: side, lengthNm: side, areaNm2: 4 * roNm * roNm },
        ],
      };

    case 'leeway-divergence': {
      // One elongated area spanning both divergence datums.
      const lengthNm = side + ddNm;
      const areaNm2 = 4 * roNm * roNm + 2 * roNm * ddNm;
      return {
        aoNm2: areaNm2,
        subAreas: [{ label: 'Combined search area', widthNm: side, lengthNm, areaNm2 }],
      };
    }

    case 'widely-diverging': {
      const each = 4 * roNm * roNm;
      return {
        aoNm2: 2 * each,
        subAreas: [
          { label: 'Area A (left divergence datum)', widthNm: side, lengthNm: side, areaNm2: each },
          {
            label: 'Area B (right divergence datum)',
            widthNm: side,
            lengthNm: side,
            areaNm2: each,
          },
        ],
      };
    }

    case 'line': {
      if (lNm === undefined) throw new Error('Line datum requires L');
      const areaNm2 = 2 * roNm * lNm;
      return {
        aoNm2: areaNm2,
        subAreas: [{ label: 'Line search area', widthNm: side, lengthNm: lNm, areaNm2 }],
      };
    }
  }
}

/** C = Z / A, the general coverage factor. */
/**
 * The lowest coverage factor the source manual will endorse.
 *
 * "A coverage factor of less than 0.5 is unsatisfactory in itself" (4.3.49),
 * and "Search of areas at a coverage factor less than 0.5 is not recommended"
 * (4.3.55). AMSA National SAR Manual, 2026 Edition.
 */
export const MINIMUM_RECOMMENDED_COVERAGE_FACTOR = 0.5;

export function coverageFactor(effortNm2: number, areaNm2: number): number {
  if (areaNm2 === 0) return Infinity;
  return effortNm2 / areaNm2;
}

/**
 * Co: optimal coverage factor. Equal across every sub-area when the search
 * area is split among assets, hence Co = Zta / Ao.
 */
export function optimalCoverageFactor(ztaNm2: number, aoNm2: number): number {
  return coverageFactor(ztaNm2, aoNm2);
}

/** S = W / C, the general track spacing. */
export function trackSpacing(wNm: number, c: number): number {
  if (c === 0) return Infinity;
  return wNm / c;
}

/** So: optimal track spacing for one facility, from its own corrected W. */
export function optimalTrackSpacing(wNm: number, coValue: number): number {
  return trackSpacing(wNm, coValue);
}

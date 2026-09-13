/**
 * Unit conversions for the ISPM engine.
 *
 * Canonical internal units, used by every function in /src/engine:
 *   speed     knots (kt)
 *   distance  nautical miles (nm)
 *   time      hours (h)
 *   area      square nautical miles (nm^2)
 *   direction degrees true, 0-360
 *
 * Direction convention: every direction stored in the engine is a TOWARD
 * direction (the direction a vector points / a current sets) EXCEPT wind,
 * which is stored as a FROM direction because that is how wind is reported.
 * Conversion between the two is `reciprocal()`.
 */

export const NM_PER_KM = 1 / 1.852;
export const KM_PER_NM = 1.852;
export const M_PER_NM = 1852;
export const KT_PER_MS = 3600 / 1852; // 1 m/s = 1.9438 kt
export const FT_PER_M = 3.280839895;

export const kmToNm = (km: number): number => km * NM_PER_KM;
export const nmToKm = (nm: number): number => nm * KM_PER_NM;
export const nmToMeters = (nm: number): number => nm * M_PER_NM;
export const metersToNm = (m: number): number => m / M_PER_NM;
export const msToKnots = (ms: number): number => ms * KT_PER_MS;
export const knotsToMs = (kt: number): number => kt / KT_PER_MS;
export const kmhToKnots = (kmh: number): number => kmh * NM_PER_KM;
export const metersToFeet = (m: number): number => m * FT_PER_M;

export const toRadians = (deg: number): number => (deg * Math.PI) / 180;
export const toDegrees = (rad: number): number => (rad * 180) / Math.PI;

/** Normalise any bearing into [0, 360). */
export function normaliseBearing(deg: number): number {
  const r = deg % 360;
  return r < 0 ? r + 360 : r;
}

/** Opposite direction. Converts wind "from" to wind "toward" and back. */
export function reciprocal(deg: number): number {
  return normaliseBearing(deg + 180);
}

/** Smallest absolute angle between two bearings, in [0, 180]. */
export function angularDifference(a: number, b: number): number {
  const d = Math.abs(normaliseBearing(a) - normaliseBearing(b)) % 360;
  return d > 180 ? 360 - d : d;
}

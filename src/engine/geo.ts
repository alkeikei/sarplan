/**
 * Spherical-earth geodesy, in nautical miles.
 *
 * A sphere is accurate enough for search planning: over the tens of nautical
 * miles a datum drifts, the spherical/ellipsoidal difference is well inside
 * the probable error E that the whole method is built around.
 */

import { normaliseBearing, toDegrees, toRadians } from './units';

/** Mean earth radius, 6 371 008.8 m, expressed in nautical miles. */
export const EARTH_RADIUS_NM = 6371008.8 / 1852;

export interface LatLon {
  lat: number;
  lon: number;
}

/** A vector in the local tangent plane: nm or kt, split east/north. */
export interface Components {
  east: number;
  north: number;
}

/** A vector in polar form: magnitude plus a TOWARD direction in degrees true. */
export interface PolarVector {
  /** Magnitude: knots for a velocity, nautical miles for a displacement. */
  magnitude: number;
  /** Direction the vector points toward, degrees true. */
  directionDeg: number;
}

export function toComponents(v: PolarVector): Components {
  const r = toRadians(v.directionDeg);
  return {
    east: v.magnitude * Math.sin(r),
    north: v.magnitude * Math.cos(r),
  };
}

export function toPolar(c: Components): PolarVector {
  const magnitude = Math.hypot(c.east, c.north);
  // atan2(east, north) gives a compass bearing rather than a maths angle.
  const directionDeg = magnitude === 0 ? 0 : normaliseBearing(toDegrees(Math.atan2(c.east, c.north)));
  return { magnitude, directionDeg };
}

/** Vector sum of any number of polar vectors. */
export function sumVectors(vectors: PolarVector[]): PolarVector {
  const total = vectors.reduce<Components>(
    (acc, v) => {
      const c = toComponents(v);
      return { east: acc.east + c.east, north: acc.north + c.north };
    },
    { east: 0, north: 0 },
  );
  return toPolar(total);
}

export function scaleVector(v: PolarVector, factor: number): PolarVector {
  return factor >= 0
    ? { magnitude: v.magnitude * factor, directionDeg: v.directionDeg }
    : { magnitude: v.magnitude * -factor, directionDeg: normaliseBearing(v.directionDeg + 180) };
}

/** Great-circle destination from a point, given a bearing and a distance in nm. */
export function destinationPoint(from: LatLon, bearingDeg: number, distanceNm: number): LatLon {
  if (distanceNm === 0) return { lat: from.lat, lon: from.lon };
  const delta = distanceNm / EARTH_RADIUS_NM;
  const theta = toRadians(bearingDeg);
  const phi1 = toRadians(from.lat);
  const lambda1 = toRadians(from.lon);

  const sinPhi2 =
    Math.sin(phi1) * Math.cos(delta) + Math.cos(phi1) * Math.sin(delta) * Math.cos(theta);
  const phi2 = Math.asin(sinPhi2);
  const lambda2 =
    lambda1 +
    Math.atan2(
      Math.sin(theta) * Math.sin(delta) * Math.cos(phi1),
      Math.cos(delta) - Math.sin(phi1) * sinPhi2,
    );

  return {
    lat: toDegrees(phi2),
    lon: ((toDegrees(lambda2) + 540) % 360) - 180,
  };
}

/** Apply a displacement vector (magnitude in nm) to a position. */
export function displace(from: LatLon, displacement: PolarVector): LatLon {
  return destinationPoint(from, displacement.directionDeg, displacement.magnitude);
}

/** Great-circle distance in nautical miles. */
export function distanceNm(a: LatLon, b: LatLon): number {
  const phi1 = toRadians(a.lat);
  const phi2 = toRadians(b.lat);
  const dPhi = toRadians(b.lat - a.lat);
  const dLambda = toRadians(b.lon - a.lon);
  const h =
    Math.sin(dPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;
  return 2 * EARTH_RADIUS_NM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Initial great-circle bearing from a to b, degrees true. */
export function bearingDeg(a: LatLon, b: LatLon): number {
  const phi1 = toRadians(a.lat);
  const phi2 = toRadians(b.lat);
  const dLambda = toRadians(b.lon - a.lon);
  const y = Math.sin(dLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);
  return normaliseBearing(toDegrees(Math.atan2(y, x)));
}

/** Midpoint of the great-circle track between two positions. */
export function midpoint(a: LatLon, b: LatLon): LatLon {
  return destinationPoint(a, bearingDeg(a, b), distanceNm(a, b) / 2);
}

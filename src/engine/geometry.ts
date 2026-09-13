/**
 * Map geometry for the calculated results: the search area rectangles and the
 * parallel track lines inside them.
 *
 * Kept framework free like the rest of /src/engine, so it stays unit
 * testable. The map layer only ever consumes plain lat/lon arrays.
 */

import { bearingDeg, destinationPoint, distanceNm, midpoint, type LatLon } from './geo';
import { normaliseBearing } from './units';

export interface Rectangle {
  label: string;
  /** Four corners, clockwise from the "near left" corner, plus the centre. */
  corners: LatLon[];
  centre: LatLon;
  /** Bearing of the long axis, degrees true. */
  axisDeg: number;
  lengthNm: number;
  widthNm: number;
}

/**
 * A rectangle centred on a point: `lengthNm` measured along `axisDeg`,
 * `widthNm` measured across it.
 */
export function rectangle(
  label: string,
  centre: LatLon,
  axisDeg: number,
  lengthNm: number,
  widthNm: number,
): Rectangle {
  const halfL = lengthNm / 2;
  const halfW = widthNm / 2;
  const across = normaliseBearing(axisDeg + 90);
  const back = normaliseBearing(axisDeg + 180);

  const nearCentre = destinationPoint(centre, back, halfL);
  const farCentre = destinationPoint(centre, axisDeg, halfL);

  return {
    label,
    corners: [
      destinationPoint(nearCentre, normaliseBearing(across + 180), halfW),
      destinationPoint(farCentre, normaliseBearing(across + 180), halfW),
      destinationPoint(farCentre, across, halfW),
      destinationPoint(nearCentre, across, halfW),
    ],
    centre,
    axisDeg,
    lengthNm,
    widthNm,
  };
}

export interface TrackLeg {
  from: LatLon;
  to: LatLon;
}

export interface TrackPlan {
  legs: TrackLeg[];
  /** Track spacing actually laid down, nm. */
  actualSpacingNm: number;
  /** Track spacing asked for, nm: So from the engine. */
  requestedSpacingNm: number;
  legCount: number;
  /** Total distance the facility runs to fly every leg, nm, turns excluded. */
  totalTrackLengthNm: number;
}

/**
 * Lay parallel creeping-line legs across a rectangle at the requested
 * spacing. The leg count is rounded to a whole number and the spacing evenly
 * redistributed, so the legs cover the whole rectangle without a part-width
 * gap at one edge; `actualSpacingNm` reports what that redistribution gave.
 */
export function trackLegs(rect: Rectangle, requestedSpacingNm: number): TrackPlan {
  if (!Number.isFinite(requestedSpacingNm) || requestedSpacingNm <= 0) {
    return {
      legs: [],
      actualSpacingNm: requestedSpacingNm,
      requestedSpacingNm,
      legCount: 0,
      totalTrackLengthNm: 0,
    };
  }

  const legCount = Math.max(1, Math.round(rect.widthNm / requestedSpacingNm));
  const actualSpacingNm = rect.widthNm / legCount;
  const across = normaliseBearing(rect.axisDeg + 90);
  const halfL = rect.lengthNm / 2;
  const halfW = rect.widthNm / 2;

  const legs: TrackLeg[] = [];
  for (let i = 0; i < legCount; i++) {
    const offset = -halfW + actualSpacingNm * (i + 0.5);
    const legCentre =
      offset >= 0
        ? destinationPoint(rect.centre, across, offset)
        : destinationPoint(rect.centre, normaliseBearing(across + 180), -offset);
    legs.push({
      from: destinationPoint(legCentre, normaliseBearing(rect.axisDeg + 180), halfL),
      to: destinationPoint(legCentre, rect.axisDeg, halfL),
    });
  }

  return {
    legs,
    actualSpacingNm,
    requestedSpacingNm,
    legCount,
    totalTrackLengthNm: legCount * rect.lengthNm,
  };
}

/** Circle approximated as a polygon, for the error circle overlay. */
export function circlePolygon(centre: LatLon, radiusNm: number, segments = 72): LatLon[] {
  const points: LatLon[] = [];
  for (let i = 0; i < segments; i++) {
    points.push(destinationPoint(centre, (360 / segments) * i, radiusNm));
  }
  return points;
}

/** Bearing of the axis joining two datums, and their midpoint. */
export function axisBetween(a: LatLon, b: LatLon): { axisDeg: number; centre: LatLon; lengthNm: number } {
  return { axisDeg: bearingDeg(a, b), centre: midpoint(a, b), lengthNm: distanceNm(a, b) };
}

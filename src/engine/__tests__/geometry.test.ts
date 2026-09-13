import { describe, expect, it } from 'vitest';
import { axisBetween, circlePolygon, rectangle, trackLegs } from '../geometry';
import { bearingDeg, distanceNm } from '../geo';

describe('search area rectangle', () => {
  const centre = { lat: -6, lon: 106.5 };
  const rect = rectangle('Search area', centre, 0, 10, 6);

  it('has four corners', () => {
    expect(rect.corners).toHaveLength(4);
  });

  it('measures length along the axis and width across it', () => {
    const [nearLeft, farLeft, farRight, nearRight] = rect.corners;
    expect(distanceNm(nearLeft, farLeft)).toBeCloseTo(10, 3);
    expect(distanceNm(nearRight, farRight)).toBeCloseTo(10, 3);
    expect(distanceNm(nearLeft, nearRight)).toBeCloseTo(6, 3);
    expect(distanceNm(farLeft, farRight)).toBeCloseTo(6, 3);
  });

  it('is centred on the given point', () => {
    for (const c of rect.corners) {
      expect(distanceNm(centre, c)).toBeCloseTo(Math.hypot(5, 3), 2);
    }
  });

  it('rotates with the axis', () => {
    const rotated = rectangle('Search area', centre, 90, 10, 6);
    expect(bearingDeg(rotated.corners[0], rotated.corners[1])).toBeCloseTo(90, 1);
  });
});

describe('track legs', () => {
  const rect = rectangle('Search area', { lat: -6, lon: 106.5 }, 0, 10, 6);

  it('lays legs across the width at roughly the requested spacing', () => {
    const plan = trackLegs(rect, 1);
    expect(plan.legCount).toBe(6);
    expect(plan.actualSpacingNm).toBeCloseTo(1, 10);
    expect(plan.totalTrackLengthNm).toBeCloseTo(60, 10);
  });

  it('redistributes the spacing evenly when it does not divide the width', () => {
    const plan = trackLegs(rect, 0.7);
    // 6 / 0.7 = 8.57 -> 9 legs at 0.667 nm.
    expect(plan.legCount).toBe(9);
    expect(plan.actualSpacingNm).toBeCloseTo(6 / 9, 10);
    expect(plan.requestedSpacingNm).toBe(0.7);
  });

  it('runs each leg the full length of the area', () => {
    const plan = trackLegs(rect, 2);
    for (const leg of plan.legs) {
      expect(distanceNm(leg.from, leg.to)).toBeCloseTo(10, 3);
    }
  });

  it('spaces adjacent legs by the actual spacing', () => {
    const plan = trackLegs(rect, 2);
    expect(distanceNm(plan.legs[0].from, plan.legs[1].from)).toBeCloseTo(plan.actualSpacingNm, 3);
  });

  it('always lays at least one leg, however wide the spacing', () => {
    expect(trackLegs(rect, 100).legCount).toBe(1);
  });

  it('lays no legs for a nonsensical spacing rather than looping forever', () => {
    expect(trackLegs(rect, 0).legs).toHaveLength(0);
    expect(trackLegs(rect, Infinity).legs).toHaveLength(0);
  });
});

describe('error circle polygon', () => {
  it('puts every vertex at the radius', () => {
    const centre = { lat: -6, lon: 106.5 };
    const poly = circlePolygon(centre, 3.937, 36);
    expect(poly).toHaveLength(36);
    for (const p of poly) {
      expect(distanceNm(centre, p)).toBeCloseTo(3.937, 6);
    }
  });
});

describe('axis between two datums', () => {
  it('returns the bearing, midpoint and separation', () => {
    const a = { lat: -6.05, lon: 106.4 };
    const b = { lat: -6.02, lon: 106.45 };
    const axis = axisBetween(a, b);
    expect(axis.axisDeg).toBeCloseTo(bearingDeg(a, b), 10);
    expect(axis.lengthNm).toBeCloseTo(distanceNm(a, b), 10);
    expect(distanceNm(a, axis.centre)).toBeCloseTo(axis.lengthNm / 2, 6);
  });
});

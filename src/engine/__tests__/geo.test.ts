import { describe, expect, it } from 'vitest';
import {
  bearingDeg,
  destinationPoint,
  distanceNm,
  midpoint,
  scaleVector,
  sumVectors,
  toComponents,
  toPolar,
} from '../geo';
import { angularDifference, kmToNm, msToKnots, normaliseBearing, reciprocal } from '../units';

describe('units', () => {
  it('converts km to nautical miles', () => {
    expect(kmToNm(1.852)).toBeCloseTo(1, 10);
    expect(kmToNm(20)).toBeCloseTo(10.7991, 4);
  });

  it('converts m/s to knots', () => {
    expect(msToKnots(1)).toBeCloseTo(1.943844, 6);
    expect(msToKnots(10)).toBeCloseTo(19.43844, 5);
  });

  it('normalises bearings into [0, 360)', () => {
    expect(normaliseBearing(370)).toBe(10);
    expect(normaliseBearing(-10)).toBe(350);
    expect(normaliseBearing(360)).toBe(0);
  });

  it('takes the reciprocal of a bearing', () => {
    expect(reciprocal(90)).toBe(270);
    expect(reciprocal(270)).toBe(90);
    expect(reciprocal(0)).toBe(180);
  });

  it('measures the smallest angle between two bearings', () => {
    expect(angularDifference(10, 350)).toBe(20);
    expect(angularDifference(0, 180)).toBe(180);
  });
});

describe('vector maths', () => {
  it('splits a polar vector into east/north components', () => {
    expect(toComponents({ magnitude: 10, directionDeg: 90 })).toEqual({
      east: expect.closeTo(10, 10),
      north: expect.closeTo(0, 10),
    });
    const nw = toComponents({ magnitude: 1, directionDeg: 315 });
    expect(nw.east).toBeCloseTo(-Math.SQRT1_2, 10);
    expect(nw.north).toBeCloseTo(Math.SQRT1_2, 10);
  });

  it('round-trips components back to polar', () => {
    const v = { magnitude: 7.3, directionDeg: 213 };
    const back = toPolar(toComponents(v));
    expect(back.magnitude).toBeCloseTo(v.magnitude, 10);
    expect(back.directionDeg).toBeCloseTo(v.directionDeg, 10);
  });

  it('sums opposing vectors to zero', () => {
    const sum = sumVectors([
      { magnitude: 3, directionDeg: 45 },
      { magnitude: 3, directionDeg: 225 },
    ]);
    expect(sum.magnitude).toBeCloseTo(0, 10);
  });

  it('sums perpendicular vectors into a 3-4-5 triangle', () => {
    const sum = sumVectors([
      { magnitude: 3, directionDeg: 0 },
      { magnitude: 4, directionDeg: 90 },
    ]);
    expect(sum.magnitude).toBeCloseTo(5, 10);
    expect(sum.directionDeg).toBeCloseTo(53.13010235, 6);
  });

  it('scales a vector, reversing it for a negative factor', () => {
    expect(scaleVector({ magnitude: 2, directionDeg: 90 }, 3).magnitude).toBe(6);
    const reversed = scaleVector({ magnitude: 2, directionDeg: 90 }, -1);
    expect(reversed.magnitude).toBe(2);
    expect(reversed.directionDeg).toBe(270);
  });
});

describe('geodesy', () => {
  it('moves due north without shifting longitude', () => {
    const p = destinationPoint({ lat: 0, lon: 0 }, 0, 60);
    expect(distanceNm({ lat: 0, lon: 0 }, p)).toBeCloseTo(60, 10);
    expect(p.lon).toBeCloseTo(0, 10);
    // 60 nm is 0.99932 deg, not exactly 1: an arc-minute on a sphere of mean
    // earth radius is 1855.3 m, while the nautical mile is defined as 1852 m.
    expect(p.lat).toBeCloseTo(0.99932, 5);
  });

  it('round-trips destination and distance', () => {
    const start = { lat: -6.1, lon: 106.8 };
    const end = destinationPoint(start, 231.1155, 3.9824615);
    expect(distanceNm(start, end)).toBeCloseTo(3.9824615, 6);
    expect(bearingDeg(start, end)).toBeCloseTo(231.1155, 4);
  });

  it('returns zero distance for identical points', () => {
    expect(distanceNm({ lat: 5, lon: 5 }, { lat: 5, lon: 5 })).toBe(0);
  });

  it('puts the midpoint half way along the track', () => {
    const a = { lat: -6, lon: 106 };
    const b = { lat: -6.2, lon: 106.3 };
    const m = midpoint(a, b);
    expect(distanceNm(a, m)).toBeCloseTo(distanceNm(m, b), 6);
    expect(distanceNm(a, m) + distanceNm(m, b)).toBeCloseTo(distanceNm(a, b), 6);
  });
});

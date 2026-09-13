/**
 * One test per formula in PRD section 14, in the order the PRD lists them.
 */
import { describe, expect, it } from 'vitest';
import {
  coverageFactor,
  optimalCoverageFactor,
  optimalSearchArea,
  optimalSearchRadius,
  optimalTrackSpacing,
  trackSpacing,
} from '../area';
import {
  computeDrift,
  downwindDirectionDeg,
  leewaySpeedKt,
  leewayVectors,
  totalWaterCurrent,
} from '../drift';
import {
  WIDELY_DIVERGING_SR_THRESHOLD,
  driftError,
  driftVelocityError,
  selectDatumType,
  separationRatio,
  totalProbableError,
  totalWaterCurrentError,
} from '../error';
import {
  correctedSweepWidth,
  cumulativeRelativeEffort,
  effortFactor,
  relativeEffort,
  searchEffort,
  totalAvailableEffort,
} from '../effort';
import { distanceNm } from '../geo';
import { cumulativeProbabilityOfSuccess, probabilityOfSuccess } from '../pos';
import { ASWDVE_BY_STEADINESS, DEFAULT_CURRENT_ERROR_KT } from '../types';

const still = { speedKt: 0, setDirectionDeg: 0 };
const noCurrents = { tidal: still, sea: still, wind: still, other: still };

describe('POS = POC x POD', () => {
  it('multiplies the two probabilities', () => {
    expect(probabilityOfSuccess(0.8, 0.79)).toBeCloseTo(0.632, 10);
    expect(probabilityOfSuccess(1, 1)).toBe(1);
    expect(probabilityOfSuccess(0.5, 0)).toBe(0);
  });

  it('sums POS across searches, capped at certainty', () => {
    expect(cumulativeProbabilityOfSuccess([0.3, 0.25, 0.1])).toBeCloseTo(0.65, 10);
    expect(cumulativeProbabilityOfSuccess([0.7, 0.6])).toBe(1);
  });
});

describe('leeway speed = (multiplier x wind speed) +/- modifier', () => {
  it('applies the multiplier and the modifier', () => {
    // Deep ballast 4-6 person raft, base row: 0.029 x 20 + 0.04.
    expect(leewaySpeedKt({ multiplier: 0.029, modifier: 0.04, divergenceAngleDeg: 15 }, 20)).toBeCloseTo(
      0.62,
      10,
    );
  });

  it('handles a negative modifier', () => {
    // Life raft, no ballast, no canopy, with drogue: 0.044 x 25 - 0.20.
    expect(leewaySpeedKt({ multiplier: 0.044, modifier: -0.2, divergenceAngleDeg: 28 }, 25)).toBeCloseTo(
      0.9,
      10,
    );
  });

  it('clamps a negative result at zero rather than drifting upwind', () => {
    expect(leewaySpeedKt({ multiplier: 0.044, modifier: -0.2, divergenceAngleDeg: 28 }, 1)).toBe(0);
  });

  it('carries leeway downwind, and splits it by the divergence angle', () => {
    const wind = { speedKt: 20, fromDirectionDeg: 90 };
    expect(downwindDirectionDeg(wind)).toBe(270);
    const v = leewayVectors({ multiplier: 0.029, modifier: 0.04, divergenceAngleDeg: 15 }, wind);
    expect(v.centre.directionDeg).toBe(270);
    expect(v.left.directionDeg).toBe(255);
    expect(v.right.directionDeg).toBe(285);
    expect(v.centre.magnitude).toBeCloseTo(0.62, 10);
  });
});

describe('total water current = vector sum of the four components', () => {
  it('adds components that set the same way', () => {
    const twc = totalWaterCurrent({
      tidal: { speedKt: 0.5, setDirectionDeg: 180 },
      sea: { speedKt: 0.3, setDirectionDeg: 180 },
      wind: still,
      other: still,
    });
    expect(twc.magnitude).toBeCloseTo(0.8, 10);
    expect(twc.directionDeg).toBeCloseTo(180, 10);
  });

  it('cancels opposing components', () => {
    const twc = totalWaterCurrent({
      tidal: { speedKt: 0.5, setDirectionDeg: 0 },
      sea: { speedKt: 0.5, setDirectionDeg: 180 },
      wind: still,
      other: still,
    });
    expect(twc.magnitude).toBeCloseTo(0, 10);
  });

  it('resolves perpendicular components', () => {
    const twc = totalWaterCurrent({
      tidal: { speedKt: 0.3, setDirectionDeg: 0 },
      sea: { speedKt: 0.4, setDirectionDeg: 90 },
      wind: still,
      other: still,
    });
    expect(twc.magnitude).toBeCloseTo(0.5, 10);
    expect(twc.directionDeg).toBeCloseTo(53.13010235, 6);
  });
});

describe('datum = drifting start point + drift vector x drift time', () => {
  it('drifts the datum downwind with no current', () => {
    const r = computeDrift({
      startPoint: { lat: 0, lon: 0 },
      driftTimeHours: 10,
      wind: { speedKt: 20, fromDirectionDeg: 180 },
      leeway: { multiplier: 0.05, modifier: 0, divergenceAngleDeg: 0 },
      currents: noCurrents,
      applyDivergence: true,
    });
    // 0.05 x 20 = 1 kt for 10 h = 10 nm due north.
    expect(r.driftVectorCentre.magnitude).toBeCloseTo(1, 10);
    expect(distanceNm({ lat: 0, lon: 0 }, r.datumCentre)).toBeCloseTo(10, 6);
    expect(r.datumCentre.lat).toBeGreaterThan(0);
    expect(r.ddNm).toBe(0);
  });

  it('produces DD = 2 x leeway speed x time x sin(divergence angle)', () => {
    const r = computeDrift({
      startPoint: { lat: 0, lon: 0 },
      driftTimeHours: 10,
      wind: { speedKt: 20, fromDirectionDeg: 180 },
      leeway: { multiplier: 0.05, modifier: 0, divergenceAngleDeg: 30 },
      currents: noCurrents,
      applyDivergence: true,
    });
    expect(r.ddNm).toBeCloseTo(2 * 1 * 10 * Math.sin(Math.PI / 6), 3);
    expect(r.divergenceApplied).toBe(true);
  });

  it('collapses to a single datum when divergence is switched off', () => {
    const base = {
      startPoint: { lat: 0, lon: 0 },
      driftTimeHours: 10,
      wind: { speedKt: 20, fromDirectionDeg: 180 },
      leeway: { multiplier: 0.05, modifier: 0, divergenceAngleDeg: 30 },
      currents: noCurrents,
    };
    const off = computeDrift({ ...base, applyDivergence: false });
    expect(off.ddNm).toBe(0);
    expect(off.datumLeft).toEqual(off.datumCentre);
    expect(off.datumRight).toEqual(off.datumCentre);
  });

  it('adds the water current to the leeway before drifting', () => {
    const r = computeDrift({
      startPoint: { lat: 0, lon: 0 },
      driftTimeHours: 1,
      wind: { speedKt: 20, fromDirectionDeg: 180 },
      leeway: { multiplier: 0.05, modifier: 0, divergenceAngleDeg: 0 },
      currents: { ...noCurrents, tidal: { speedKt: 1, setDirectionDeg: 90 } },
      applyDivergence: true,
    });
    // 1 kt north (leeway) + 1 kt east (tidal) = sqrt(2) kt toward 045.
    expect(r.driftVectorCentre.magnitude).toBeCloseTo(Math.SQRT2, 10);
    expect(r.driftVectorCentre.directionDeg).toBeCloseTo(45, 10);
  });
});

describe('TWCe = sqrt(TCe^2 + SCe^2 + WCe^2 + OWCe^2)', () => {
  it('roots the sum of squares', () => {
    expect(
      totalWaterCurrentError({ tidalKt: 0.3, seaKt: 0.3, windKt: 0.3, otherKt: 0.3 }),
    ).toBeCloseTo(0.6, 10);
    expect(totalWaterCurrentError({ tidalKt: 3, seaKt: 4, windKt: 0, otherKt: 0 })).toBeCloseTo(5, 10);
  });

  it('uses the PRD default of 0.3 kt per component', () => {
    expect(DEFAULT_CURRENT_ERROR_KT).toBe(0.3);
  });
});

describe('Dve = sqrt(ASWDve^2 + TWCe^2 + LWe^2)', () => {
  it('roots the sum of squares', () => {
    expect(driftVelocityError(0.3, 0.6, 0.3)).toBeCloseTo(Math.sqrt(0.54), 10);
    expect(driftVelocityError(0, 0, 0)).toBe(0);
  });

  it('uses 0.3 kt for a steady wind and 0.5 kt for a forecast or variable one', () => {
    expect(ASWDVE_BY_STEADINESS.steady).toBe(0.3);
    expect(ASWDVE_BY_STEADINESS.variable).toBe(0.5);
  });
});

describe('De = Dve x drift time', () => {
  it('scales the velocity error by the drift time', () => {
    expect(driftError(0.7348469228349533, 5)).toBeCloseTo(3.674234614, 8);
    expect(driftError(0.5, 0)).toBe(0);
  });
});

describe('E = sqrt(X^2 + De^2 + Y^2)', () => {
  it('roots the sum of squares', () => {
    expect(totalProbableError(1, 3.674234614174767, 1)).toBeCloseTo(Math.sqrt(15.5), 10);
    expect(totalProbableError(3, 4, 0)).toBeCloseTo(5, 10);
  });

  it('is driven by the drift error alone when both fixes are perfect', () => {
    expect(totalProbableError(0, 4.2, 0)).toBeCloseTo(4.2, 10);
  });
});

describe('SR = DD / E, and the datum type it selects', () => {
  it('divides DD by E', () => {
    expect(separationRatio(1.6046780796, 3.937003937)).toBeCloseTo(0.4075886, 6);
    expect(separationRatio(8, 2)).toBe(4);
  });

  it('is zero when there is no divergence distance', () => {
    expect(separationRatio(0, 3.9)).toBe(0);
  });

  it('selects a single point datum when DD = 0', () => {
    expect(selectDatumType(0, 0)).toBe('single-point');
  });

  it('selects a leeway divergence datum below SR 4', () => {
    expect(selectDatumType(1.6, 0.41)).toBe('leeway-divergence');
    expect(selectDatumType(7.8, 3.9)).toBe('leeway-divergence');
  });

  it('selects widely diverging datums at SR 4 and above', () => {
    expect(selectDatumType(8, WIDELY_DIVERGING_SR_THRESHOLD)).toBe('widely-diverging');
    expect(selectDatumType(20, 10)).toBe('widely-diverging');
  });
});

describe('W = W0 x fw x fv x ff, Z = W x V x T', () => {
  it('corrects the sweep width by all three factors', () => {
    expect(correctedSweepWidth(2.7, 0.5, 1, 1)).toBeCloseTo(1.35, 10);
    expect(correctedSweepWidth(5.0, 0.5, 1, 0.9)).toBeCloseTo(2.25, 10);
  });

  it('multiplies corrected sweep width by speed and endurance', () => {
    expect(searchEffort(1.35, 90, 3)).toBeCloseTo(364.5, 10);
    expect(searchEffort(2.25, 15, 8)).toBeCloseTo(270, 10);
  });

  it('sums Z across every assigned facility to give Zta', () => {
    expect(totalAvailableEffort([364.5, 270])).toBeCloseTo(634.5, 10);
    expect(totalAvailableEffort([])).toBe(0);
  });
});

describe('effort factor fz', () => {
  it('uses E^2 for every point-type datum', () => {
    expect(effortFactor('single-point', 3.937003937, 0).fz).toBeCloseTo(15.5, 8);
    expect(effortFactor('leeway-divergence', 4, 1.6).fz).toBe(16);
    expect(effortFactor('widely-diverging', 4, 20).fz).toBe(16);
    expect(effortFactor('single-point', 4, 0).lNm).toBeUndefined();
  });

  it('uses E x L with L = DD + 2E for a line datum', () => {
    const r = effortFactor('line', 4, 10);
    expect(r.lNm).toBe(18);
    expect(r.fz).toBe(72);
  });
});

describe('Zr = Zta / fz, Zrc = sum of Zr', () => {
  it('divides total effort by the effort factor', () => {
    expect(relativeEffort(634.5, 15.5)).toBeCloseTo(40.93548387, 8);
  });

  it('sums relative effort across every search to date', () => {
    expect(cumulativeRelativeEffort([12.5, 8.25, 40.93548387])).toBeCloseTo(61.68548387, 8);
    expect(cumulativeRelativeEffort([])).toBe(0);
  });
});

describe('Ro = fs x E', () => {
  it('scales the probable error by the safety factor', () => {
    expect(optimalSearchRadius(1.1, 3.937003937005905)).toBeCloseTo(4.330704331, 8);
    expect(optimalSearchRadius(2.5, 4)).toBe(10);
  });
});

describe('optimal search area Ao, by datum type', () => {
  it('single point datum: Ao = 4 Ro^2', () => {
    const r = optimalSearchArea('single-point', 5, 0);
    expect(r.aoNm2).toBe(100);
    expect(r.subAreas).toHaveLength(1);
    expect(r.subAreas[0]).toMatchObject({ widthNm: 10, lengthNm: 10, areaNm2: 100 });
  });

  it('leeway divergence datum: Ao = 4 Ro^2 + 2 Ro DD, as one elongated area', () => {
    const r = optimalSearchArea('leeway-divergence', 5, 4);
    expect(r.aoNm2).toBe(140);
    expect(r.subAreas).toHaveLength(1);
    expect(r.subAreas[0]).toMatchObject({ widthNm: 10, lengthNm: 14, areaNm2: 140 });
  });

  it('widely diverging datums: two separate areas of 4 Ro^2 each', () => {
    const r = optimalSearchArea('widely-diverging', 5, 40);
    expect(r.subAreas).toHaveLength(2);
    expect(r.subAreas[0].areaNm2).toBe(100);
    expect(r.subAreas[1].areaNm2).toBe(100);
    expect(r.aoNm2).toBe(200);
  });

  it('line datum: Ao = 2 Ro L', () => {
    const r = optimalSearchArea('line', 5, 10, 20);
    expect(r.aoNm2).toBe(200);
    expect(r.subAreas[0]).toMatchObject({ widthNm: 10, lengthNm: 20 });
  });

  it('refuses a line datum without L rather than guessing one', () => {
    expect(() => optimalSearchArea('line', 5, 10)).toThrow(/requires L/);
  });
});

describe('coverage factor C = Z / A', () => {
  it('divides effort by area', () => {
    expect(coverageFactor(200, 100)).toBe(2);
    expect(optimalCoverageFactor(634.5, 88.9187726177356)).toBeCloseTo(7.135726026, 8);
  });

  it('is equal across sub-areas when effort is split in proportion to area', () => {
    const co = optimalCoverageFactor(634.5, 200);
    expect(coverageFactor(634.5 / 2, 100)).toBeCloseTo(co, 10);
  });
});

describe('track spacing S = W / C', () => {
  it('divides corrected sweep width by the coverage factor', () => {
    expect(trackSpacing(2, 1)).toBe(2);
    expect(optimalTrackSpacing(1.35, 7.135726026355921)).toBeCloseTo(0.189188878, 8);
    expect(optimalTrackSpacing(2.25, 7.135726026355921)).toBeCloseTo(0.315314797, 8);
  });

  it('is wider than the sweep width when coverage is below 1', () => {
    expect(optimalTrackSpacing(2, 0.5)).toBe(4);
  });
});

/**
 * End-to-end worked case: drifting start point through to track spacing,
 * checked against a hand calculation.
 *
 * ============================ THE HAND CALCULATION ============================
 *
 * CASE FACTS
 *   Drifting start point (LKP)  06 00.0 S, 106 30.0 E, fixed by GPS-equipped
 *                               vessel; X taken as 1.0 nm (RADAR fix)
 *   Drift time                  5 h
 *   Wind                        20 kt from 090 (steady)
 *   Search object               life raft, deep ballast + canopy, 4-6 person,
 *                               base row: multiplier 0.029, modifier 0.04,
 *                               divergence angle 15 deg  (Table D-5:2)
 *   Tidal current               0.5 kt setting 180. Sea, wind and other
 *                               currents nil.
 *   Search facility error Y     1.0 nm
 *
 * 1. LEEWAY
 *      leeway speed = 0.029 x 20 + 0.04 = 0.62 kt
 *      downwind     = 090 + 180 = 270
 *      divergence   = 270 -/+ 15 -> left 255, right 285
 *
 * 2. DRIFT VECTORS (east/north components, kt)
 *      TWC          0.5 kt @ 180        -> ( 0.0000, -0.5000)
 *      leeway ctr   0.62 kt @ 270       -> (-0.6200,  0.0000)
 *      leeway left  0.62 kt @ 255       -> (-0.5989, -0.1605)
 *      leeway right 0.62 kt @ 285       -> (-0.5989,  0.1605)
 *      drift ctr    (-0.6200, -0.5000)  -> 0.79649 kt @ 231.116
 *      drift left   (-0.5989, -0.6605)  -> 0.89155 kt @ 222.200
 *      drift right  (-0.5989, -0.3395)  -> 0.68843 kt @ 240.449
 *
 * 3. DATUMS AND DD, after 5 h
 *      datum left   4.4578 nm @ 222.200 from the LKP
 *      datum right  3.4421 nm @ 240.449 from the LKP
 *      DD = 2 x leeway speed x t x sin(divergence)
 *         = 2 x 0.62 x 5 x sin 15 = 1.60468 nm
 *
 * 4. ERRORS
 *      TWCe = sqrt(0.3^2 x 4)                      = 0.60000 kt
 *      Dve  = sqrt(0.3^2 + 0.6^2 + 0.3^2)          = 0.73485 kt
 *      De   = 0.73485 x 5                          = 3.67423 nm
 *      E    = sqrt(1^2 + 3.67423^2 + 1^2) = sqrt(15.5) = 3.93700 nm
 *
 * 5. DATUM TYPE
 *      SR = DD / E = 1.60468 / 3.93700 = 0.4076
 *      SR < 4 -> leeway divergence datum, one combined search area
 *
 * 6. SEARCH EFFORT
 *      Helicopter, 500 ft, 6-person raft, visibility 20 km  W0 = 2.7 nm
 *        fw 0.5 (20 kt wind, small object), fv 1.0, ff 1.0 (rested)
 *        W = 2.7 x 0.5 x 1.0 x 1.0 = 1.35 nm
 *        Z = 1.35 x 90 kt x 3 h    = 364.5 nm2
 *      Vessel, 14 ft eye height, 6-person raft, visibility 20 km  W0 = 5.0 nm
 *        fw 0.5, fv 1.0, ff 0.9 (fatigued)
 *        W = 5.0 x 0.5 x 1.0 x 0.9 = 2.25 nm
 *        Z = 2.25 x 15 kt x 8 h    = 270.0 nm2
 *      Zta = 364.5 + 270.0 = 634.5 nm2
 *
 * 7. EFFORT FACTOR AND RELATIVE EFFORT
 *      fz  = E^2 = 15.5 nm2      (point-type datum)
 *      Zr  = 634.5 / 15.5 = 40.9355
 *      Zrc = 40.9355            (first search on this case)
 *
 * 8. SEARCH AREA
 *      fs = 1.1 (initial probability area, Table 3-2)
 *      Ro = 1.1 x 3.93700 = 4.33070 nm
 *      Ao = 4 Ro^2 + 2 Ro DD
 *         = 4 x 18.755 + 2 x 4.33070 x 1.60468
 *         = 75.020 + 13.8988 = 88.9188 nm2
 *      Co = Zta / Ao = 634.5 / 88.9188 = 7.13573
 *
 * 9. TRACK SPACING
 *      So helicopter = 1.35 / 7.13573 = 0.18919 nm
 *      So vessel     = 2.25 / 7.13573 = 0.31531 nm
 *
 * 10. SUCCESS
 *      POC 0.80, POD 0.79 -> POS = 0.632
 * ==============================================================================
 */

import { describe, expect, it } from 'vitest';
import { calculateCase, type CaseCalculationInput } from '../calculate';
import { bearingDeg, distanceNm } from '../geo';
import {
  fatigueCorrectionFactor,
  fixErrorByNavigation,
  getLeewayEntry,
  lookupSweepWidth,
  safetyFactorForStage,
  weatherCorrectionFactor,
} from '../tables';
import { DEFAULT_CURRENT_ERROR_KT, DEFAULT_LEEWAY_ERROR_KT, ASWDVE_BY_STEADINESS } from '../types';

const LKP = { lat: -6.0, lon: 106.5 };
const still = { speedKt: 0, setDirectionDeg: 0 };

function buildInput(): CaseCalculationInput {
  const leeway = getLeewayEntry('dbraft-4-6-general');
  const heliW0 = lookupSweepWidth('helicopter-500', 'Life raft, 6 person', 20).w0;
  const vesselW0 = lookupSweepWidth('vessel-14ft', 'Life raft, 6 person', 20).w0;
  const fw = weatherCorrectionFactor(20, 'small').factor;

  return {
    drift: {
      startPoint: LKP,
      driftTimeHours: 5,
      wind: { speedKt: 20, fromDirectionDeg: 90 },
      leeway,
      currents: {
        tidal: { speedKt: 0.5, setDirectionDeg: 180 },
        sea: still,
        wind: still,
        other: still,
      },
      applyDivergence: true,
    },
    errors: {
      aswdveKt: ASWDVE_BY_STEADINESS.steady,
      currentErrors: {
        tidalKt: DEFAULT_CURRENT_ERROR_KT,
        seaKt: DEFAULT_CURRENT_ERROR_KT,
        windKt: DEFAULT_CURRENT_ERROR_KT,
        otherKt: DEFAULT_CURRENT_ERROR_KT,
      },
      lweKt: DEFAULT_LEEWAY_ERROR_KT,
      xNm: fixErrorByNavigation('radar').errorNm!,
      yNm: fixErrorByNavigation('radar').errorNm!,
    },
    fs: safetyFactorForStage('initial'),
    assets: [
      {
        id: 'heli-1',
        name: 'Helicopter 1',
        w0Nm: heliW0,
        fw,
        fv: 1.0,
        ff: fatigueCorrectionFactor(false),
        speedKt: 90,
        enduranceHours: 3,
      },
      {
        id: 'vessel-1',
        name: 'Patrol vessel 1',
        w0Nm: vesselW0,
        fw,
        fv: 1.0,
        ff: fatigueCorrectionFactor(true),
        speedKt: 15,
        enduranceHours: 8,
      },
    ],
    poc: 0.8,
    pod: 0.79,
  };
}

describe('worked case: LKP through to track spacing', () => {
  const r = calculateCase(buildInput());

  it('step 1: leeway speed 0.62 kt, downwind 270, divergence 255/285', () => {
    expect(r.drift.leeway.speedKt).toBeCloseTo(0.62, 10);
    expect(r.drift.leeway.downwindDeg).toBe(270);
    expect(r.drift.leeway.left.directionDeg).toBe(255);
    expect(r.drift.leeway.right.directionDeg).toBe(285);
  });

  it('step 2: drift vectors 0.79649/0.89155/0.68843 kt', () => {
    expect(r.drift.totalWaterCurrent.magnitude).toBeCloseTo(0.5, 10);
    expect(r.drift.totalWaterCurrent.directionDeg).toBeCloseTo(180, 10);
    expect(r.drift.driftVectorCentre.magnitude).toBeCloseTo(0.796492, 6);
    expect(r.drift.driftVectorCentre.directionDeg).toBeCloseTo(231.1155, 4);
    expect(r.drift.driftVectorLeft.magnitude).toBeCloseTo(0.891554, 6);
    expect(r.drift.driftVectorLeft.directionDeg).toBeCloseTo(222.1999, 4);
    expect(r.drift.driftVectorRight.magnitude).toBeCloseTo(0.688427, 6);
    expect(r.drift.driftVectorRight.directionDeg).toBeCloseTo(240.4489, 4);
  });

  it('step 3: datums 4.4578 nm @ 222.200 and 3.4421 nm @ 240.449, DD 1.6047 nm', () => {
    expect(distanceNm(LKP, r.datum.datumLeft)).toBeCloseTo(4.45777, 4);
    expect(bearingDeg(LKP, r.datum.datumLeft)).toBeCloseTo(222.1999, 3);
    expect(distanceNm(LKP, r.datum.datumRight)).toBeCloseTo(3.44214, 4);
    expect(bearingDeg(LKP, r.datum.datumRight)).toBeCloseTo(240.4489, 3);
    expect(r.datum.ddNm).toBeCloseTo(1.60468, 3);
  });

  it('step 4: TWCe 0.6, Dve 0.73485, De 3.67423, E 3.93700 nm', () => {
    expect(r.error.twceKt).toBeCloseTo(0.6, 10);
    expect(r.error.dveKt).toBeCloseTo(0.734847, 6);
    expect(r.error.deNm).toBeCloseTo(3.674235, 6);
    expect(r.error.eNm).toBeCloseTo(3.937004, 6);
    expect(r.error.eNm ** 2).toBeCloseTo(15.5, 8);
  });

  it('step 5: SR 0.4076 selects a leeway divergence datum', () => {
    expect(r.datum.srValue).toBeCloseTo(0.4076, 3);
    expect(r.datum.autoDatumType).toBe('leeway-divergence');
    expect(r.datum.datumType).toBe('leeway-divergence');
    expect(r.datum.overridden).toBe(false);
  });

  it('step 6: W 1.35/2.25 nm, Z 364.5/270 nm2, Zta 634.5 nm2', () => {
    expect(r.assets[0].wNm).toBeCloseTo(1.35, 10);
    expect(r.assets[0].zNm2).toBeCloseTo(364.5, 10);
    expect(r.assets[1].wNm).toBeCloseTo(2.25, 10);
    expect(r.assets[1].zNm2).toBeCloseTo(270, 10);
    expect(r.effort.ztaNm2).toBeCloseTo(634.5, 10);
  });

  it('step 7: fz 15.5, Zr 40.9355, Zrc 40.9355', () => {
    expect(r.effort.fz).toBeCloseTo(15.5, 8);
    expect(r.effort.lNm).toBeUndefined();
    expect(r.effort.zr).toBeCloseTo(40.93548, 5);
    expect(r.effort.zrc).toBeCloseTo(40.93548, 5);
  });

  it('step 7b: reports a normal search condition, since fw and ff are below 1', () => {
    expect(r.effort.searchCondition).toBe('normal');
  });

  it('step 8: Ro 4.33070 nm, Ao 88.9188 nm2, Co 7.13573', () => {
    expect(r.area.roNm).toBeCloseTo(4.330704, 6);
    expect(r.area.aoNm2).toBeCloseTo(88.9188, 3);
    expect(r.area.co).toBeCloseTo(7.135726, 4);
    expect(r.area.subAreas).toHaveLength(1);
    expect(r.area.subAreas[0].widthNm).toBeCloseTo(8.661409, 5);
    expect(r.area.subAreas[0].lengthNm).toBeCloseTo(10.266087, 3);
  });

  it('step 9: So 0.18919 nm for the helicopter, 0.31531 nm for the vessel', () => {
    expect(r.assets[0].soNm).toBeCloseTo(0.189189, 5);
    expect(r.assets[1].soNm).toBeCloseTo(0.315315, 5);
  });

  it('step 10: POS 0.632', () => {
    expect(r.success.pos).toBeCloseTo(0.632, 10);
    expect(r.success.posCumulative).toBeCloseTo(0.632, 10);
  });

  it('cross-check: Co = Zta / Ao holds against the parts it was built from', () => {
    expect(r.area.co * r.area.aoNm2).toBeCloseTo(r.effort.ztaNm2, 6);
    expect(r.assets[0].soNm * r.area.co).toBeCloseTo(r.assets[0].wNm, 8);
    expect(r.assets[1].soNm * r.area.co).toBeCloseTo(r.assets[1].wNm, 8);
  });

  it('cross-check: the rectangle laid on the map has area Ao', () => {
    const rect = r.geometry.searchRectangles[0];
    expect(rect.widthNm * rect.lengthNm).toBeCloseTo(r.area.aoNm2, 4);
    expect(r.geometry.searchRectangles).toHaveLength(1);
    expect(r.geometry.errorCircles).toHaveLength(2);
    expect(r.geometry.errorCircles[0].radiusNm).toBeCloseTo(r.error.eNm, 10);
  });

  it('cross-check: each drift track is as long as the displacement that made it', () => {
    // The worked case diverges, so there are two tracks of unequal length:
    // the left and right drift vectors differ, and each track must match its
    // own displacement rather than both quoting the centre figure.
    const [left, right] = r.geometry.driftTrack;
    expect(r.geometry.driftTrack).toHaveLength(2);
    expect(left.distanceNm).toBeCloseTo(r.drift.displacementLeft.magnitude, 6);
    expect(right.distanceNm).toBeCloseTo(r.drift.displacementRight.magnitude, 6);
    expect(left.label).not.toBe(right.label);

    // And the two datums are DD apart, which is the difference these two
    // tracks exist to show.
    expect(distanceNm(left.points[1], right.points[1])).toBeCloseTo(r.datum.ddNm, 6);
  });

  it('is deterministic: the same input replays to the same numbers', () => {
    const again = calculateCase(buildInput());
    expect(again.area.aoNm2).toBe(r.area.aoNm2);
    expect(again.datum.datumLeft).toEqual(r.datum.datumLeft);
  });

  it('completes a full recalculation well inside the two second budget', () => {
    const started = performance.now();
    for (let i = 0; i < 50; i++) calculateCase(buildInput());
    expect((performance.now() - started) / 50).toBeLessThan(2000);
  });
});

describe('worked case variants', () => {
  it('a manual datum type override wins over the auto-selection', () => {
    const r = calculateCase({ ...buildInput(), datumTypeOverride: 'single-point' });
    expect(r.datum.autoDatumType).toBe('leeway-divergence');
    expect(r.datum.datumType).toBe('single-point');
    expect(r.datum.overridden).toBe(true);
    // Ao falls back to 4 Ro^2 = 75.02 nm2, with the DD term dropped.
    expect(r.area.aoNm2).toBeCloseTo(75.02, 3);
  });

  it('a wide divergence angle pushes SR past 4 and splits the area in two', () => {
    const input = buildInput();
    // Commercial fishing vessel: 48 deg divergence, multiplier 0.037.
    input.drift.leeway = getLeewayEntry('fv-general');
    const r = calculateCase(input);
    // leeway = 0.037 x 20 + 0.02 = 0.76 kt
    // DD = 2 x 0.76 x 5 x sin 48 = 5.6479 nm; E is unchanged at
    // sqrt(15.5) = 3.9370, so SR = 5.6479 / 3.9370 = 1.4346 -- still below 4.
    expect(r.datum.srValue).toBeCloseTo(1.4346, 3);
    expect(r.datum.datumType).toBe('leeway-divergence');

    // Stretching the drift time alone will never clear SR 4: DD and De both
    // scale with time, so SR climbs to an asymptote of
    //   2 x leeway speed x sin(divergence) / Dve
    // which here is 2 x 0.76 x sin 48 / 0.73485 = 1.537. (The engine lands a
    // shade under that: over the ~800 nm this extreme drift time throws, the
    // two great-circle tracks converge slightly against the planar formula.)
    expect(
      calculateCase({
        ...input,
        drift: { ...input.drift, driftTimeHours: 1000 },
      }).datum.srValue,
    ).toBeCloseTo(1.53, 1);

    // Two independent areas need a big leeway against a small drift velocity
    // error: 40 kt of wind on the same hull, tighter current estimates, and a
    // long drift.
    //   leeway = 0.037 x 40 + 0.02 = 1.50 kt
    //   Dve    = sqrt(0.3^2 + (0.1 x 4 components -> 0.2)^2 + 0.1^2) = 0.37417
    //   over 24 h: DD = 2 x 1.5 x 24 x sin 48 = 53.506 nm
    //              De = 0.37417 x 24          =  8.980 nm
    //              E  = sqrt(0.1^2 + 8.980^2 + 0.1^2) = 8.981 nm
    //              SR = 53.506 / 8.981 = 5.958
    input.drift.wind = { speedKt: 40, fromDirectionDeg: 90 };
    input.drift.driftTimeHours = 24;
    input.errors.currentErrors = { tidalKt: 0.1, seaKt: 0.1, windKt: 0.1, otherKt: 0.1 };
    input.errors.lweKt = 0.1;
    input.errors.xNm = 0.1;
    input.errors.yNm = 0.1;
    const r2 = calculateCase(input);
    expect(r2.datum.ddNm).toBeCloseTo(53.506, 1);
    expect(r2.error.eNm).toBeCloseTo(8.981, 2);
    expect(r2.datum.srValue).toBeCloseTo(5.958, 2);
    expect(r2.datum.srValue).toBeGreaterThan(4);
    expect(r2.datum.datumType).toBe('widely-diverging');
    expect(r2.area.subAreas).toHaveLength(2);
    expect(r2.area.aoNm2).toBeCloseTo(8 * r2.area.roNm ** 2, 6);
    expect(r2.geometry.searchRectangles).toHaveLength(2);
  });

  it('a line datum drifts the whole line and uses Ao = 2 Ro L', () => {
    const input = buildInput();
    input.datumTypeOverride = 'line';
    // A track line running 0.2 deg due north of the LKP. On a sphere of mean
    // earth radius that is 12.0081 nm, not 12: see the geo test suite.
    input.lineEndPoint = { lat: -6.0 + 0.2, lon: 106.5 };
    const lineLengthNm = distanceNm(LKP, input.lineEndPoint);
    expect(lineLengthNm).toBeCloseTo(12.0081, 4);
    const r = calculateCase(input);
    expect(r.datum.ddNm).toBeCloseTo(lineLengthNm, 4);
    expect(r.effort.lNm).toBeCloseTo(lineLengthNm + 2 * r.error.eNm, 4);
    expect(r.effort.fz).toBeCloseTo(r.error.eNm * r.effort.lNm!, 8);
    expect(r.area.aoNm2).toBeCloseTo(2 * r.area.roNm * r.effort.lNm!, 8);
    expect(r.geometry.searchRectangles[0].lengthNm).toBeCloseTo(r.effort.lNm!, 8);
  });

  it('carries prior searches into Zrc and POSc', () => {
    const r = calculateCase({ ...buildInput(), priorRelativeEfforts: [10, 5], priorPos: [0.2] });
    expect(r.effort.zr).toBeCloseTo(40.93548, 5);
    expect(r.effort.zrc).toBeCloseTo(55.93548, 5);
    expect(r.success.posCumulative).toBeCloseTo(0.832, 10);
  });

  it('runs with no assets assigned yet, leaving coverage undefined-but-infinite', () => {
    const r = calculateCase({ ...buildInput(), assets: [] });
    expect(r.effort.ztaNm2).toBe(0);
    expect(r.area.co).toBe(0);
    expect(r.area.roNm).toBeCloseTo(4.330704, 6);
    expect(r.assets).toHaveLength(0);
  });
});

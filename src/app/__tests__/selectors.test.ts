/**
 * The override and provenance layer, PRD 6.3 and 6.8: every auto-derived
 * value can be overridden, is tagged with where it came from, and resets
 * cleanly back to the source value.
 */

import { describe, expect, it } from 'vitest';
import { newAsset, newCase } from '../defaults';
import {
  deriveCase,
  fixErrorOptions,
  resolve,
  resolveAsset,
  resolveDriftTime,
  resolveFs,
  resolveLeeway,
  resolveX,
  resolveY,
} from '../selectors';

describe('resolve', () => {
  it('uses the auto value when no override is set', () => {
    const r = resolve(1.1, null, 'Table 3-2');
    expect(r.value).toBe(1.1);
    expect(r.isAuto).toBe(true);
    expect(r.sourceLabel).toBe('Table 3-2');
  });

  it('uses the override when one is set, and keeps the auto value for reset', () => {
    const r = resolve(1.1, 2.4, 'Table 3-2');
    expect(r.value).toBe(2.4);
    expect(r.autoValue).toBe(1.1);
    expect(r.isAuto).toBe(false);
  });

  it('overrides an auto value of zero rather than falling through to it', () => {
    expect(resolve(5, 0, 'Table').value).toBe(0);
  });

  it('drops the source warning once the user has taken the value over', () => {
    expect(resolve(5, null, 'INS', 'work the rule').warning).toBe('work the rule');
    expect(resolve(5, 3, 'INS', 'work the rule').warning).toBeUndefined();
  });
});

describe('drift time', () => {
  it('derives from the distress and search start times', () => {
    const c = newCase();
    c.distressTimeIso = '2026-03-01T06:00';
    c.searchStartTimeIso = '2026-03-01T11:30';
    expect(resolveDriftTime(c).value).toBeCloseTo(5.5, 10);
    expect(resolveDriftTime(c).isAuto).toBe(true);
  });

  it('never goes negative when the search start precedes the distress time', () => {
    const c = newCase();
    c.distressTimeIso = '2026-03-01T11:00';
    c.searchStartTimeIso = '2026-03-01T06:00';
    expect(resolveDriftTime(c).value).toBe(0);
  });

  it('honours a manual override', () => {
    const c = newCase();
    c.driftTimeOverride = 12;
    expect(resolveDriftTime(c).value).toBe(12);
    expect(resolveDriftTime(c).isAuto).toBe(false);
  });
});

describe('fix error resolution', () => {
  it('reads a numeric fix error straight from the table', () => {
    const c = newCase();
    c.xSourceId = 'radar';
    expect(resolveX(c).value).toBe(1);
    expect(resolveX(c).sourceLabel).toContain('Table D-6:1');
  });

  it('falls back by craft type when the means of navigation is unknown', () => {
    const c = newCase();
    c.xSourceId = 'craft:small-craft';
    expect(resolveX(c).value).toBe(15);
    expect(resolveX(c).sourceLabel).toContain('Table D-6:2');
  });

  it('flags a rule-based entry instead of inventing a number for it', () => {
    const c = newCase();
    c.ySourceId = 'ins';
    const y = resolveY(c);
    expect(y.warning).toMatch(/rule, not a fixed value/);
    // The practical default stands in until the planner works the rule.
    expect(y.value).toBe(1);
  });

  it('offers every row of both position error tables', () => {
    const options = fixErrorOptions();
    expect(options.filter((o) => o.group.includes('D-6:1'))).toHaveLength(8);
    expect(options.filter((o) => o.group.includes('D-6:2'))).toHaveLength(4);
  });
});

describe('leeway resolution', () => {
  it('reads all three coefficients from the chosen table row', () => {
    const c = newCase();
    c.leewayObjectId = 'piw-sitting';
    const l = resolveLeeway(c);
    expect(l.multiplier.value).toBe(0.012);
    expect(l.modifier.value).toBe(0);
    expect(l.divergenceAngleDeg.value).toBe(18);
    expect(l.multiplier.isAuto).toBe(true);
  });

  it('lets each coefficient be overridden on its own', () => {
    const c = newCase();
    c.leewayObjectId = 'piw-sitting';
    c.leewayDivergenceOverride = 0;
    const l = resolveLeeway(c);
    expect(l.divergenceAngleDeg.value).toBe(0);
    expect(l.divergenceAngleDeg.isAuto).toBe(false);
    expect(l.multiplier.isAuto).toBe(true);
  });
});

describe('asset resolution', () => {
  it('looks W0 up from the chosen table, row and visibility', () => {
    const c = newCase();
    c.visibilityKm = 20;
    const asset = { ...newAsset(0), sweepTableId: 'vessel-14ft', sweepObject: 'Life raft, 6 person' };
    expect(resolveAsset(asset, c).w0.value).toBe(5.0);
  });

  it('flags an interpolated W0 rather than passing it off as a table value', () => {
    const c = newCase();
    c.visibilityKm = 12.5;
    const r = resolveAsset({ ...newAsset(0), sweepObject: 'Life raft, 6 person' }, c);
    expect(r.w0Interpolated).toBe(true);
    expect(r.w0.warning).toMatch(/Interpolated/);
  });

  it('leaves W0 at zero and says so when the table has no row for the object', () => {
    const c = newCase();
    const r = resolveAsset({ ...newAsset(0), sweepTableId: 'merchant-ship', sweepObject: 'Nope' }, c);
    expect(r.w0.value).toBe(0);
    expect(r.w0.sourceLabel).toMatch(/No matching table row/);
  });

  it('derives fw from the wind, and from the sea height when that is worse', () => {
    const c = newCase();
    c.windSpeedKt = 10;
    expect(resolveAsset(newAsset(0), c).fw.value).toBe(1.0);
    c.windSpeedKt = 20;
    expect(resolveAsset(newAsset(0), c).fw.value).toBe(0.5);
    c.windSpeedKt = 10;
    c.seaHeightM = 2;
    expect(resolveAsset(newAsset(0), c).fw.value).toBe(0.25);
  });

  it('derives ff from the fatigue flag', () => {
    const c = newCase();
    expect(resolveAsset({ ...newAsset(0), crewFatigued: false }, c).ff.value).toBe(1.0);
    expect(resolveAsset({ ...newAsset(0), crewFatigued: true }, c).ff.value).toBe(0.9);
  });

  it('reads fv from Table D-5:8 for aircraft, and leaves it at 1.0 elsewhere', () => {
    // A new facility is a vessel, and D-5:8 covers aircraft only.
    const vessel = resolveAsset(newAsset(0), newCase());
    expect(vessel.fv.value).toBe(1.0);
    expect(vessel.fv.sourceLabel).toMatch(/aircraft/);

    // A helicopter at 140 kt searching for a person in the water is the
    // harshest correction the table prints.
    const heli = newAsset(1);
    heli.sweepTableId = 'helicopter-500';
    heli.sweepObject = 'Person in water';
    heli.speedKt = 140;
    expect(resolveAsset(heli, newCase()).fv.value).toBe(0.7);

    // At or below the first printed speed the first column applies.
    heli.speedKt = 50;
    expect(resolveAsset(heli, newCase()).fv.value).toBe(1.5);

    // Between columns it interpolates and says so.
    heli.speedKt = 75;
    const mid = resolveAsset(heli, newCase()).fv;
    expect(mid.value).toBeCloseTo(1.25, 3);
    expect(mid.warning).toMatch(/Interpolated/);
  });
});

describe('deriveCase', () => {
  it('builds engine input a new case can be calculated from', () => {
    const input = deriveCase(newCase()).engineInput;
    expect(input.drift.driftTimeHours).toBeCloseTo(5, 6);
    expect(input.errors.currentErrors).toEqual({
      tidalKt: 0.3,
      seaKt: 0.3,
      windKt: 0.3,
      otherKt: 0.3,
    });
    expect(input.fs).toBe(1.1);
    expect(input.assets).toHaveLength(1);
  });

  it('maps wind steadiness onto ASWDve', () => {
    const c = newCase();
    expect(deriveCase(c).engineInput.errors.aswdveKt).toBe(0.3);
    c.windSteadiness = 'variable';
    expect(deriveCase(c).engineInput.errors.aswdveKt).toBe(0.5);
  });

  it('passes overrides through to the engine, not the table values', () => {
    const c = newCase();
    c.fsOverride = 2.5;
    c.xOverride = 7;
    c.assets[0].w0Override = 3.3;
    const input = deriveCase(c).engineInput;
    expect(input.fs).toBe(2.5);
    expect(input.errors.xNm).toBe(7);
    expect(input.assets[0].w0Nm).toBe(3.3);
  });

  it('resolves fs from the search stage', () => {
    const c = newCase();
    c.searchStage = 'third-expansion';
    expect(resolveFs(c).value).toBe(2.3);
    expect(deriveCase(c).engineInput.fs).toBe(2.3);
  });
});

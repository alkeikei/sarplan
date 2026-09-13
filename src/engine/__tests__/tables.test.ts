import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FACILITY_FIX_ERROR_NM,
  DEFAULT_TARGET_FIX_ERROR_NM,
  LEEWAY_TABLE,
  SAFETY_FACTOR_TABLE,
  SWEEP_WIDTH_TABLES,
  VEGETATION_CORRECTION,
  deadReckoningError,
  fatigueCorrectionFactor,
  fixErrorByCraft,
  fixErrorByNavigation,
  getLeewayEntry,
  leewayCategories,
  lookupSweepWidth,
  safetyFactorForStage,
  searchCondition,
  weatherCorrectionFactor,
} from '../tables';

describe('leeway table (AMSA NATSAR 2026, Tables D-5:1 and D-5:2)', () => {
  it('has unique ids for every row', () => {
    const ids = LEEWAY_TABLE.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('carries every transcribed row', () => {
    // 41 rows from Table D-5:1 plus 11 from the deep-ballast sub-table D-5:2.
    expect(LEEWAY_TABLE).toHaveLength(53);
  });

  it('reads source values back exactly', () => {
    // AMSA Table D-5:1. Its worked examples pin two of these: a person in
    // the water uses the general PIW row (0.011 / 0.07), and a scuba diver
    // uses 0.007 / 0.08 at 30 degrees.
    expect(getLeewayEntry('piw-general')).toMatchObject({
      multiplier: 0.011,
      modifier: 0.07,
      divergenceAngleDeg: 30,
    });
    expect(getLeewayEntry('piw-vertical')).toMatchObject({
      multiplier: 0.005,
      modifier: 0.07,
      divergenceAngleDeg: 18,
    });
    expect(getLeewayEntry('piw-sitting')).toMatchObject({
      multiplier: 0.012,
      modifier: 0.0,
      divergenceAngleDeg: 18,
    });
    expect(getLeewayEntry('piw-horizontal-scuba-suit')).toMatchObject({
      multiplier: 0.007,
      modifier: 0.08,
      divergenceAngleDeg: 30,
    });
    expect(getLeewayEntry('dbraft-15-25-swamped')).toMatchObject({
      multiplier: 0.01,
      modifier: -0.04,
      divergenceAngleDeg: 8,
    });
  });

  it('throws on an unknown object id rather than guessing', () => {
    expect(() => getLeewayEntry('not-a-row')).toThrow(/Unknown leeway object id/);
  });

  it('groups rows by category without reordering them', () => {
    const groups = leewayCategories();
    expect(groups[0].category).toBe('Person in water');
    expect(groups.flatMap((g) => g.entries)).toEqual(LEEWAY_TABLE);
  });
});

describe('sweep width tables', () => {
  it('gives every row one value per visibility column', () => {
    for (const table of SWEEP_WIDTH_TABLES) {
      for (const row of table.rows) {
        expect(row.values, `${table.id} / ${row.object}`).toHaveLength(table.visibilityKm.length);
      }
    }
  });

  it('reads an exact column without interpolating', () => {
    const r = lookupSweepWidth('vessel-14ft', 'Life raft, 6 person', 20);
    expect(r.w0).toBe(5.0);
    expect(r.interpolated).toBe(false);
  });

  it('interpolates between two columns and flags it', () => {
    // Vessel 8 ft, person in water: 0.2 at 5 km, 0.3 at 10 km -> 0.25 at 7.5 km.
    const r = lookupSweepWidth('vessel-8ft', 'Person in water', 7.5);
    expect(r.w0).toBeCloseTo(0.25, 10);
    expect(r.interpolated).toBe(true);
  });

  it('clamps to the end columns outside the table', () => {
    expect(lookupSweepWidth('helicopter-500', 'Ship >91m', 1).w0).toBe(0.8);
    expect(lookupSweepWidth('helicopter-500', 'Ship >91m', 100).w0).toBe(29.8);
  });

  it('carries every row and column the printed appendix prints', () => {
    // The aircraft and land tables were once transcribed only in part, so an
    // object a planner picked could fall through to manual entry. These counts
    // are the printed tables' own shapes.
    const shape = (id: string) => {
      const t = SWEEP_WIDTH_TABLES.find((x) => x.id === id)!;
      return [t.rows.length, t.visibilityKm.length];
    };
    for (const alt of [500, 1000, 1500, 2000]) {
      expect(shape(`fixed-wing-${alt}`)).toEqual([23, 6]);
      expect(shape(`helicopter-${alt}`)).toEqual([23, 6]);
    }
    expect(shape('vessel-8ft')).toEqual([22, 6]);
    expect(shape('merchant-ship')).toEqual([9, 5]);
    // Land search has no Person row above 1000 ft: the source prints a dash.
    expect(shape('land-500')).toEqual([4, 5]);
    expect(shape('land-1500')).toEqual([3, 5]);
    expect(SWEEP_WIDTH_TABLES.every((t) => t.rows.every((r) => r.values.length === t.visibilityKm.length))).toBe(true);
  });

  it('carries the source footnote for the 500 ft person-in-water row', () => {
    const r = lookupSweepWidth('fixed-wing-500', 'Person in water', 10);
    expect(r.note).toMatch(/flotation device/);
    expect(r.sourceTable).toBe('Table D-5:6 (1)');
  });

  it('throws for an object the table does not carry', () => {
    expect(() => lookupSweepWidth('merchant-ship', 'Life raft, 8 person', 10)).toThrow(
      /no row for object/,
    );
  });

  it('carries the vegetation correction factors for land search', () => {
    expect(VEGETATION_CORRECTION.Person.rainforest).toBe(0.1);
    expect(VEGETATION_CORRECTION['Aircraft >5700kg'].hilly).toBe(0.8);
  });
});

describe('correction factors (Table D-5:4)', () => {
  it('applies no weather correction below 15 kt', () => {
    expect(weatherCorrectionFactor(10, 'small').factor).toBe(1.0);
    expect(weatherCorrectionFactor(10, 'other').factor).toBe(1.0);
  });

  it('uses the AMSA values, which differ from IAMSAR above 15 kt', () => {
    expect(weatherCorrectionFactor(20, 'small').factor).toBe(0.5);
    expect(weatherCorrectionFactor(20, 'other').factor).toBe(0.8);
    expect(weatherCorrectionFactor(30, 'small').factor).toBe(0.25);
    expect(weatherCorrectionFactor(30, 'other').factor).toBe(0.5);
  });

  it('takes the worse of the wind band and the sea band', () => {
    const r = weatherCorrectionFactor(10, 'small', 2.0);
    expect(r.factor).toBe(0.25);
    expect(r.drivenBy).toBe('sea');
  });

  it('applies the fatigue factor', () => {
    expect(fatigueCorrectionFactor(false)).toBe(1.0);
    expect(fatigueCorrectionFactor(true)).toBe(0.9);
  });
});

describe('position error tables (Appendix D-6)', () => {
  it('reads fix error by means of navigation', () => {
    expect(fixErrorByNavigation('gps').errorNm).toBe(0.1);
    expect(fixErrorByNavigation('celestial-fix').errorNm).toBe(2);
  });

  it('keeps rule-based entries as text rather than a fabricated number', () => {
    const ins = fixErrorByNavigation('ins');
    expect(ins.errorNm).toBeUndefined();
    expect(ins.rule).toMatch(/per flight hour/);
  });

  it('reads fix error by craft type when navigation is unknown', () => {
    expect(fixErrorByCraft('small-craft').errorNm).toBe(15);
  });

  it('computes dead reckoning error as last fix plus a share of distance run', () => {
    // Table D-6:3: small craft, 15% of distance since the fix.
    expect(deadReckoningError(1, 20, 'small-craft')).toBeCloseTo(4, 10);
    expect(deadReckoningError(0.1, 50, 'aircraft')).toBeCloseTo(5.1, 10);
  });

  it('exposes the manual practical defaults', () => {
    expect(DEFAULT_TARGET_FIX_ERROR_NM).toBe(5);
    expect(DEFAULT_FACILITY_FIX_ERROR_NM).toBe(1);
  });
});

describe('safety factor (Table 3-2)', () => {
  it('steps fs up by search stage', () => {
    expect(safetyFactorForStage('initial')).toBe(1.1);
    expect(safetyFactorForStage('first-expansion')).toBe(1.6);
    expect(safetyFactorForStage('second-expansion')).toBe(2.0);
    expect(safetyFactorForStage('third-expansion')).toBe(2.3);
    expect(safetyFactorForStage('final-expansion')).toBe(2.5);
    expect(SAFETY_FACTOR_TABLE).toHaveLength(5);
  });

  it('classifies the search condition from the correction factors', () => {
    expect(searchCondition(1, 1, 1)).toBe('ideal');
    expect(searchCondition(1, 1, 0.9)).toBe('normal');
    expect(searchCondition(0.5, 1, 1)).toBe('normal');
  });
});

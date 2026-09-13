/**
 * Allen & Plourde Table 8-1, and the mapping from the app's leeway objects
 * onto it.
 *
 * Both tables were transcribed from the printed sources: AMSA NATSAR 2026
 * Tables D-5:1 and D-5:2 for the leeway coefficients, and USCG CG-D-08-99
 * Table 8-1 / 8-1A for the errors. AMSA's tables are adapted from the report,
 * so the two line up row for row.
 *
 * The coefficient check below is the important one: an earlier transcription
 * had labels shifted a row out of step with their numbers, which names alone
 * cannot detect.
 */

import { describe, expect, it } from 'vitest';
import { LEEWAY_TABLE } from '../tables/leeway';
import {
  LEEWAY_ERROR_BY_OBJECT,
  LEEWAY_ERROR_TABLE,
  SYX_CM_S_TO_KT,
  getLeewayError,
  leewayErrorForObject,
} from '../tables/leewayError';

describe('leeway error table', () => {
  it('holds Table 8-1 refs 1 to 56 in order', () => {
    expect(LEEWAY_ERROR_TABLE.map((e) => e.ref)).toEqual(
      Array.from({ length: 56 }, (_, i) => i + 1),
    );
  });

  it('quotes LWe as Sy/x converted to knots', () => {
    for (const entry of LEEWAY_ERROR_TABLE) {
      expect(entry.lweKt).toBeCloseTo(entry.syxCmS * SYX_CM_S_TO_KT, 4);
    }
  });

  it('reads the rows the printed table gives', () => {
    // AMSA's worked examples pin these two: a person in the water uses the
    // general PIW row, and a scuba diver uses the scuba row.
    expect(getLeewayError(1).category).toMatch(/general, state unknown/);
    expect(getLeewayError(2).category).toMatch(/Vertical/);
    expect(getLeewayError(5).category).toMatch(/Scuba Suit/);
    expect(getLeewayError(17).category).toMatch(/4-6 person capacity \(general\)/);
    expect(() => getLeewayError(99)).toThrow(/Unknown/);
  });
});

describe('mapping from leeway objects', () => {
  it('maps every leeway object the app offers', () => {
    const unmapped = LEEWAY_TABLE.filter((e) => !(e.id in LEEWAY_ERROR_BY_OBJECT)).map((e) => e.id);
    expect(unmapped).toEqual([]);
  });

  it('cites no object that is not in the leeway table', () => {
    const ids = new Set(LEEWAY_TABLE.map((e) => e.id));
    expect(Object.keys(LEEWAY_ERROR_BY_OBJECT).filter((id) => !ids.has(id))).toEqual([]);
  });

  it('cites, for every object, a row whose coefficients actually match it', () => {
    // The defect this guards against: a transcription that shifts a label by
    // one row leaves every object citing its neighbour's error. Names cannot
    // catch that; coefficients can. AMSA quotes the multiplier as a fraction
    // and the modifier in knots; Table 8-1 quotes slope in % and intercept in
    // cm/s. Divergence is not compared: AMSA scales the printed angle.
    const wrong: string[] = [];
    for (const entry of LEEWAY_TABLE) {
      const row = getLeewayError(LEEWAY_ERROR_BY_OBJECT[entry.id]);
      const slopeOff = Math.abs(entry.multiplier - row.slopePct / 100);
      const interceptOff = Math.abs(entry.modifier - row.yInterceptCmS * SYX_CM_S_TO_KT);
      if (slopeOff > 0.0006 || interceptOff > 0.006) {
        wrong.push(`${entry.id} -> ref ${row.ref}`);
      }
    }
    expect(wrong).toEqual([]);
  });

  it('marks the rows whose error the source prints only as a floor', () => {
    expect(leewayErrorForObject('piw-general')?.syxIsFloor).toBe(true);
    expect(leewayErrorForObject('piw-horizontal-scuba-suit')?.syxIsFloor).toBe(false);
    expect(leewayErrorForObject('not-a-real-object')).toBeUndefined();
  });
});

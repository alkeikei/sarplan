/**
 * BMKG's port API emits bare NaN, which is not valid JSON: JSON.parse throws
 * outright on it (seen live at Ajibata, a lake port with no sea state). The
 * payload is repaired before parsing, and the repair has to be narrow enough
 * not to damage the data around it.
 */

import { describe, expect, it } from 'vitest';
import { repairBmkgJson } from '../bmkgService';

describe('BMKG payload repair', () => {
  it('makes a NaN-bearing payload parseable', () => {
    const raw = '{"data": [{"current_speed_min": NaN, "visibility": 2637}]}';
    expect(() => JSON.parse(raw)).toThrow();
    expect(JSON.parse(repairBmkgJson(raw))).toEqual({
      data: [{ current_speed_min: null, visibility: 2637 }],
    });
  });

  it('leaves port names that contain those letters alone', () => {
    // Real Indonesian place names the repair must not corrupt.
    const raw = '{"portname": "Nanga Pinoh", "note": "NaN", "v": NaN}';
    const parsed = JSON.parse(repairBmkgJson(raw));
    expect(parsed.portname).toBe('Nanga Pinoh');
    expect(parsed.note).toBe('NaN');
    expect(parsed.v).toBeNull();
  });

  it('is a no-op on a clean payload', () => {
    const raw = '{"visibility": 7819, "low_tide": null}';
    expect(repairBmkgJson(raw)).toBe(raw);
  });
});

/**
 * Position (fix) error tables. Feed X, the drifting start point error, and Y,
 * the search facility position error, in E = sqrt(X^2 + De^2 + Y^2).
 *
 * SOURCE: National Search and Rescue Manual, 2026 Edition (Version 1,
 * February 2026; AMSA / Australian National Search and Rescue Council),
 * Appendix D-6, Tables D-6:1, D-6:2 and D-6:3, verified against the printed
 * appendix (manual page 409).
 *
 * DEVIATION NOTE, in the manual's own words: "Variation from IAMSAR for
 * Tables D-6:2 & D-6:3, the National SAR Manual uses the values previously
 * used by JRCC Australia because experience has shown it is more practicable
 * to base fix errors on the navigation equipment carried in a craft." So it is
 * the BY-CRAFT tables that depart from IAMSAR, not D-6:1.
 *
 * The manual also states that every figure in D-6:1 to D-6:3 is a MINIMUM,
 * which an SMC may raise at discretion; the app keeps all of them editable.
 */

export interface FixErrorEntry {
  id: string;
  label: string;
  /** Fix error, nm. Undefined where the source gives a rule, not a number. */
  errorNm?: number;
  /** The source's wording, where the entry is a rule rather than a value. */
  rule?: string;
  /** The source asterisks this row: evaluate upward according to circumstances. */
  evaluateUpward?: boolean;
}

/** Table D-6:1 — fix error by means of navigation. */
export const FIX_ERROR_BY_NAVIGATION: FixErrorEntry[] = [
  { id: 'gps', label: 'GPS', errorNm: 0.1 },
  { id: 'radar', label: 'RADAR', errorNm: 1 },
  // The source marks these two with an asterisk: "Should be evaluated upward
  // according to circumstances."
  { id: 'visual-fix', label: 'Visual fix (3 lines)', errorNm: 1, evaluateUpward: true },
  { id: 'celestial-fix', label: 'Celestial fix (3 lines)', errorNm: 2, evaluateUpward: true },
  { id: 'radio-beacon', label: 'Marine radio beacon (3-beacon fix)', errorNm: 4 },
  {
    id: 'ins',
    label: 'INS',
    rule: '0.5 nm per flight hour without update',
  },
  {
    id: 'vor',
    label: 'VOR',
    rule: '+/-3 deg arc and 3% of distance, or 0.5 nm radius, whichever is greater',
  },
  {
    id: 'tacan',
    label: 'TACAN',
    rule: '+/-3 deg arc and 3% of distance, or 0.5 nm radius, whichever is greater',
  },
];

/** Table D-6:2 — fix error when the means of navigation is unknown. */
export const FIX_ERROR_BY_CRAFT: FixErrorEntry[] = [
  { id: 'ship', label: 'Ships, military submarines', errorNm: 5 },
  { id: 'aircraft-self-contained', label: 'Aircraft, self-contained navigation', errorNm: 5 },
  { id: 'aircraft-other', label: 'Aircraft, other', errorNm: 10 },
  { id: 'small-craft', label: 'Small craft, submersibles', errorNm: 15 },
];

/** Table D-6:3 — dead reckoning error, as a fraction of distance run. */
export interface DrErrorEntry {
  id: string;
  label: string;
  /** Fraction of distance travelled since the last fix, added to fix error. */
  fractionOfDistance: number;
}

export const DR_ERROR_BY_CRAFT: DrErrorEntry[] = [
  { id: 'ship', label: 'Ship, military submarine', fractionOfDistance: 0.05 },
  { id: 'aircraft', label: 'Aircraft', fractionOfDistance: 0.1 },
  { id: 'small-craft', label: 'Small craft, submersibles', fractionOfDistance: 0.15 },
];

/**
 * Practical defaults used elsewhere in the source manual when the method is
 * simply unknown (SAR_Reference_Tables.md section 4).
 */
export const DEFAULT_TARGET_FIX_ERROR_NM = 5;
/** Search craft take near-continuous GPS fixes, hence the much smaller Y. */
export const DEFAULT_FACILITY_FIX_ERROR_NM = 1;

function lookup(list: FixErrorEntry[], id: string): FixErrorEntry {
  const entry = list.find((e) => e.id === id);
  if (!entry) throw new Error(`Unknown fix error entry: ${id}`);
  return entry;
}

export function fixErrorByNavigation(id: string): FixErrorEntry {
  return lookup(FIX_ERROR_BY_NAVIGATION, id);
}

export function fixErrorByCraft(id: string): FixErrorEntry {
  return lookup(FIX_ERROR_BY_CRAFT, id);
}

export function drErrorEntry(id: string): DrErrorEntry {
  const entry = DR_ERROR_BY_CRAFT.find((e) => e.id === id);
  if (!entry) throw new Error(`Unknown DR error entry: ${id}`);
  return entry;
}

/** Table D-6:3: DR error = last fix error + (fraction x distance since fix). */
export function deadReckoningError(
  lastFixErrorNm: number,
  distanceSinceFixNm: number,
  craftId: string,
): number {
  return lastFixErrorNm + drErrorEntry(craftId).fractionOfDistance * distanceSinceFixNm;
}

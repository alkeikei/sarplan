/**
 * Leeway error LWe, per leeway category.
 *
 * SOURCE: Allen, A.A. and Plourde, J.V. (1999). Review of Leeway: Field
 * Experiments and Implementation. U.S. Coast Guard Research and Development
 * Center, Report No. CG-D-08-99. Prepared for the U.S. Department of
 * Transportation / United States Coast Guard. Available through NTIS,
 * Springfield, VA. A U.S. federal government work: public domain, no
 * commercial-use restriction.
 *
 * Table 8-1, "Recommended Leeway Speed and Direction Values for Search
 * Planning Tools", report pages 8-4 to 8-8; sub-table 8-1A, report page 8-6.
 *
 * Table 8-1 gives per category a slope (%) and Y-intercept (cm/s) for
 *   leeway speed (cm/s) = slope x wind speed (m/s) + Y-intercept
 * a divergence angle, and Sy/x, the standard error of the estimate in cm/s.
 * Sy/x converts to LWe in knots by multiplying by 0.0194385. The lweKt column
 * below is that conversion, already applied.
 *
 * WHY THIS EXISTS: this app previously had no source for LWe at all. The AMSA
 * manual presents leeway error as a chart, which SAR_Reference_Tables.md lists
 * as not digitised, so every craft used a flat 0.3 kt default. Allen & Plourde
 * is the study AMSA's own leeway table derives from, and it prints the
 * regression error per category, so the figures below replace that flat
 * default with the error actually measured for the craft being searched for.
 *
 * ONE THING TO KEEP HONEST: where the source prints a floor rather than a
 * number ("Sy/x > 15"), the LWe here is a MINIMUM, not a measurement. Those
 * rows carry syxIsFloor: true and the app flags them.
 *
 * Transcribed from the printed pages 8-4 to 8-8 of the report. Each group in
 * the table opens with an unlabelled row: that is the general value for the
 * class, used when the object's state is not known, with the indented rows
 * below it the specific states. Every row here carries the label the printed
 * table gives it.
 */

/** Sy/x is printed in cm/s; LWe is quoted in knots. */
export const SYX_CM_S_TO_KT = 0.0194385;

export const LEEWAY_ERROR_SOURCE =
  'Allen & Plourde 1999, USCG R&D Center CG-D-08-99, Table 8-1';

export const LEEWAY_ERROR_SOURCE_FULL =
  'Allen, A.A. and Plourde, J.V. (1999). Review of Leeway: Field Experiments and Implementation. ' +
  'U.S. Coast Guard Research and Development Center, Report No. CG-D-08-99. Table 8-1. ' +
  'U.S. federal government work, public domain.';

export interface LeewayErrorEntry {
  /** Row number in Table 8-1, for tracing a value back to the source. */
  ref: number;
  category: string;
  slopePct: number;
  yInterceptCmS: number;
  divergenceDeg: number;
  /** Standard error of the estimate, cm/s. A floor where the source prints one. */
  syxCmS: number;
  /** True when the source prints "> n" rather than a measured value. */
  syxIsFloor: boolean;
  /** LWe in knots: syxCmS x SYX_CM_S_TO_KT. */
  lweKt: number;
}

const F = true; // Sy/x printed as a floor (">15", ">10"), not a measurement

export const LEEWAY_ERROR_TABLE: LeewayErrorEntry[] = [
  { ref: 1, category: 'PIW (general, state unknown)', slopePct: 1.1, yInterceptCmS: 3.5, divergenceDeg: 40, syxCmS: 15, syxIsFloor: F, lweKt: 0.2916 },
  { ref: 2, category: 'PIW, Vertical', slopePct: 0.5, yInterceptCmS: 3.8, divergenceDeg: 24, syxCmS: 10, syxIsFloor: F, lweKt: 0.1944 },
  { ref: 3, category: 'PIW, Sitting', slopePct: 1.2, yInterceptCmS: 0.2, divergenceDeg: 24, syxCmS: 1.38, syxIsFloor: false, lweKt: 0.0268 },
  { ref: 4, category: 'PIW, Horizontal, Survival Suit, face up', slopePct: 1.4, yInterceptCmS: 5.3, divergenceDeg: 40, syxCmS: 1.85, syxIsFloor: false, lweKt: 0.036 },
  { ref: 5, category: 'PIW, Horizontal, Scuba Suit, face up', slopePct: 0.7, yInterceptCmS: 4.3, divergenceDeg: 40, syxCmS: 5.92, syxIsFloor: false, lweKt: 0.1151 },
  { ref: 6, category: 'PIW, Horizontal, Deceased, face down', slopePct: 1.5, yInterceptCmS: 4.0, divergenceDeg: 40, syxCmS: 10, syxIsFloor: F, lweKt: 0.1944 },
  { ref: 7, category: 'Maritime life raft, no ballast systems (general)', slopePct: 4.2, yInterceptCmS: 1.6, divergenceDeg: 38, syxCmS: 15, syxIsFloor: F, lweKt: 0.2916 },
  { ref: 8, category: 'Maritime life raft, no ballast, no canopy, no drogue', slopePct: 5.7, yInterceptCmS: 10.9, divergenceDeg: 32, syxCmS: 10.4, syxIsFloor: false, lweKt: 0.2022 },
  { ref: 9, category: 'Maritime life raft, no ballast, no canopy, w/ drogue', slopePct: 4.4, yInterceptCmS: -10.3, divergenceDeg: 38, syxCmS: 4.1, syxIsFloor: false, lweKt: 0.0797 },
  { ref: 10, category: 'Maritime life raft, no ballast, canopy, no drogue', slopePct: 3.7, yInterceptCmS: 5.7, divergenceDeg: 32, syxCmS: 2.1, syxIsFloor: false, lweKt: 0.0408 },
  { ref: 11, category: 'Maritime life raft, no ballast, canopy, w/ drogue', slopePct: 3.0, yInterceptCmS: 0.0, divergenceDeg: 38, syxCmS: 15, syxIsFloor: F, lweKt: 0.2916 },
  { ref: 12, category: 'Maritime life raft, shallow ballast and canopy (general)', slopePct: 2.9, yInterceptCmS: -0.2, divergenceDeg: 30, syxCmS: 15, syxIsFloor: F, lweKt: 0.2916 },
  { ref: 13, category: 'Maritime life raft, shallow ballast, no drogue', slopePct: 3.2, yInterceptCmS: -1.0, divergenceDeg: 30, syxCmS: 0.9, syxIsFloor: false, lweKt: 0.0175 },
  { ref: 14, category: 'Maritime life raft, shallow ballast, with drogue', slopePct: 2.5, yInterceptCmS: 0.7, divergenceDeg: 30, syxCmS: 4.2, syxIsFloor: false, lweKt: 0.0816 },
  { ref: 15, category: 'Maritime life raft, shallow ballast, capsized', slopePct: 1.7, yInterceptCmS: -5.2, divergenceDeg: 11, syxCmS: 2.1, syxIsFloor: false, lweKt: 0.0408 },
  { ref: 16, category: 'Maritime life raft, deep ballast systems and canopies (see Table 8-1A)', slopePct: 3.0, yInterceptCmS: 0.8, divergenceDeg: 18, syxCmS: 7.9, syxIsFloor: false, lweKt: 0.1536 },
  { ref: 17, category: 'Deep ballast raft, 4-6 person capacity (general)', slopePct: 2.9, yInterceptCmS: 2.0, divergenceDeg: 20, syxCmS: 8.6, syxIsFloor: false, lweKt: 0.1672 },
  { ref: 18, category: 'Deep ballast raft, 4-6 person, without drogue', slopePct: 3.8, yInterceptCmS: -2.1, divergenceDeg: 20, syxCmS: 4.4, syxIsFloor: false, lweKt: 0.0855 },
  { ref: 19, category: 'Deep ballast raft, 4-6 person, without drogue, light loading', slopePct: 3.8, yInterceptCmS: -2.1, divergenceDeg: 20, syxCmS: 4.5, syxIsFloor: false, lweKt: 0.0875 },
  { ref: 20, category: 'Deep ballast raft, 4-6 person, without drogue, heavy loading', slopePct: 3.6, yInterceptCmS: -1.5, divergenceDeg: 20, syxCmS: 2.5, syxIsFloor: false, lweKt: 0.0486 },
  { ref: 21, category: 'Deep ballast raft, 4-6 person, with drogue', slopePct: 1.8, yInterceptCmS: 1.4, divergenceDeg: 16, syxCmS: 3.1, syxIsFloor: false, lweKt: 0.0603 },
  { ref: 22, category: 'Deep ballast raft, 4-6 person, with drogue, light loading', slopePct: 1.6, yInterceptCmS: 2.7, divergenceDeg: 32, syxCmS: 3.0, syxIsFloor: false, lweKt: 0.0583 },
  { ref: 23, category: 'Deep ballast raft, 4-6 person, with drogue, heavy loading', slopePct: 2.1, yInterceptCmS: 0.0, divergenceDeg: 27, syxCmS: 2.7, syxIsFloor: false, lweKt: 0.0525 },
  { ref: 24, category: 'Deep ballast raft, 15-25 person capacity (general)', slopePct: 3.6, yInterceptCmS: -4.4, divergenceDeg: 14, syxCmS: 5.4, syxIsFloor: false, lweKt: 0.105 },
  { ref: 25, category: 'Deep ballast raft, 15-25 person, without drogue, light loading', slopePct: 3.9, yInterceptCmS: -3.1, divergenceDeg: 12, syxCmS: 2.9, syxIsFloor: false, lweKt: 0.0564 },
  { ref: 26, category: 'Deep ballast raft, 15-25 person, with drogue, heavy loading', slopePct: 3.1, yInterceptCmS: -3.6, divergenceDeg: 12, syxCmS: 3.3, syxIsFloor: false, lweKt: 0.0641 },
  { ref: 27, category: 'Deep ballast raft, capsized', slopePct: 0.9, yInterceptCmS: 0.0, divergenceDeg: 16, syxCmS: 2.2, syxIsFloor: false, lweKt: 0.0428 },
  { ref: 28, category: 'Deep ballast raft, swamped', slopePct: 1.0, yInterceptCmS: -2.2, divergenceDeg: 11, syxCmS: 2.0, syxIsFloor: false, lweKt: 0.0389 },
  { ref: 29, category: 'Other maritime survival craft, life capsule', slopePct: 3.8, yInterceptCmS: -4.1, divergenceDeg: 30, syxCmS: 1.4, syxIsFloor: false, lweKt: 0.0272 },
  { ref: 30, category: 'USCG sea rescue kit', slopePct: 2.5, yInterceptCmS: -2.1, divergenceDeg: 10, syxCmS: 4.0, syxIsFloor: false, lweKt: 0.0778 },
  { ref: 31, category: 'Aviation life raft, no ballast w/ canopy, 4-6 person, w/o drogue', slopePct: 3.7, yInterceptCmS: 5.7, divergenceDeg: 32, syxCmS: 2.1, syxIsFloor: false, lweKt: 0.0408 },
  { ref: 32, category: 'Aviation life raft, evac/slide, 46-person', slopePct: 2.8, yInterceptCmS: -0.6, divergenceDeg: 20, syxCmS: 4.0, syxIsFloor: false, lweKt: 0.0778 },
  { ref: 33, category: 'Sea kayak w/ person on aft deck', slopePct: 1.1, yInterceptCmS: 12.5, divergenceDeg: 20, syxCmS: 3.52, syxIsFloor: false, lweKt: 0.0684 },
  { ref: 34, category: 'Surf board w/ person', slopePct: 2.0, yInterceptCmS: 0.0, divergenceDeg: 20, syxCmS: 10, syxIsFloor: F, lweKt: 0.1944 },
  { ref: 35, category: 'Windsurfer w/ person, mast and sail in water', slopePct: 2.3, yInterceptCmS: 5.2, divergenceDeg: 16, syxCmS: 2.32, syxIsFloor: false, lweKt: 0.0451 },
  { ref: 36, category: 'Sailing vessel, mono-hull, full keel, deep draft', slopePct: 3.0, yInterceptCmS: 0.0, divergenceDeg: 65, syxCmS: 10, syxIsFloor: F, lweKt: 0.1944 },
  { ref: 37, category: 'Sailing vessel, mono-hull, fin keel, shoal draft', slopePct: 4.0, yInterceptCmS: 0.0, divergenceDeg: 65, syxCmS: 10, syxIsFloor: F, lweKt: 0.1944 },
  { ref: 38, category: 'Skiff, flat bottom (Boston whaler)', slopePct: 3.4, yInterceptCmS: 2.1, divergenceDeg: 30, syxCmS: 1.8, syxIsFloor: false, lweKt: 0.035 },
  { ref: 39, category: 'Skiff, V-hull, standard configuration', slopePct: 3.0, yInterceptCmS: 3.9, divergenceDeg: 20, syxCmS: 4.1, syxIsFloor: false, lweKt: 0.0797 },
  { ref: 40, category: 'Skiff, V-hull, swamped', slopePct: 1.7, yInterceptCmS: 0.0, divergenceDeg: 20, syxCmS: 3.0, syxIsFloor: false, lweKt: 0.0583 },
  { ref: 41, category: 'Sport boat, cuddy cabin, modified V-hull', slopePct: 6.9, yInterceptCmS: -4.1, divergenceDeg: 25, syxCmS: 2.9, syxIsFloor: false, lweKt: 0.0564 },
  { ref: 42, category: 'Sport fisher, centre console, open cockpit', slopePct: 6.0, yInterceptCmS: -4.6, divergenceDeg: 30, syxCmS: 3.3, syxIsFloor: false, lweKt: 0.0641 },
  { ref: 43, category: 'Commercial fishing vessel (general)', slopePct: 3.7, yInterceptCmS: 1.0, divergenceDeg: 65, syxCmS: 15, syxIsFloor: F, lweKt: 0.2916 },
  { ref: 44, category: 'Commercial fishing vessel, sampans, Hawaiian', slopePct: 4.0, yInterceptCmS: 0.0, divergenceDeg: 65, syxCmS: 10, syxIsFloor: F, lweKt: 0.1944 },
  { ref: 45, category: 'Commercial fishing vessel, side-stern troller, Japanese', slopePct: 4.2, yInterceptCmS: 0.0, divergenceDeg: 65, syxCmS: 10, syxIsFloor: F, lweKt: 0.1944 },
  { ref: 46, category: 'Commercial fishing vessel, longliners, Japanese', slopePct: 3.7, yInterceptCmS: 0.0, divergenceDeg: 65, syxCmS: 10, syxIsFloor: F, lweKt: 0.1944 },
  { ref: 47, category: 'Commercial fishing vessel, junk, Korean', slopePct: 2.7, yInterceptCmS: 4.9, divergenceDeg: 65, syxCmS: 3.9, syxIsFloor: false, lweKt: 0.0758 },
  { ref: 48, category: 'Commercial fishing vessel, gill-netter w/ rear reel', slopePct: 4.0, yInterceptCmS: 0.3, divergenceDeg: 45, syxCmS: 3.0, syxIsFloor: false, lweKt: 0.0583 },
  { ref: 49, category: 'Coastal freighter', slopePct: 2.8, yInterceptCmS: 0.0, divergenceDeg: 65, syxCmS: 10, syxIsFloor: F, lweKt: 0.1944 },
  { ref: 50, category: 'F/V debris', slopePct: 2.0, yInterceptCmS: 0.0, divergenceDeg: 14, syxCmS: 10, syxIsFloor: F, lweKt: 0.1944 },
  { ref: 51, category: 'Bait/wharf box, holds a cubic metre of ice (general)', slopePct: 1.3, yInterceptCmS: 13.8, divergenceDeg: 42, syxCmS: 4.5, syxIsFloor: false, lweKt: 0.0875 },
  { ref: 52, category: 'Bait/wharf box, lightly loaded', slopePct: 2.6, yInterceptCmS: 9.2, divergenceDeg: 20, syxCmS: 2.96, syxIsFloor: false, lweKt: 0.0575 },
  { ref: 53, category: 'Bait/wharf box, fully loaded', slopePct: 1.6, yInterceptCmS: 8.0, divergenceDeg: 44, syxCmS: 2.7, syxIsFloor: false, lweKt: 0.0525 },
  { ref: 54, category: 'Immigration vessel, Cuban refugee raft, w/o sail', slopePct: 1.5, yInterceptCmS: 8.7, divergenceDeg: 23, syxCmS: 1.5, syxIsFloor: false, lweKt: 0.0292 },
  { ref: 55, category: 'Immigration vessel, Cuban refugee raft, w/ sail', slopePct: 7.9, yInterceptCmS: -8.9, divergenceDeg: 45, syxCmS: 5.4, syxIsFloor: false, lweKt: 0.105 },
  { ref: 56, category: 'Sewage floatables, tampon applicators', slopePct: 1.8, yInterceptCmS: 0.0, divergenceDeg: 7, syxCmS: 3, syxIsFloor: false, lweKt: 0.0583 },
];

/**
 * Which Table 8-1 row describes each leeway object the app offers.
 *
 * AMSA's Table D-5:1 and D-5:2 are adapted from this report and carry the same
 * rows in the same order, so the mapping is one-to-one and complete.
 *
 * The AMSA leeway table this app reads its drift coefficients from is itself
 * derived from Allen & Plourde, so the taxonomies line up almost row for row.
 * The mapping is written out rather than matched on text, because a fuzzy
 * match that silently picks the wrong row would put a wrong error into the
 * datum with nothing on screen to show it happened.
 *
 */
export const LEEWAY_ERROR_BY_OBJECT: Record<string, number> = {
  'piw-general': 1,
  'piw-vertical': 2,
  'piw-sitting': 3,
  'piw-horizontal-survival-suit': 4,
  'piw-horizontal-scuba-suit': 5,
  'piw-horizontal-deceased': 6,
  'raft-nb-general': 7,
  'raft-nb-nocanopy-nodrogue': 8,
  'raft-nb-nocanopy-drogue': 9,
  'raft-nb-canopy-nodrogue': 10,
  'raft-nb-canopy-drogue': 11,
  'raft-sb-general': 12,
  'raft-sb-nodrogue': 13,
  'raft-sb-drogue': 14,
  'raft-sb-capsized': 15,
  'raft-db-general': 16,
  'dbraft-4-6-general': 17,
  'dbraft-4-6-nodrogue': 18,
  'dbraft-4-6-nodrogue-light': 19,
  'dbraft-4-6-nodrogue-heavy': 20,
  'dbraft-4-6-drogue': 21,
  'dbraft-4-6-drogue-light': 22,
  'dbraft-4-6-drogue-heavy': 23,
  'dbraft-15-25-general': 24,
  'dbraft-15-25-nodrogue-light': 25,
  'dbraft-15-25-drogue-heavy': 26,
  'dbraft-15-25-capsized': 27,
  'dbraft-15-25-swamped': 28,
  'survival-life-capsule': 29,
  'survival-uscg-sea-rescue-kit': 30,
  'avraft-4-6-person': 31,
  'avraft-evac-slide': 32,
  'ppc-sea-kayak': 33,
  'ppc-surfboard': 34,
  'ppc-windsurfer': 35,
  'sail-mono-full-keel': 36,
  'sail-mono-fin-keel': 37,
  'skiff-flat-bottom': 38,
  'skiff-v-hull': 39,
  'skiff-v-hull-swamped': 40,
  'power-sport-boat': 41,
  'power-sport-fisher': 42,
  'fv-general': 43,
  'fv-sampan': 44,
  'fv-trawler': 45,
  'fv-longliner': 46,
  'fv-junk': 47,
  'fv-gill-netter': 48,
  'fv-coastal-freighter': 49,
  'debris-fv': 50,
  'debris-bait-box': 51,
  'debris-bait-box-light': 52,
  'debris-bait-box-full': 53,
};

/** A Table 8-1 row by its reference number. */
export function getLeewayError(ref: number): LeewayErrorEntry {
  const entry = LEEWAY_ERROR_TABLE.find((e) => e.ref === ref);
  if (!entry) throw new Error(`Unknown leeway error ref: ${ref}`);
  return entry;
}

/**
 * The measured leeway error for a leeway object, or undefined where the
 * source has no confident row for it.
 */
export function leewayErrorForObject(leewayObjectId: string): LeewayErrorEntry | undefined {
  const ref = LEEWAY_ERROR_BY_OBJECT[leewayObjectId];
  return ref === undefined ? undefined : getLeewayError(ref);
}

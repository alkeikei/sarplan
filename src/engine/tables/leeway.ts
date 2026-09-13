/**
 * Leeway table.
 *
 * SOURCE: National Search and Rescue Manual, 2026 Edition (Version 1, February 2026) (AMSA / Australian
 * National Search and Rescue Council), Appendix D-5, Tables D-5:1 and D-5:2.
 * Transcribed via the printed Tables D-5:1 and D-5:2 section 1.
 *
 * The source manual notes these values are adapted from Allen and Plourde 1999
 * ("Review of Leeway: Field Experiments and Implementation", USCG R&D Centre
 * Report No. CG-D-08-99), which is also the origin of IAMSAR's own leeway
 * tables. If a licensed IAMSAR Appendix N copy becomes available, replace the
 * rows in this file; nothing else in the engine needs to change.
 *
 * Formula (source, section 1):
 *   leeway speed (kt) = (multiplier x wind speed in kt) +/- modifier
 * The divergence angle is applied both + and - of the downwind direction to
 * produce the two leeway-divergence datums.
 *
 * Where the source table lists two or more rows with identical category and
 * sub-category labels but different coefficients, they are kept as separate
 * rows here and distinguished with "(variant a/b/...)" so no source data is
 * silently dropped.
 */

export interface LeewayEntry {
  id: string;
  category: string;
  subCategory: string;
  descriptor: string;
  /** Dimensionless coefficient applied to wind speed in knots. */
  multiplier: number;
  /** Additive term in knots. May be negative. */
  modifier: number;
  /** Leeway divergence angle, degrees, applied +/- of downwind. */
  divergenceAngleDeg: number;
}

/** Table D-5:1 — leeway for craft and objects. */
export const LEEWAY_TABLE: LeewayEntry[] = [
  { id: 'piw-general', category: 'Person in water', subCategory: '', descriptor: '', multiplier: 0.011, modifier: 0.07, divergenceAngleDeg: 30 },
  { id: 'piw-vertical', category: 'Person in water', subCategory: 'Vertical', descriptor: '', multiplier: 0.005, modifier: 0.07, divergenceAngleDeg: 18 },
  { id: 'piw-sitting', category: 'Person in water', subCategory: 'Sitting', descriptor: '', multiplier: 0.012, modifier: 0.0, divergenceAngleDeg: 18 },
  { id: 'piw-horizontal-survival-suit', category: 'Person in water', subCategory: 'Horizontal', descriptor: 'Survival suit', multiplier: 0.014, modifier: 0.1, divergenceAngleDeg: 30 },
  { id: 'piw-horizontal-scuba-suit', category: 'Person in water', subCategory: 'Horizontal', descriptor: 'Scuba suit', multiplier: 0.007, modifier: 0.08, divergenceAngleDeg: 30 },
  { id: 'piw-horizontal-deceased', category: 'Person in water', subCategory: 'Horizontal', descriptor: 'Deceased', multiplier: 0.015, modifier: 0.08, divergenceAngleDeg: 30 },
  { id: 'raft-nb-general', category: 'Maritime life raft, no ballast', subCategory: '', descriptor: '', multiplier: 0.042, modifier: 0.03, divergenceAngleDeg: 28 },
  { id: 'raft-nb-nocanopy-nodrogue', category: 'Maritime life raft, no ballast', subCategory: 'No canopy, no drogue', descriptor: '', multiplier: 0.057, modifier: 0.21, divergenceAngleDeg: 24 },
  { id: 'raft-nb-nocanopy-drogue', category: 'Maritime life raft, no ballast', subCategory: 'No canopy, with drogue', descriptor: '', multiplier: 0.044, modifier: -0.2, divergenceAngleDeg: 28 },
  { id: 'raft-nb-canopy-nodrogue', category: 'Maritime life raft, no ballast', subCategory: 'Canopy, no drogue', descriptor: '', multiplier: 0.037, modifier: 0.11, divergenceAngleDeg: 24 },
  { id: 'raft-nb-canopy-drogue', category: 'Maritime life raft, no ballast', subCategory: 'Canopy, with drogue', descriptor: '', multiplier: 0.03, modifier: 0.0, divergenceAngleDeg: 28 },
  { id: 'raft-sb-general', category: 'Maritime life raft, shallow ballast + canopy', subCategory: '', descriptor: '', multiplier: 0.029, modifier: 0.0, divergenceAngleDeg: 22 },
  { id: 'raft-sb-nodrogue', category: 'Maritime life raft, shallow ballast + canopy', subCategory: 'No drogue', descriptor: '', multiplier: 0.032, modifier: -0.02, divergenceAngleDeg: 22 },
  { id: 'raft-sb-drogue', category: 'Maritime life raft, shallow ballast + canopy', subCategory: 'With drogue', descriptor: '', multiplier: 0.025, modifier: 0.01, divergenceAngleDeg: 22 },
  { id: 'raft-sb-capsized', category: 'Maritime life raft, shallow ballast + canopy', subCategory: 'Capsized', descriptor: '', multiplier: 0.017, modifier: -0.1, divergenceAngleDeg: 8 },
  { id: 'raft-db-general', category: 'Maritime life raft, deep ballast + canopy', subCategory: '', descriptor: 'see the 4-6 / 15-25 person rows for detail', multiplier: 0.03, modifier: 0.02, divergenceAngleDeg: 13 },
  { id: 'survival-life-capsule', category: 'Other maritime survival craft', subCategory: 'Life capsule', descriptor: '', multiplier: 0.038, modifier: -0.08, divergenceAngleDeg: 22 },
  { id: 'survival-uscg-sea-rescue-kit', category: 'Other maritime survival craft', subCategory: 'USCG sea rescue kit', descriptor: '', multiplier: 0.025, modifier: -0.04, divergenceAngleDeg: 7 },
  { id: 'avraft-4-6-person', category: 'Aviation life raft, no ballast w/ canopy', subCategory: '4-6 person, without drogue', descriptor: '', multiplier: 0.037, modifier: 0.11, divergenceAngleDeg: 24 },
  { id: 'avraft-evac-slide', category: 'Aviation life raft, no ballast w/ canopy', subCategory: 'Evac/slide, 46-person', descriptor: '', multiplier: 0.028, modifier: -0.01, divergenceAngleDeg: 15 },
  { id: 'ppc-sea-kayak', category: 'Person-powered craft', subCategory: 'Sea kayak w/ person on aft deck', descriptor: '', multiplier: 0.011, modifier: 0.24, divergenceAngleDeg: 15 },
  { id: 'ppc-surfboard', category: 'Person-powered craft', subCategory: 'Surfboard w/ person', descriptor: '', multiplier: 0.02, modifier: 0.0, divergenceAngleDeg: 15 },
  { id: 'ppc-windsurfer', category: 'Person-powered craft', subCategory: 'Windsurfer w/ person, mast and sail in water', descriptor: '', multiplier: 0.023, modifier: 0.1, divergenceAngleDeg: 12 },
  { id: 'sail-mono-full-keel', category: 'Sailing vessel, mono-hull', subCategory: 'Full keel, deep draft', descriptor: '', multiplier: 0.03, modifier: 0.0, divergenceAngleDeg: 48 },
  { id: 'sail-mono-fin-keel', category: 'Sailing vessel, mono-hull', subCategory: 'Fin keel, shoal draft', descriptor: '', multiplier: 0.04, modifier: 0.0, divergenceAngleDeg: 48 },
  { id: 'skiff-flat-bottom', category: 'Power vessel, skiff', subCategory: 'Flat bottom (Boston whaler)', descriptor: '', multiplier: 0.034, modifier: 0.04, divergenceAngleDeg: 22 },
  { id: 'skiff-v-hull', category: 'Power vessel, skiff', subCategory: 'V-hull, standard configuration', descriptor: '', multiplier: 0.03, modifier: 0.08, divergenceAngleDeg: 15 },
  { id: 'skiff-v-hull-swamped', category: 'Power vessel, skiff', subCategory: 'V-hull, swamped', descriptor: '', multiplier: 0.017, modifier: 0.0, divergenceAngleDeg: 15 },
  { id: 'power-sport-boat', category: 'Power vessel', subCategory: 'Sport boat, cuddy cabin, modified V-hull', descriptor: '', multiplier: 0.069, modifier: -0.08, divergenceAngleDeg: 19 },
  { id: 'power-sport-fisher', category: 'Power vessel', subCategory: 'Sport fisher, centre console, open cockpit', descriptor: '', multiplier: 0.06, modifier: -0.09, divergenceAngleDeg: 22 },
  { id: 'fv-general', category: 'Commercial fishing vessel', subCategory: '', descriptor: '', multiplier: 0.037, modifier: 0.02, divergenceAngleDeg: 48 },
  { id: 'fv-sampan', category: 'Commercial fishing vessel', subCategory: 'Sampan', descriptor: '', multiplier: 0.04, modifier: 0.0, divergenceAngleDeg: 48 },
  { id: 'fv-trawler', category: 'Commercial fishing vessel', subCategory: 'Side-stern trawler', descriptor: '', multiplier: 0.042, modifier: 0.0, divergenceAngleDeg: 48 },
  { id: 'fv-longliner', category: 'Commercial fishing vessel', subCategory: 'Longliner', descriptor: '', multiplier: 0.037, modifier: 0.0, divergenceAngleDeg: 48 },
  { id: 'fv-junk', category: 'Commercial fishing vessel', subCategory: 'Junk', descriptor: '', multiplier: 0.027, modifier: 0.1, divergenceAngleDeg: 48 },
  { id: 'fv-gill-netter', category: 'Commercial fishing vessel', subCategory: 'Gill-netter w/ rear reel', descriptor: '', multiplier: 0.04, modifier: 0.01, divergenceAngleDeg: 33 },
  { id: 'fv-coastal-freighter', category: 'Commercial fishing vessel', subCategory: 'Coastal freighter', descriptor: '', multiplier: 0.028, modifier: 0.0, divergenceAngleDeg: 48 },
  { id: 'debris-fv', category: 'Boating debris', subCategory: 'F/V debris', descriptor: '', multiplier: 0.02, modifier: 0.0, divergenceAngleDeg: 10 },
  { id: 'debris-bait-box', category: 'Boating debris', subCategory: 'Bait/wharf box (holds 1 m3 ice)', descriptor: '', multiplier: 0.013, modifier: 0.27, divergenceAngleDeg: 31 },
  { id: 'debris-bait-box-light', category: 'Boating debris', subCategory: 'Bait/wharf box, lightly loaded', descriptor: '', multiplier: 0.026, modifier: 0.18, divergenceAngleDeg: 15 },
  { id: 'debris-bait-box-full', category: 'Boating debris', subCategory: 'Bait/wharf box, fully loaded', descriptor: '', multiplier: 0.016, modifier: 0.16, divergenceAngleDeg: 33 },
  { id: 'dbraft-4-6-general', category: 'Life raft, deep ballast + canopy, 4-6 person', subCategory: '', descriptor: '', multiplier: 0.029, modifier: 0.04, divergenceAngleDeg: 15 },
  { id: 'dbraft-4-6-nodrogue', category: 'Life raft, deep ballast + canopy, 4-6 person', subCategory: 'Without drogue', descriptor: '', multiplier: 0.038, modifier: -0.04, divergenceAngleDeg: 15 },
  { id: 'dbraft-4-6-nodrogue-light', category: 'Life raft, deep ballast + canopy, 4-6 person', subCategory: 'Without drogue, light loading', descriptor: '', multiplier: 0.038, modifier: -0.04, divergenceAngleDeg: 15 },
  { id: 'dbraft-4-6-nodrogue-heavy', category: 'Life raft, deep ballast + canopy, 4-6 person', subCategory: 'Without drogue, heavy loading', descriptor: '', multiplier: 0.036, modifier: -0.03, divergenceAngleDeg: 15 },
  { id: 'dbraft-4-6-drogue', category: 'Life raft, deep ballast + canopy, 4-6 person', subCategory: 'With drogue', descriptor: '', multiplier: 0.018, modifier: 0.03, divergenceAngleDeg: 12 },
  { id: 'dbraft-4-6-drogue-light', category: 'Life raft, deep ballast + canopy, 4-6 person', subCategory: 'With drogue, light loading', descriptor: '', multiplier: 0.016, modifier: 0.05, divergenceAngleDeg: 24 },
  { id: 'dbraft-4-6-drogue-heavy', category: 'Life raft, deep ballast + canopy, 4-6 person', subCategory: 'With drogue, heavy loading', descriptor: '', multiplier: 0.021, modifier: 0.0, divergenceAngleDeg: 20 },
  { id: 'dbraft-15-25-general', category: 'Life raft, deep ballast + canopy, 15-25 person', subCategory: '', descriptor: '', multiplier: 0.036, modifier: -0.09, divergenceAngleDeg: 10 },
  { id: 'dbraft-15-25-nodrogue-light', category: 'Life raft, deep ballast + canopy, 15-25 person', subCategory: 'Without drogue, light loading', descriptor: '', multiplier: 0.039, modifier: -0.06, divergenceAngleDeg: 9 },
  { id: 'dbraft-15-25-drogue-heavy', category: 'Life raft, deep ballast + canopy, 15-25 person', subCategory: 'With drogue, heavy loading', descriptor: '', multiplier: 0.031, modifier: -0.07, divergenceAngleDeg: 9 },
  { id: 'dbraft-15-25-capsized', category: 'Life raft, deep ballast + canopy, 15-25 person', subCategory: 'Capsized', descriptor: '', multiplier: 0.009, modifier: 0.0, divergenceAngleDeg: 12 },
  { id: 'dbraft-15-25-swamped', category: 'Life raft, deep ballast + canopy, 15-25 person', subCategory: 'Swamped', descriptor: '', multiplier: 0.01, modifier: -0.04, divergenceAngleDeg: 8 },
];

const LEEWAY_BY_ID = new Map(LEEWAY_TABLE.map((e) => [e.id, e]));

export function getLeewayEntry(id: string): LeewayEntry {
  const entry = LEEWAY_BY_ID.get(id);
  if (!entry) throw new Error(`Unknown leeway object id: ${id}`);
  return entry;
}

export function leewayLabel(entry: LeewayEntry): string {
  const tail = [entry.subCategory, entry.descriptor].filter(Boolean).join(' - ');
  return tail ? `${entry.category} - ${tail}` : entry.category;
}

/** Leeway entries grouped by category, in table order, for select menus. */
export function leewayCategories(): { category: string; entries: LeewayEntry[] }[] {
  const groups: { category: string; entries: LeewayEntry[] }[] = [];
  for (const entry of LEEWAY_TABLE) {
    const last = groups[groups.length - 1];
    if (last && last.category === entry.category) last.entries.push(entry);
    else groups.push({ category: entry.category, entries: [entry] });
  }
  return groups;
}

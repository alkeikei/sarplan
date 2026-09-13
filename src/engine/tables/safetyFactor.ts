/**
 * Safety factor / optimal search factor fs, for Ro = fs x E.
 *
 * SOURCE: National Search and Rescue Manual, 2023 Edition (AMSA / Australian
 * National Search and Rescue Council), Table 3-2. Transcribed via
 * SAR_Reference_Tables.md section 5.
 *
 * DEVIATION NOTE from the source manual: this stepped table is the source
 * manual's discretized STAND-IN for IAMSAR's continuous optimal-search-factor
 * graph (IAMSAR Figures N-5/N-6), which reads fs off a curve against
 * cumulative relative effort Zrc. The source also notes that JRCC Australia's
 * own computer-generated search planning does NOT use this stepped table; it
 * is provided for manual and coastal planning. The app therefore treats it as
 * the default curve for fs and keeps the field manually editable per PRD 6.8.
 *
 * If a licensed IAMSAR copy supplies the continuous curve, add a function here
 * that reads fs from Zrc and the ideal/normal search condition, and switch the
 * default source in the engine; the rest of the chain is unchanged.
 */

export type SearchStage =
  | 'initial'
  | 'first-expansion'
  | 'second-expansion'
  | 'third-expansion'
  | 'final-expansion';

export interface SafetyFactorEntry {
  stage: SearchStage;
  label: string;
  fs: number;
}

export const SAFETY_FACTOR_TABLE: SafetyFactorEntry[] = [
  { stage: 'initial', label: 'Initial probability area', fs: 1.1 },
  { stage: 'first-expansion', label: 'First expansion', fs: 1.6 },
  { stage: 'second-expansion', label: 'Second expansion', fs: 2.0 },
  { stage: 'third-expansion', label: 'Third expansion', fs: 2.3 },
  { stage: 'final-expansion', label: 'Final expansion', fs: 2.5 },
];

export function safetyFactorForStage(stage: SearchStage): number {
  const entry = SAFETY_FACTOR_TABLE.find((e) => e.stage === stage);
  if (!entry) throw new Error(`Unknown search stage: ${stage}`);
  return entry.fs;
}

/**
 * Search condition, per PRD section 14: "ideal" when the correction factors
 * fw, fv and ff are all >= 1, "normal" when any is < 1. With the stepped fs
 * table above the condition does not change fs, but IAMSAR's continuous graph
 * has one curve per condition, so the engine reports it for the planner and
 * for the day a licensed curve replaces the table.
 */
export type SearchCondition = 'ideal' | 'normal';

export function searchCondition(fw: number, fv: number, ff: number): SearchCondition {
  return fw >= 1 && fv >= 1 && ff >= 1 ? 'ideal' : 'normal';
}

/**
 * Probability of success, PRD section 14.
 *
 *   POS  = POC x POD
 *   POSc = POS1 + POS2 + ... + POSi
 *
 * POC and POD are inputs, not derived here. POD in particular comes from
 * IAMSAR's probability-of-detection curve, which SAR_Reference_Tables.md
 * section 6 lists as NOT DIGITISED (source Figure D-5:13 is a graph). It is
 * therefore a manual entry field in the app, flagged as such.
 */

/**
 * The only POD figures the source manual prints, from Table 4-2 "Coverage Data
 * Example" (AMSA National SAR Manual, 2026 Edition, manual page 222): a single
 * search achieves 78% at a coverage factor of 1.0 and 47% at 0.5.
 *
 * Two points are not a curve, and the detection curve itself is a graph the
 * manual does not tabulate, so the app does not interpolate between them or
 * extrapolate beyond them. They are shown beside the POD field as the anchors
 * a planner can judge against, and POD stays a manual entry.
 */
export const POD_REFERENCE_POINTS: { coverageFactor: number; pod: number }[] = [
  { coverageFactor: 0.5, pod: 0.47 },
  { coverageFactor: 1.0, pod: 0.78 },
];

/** POS = POC x POD. Both inputs and the result are fractions in [0, 1]. */
export function probabilityOfSuccess(poc: number, pod: number): number {
  return poc * pod;
}

/**
 * POSc: cumulative probability of success across searches.
 *
 * A high POSc after repeated searches signals that continuing to search the
 * same area is probably not worthwhile (PRD section 14). Capped at 1 because
 * a probability cannot exceed certainty.
 */
export function cumulativeProbabilityOfSuccess(posValues: number[]): number {
  return Math.min(1, posValues.reduce((sum, p) => sum + p, 0));
}

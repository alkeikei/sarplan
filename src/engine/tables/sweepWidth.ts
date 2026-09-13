/**
 * Uncorrected sweep width (W0) tables.
 *
 * SOURCE: National Search and Rescue Manual, 2026 Edition (AMSA / Australian
 * National Search and Rescue Council), Appendix D-5, Tables D-5:3, D-5:5,
 * D-5:6, D-5:7, D-5:9 and D-5:10. Transcribed via SAR_Reference_Tables.md
 * section 2. All values are nautical miles.
 *
 * Coverage note carried from the source transcription: the aircraft tables
 * here are condensed to the altitudes that were digitised (fixed wing 500 ft
 * and 1500 ft, helicopter 500 ft). The full four-altitude tables
 * (500/1000/1500/2000 ft) are in the source PDF, Appendix D-5, Tables
 * D-5:6(1)/(2) pages 406 and 408 and D-5:7(1)/(2) pages 410 and 412. Add them
 * as further entries in SWEEP_WIDTH_TABLES when they are digitised; no engine
 * code needs to change.
 *
 * Corrected sweep width is built elsewhere (see ./correctionFactors and
 * ../effort): W = W0 x fw x fv x ff.
 */

export type SweepWidthPlatform =
  | 'vessel-visual-water'
  | 'merchant-ship-visual-water'
  | 'fixed-wing-water'
  | 'helicopter-water'
  | 'visual-land';

export interface SweepWidthRow {
  /** Search object as named in the source table. */
  object: string;
  /** W0 in nm, one per visibility column, in column order. */
  values: number[];
  /** Source footnote applying to this row alone. */
  note?: string;
}

/** The manual every table in this module is transcribed from. */
export const SOURCE_MANUAL = 'AMSA NATSAR 2026';

export interface SweepWidthTable {
  id: string;
  label: string;
  platform: SweepWidthPlatform;
  /**
   * Short source table reference, shown in the UI beside the value so a
   * planner can audit it. The manual itself is SOURCE_MANUAL.
   */
  sourceTable: string;
  /** Meteorological visibility, km, one per column of every row. */
  visibilityKm: number[];
  /** Observer eye height above the water, feet (vessel tables). */
  observerHeightFt?: number;
  /** Search altitude, feet (aircraft and land tables). */
  altitudeFt?: number;
  rows: SweepWidthRow[];
  note?: string;
}

/** Table D-5:3 visibility columns, quoted in the source as km/nm pairs. */
const VESSEL_VIS_KM = [2, 5, 10, 15, 20, 25];
const MERCHANT_VIS_KM = [5, 10, 20, 30, 40];
const AIR_VIS_KM = [2, 5, 10, 20, 30, 40];
const LAND_VIS_KM = [5, 10, 20, 30, 40];

const VESSEL_ROWS_8FT: SweepWidthRow[] = [
  { object: 'Person in water', values: [0.2, 0.2, 0.3, 0.3, 0.3, 0.3] },
  { object: 'Life raft, 1 person', values: [0.7, 1.2, 1.8, 2.1, 2.4, 2.5] },
  { object: 'Life raft, 4 person', values: [0.8, 1.5, 2.3, 2.9, 3.2, 3.4] },
  { object: 'Life raft, 6 person', values: [0.9, 1.7, 2.7, 3.4, 3.8, 4.1] },
  { object: 'Life raft, 8 person', values: [0.9, 1.7, 2.8, 3.5, 4.0, 4.2] },
  { object: 'Life raft, 10 person', values: [0.9, 1.8, 2.9, 3.7, 4.2, 4.6] },
  { object: 'Life raft, 15 person', values: [1.0, 2.0, 3.2, 4.0, 4.5, 4.9] },
  { object: 'Life raft, 20 person', values: [1.0, 2.1, 3.5, 4.4, 5.1, 5.6] },
  { object: 'Life raft, 25 person', values: [1.0, 2.2, 3.7, 4.7, 5.5, 6.0] },
  { object: 'Power boat <5m', values: [0.5, 0.7, 1.0, 1.2, 1.3, 1.4] },
  { object: 'Power boat 5-8m', values: [0.8, 1.4, 2.3, 2.9, 3.4, 3.8] },
  { object: 'Power boat 8-12m', values: [0.8, 1.8, 3.1, 4.1, 4.9, 5.6] },
  { object: 'Power boat 12-20m', values: [0.9, 2.2, 4.2, 5.9, 7.4, 8.7] },
  { object: 'Power boat 20-27m', values: [0.9, 2.3, 4.6, 6.8, 8.8, 10.6] },
  { object: 'Sail boat 5m', values: [0.8, 1.4, 2.2, 2.7, 3.1, 3.4] },
  { object: 'Sail boat 6m', values: [0.8, 1.6, 2.6, 3.3, 3.9, 4.4] },
  { object: 'Sail boat 8m', values: [0.9, 1.8, 2.9, 3.9, 4.6, 5.1] },
  { object: 'Sail boat 9m', values: [0.9, 2.0, 3.4, 4.6, 5.5, 6.3] },
  { object: 'Sail boat 12m', values: [0.9, 2.2, 4.1, 5.7, 7.0, 8.1] },
  { object: 'Sail boat 15m', values: [0.9, 2.2, 4.3, 6.1, 7.7, 9.1] },
  { object: 'Sail boat 20-23m', values: [0.9, 2.3, 4.5, 6.5, 8.3, 9.9] },
  { object: 'Sail boat 23-27m', values: [0.9, 2.4, 4.7, 6.8, 8.9, 10.7] },
];

const VESSEL_ROWS_14FT: SweepWidthRow[] = [
  { object: 'Person in water', values: [0.3, 0.4, 0.5, 0.6, 0.6, 0.6] },
  { object: 'Life raft, 1 person', values: [1.0, 1.6, 2.5, 2.9, 3.2, 3.3] },
  { object: 'Life raft, 4 person', values: [1.1, 2.0, 3.1, 3.8, 4.2, 4.4] },
  { object: 'Life raft, 6 person', values: [1.2, 2.2, 3.5, 4.4, 5.0, 5.3] },
  { object: 'Life raft, 8 person', values: [1.2, 2.3, 3.6, 4.5, 5.1, 5.4] },
  { object: 'Life raft, 10 person', values: [1.2, 2.3, 3.7, 4.7, 5.4, 5.8] },
  { object: 'Life raft, 15 person', values: [1.2, 2.5, 4.0, 5.1, 5.7, 6.2] },
  { object: 'Life raft, 20 person', values: [1.3, 2.6, 4.3, 5.7, 6.4, 6.9] },
  { object: 'Life raft, 25 person', values: [1.3, 2.7, 4.3, 5.8, 6.7, 7.5] },
  { object: 'Power boat <5m', values: [0.5, 1.0, 1.5, 1.8, 1.9, 2.0] },
  { object: 'Power boat 5-8m', values: [1.0, 1.9, 3.0, 3.9, 4.5, 5.0] },
  { object: 'Power boat 8-12m', values: [1.2, 2.3, 4.0, 5.3, 6.4, 7.3] },
  { object: 'Power boat 12-20m', values: [1.2, 3.0, 5.4, 7.6, 9.6, 11.3] },
  { object: 'Power boat 20-27m', values: [1.2, 3.0, 6.0, 8.7, 11.3, 13.6] },
  { object: 'Sail boat 5m', values: [1.0, 1.8, 2.8, 3.5, 4.1, 4.5] },
  { object: 'Sail boat 6m', values: [1.1, 2.0, 3.3, 4.3, 5.0, 5.6] },
  { object: 'Sail boat 8m', values: [1.1, 2.2, 3.8, 5.0, 5.9, 6.7] },
  { object: 'Sail boat 9m', values: [1.2, 2.5, 4.4, 5.9, 7.1, 8.1] },
  { object: 'Sail boat 12m', values: [1.3, 2.8, 5.2, 7.2, 9.0, 10.5] },
  { object: 'Sail boat 15m', values: [1.2, 2.9, 5.2, 7.9, 9.9, 11.7] },
  { object: 'Sail boat 20-23m', values: [1.2, 3.0, 5.8, 8.4, 10.8, 12.9] },
  { object: 'Sail boat 23-27m', values: [1.2, 3.1, 6.1, 8.9, 11.5, 13.8] },
];

const PIW_FLOTATION_NOTE =
  'At 500 ft only, this value may be multiplied by 4 if the person is known to be wearing a flotation device.';

const FW_500: SweepWidthRow[] = [
  { object: 'Person in water', values: [0.0, 0.1, 0.1, 0.1, 0.1, 0.1], note: PIW_FLOTATION_NOTE },
  { object: 'Life raft, 1 person', values: [0.3, 0.7, 0.9, 1.2, 1.4, 1.4] },
  { object: 'Life raft, 4 person', values: [0.4, 1.0, 1.3, 1.8, 2.0, 2.2] },
  { object: 'Life raft, 6 person', values: [0.4, 1.1, 1.5, 2.2, 2.5, 2.8] },
  { object: 'Life raft, 8 person', values: [0.4, 1.2, 1.6, 2.3, 2.7, 2.9] },
  { object: 'Life raft, 10 person', values: [0.4, 1.2, 1.7, 2.5, 2.9, 3.2] },
  { object: 'Life raft, 15 person', values: [0.5, 1.3, 1.9, 2.7, 3.3, 3.6] },
  { object: 'Life raft, 20 person', values: [0.5, 1.5, 2.1, 3.2, 3.8, 4.2] },
  { object: 'Life raft, 25 person', values: [0.5, 1.6, 2.3, 3.4, 4.1, 4.6] },
  { object: 'Power boat <5m', values: [0.4, 0.9, 1.2, 1.5, 1.7, 1.8] },
  { object: 'Power boat 5-8m', values: [0.5, 1.7, 2.4, 3.6, 4.3, 4.8] },
  { object: 'Power boat 8-12m', values: [0.6, 2.1, 3.3, 5.3, 6.7, 7.7] },
  { object: 'Power boat 12-20m', values: [0.6, 2.7, 4.5, 8.1, 10.9, 13.1] },
  { object: 'Power boat 20-27m', values: [0.6, 2.8, 5.0, 9.8, 13.5, 16.7] },
  { object: 'Sail boat 5m', values: [0.5, 1.6, 2.2, 3.2, 3.9, 4.3] },
  { object: 'Sail boat 8m', values: [0.6, 2.0, 3.1, 4.9, 6.1, 7.0] },
  { object: 'Sail boat 12m', values: [0.6, 2.6, 4.3, 7.6, 10.0, 11.9] },
  { object: 'Sail boat 15m', values: [0.8, 2.7, 4.6, 8.4, 11.3, 13.7] },
  { object: 'Sail boat 20-23m', values: [0.6, 2.8, 4.9, 9.3, 12.7, 15.5] },
  { object: 'Sail boat 23-27m', values: [0.6, 2.8, 5.1, 9.9, 13.7, 17.0] },
  { object: 'Ship 27-46m', values: [0.6, 2.9, 5.4, 11.1, 15.9, 20.1] },
  { object: 'Ship 46-91m', values: [0.6, 3.0, 5.7, 12.5, 18.9, 24.7] },
  { object: 'Ship >91m', values: [0.7, 3.0, 5.8, 13.2, 20.6, 27.9] },
];

const FW_1000: SweepWidthRow[] = [
  { object: 'Person in water', values: [0.0, 0.1, 0.1, 0.1, 0.1, 0.1] },
  { object: 'Life raft, 1 person', values: [0.3, 0.7, 0.9, 1.2, 1.4, 1.4] },
  { object: 'Life raft, 4 person', values: [0.3, 1.0, 1.3, 1.8, 2.1, 2.3] },
  { object: 'Life raft, 6 person', values: [0.4, 1.1, 1.6, 2.2, 2.6, 2.8] },
  { object: 'Life raft, 8 person', values: [0.4, 1.2, 1.7, 2.4, 2.8, 3.0] },
  { object: 'Life raft, 10 person', values: [0.4, 1.3, 1.8, 2.6, 3.0, 3.3] },
  { object: 'Life raft, 15 person', values: [0.4, 1.4, 2.0, 2.8, 3.4, 3.7] },
  { object: 'Life raft, 20 person', values: [0.4, 1.5, 2.2, 3.2, 3.9, 4.3] },
  { object: 'Life raft, 25 person', values: [0.4, 1.6, 2.3, 3.5, 4.2, 4.7] },
  { object: 'Power boat <5m', values: [0.4, 1.0, 1.3, 1.7, 1.8, 2.0] },
  { object: 'Power boat 5-8m', values: [0.5, 1.7, 2.5, 3.7, 4.4, 5.0] },
  { object: 'Power boat 8-12m', values: [0.5, 2.2, 3.4, 5.4, 6.8, 7.8] },
  { object: 'Power boat 12-20m', values: [0.6, 2.7, 4.5, 8.2, 10.9, 13.1] },
  { object: 'Power boat 20-27m', values: [0.6, 2.8, 5.1, 9.8, 13.6, 16.7] },
  { object: 'Sail boat 5m', values: [0.5, 1.6, 2.3, 3.3, 4.0, 4.4] },
  { object: 'Sail boat 8m', values: [0.5, 2.1, 3.2, 5.0, 6.2, 7.1] },
  { object: 'Sail boat 12m', values: [0.6, 2.6, 4.3, 7.6, 10.9, 12.0] },
  { object: 'Sail boat 15m', values: [0.6, 2.7, 4.6, 8.5, 11.4, 13.7] },
  { object: 'Sail boat 20-23m', values: [0.6, 2.8, 4.9, 9.3, 12.8, 15.6] },
  { object: 'Sail boat 23-27m', values: [0.6, 2.8, 5.1, 9.9, 13.6, 17.0] },
  { object: 'Ship 27-46m', values: [0.6, 2.9, 5.4, 11.1, 15.9, 20.1] },
  { object: 'Ship 46-91m', values: [0.6, 3.0, 5.7, 12.5, 18.9, 24.7] },
  { object: 'Ship >91m', values: [0.6, 3.0, 5.8, 13.2, 20.6, 27.9] },
];

const FW_1500: SweepWidthRow[] = [
  { object: 'Person in water', values: [0.0, 0.0, 0.0, 0.0, 0.0, 0.1] },
  { object: 'Life raft, 1 person', values: [0.2, 0.7, 0.9, 1.3, 1.4, 1.4] },
  { object: 'Life raft, 4 person', values: [0.3, 1.0, 1.3, 1.9, 2.1, 2.3] },
  { object: 'Life raft, 6 person', values: [0.3, 1.1, 1.6, 2.3, 2.6, 2.9] },
  { object: 'Life raft, 8 person', values: [0.3, 1.2, 1.7, 2.4, 2.8, 3.1] },
  { object: 'Life raft, 10 person', values: [0.3, 1.3, 1.8, 2.6, 3.1, 3.4] },
  { object: 'Life raft, 15 person', values: [0.3, 1.4, 2.0, 2.9, 3.4, 3.8] },
  { object: 'Life raft, 20 person', values: [0.4, 1.5, 2.2, 3.3, 4.0, 4.4] },
  { object: 'Life raft, 25 person', values: [0.4, 1.6, 2.4, 3.6, 4.3, 4.8] },
  { object: 'Power boat <5m', values: [0.3, 1.0, 1.3, 1.7, 2.0, 2.1] },
  { object: 'Power boat 5-8m', values: [0.4, 1.7, 2.5, 3.7, 4.5, 5.1] },
  { object: 'Power boat 8-12m', values: [0.5, 2.2, 3.4, 5.5, 6.8, 7.9] },
  { object: 'Power boat 12-20m', values: [0.5, 2.6, 4.5, 8.2, 11.0, 13.2] },
  { object: 'Power boat 20-27m', values: [0.5, 2.8, 5.1, 9.8, 13.6, 16.7] },
  { object: 'Sail boat 5m', values: [0.4, 1.6, 2.3, 3.4, 4.1, 4.5] },
  { object: 'Sail boat 8m', values: [0.5, 2.1, 3.2, 5.1, 6.3, 7.2] },
  { object: 'Sail boat 12m', values: [0.5, 2.6, 4.3, 7.6, 10.1, 12.0] },
  { object: 'Sail boat 15m', values: [0.5, 2.7, 4.6, 8.5, 11.4, 13.8] },
  { object: 'Sail boat 20-23m', values: [0.5, 2.8, 4.9, 9.4, 12.8, 15.7] },
  { object: 'Sail boat 23-27m', values: [0.5, 2.8, 5.1, 10.0, 13.8, 17.1] },
  { object: 'Ship 27-46m', values: [0.5, 2.9, 5.4, 11.1, 16.0, 20.1] },
  { object: 'Ship 46-91m', values: [0.5, 3.0, 5.7, 12.5, 18.9, 24.7] },
  { object: 'Ship >91m', values: [0.6, 3.0, 5.8, 13.2, 20.7, 27.9] },
];

const FW_2000: SweepWidthRow[] = [
  { object: 'Person in water', values: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0] },
  { object: 'Life raft, 1 person', values: [0.1, 0.6, 0.9, 1.2, 1.4, 1.4] },
  { object: 'Life raft, 4 person', values: [0.2, 0.9, 1.3, 1.9, 2.2, 2.3] },
  { object: 'Life raft, 6 person', values: [0.2, 1.1, 1.6, 2.3, 2.7, 2.9] },
  { object: 'Life raft, 8 person', values: [0.2, 1.2, 1.7, 2.5, 2.9, 3.2] },
  { object: 'Life raft, 10 person', values: [0.2, 1.2, 1.8, 2.7, 3.1, 3.5] },
  { object: 'Life raft, 15 person', values: [0.2, 1.4, 2.0, 3.0, 3.5, 3.9] },
  { object: 'Life raft, 20 person', values: [0.4, 1.5, 2.2, 3.4, 4.0, 4.5] },
  { object: 'Life raft, 25 person', values: [0.3, 1.6, 2.4, 3.6, 4.4, 4.9] },
  { object: 'Power boat <5m', values: [0.2, 1.0, 1.3, 1.8, 2.0, 2.2] },
  { object: 'Power boat 5-8m', values: [0.3, 1.7, 2.5, 3.8, 4.6, 5.1] },
  { object: 'Power boat 8-12m', values: [0.3, 2.2, 3.4, 5.5, 6.9, 8.0] },
  { object: 'Power boat 12-20m', values: [0.4, 2.6, 4.5, 8.3, 11.0, 13.3] },
  { object: 'Power boat 20-27m', values: [0.4, 2.8, 5.0, 9.8, 13.6, 16.8] },
  { object: 'Sail boat 5m', values: [0.3, 1.6, 2.3, 3.5, 4.1, 4.5] },
  { object: 'Sail boat 8m', values: [0.3, 2.1, 3.3, 5.2, 6.4, 7.3] },
  { object: 'Sail boat 12m', values: [0.4, 2.5, 4.3, 7.7, 10.1, 12.1] },
  { object: 'Sail boat 15m', values: [0.4, 2.7, 4.6, 8.6, 11.5, 13.9] },
  { object: 'Sail boat 20-23m', values: [0.4, 2.7, 4.9, 9.4, 12.9, 15.7] },
  { object: 'Sail boat 23-27m', values: [0.4, 2.8, 5.1, 10.0, 13.9, 17.1] },
  { object: 'Ship 27-46m', values: [0.4, 2.9, 5.4, 11.1, 16.0, 20.1] },
  { object: 'Ship 46-91m', values: [0.4, 3.0, 5.7, 12.5, 18.9, 24.7] },
  { object: 'Ship >91m', values: [0.5, 3.0, 5.8, 13.2, 20.6, 27.9] },
];

const HELI_500: SweepWidthRow[] = [
  { object: 'Person in water', values: [0.0, 0.1, 0.1, 0.1, 0.1, 0.1], note: PIW_FLOTATION_NOTE },
  { object: 'Life raft, 1 person', values: [0.4, 0.9, 1.2, 1.6, 1.8, 1.8] },
  { object: 'Life raft, 4 person', values: [0.5, 1.2, 1.6, 2.2, 2.6, 2.8] },
  { object: 'Life raft, 6 person', values: [0.5, 1.4, 1.9, 2.7, 3.2, 3.5] },
  { object: 'Life raft, 8 person', values: [0.6, 1.5, 2.0, 2.8, 3.3, 3.7] },
  { object: 'Life raft, 10 person', values: [0.6, 1.6, 2.2, 3.1, 3.6, 4.0] },
  { object: 'Life raft, 15 person', values: [0.6, 1.7, 2.3, 3.3, 4.0, 4.4] },
  { object: 'Life raft, 20 person', values: [0.6, 1.8, 2.6, 3.8, 4.6, 5.1] },
  { object: 'Life raft, 25 person', values: [0.6, 1.9, 2.7, 4.1, 5.0, 5.6] },
  { object: 'Power boat <5m', values: [0.5, 1.2, 1.5, 1.9, 2.2, 2.3] },
  { object: 'Power boat 5-8m', values: [0.7, 2.0, 2.9, 4.3, 5.2, 5.8] },
  { object: 'Power boat 8-12m', values: [0.8, 2.5, 3.9, 6.2, 7.8, 9.0] },
  { object: 'Power boat 12-20m', values: [0.8, 3.1, 5.1, 9.2, 12.3, 14.7] },
  { object: 'Power boat 20-27m', values: [0.8, 3.3, 5.7, 10.8, 15.0, 18.4] },
  { object: 'Sail boat 5m', values: [0.7, 1.9, 2.7, 3.9, 4.7, 5.2] },
  { object: 'Sail boat 8m', values: [0.8, 2.4, 3.7, 5.7, 7.1, 8.2] },
  { object: 'Sail boat 12m', values: [0.8, 3.0, 4.9, 8.3, 11.3, 13.5] },
  { object: 'Sail boat 15m', values: [0.8, 3.1, 5.2, 9.5, 12.7, 15.3] },
  { object: 'Sail boat 20-23m', values: [0.8, 3.2, 5.5, 10.4, 14.1, 17.3] },
  { object: 'Sail boat 23-27m', values: [0.8, 3.3, 5.7, 11.0, 15.2, 18.7] },
  { object: 'Ship 27-46m', values: [0.8, 3.4, 6.0, 12.2, 17.4, 21.9] },
  { object: 'Ship 46-91m', values: [0.8, 3.4, 6.3, 13.6, 20.4, 26.6] },
  { object: 'Ship >91m', values: [0.8, 3.5, 6.4, 14.3, 22.1, 29.8] },
];

const HELI_1000: SweepWidthRow[] = [
  { object: 'Person in water', values: [0.0, 0.1, 0.1, 0.1, 0.1, 0.1] },
  { object: 'Life raft, 1 person', values: [0.4, 0.9, 1.2, 1.6, 1.8, 1.8] },
  { object: 'Life raft, 4 person', values: [0.5, 1.2, 1.7, 2.3, 2.6, 2.9] },
  { object: 'Life raft, 6 person', values: [0.5, 1.4, 2.0, 2.8, 3.2, 3.5] },
  { object: 'Life raft, 8 person', values: [0.5, 1.5, 2.1, 2.9, 3.4, 3.8] },
  { object: 'Life raft, 10 person', values: [0.5, 1.6, 2.2, 3.2, 3.7, 4.1] },
  { object: 'Life raft, 15 person', values: [0.6, 1.7, 2.4, 3.5, 4.1, 4.5] },
  { object: 'Life raft, 20 person', values: [0.6, 1.8, 2.7, 3.9, 4.7, 5.2] },
  { object: 'Life raft, 25 person', values: [0.6, 1.9, 2.8, 4.2, 5.1, 5.7] },
  { object: 'Power boat <5m', values: [0.5, 1.2, 1.6, 2.1, 2.3, 2.5] },
  { object: 'Power boat 5-8m', values: [0.7, 2.1, 3.0, 4.4, 5.3, 5.9] },
  { object: 'Power boat 8-12m', values: [0.7, 2.6, 3.9, 6.3, 7.9, 9.1] },
  { object: 'Power boat 12-20m', values: [0.7, 3.1, 5.2, 9.2, 12.3, 14.8] },
  { object: 'Power boat 20-27m', values: [0.8, 3.3, 5.7, 10.9, 15.0, 18.5] },
  { object: 'Sail boat 5m', values: [0.6, 1.9, 2.8, 4.0, 4.8, 5.4] },
  { object: 'Sail boat 8m', values: [0.7, 2.5, 3.7, 5.8, 7.3, 8.3] },
  { object: 'Sail boat 12m', values: [0.7, 3.0, 4.9, 8.6, 11.4, 13.5] },
  { object: 'Sail boat 15m', values: [0.7, 3.1, 5.3, 9.5, 12.8, 15.4] },
  { object: 'Sail boat 20-23m', values: [0.8, 3.2, 5.6, 10.4, 14.2, 17.3] },
  { object: 'Sail boat 23-27m', values: [0.8, 3.3, 5.7, 11.0, 15.3, 18.8] },
  { object: 'Ship 27-46m', values: [0.8, 3.4, 6.0, 12.2, 17.4, 21.9] },
  { object: 'Ship 46-91m', values: [0.8, 3.4, 6.3, 13.6, 20.4, 26.6] },
  { object: 'Ship >91m', values: [0.8, 3.5, 6.4, 14.3, 22.2, 29.8] },
];

const HELI_1500: SweepWidthRow[] = [
  { object: 'Person in water', values: [0.0, 0.0, 0.0, 0.1, 0.1, 0.1] },
  { object: 'Life raft, 1 person', values: [0.3, 0.9, 1.2, 1.6, 1.8, 1.8] },
  { object: 'Life raft, 4 person', values: [0.4, 1.2, 1.7, 2.3, 2.7, 2.9] },
  { object: 'Life raft, 6 person', values: [0.4, 1.4, 2.0, 2.8, 3.3, 3.6] },
  { object: 'Life raft, 8 person', values: [0.4, 1.5, 2.1, 3.0, 3.5, 3.9] },
  { object: 'Life raft, 10 person', values: [0.4, 1.6, 2.2, 3.2, 3.8, 4.2] },
  { object: 'Life raft, 15 person', values: [0.5, 1.7, 2.4, 3.5, 4.2, 4.6] },
  { object: 'Life raft, 20 person', values: [0.5, 1.9, 2.7, 4.0, 4.8, 5.3] },
  { object: 'Life raft, 25 person', values: [0.5, 2.0, 2.9, 4.3, 5.2, 5.6] },
  { object: 'Power boat <5m', values: [0.4, 1.3, 1.7, 2.2, 2.5, 2.6] },
  { object: 'Power boat 5-8m', values: [0.6, 2.1, 3.0, 4.5, 5.4, 6.1] },
  { object: 'Power boat 8-12m', values: [0.6, 2.6, 4.0, 6.3, 7.9, 9.2] },
  { object: 'Power boat 12-20m', values: [0.7, 3.1, 5.2, 9.3, 12.4, 14.8] },
  { object: 'Power boat 20-27m', values: [0.7, 3.2, 5.7, 10.9, 15.1, 18.5] },
  { object: 'Sail boat 5m', values: [0.6, 2.0, 2.8, 4.1, 4.9, 5.5] },
  { object: 'Sail boat 8m', values: [0.6, 2.5, 3.8, 5.9, 7.4, 8.4] },
  { object: 'Sail boat 12m', values: [0.6, 3.0, 4.9, 8.7, 11.4, 13.6] },
  { object: 'Sail boat 15m', values: [0.7, 3.1, 5.3, 9.6, 12.8, 15.5] },
  { object: 'Sail boat 20-23m', values: [0.7, 3.2, 5.6, 10.4, 14.3, 17.4] },
  { object: 'Sail boat 23-27m', values: [0.7, 3.3, 5.7, 11.1, 15.3, 18.8] },
  { object: 'Ship 27-46m', values: [0.7, 3.3, 6.0, 12.2, 17.5, 22.0] },
  { object: 'Ship 46-91m', values: [0.7, 3.4, 6.3, 13.6, 20.4, 26.6] },
  { object: 'Ship >91m', values: [0.7, 3.4, 6.4, 14.3, 22.2, 29.8] },
];

const HELI_2000: SweepWidthRow[] = [
  { object: 'Person in water', values: [0.0, 0.0, 0.0, 0.0, 0.0, 0.1] },
  { object: 'Life raft, 1 person', values: [0.2, 0.8, 1.2, 1.6, 1.8, 1.8] },
  { object: 'Life raft, 4 person', values: [0.3, 1.2, 1.7, 2.3, 2.7, 3.0] },
  { object: 'Life raft, 6 person', values: [0.3, 1.4, 2.0, 2.8, 3.3, 3.6] },
  { object: 'Life raft, 8 person', values: [0.3, 1.5, 2.1, 3.0, 3.6, 3.9] },
  { object: 'Life raft, 10 person', values: [0.3, 1.6, 2.3, 3.3, 3.9, 4.2] },
  { object: 'Life raft, 15 person', values: [0.3, 1.7, 2.5, 3.6, 4.3, 4.7] },
  { object: 'Life raft, 20 person', values: [0.4, 1.8, 2.7, 4.0, 4.9, 5.4] },
  { object: 'Life raft, 25 person', values: [0.4, 1.9, 2.9, 4.3, 5.3, 5.9] },
  { object: 'Power boat <5m', values: [0.3, 1.3, 1.7, 2.3, 2.6, 2.7] },
  { object: 'Power boat 5-8m', values: [0.4, 2.1, 3.0, 4.5, 5.5, 6.1] },
  { object: 'Power boat 8-12m', values: [0.5, 2.6, 4.0, 6.4, 8.0, 9.3] },
  { object: 'Power boat 12-20m', values: [0.5, 3.0, 5.2, 9.3, 12.4, 14.9] },
  { object: 'Power boat 20-27m', values: [0.5, 3.2, 5.7, 10.9, 15.1, 18.5] },
  { object: 'Sail boat 5m', values: [0.4, 1.9, 2.8, 4.2, 5.0, 5.6] },
  { object: 'Sail boat 8m', values: [0.5, 2.5, 3.8, 6.0, 7.5, 8.6] },
  { object: 'Sail boat 12m', values: [0.5, 3.0, 4.9, 8.7, 11.4, 13.6] },
  { object: 'Sail boat 15m', values: [0.5, 3.1, 5.3, 9.6, 12.9, 15.5] },
  { object: 'Sail boat 20-23m', values: [0.5, 3.2, 5.6, 10.5, 14.3, 17.4] },
  { object: 'Sail boat 23-27m', values: [0.5, 3.2, 5.7, 11.1, 15.4, 18.9] },
  { object: 'Ship 27-46m', values: [0.5, 3.3, 6.0, 12.2, 17.5, 22.0] },
  { object: 'Ship 46-91m', values: [0.5, 3.4, 6.3, 13.6, 20.4, 26.6] },
  { object: 'Ship >91m', values: [0.6, 3.4, 6.4, 14.3, 22.2, 29.8] },
];

const SAILBOAT_NOTE =
  'A craft is only classed as a sailboat if its sails are up; otherwise use the power boat row for the same size.';

/**
 * COVERAGE: every table below is transcribed in full from the printed
 * appendix of the 2026 edition (manual pages 397 to 408) and verified value
 * by value: D-5:3 vessels, D-5:4 weather, D-5:5 merchant ships, D-5:6 (1) and
 * (2) fixed-wing, D-5:7 (1) and (2) helicopters, D-5:9 land, D-5:10 terrain.
 *
 * One presentation detail is normalised rather than copied. D-5:6 (1) names
 * boat rows by size range ("Power Boat 8-12 m") and D-5:6 (2) and D-5:7 name
 * the same rows by a representative size ("Power Boat 10 (33 ft)"). They are
 * the same objects, so a single set of names is used across all the aircraft
 * tables; otherwise the object picker would rename every row when the planner
 * changed altitude.
 *
 * Land search has no Person row at 1500 or 2000 ft: the source prints a dash
 * there, so those rows are absent rather than guessed.
 */
export const SWEEP_WIDTH_TABLES: SweepWidthTable[] = [
  {
    id: 'vessel-8ft',
    label: 'Vessel, visual over water, observer eye height 8 ft',
    platform: 'vessel-visual-water',
    sourceTable: 'Table D-5:3',
    visibilityKm: VESSEL_VIS_KM,
    observerHeightFt: 8,
    rows: VESSEL_ROWS_8FT,
    note: SAILBOAT_NOTE,
  },
  {
    id: 'vessel-14ft',
    label: 'Vessel, visual over water, observer eye height 14 ft',
    platform: 'vessel-visual-water',
    sourceTable: 'Table D-5:3',
    visibilityKm: VESSEL_VIS_KM,
    observerHeightFt: 14,
    rows: VESSEL_ROWS_14FT,
    note: SAILBOAT_NOTE,
  },
  {
    id: 'merchant-ship',
    label: 'Merchant ship bridge height, visual over water',
    platform: 'merchant-ship-visual-water',
    sourceTable: 'Table D-5:5',
    visibilityKm: MERCHANT_VIS_KM,
    rows: [
      { object: 'Person in water', values: [0.4, 0.5, 0.6, 0.7, 0.7] },
      { object: '4-person life raft', values: [2.3, 3.2, 4.2, 4.9, 5.5] },
      { object: '6-person life raft', values: [2.5, 3.6, 5.0, 6.2, 6.9] },
      { object: '15-person life raft', values: [2.6, 4.0, 5.1, 6.4, 7.3] },
      { object: '25-person life raft', values: [2.7, 4.2, 5.2, 6.5, 7.5] },
      { object: 'Boat <5m', values: [1.1, 1.4, 1.9, 2.1, 2.3] },
      { object: 'Boat <7m', values: [2.0, 2.9, 4.3, 5.2, 5.8] },
      { object: 'Boat <12m', values: [2.8, 4.5, 7.6, 9.4, 11.6] },
      { object: 'Boat <24m', values: [3.2, 5.6, 10.7, 14.7, 18.1] },
    ],
  },
  {
    id: 'fixed-wing-500',
    label: 'Fixed-wing aircraft at 500 ft, over water',
    platform: 'fixed-wing-water',
    sourceTable: 'Table D-5:6 (1)',
    visibilityKm: AIR_VIS_KM,
    altitudeFt: 500,
    rows: FW_500,
    note: SAILBOAT_NOTE,
  },
  {
    id: 'fixed-wing-1000',
    label: 'Fixed-wing aircraft at 1000 ft, over water',
    platform: 'fixed-wing-water',
    sourceTable: 'Table D-5:6 (1)',
    visibilityKm: AIR_VIS_KM,
    altitudeFt: 1000,
    rows: FW_1000,
    note: SAILBOAT_NOTE,
  },
  {
    id: 'fixed-wing-1500',
    label: 'Fixed-wing aircraft at 1500 ft, over water',
    platform: 'fixed-wing-water',
    sourceTable: 'Table D-5:6 (2)',
    visibilityKm: AIR_VIS_KM,
    altitudeFt: 1500,
    rows: FW_1500,
    note: SAILBOAT_NOTE,
  },
  {
    id: 'fixed-wing-2000',
    label: 'Fixed-wing aircraft at 2000 ft, over water',
    platform: 'fixed-wing-water',
    sourceTable: 'Table D-5:6 (2)',
    visibilityKm: AIR_VIS_KM,
    altitudeFt: 2000,
    rows: FW_2000,
    note: SAILBOAT_NOTE,
  },
  {
    id: 'helicopter-500',
    label: 'Helicopter at 500 ft, over water',
    platform: 'helicopter-water',
    sourceTable: 'Table D-5:7 (1)',
    visibilityKm: AIR_VIS_KM,
    altitudeFt: 500,
    rows: HELI_500,
    note: SAILBOAT_NOTE,
  },
  {
    id: 'helicopter-1000',
    label: 'Helicopter at 1000 ft, over water',
    platform: 'helicopter-water',
    sourceTable: 'Table D-5:7 (1)',
    visibilityKm: AIR_VIS_KM,
    altitudeFt: 1000,
    rows: HELI_1000,
    note: SAILBOAT_NOTE,
  },
  {
    id: 'helicopter-1500',
    label: 'Helicopter at 1500 ft, over water',
    platform: 'helicopter-water',
    sourceTable: 'Table D-5:7 (2)',
    visibilityKm: AIR_VIS_KM,
    altitudeFt: 1500,
    rows: HELI_1500,
    note: SAILBOAT_NOTE,
  },
  {
    id: 'helicopter-2000',
    label: 'Helicopter at 2000 ft, over water',
    platform: 'helicopter-water',
    sourceTable: 'Table D-5:7 (2)',
    visibilityKm: AIR_VIS_KM,
    altitudeFt: 2000,
    rows: HELI_2000,
    note: SAILBOAT_NOTE,
  },
  {
    id: 'land-500',
    label: 'Visual search over land, 500 ft',
    platform: 'visual-land',
    sourceTable: 'Table D-5:9',
    visibilityKm: LAND_VIS_KM,
    altitudeFt: 500,
    rows: [
      { object: 'Person', values: [0.4, 0.4, 0.5, 0.5, 0.5] },
      { object: 'Vehicle', values: [0.9, 1.3, 1.3, 1.3, 1.3] },
      { object: 'Aircraft <5700kg', values: [1.0, 1.4, 1.4, 1.4, 1.4] },
      { object: 'Aircraft >5700kg', values: [1.2, 2.0, 2.2, 2.2, 2.2] },
    ],
  },
  {
    id: 'land-1000',
    label: 'Visual search over land, 1000 ft',
    platform: 'visual-land',
    sourceTable: 'Table D-5:9',
    visibilityKm: LAND_VIS_KM,
    altitudeFt: 1000,
    rows: [
      { object: 'Person', values: [0.4, 0.4, 0.5, 0.5, 0.5] },
      { object: 'Vehicle', values: [1.0, 1.4, 1.4, 1.5, 1.5] },
      { object: 'Aircraft <5700kg', values: [1.0, 1.5, 1.5, 1.6, 1.6] },
      { object: 'Aircraft >5700kg', values: [1.8, 2.7, 3.0, 3.0, 3.0] },
    ],
  },
  {
    id: 'land-1500',
    label: 'Visual search over land, 1500 ft',
    platform: 'visual-land',
    sourceTable: 'Table D-5:9',
    visibilityKm: LAND_VIS_KM,
    altitudeFt: 1500,
    rows: [
      { object: 'Vehicle', values: [1.0, 1.4, 1.7, 1.7, 1.7] },
      { object: 'Aircraft <5700kg', values: [1.0, 1.5, 1.8, 1.8, 1.8] },
      { object: 'Aircraft >5700kg', values: [2.0, 2.8, 3.2, 3.2, 3.2] },
    ],
  },
  {
    id: 'land-2000',
    label: 'Visual search over land, 2000 ft',
    platform: 'visual-land',
    sourceTable: 'Table D-5:9',
    visibilityKm: LAND_VIS_KM,
    altitudeFt: 2000,
    rows: [
      { object: 'Vehicle', values: [1.0, 1.5, 2.0, 2.0, 2.0] },
      { object: 'Aircraft <5700kg', values: [1.0, 1.6, 2.0, 2.0, 2.0] },
      { object: 'Aircraft >5700kg', values: [2.2, 2.9, 3.5, 3.5, 3.5] },
    ],
  },
];

/**
 * Vegetation / terrain correction factor for land search (Table D-5:10).
 * Multiplies the land sweep widths above.
 */
export type TerrainClass = 'open' | 'hilly' | 'mountainous' | 'rainforest';


export const VEGETATION_CORRECTION: Record<string, Record<TerrainClass, number>> = {
  Person: { open: 0.8, hilly: 0.5, mountainous: 0.3, rainforest: 0.1 },
  Vehicle: { open: 1.0, hilly: 0.7, mountainous: 0.4, rainforest: 0.1 },
  'Aircraft <5700kg': { open: 1.0, hilly: 0.7, mountainous: 0.4, rainforest: 0.1 },
  'Aircraft >5700kg': { open: 1.0, hilly: 0.8, mountainous: 0.4, rainforest: 0.1 },
};

const TABLES_BY_ID = new Map(SWEEP_WIDTH_TABLES.map((t) => [t.id, t]));

export function getSweepWidthTable(id: string): SweepWidthTable {
  const table = TABLES_BY_ID.get(id);
  if (!table) throw new Error(`Unknown sweep width table id: ${id}`);
  return table;
}

export interface SweepWidthLookup {
  /** Uncorrected sweep width W0, nm. */
  w0: number;
  /** True when the value sits between two visibility columns of the table. */
  interpolated: boolean;
  tableId: string;
  sourceTable: string;
  object: string;
  note?: string;
}

/**
 * Read W0 from a table for a given search object and meteorological
 * visibility. Visibility between two columns is linearly interpolated (the
 * source tables are read that way in manual planning) and flagged as such;
 * visibility outside the table clamps to the end column.
 */
export function lookupSweepWidth(
  tableId: string,
  object: string,
  visibilityKm: number,
): SweepWidthLookup {
  const table = getSweepWidthTable(tableId);
  const row = table.rows.find((r) => r.object === object);
  if (!row) throw new Error(`Sweep width table ${tableId} has no row for object: ${object}`);

  const cols = table.visibilityKm;
  const base = { tableId, sourceTable: table.sourceTable, object, note: row.note };

  if (visibilityKm <= cols[0]) return { ...base, w0: row.values[0], interpolated: false };
  const last = cols.length - 1;
  if (visibilityKm >= cols[last]) return { ...base, w0: row.values[last], interpolated: false };

  for (let i = 0; i < last; i++) {
    const lo = cols[i];
    const hi = cols[i + 1];
    if (visibilityKm === lo) return { ...base, w0: row.values[i], interpolated: false };
    if (visibilityKm > lo && visibilityKm < hi) {
      const t = (visibilityKm - lo) / (hi - lo);
      return {
        ...base,
        w0: row.values[i] + t * (row.values[i + 1] - row.values[i]),
        interpolated: true,
      };
    }
  }
  return { ...base, w0: row.values[last], interpolated: false };
}

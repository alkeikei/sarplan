/**
 * Sweep width correction factors.
 *
 * SOURCE: National Search and Rescue Manual, 2023 Edition (AMSA / Australian
 * National Search and Rescue Council), Appendix D-5, Table D-5:4 (weather)
 * and the fatigue table alongside it. Transcribed via
 * SAR_Reference_Tables.md section 3.
 *
 * DEVIATION NOTE, carried verbatim in spirit from the source manual: the
 * weather correction table below DIFFERS FROM IAMSAR for "other search
 * objects" in winds over 15 kt. It is the Australian National SAR Council's
 * own adjustment based on observed SAR outcomes, not an IAMSAR figure. If a
 * licensed IAMSAR Appendix N copy replaces this file, that row is the one to
 * check first.
 *
 * Corrected sweep width: W = W0 x fw x fv x ff.
 */

/** Weather correction factor applies to two object classes only. */
export type WeatherObjectClass = 'small' | 'other';


export interface WeatherCorrectionBand {
  id: string;
  label: string;
  /** Inclusive lower bound of sustained wind, kt. */
  windFromKt: number;
  /** Exclusive upper bound of sustained wind, kt. Infinity for the top band. */
  windToKt: number;
  /** Inclusive lower bound of significant sea height, m. */
  seaFromM: number;
  /** Exclusive upper bound of significant sea height, m. Infinity at the top. */
  seaToM: number;
  factors: Record<WeatherObjectClass, number>;
}

/** Table D-5:4. */
export const WEATHER_CORRECTION_BANDS: WeatherCorrectionBand[] = [
  {
    id: 'calm',
    label: 'Winds <28 km/h (<15 kt) or seas 0-1 m',
    windFromKt: 0,
    windToKt: 15,
    seaFromM: 0,
    seaToM: 1,
    factors: { small: 1.0, other: 1.0 },
  },
  {
    id: 'moderate',
    label: 'Winds 28-46 km/h (15-25 kt) or seas 1-1.5 m',
    windFromKt: 15,
    windToKt: 25,
    seaFromM: 1,
    seaToM: 1.5,
    // "other" = 0.8 here is the AMSA deviation from IAMSAR.
    factors: { small: 0.5, other: 0.8 },
  },
  {
    id: 'rough',
    label: 'Winds >46 km/h (>25 kt) or seas >1.5 m',
    windFromKt: 25,
    windToKt: Infinity,
    seaFromM: 1.5,
    seaToM: Infinity,
    // "other" = 0.5 here is the AMSA deviation from IAMSAR.
    factors: { small: 0.25, other: 0.5 },
  },
];

export interface WeatherCorrectionResult {
  /** fw. */
  factor: number;
  band: WeatherCorrectionBand;
  /** Which input drove the band choice, when wind and sea disagree. */
  drivenBy: 'wind' | 'sea';
}

/**
 * Pick fw from wind speed and, optionally, sea height. The source table gives
 * wind OR sea as alternative entry points; when both are supplied the worse
 * (lower factor) band wins, which is the conservative planning reading.
 */
export function weatherCorrectionFactor(
  windSpeedKt: number,
  objectClass: WeatherObjectClass,
  seaHeightM?: number,
): WeatherCorrectionResult {
  const byWind =
    WEATHER_CORRECTION_BANDS.find((b) => windSpeedKt >= b.windFromKt && windSpeedKt < b.windToKt) ??
    WEATHER_CORRECTION_BANDS[WEATHER_CORRECTION_BANDS.length - 1];

  if (seaHeightM === undefined || Number.isNaN(seaHeightM)) {
    return { factor: byWind.factors[objectClass], band: byWind, drivenBy: 'wind' };
  }

  const bySea =
    WEATHER_CORRECTION_BANDS.find((b) => seaHeightM >= b.seaFromM && seaHeightM < b.seaToM) ??
    WEATHER_CORRECTION_BANDS[WEATHER_CORRECTION_BANDS.length - 1];

  return bySea.factors[objectClass] < byWind.factors[objectClass]
    ? { factor: bySea.factors[objectClass], band: bySea, drivenBy: 'sea' }
    : { factor: byWind.factors[objectClass], band: byWind, drivenBy: 'wind' };
}

/** Fatigue correction factor ff. Source: SAR_Reference_Tables.md section 3. */
export const FATIGUE_FACTOR_RESTED = 1.0;
export const FATIGUE_FACTOR_FATIGUED = 0.9;

export function fatigueCorrectionFactor(crewFatigued: boolean): number {
  return crewFatigued ? FATIGUE_FACTOR_FATIGUED : FATIGUE_FACTOR_RESTED;
}

/**
 * Speed (velocity) correction factor fv.
 *
 * SOURCE: Table D-5:8, "Speed (velocity) Correction Factors for Helicopter and
 * Fixed-wing Aircraft Search Facilities", manual page 407.
 *
 * The table applies to AIRCRAFT ONLY. It is printed in the aircraft section
 * and its rows are maritime search objects, so a vessel facility, and an
 * aircraft searching over land for a person or a vehicle, have no row and take
 * 1.0. That is the source declining to correct, not the app inventing a value.
 *
 * Searching faster gives the crew less time over each patch of sea, so the
 * effective sweep narrows: a person in the water is 1.2 at or below 150 kt in
 * a fixed-wing aircraft and 0.9 at 210 kt.
 */
export const DEFAULT_SPEED_CORRECTION_FACTOR = 1.0;

/** The two aircraft columns of Table D-5:8. Vessels and land take the default. */
export type SpeedCorrectionPlatform = 'fixed-wing' | 'helicopter';

/** Speeds the table prints, in knots, per platform. */
export const SPEED_CORRECTION_SPEEDS_KT: Record<SpeedCorrectionPlatform, number[]> = {
  'fixed-wing': [150, 180, 210],
  helicopter: [60, 90, 120, 140],
};

export interface SpeedCorrectionRow {
  /** The row label as Table D-5:8 prints it. */
  object: string;
  'fixed-wing': number[];
  helicopter: number[];
}

export const SPEED_CORRECTION_TABLE: SpeedCorrectionRow[] = [
  { object: 'Person in water', 'fixed-wing': [1.2, 1.0, 0.9], helicopter: [1.5, 1.0, 0.8, 0.7] },
  { object: 'Raft, 1-4 person', 'fixed-wing': [1.1, 1.0, 0.9], helicopter: [1.3, 1.0, 0.9, 0.8] },
  { object: 'Raft, 6-25 person', 'fixed-wing': [1.1, 1.0, 0.9], helicopter: [1.2, 1.0, 0.9, 0.8] },
  { object: 'Power boat <8 m', 'fixed-wing': [1.1, 1.0, 0.9], helicopter: [1.2, 1.0, 0.9, 0.8] },
  { object: 'Power boat 10 m', 'fixed-wing': [1.1, 1.0, 0.9], helicopter: [1.1, 1.0, 0.9, 0.9] },
  { object: 'Power boat 16 m', 'fixed-wing': [1.1, 1.0, 1.0], helicopter: [1.1, 1.0, 0.9, 0.9] },
  { object: 'Power boat 24 m', 'fixed-wing': [1.1, 1.0, 1.0], helicopter: [1.1, 1.0, 1.0, 0.9] },
  { object: 'Sail boat <8 m', 'fixed-wing': [1.1, 1.0, 0.9], helicopter: [1.2, 1.0, 0.9, 0.9] },
  { object: 'Sail boat 12 m', 'fixed-wing': [1.1, 1.0, 1.0], helicopter: [1.1, 1.0, 0.9, 0.9] },
  { object: 'Sail boat 25 m', 'fixed-wing': [1.1, 1.0, 1.0], helicopter: [1.1, 1.0, 1.0, 0.9] },
  { object: 'Ship >27 m', 'fixed-wing': [1.0, 1.0, 1.0], helicopter: [1.1, 1.0, 1.0, 0.9] },
];

/**
 * Which Table D-5:8 row covers each sweep width search object.
 *
 * D-5:8 is coarser than the sweep width tables: it prints one row per size
 * band where D-5:6 and D-5:7 print one per size. Written out rather than
 * matched on text, for the same reason as the leeway error mapping.
 */
export const SPEED_CORRECTION_BY_OBJECT: Record<string, string> = {
  'Person in water': 'Person in water',
  'Life raft, 1 person': 'Raft, 1-4 person',
  'Life raft, 4 person': 'Raft, 1-4 person',
  'Life raft, 6 person': 'Raft, 6-25 person',
  'Life raft, 8 person': 'Raft, 6-25 person',
  'Life raft, 10 person': 'Raft, 6-25 person',
  'Life raft, 15 person': 'Raft, 6-25 person',
  'Life raft, 20 person': 'Raft, 6-25 person',
  'Life raft, 25 person': 'Raft, 6-25 person',
  'Power boat <5m': 'Power boat <8 m',
  'Power boat 5-8m': 'Power boat <8 m',
  'Power boat 8-12m': 'Power boat 10 m',
  'Power boat 12-20m': 'Power boat 16 m',
  'Power boat 20-27m': 'Power boat 24 m',
  'Sail boat 5m': 'Sail boat <8 m',
  'Sail boat 8m': 'Sail boat <8 m',
  'Sail boat 12m': 'Sail boat 12 m',
  'Sail boat 15m': 'Sail boat 12 m',
  'Sail boat 20-23m': 'Sail boat 25 m',
  'Sail boat 23-27m': 'Sail boat 25 m',
  'Ship 27-46m': 'Ship >27 m',
  'Ship 46-91m': 'Ship >27 m',
  'Ship >91m': 'Ship >27 m',
};

export interface SpeedCorrectionResult {
  /** fv. 1.0 where the source has no row for this platform or object. */
  factor: number;
  /** The Table D-5:8 row used, if any. */
  row?: string;
  /** True when the speed fell between two printed columns. */
  interpolated: boolean;
  /** Set when the source offers no correction, with the reason. */
  noRow?: 'platform' | 'object';
}

/**
 * fv for an aircraft searching at a given speed for a given object.
 *
 * Speeds between two printed columns are interpolated, as visibility is for
 * sweep width, and clamped at the ends: the first column is printed as "< or
 * = 150", so anything slower takes it.
 */
export function speedCorrectionFactor(
  platform: SpeedCorrectionPlatform | null,
  speedKt: number,
  sweepObject: string,
): SpeedCorrectionResult {
  if (platform === null) {
    return { factor: DEFAULT_SPEED_CORRECTION_FACTOR, interpolated: false, noRow: 'platform' };
  }
  const rowName = SPEED_CORRECTION_BY_OBJECT[sweepObject];
  const row = SPEED_CORRECTION_TABLE.find((r) => r.object === rowName);
  if (!row) {
    return { factor: DEFAULT_SPEED_CORRECTION_FACTOR, interpolated: false, noRow: 'object' };
  }

  const speeds = SPEED_CORRECTION_SPEEDS_KT[platform];
  const values = row[platform];
  if (speedKt <= speeds[0]) return { factor: values[0], row: row.object, interpolated: false };
  const last = speeds.length - 1;
  if (speedKt >= speeds[last]) {
    return { factor: values[last], row: row.object, interpolated: false };
  }
  for (let i = 0; i < last; i++) {
    if (speedKt <= speeds[i + 1]) {
      const span = speeds[i + 1] - speeds[i];
      const t = (speedKt - speeds[i]) / span;
      const factor = values[i] + t * (values[i + 1] - values[i]);
      return {
        factor: Math.round(factor * 1000) / 1000,
        row: row.object,
        interpolated: speedKt !== speeds[i],
      };
    }
  }
  return { factor: values[last], row: row.object, interpolated: false };
}

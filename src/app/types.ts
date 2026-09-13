/**
 * Case state: everything the user enters or accepts, plus where each value
 * came from. Serialised straight to IndexedDB, so keep it plain JSON.
 */

import type { DatumType, SearchStage, WeatherObjectClass } from '../engine';
import type { Params, TextKey } from './i18n';

/**
 * An auto-derived value the user may override (PRD 6.8: every auto-calculated
 * or auto-fetched value can be edited). `null` means "use the auto value".
 */
export type Override = number | null;

export type ProvenanceKind = 'fetched' | 'manual';

/** A flag message held as a dictionary key so it renders in the reader's language. */
export interface ProvenanceFlag {
  key: TextKey;
  params?: Params;
}

export interface Provenance {
  kind: ProvenanceKind;
  /**
   * Where a fetched value came from. A plain string for a bare provider name
   * ("Open-Meteo"); a key and values where the label is a sentence, so that,
   * like the flags below, it renders in the reader's language rather than the
   * language it happened to be fetched in.
   */
  source?: string | ProvenanceFlag;
  /** When it was fetched, ISO 8601. */
  at?: string;
  /**
   * Why the fetched value may not describe what was asked for: the nearest
   * available forecast hour is not the requested hour, the port is far from
   * the datum, and so on (PRD 6.3). Rendered in amber: expected, not an error.
   *
   * Stored as keys and values rather than a finished sentence, because this
   * is persisted with the case: a case fetched in English and reopened in
   * Indonesian must read in Indonesian, and a stored sentence cannot.
   *
   * `staleReason` is the string form these used to take. Cases saved before
   * the change still carry it, so it is read and never written.
   */
  flags?: ProvenanceFlag[];
  /** @deprecated legacy shape; read for old cases, not written. */
  staleReason?: string;
}

export type DistressType = 'lkp' | 'eip' | 'previous-datum';


export interface LatLonState {
  lat: number;
  lon: number;
}

export interface CurrentState {
  speedKt: number;
  setDirectionDeg: number;
  /** Probable error of this component, kt. PRD 14 default: 0.3. */
  errorKt: number;
}

export interface AssetState {
  id: string;
  name: string;
  /** Sweep width table this facility reads from. */
  sweepTableId: string;
  /** Row of that table: the search object as the table names it. */
  sweepObject: string;
  /** W0 override, nm. Null uses the table lookup. */
  w0Override: Override;
  /**
   * Override for the case's weather-correction class. Null inherits it.
   *
   * The class describes the search object, not the facility, so it is asked
   * once on the case and inherited here; the override exists only because
   * every auto-filled value in this app stays editable.
   */
  weatherObjectClassOverride: WeatherObjectClass | null;
  /** fw override. Null uses Table D-5:4. */
  fwOverride: Override;
  /** fv override, nm. Null uses Table D-5:8. */
  fvOverride: Override;
  /** @deprecated fv was a plain number before Table D-5:8 was wired in. */
  fv?: number;
  crewFatigued: boolean;
  /** ff override. Null uses the fatigue table. */
  ffOverride: Override;
  /** V, kt. */
  speedKt: number;
  /** T, hours. */
  enduranceHours: number;
  /** Overlay colour for this facility's track lines. */
  colour: string;
}

export interface CaseState {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;

  // --- 1. Case setup -------------------------------------------------------
  distressType: DistressType;
  /** Row id in the leeway table. */
  leewayObjectId: string;
  /**
   * Which weather-correction column the search object reads: waves hide a
   * life raft far more readily than they hide a freighter. A property of the
   * object, so it is asked once here rather than per facility.
   */
  weatherObjectClass: WeatherObjectClass;
  leewayMultiplierOverride: Override;
  leewayModifierOverride: Override;
  leewayDivergenceOverride: Override;
  applyDivergence: boolean;

  // --- 2. Drifting start point --------------------------------------------
  startPoint: LatLonState;
  /** Far end of the drifting start line, for a line datum. */
  lineEndPoint: LatLonState | null;
  distressTimeIso: string;
  searchStartTimeIso: string;
  /** Drift time override, hours. Null derives it from the two timestamps. */
  driftTimeOverride: Override;

  // --- 3. Environment ------------------------------------------------------
  windSpeedKt: number;
  windFromDirectionDeg: number;
  windProvenance: Provenance;
  /**
   * Where the visibility came from. Optional because cases persisted before
   * the BMKG fetch existed have no such field; absent means manual entry.
   */
  visibilityProvenance?: Provenance;
  windSteadiness: 'steady' | 'variable';
  /** Significant sea height, m. Manual: no live source in this build. */
  seaHeightM: number | null;
  /** Meteorological visibility, km. Drives the sweep width lookup. */
  visibilityKm: number;
  currents: {
    tidal: CurrentState;
    sea: CurrentState;
    wind: CurrentState;
    other: CurrentState;
  };
  /** LWe, kt. Manual: the leeway error chart is not digitised. */
  /**
   * LWe in knots. Kept for cases saved before the value gained a source
   * table; hydrate migrates it into lweOverride and nothing reads it after.
   * @deprecated use lweOverride
   */
  lweKt?: number;
  /** Override for the measured leeway error. Null uses the table value. */
  lweOverride: Override;

  // --- 4. Position error ---------------------------------------------------
  /** Fix-error table row id for the drifting start point. */
  xSourceId: string;
  xOverride: Override;
  /** Fix-error table row id for the search facility. */
  ySourceId: string;
  yOverride: Override;

  // --- 5. Datum and area ---------------------------------------------------
  datumTypeOverride: DatumType | null;
  searchStage: SearchStage;
  /** fs override. Null uses the safety factor table. */
  fsOverride: Override;

  // --- 6. Assets -----------------------------------------------------------
  assets: AssetState[];

  // --- 7. Evaluation -------------------------------------------------------
  /** POC, fraction 0-1. */
  poc: number;
  /** POD, fraction 0-1. Manual: the POD curve is not digitised. */
  pod: number;
}

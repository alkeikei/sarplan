/**
 * Shared types for the search planning calculation engine.
 *
 * This module, and everything else under /src/engine, is framework free: no
 * React, no DOM, no network. Everything is pure functions over plain data so
 * the chain can be unit tested against worked examples on its own.
 */

import type { LatLon, PolarVector } from './geo';

export type { LatLon, PolarVector };

/** Wind, reported the way wind is always reported: the direction it blows FROM. */
export interface WindInput {
  speedKt: number;
  fromDirectionDeg: number;
}

/** A water current, reported as the direction it SETS TOWARD. */
export interface CurrentInput {
  speedKt: number;
  setDirectionDeg: number;
}

/** The four water current components of PRD section 14. */
export interface WaterCurrents {
  tidal: CurrentInput;
  sea: CurrentInput;
  wind: CurrentInput;
  other: CurrentInput;
}

/** Probable error of each water current component, kt. */
export interface WaterCurrentErrors {
  tidalKt: number;
  seaKt: number;
  windKt: number;
  otherKt: number;
}

/** The three coefficients a leeway table row supplies. */
export interface LeewayCoefficients {
  multiplier: number;
  modifier: number;
  divergenceAngleDeg: number;
}

export type DatumType = 'single-point' | 'leeway-divergence' | 'widely-diverging' | 'line';


/**
 * Probable error of drift velocity caused by the average surface wind
 * (ASWDve). PRD section 14: 0.3 kt for steady or gradually changing winds,
 * 0.5 kt for forecast or highly variable winds.
 */
export type WindSteadiness = 'steady' | 'variable';

export const ASWDVE_BY_STEADINESS: Record<WindSteadiness, number> = {
  steady: 0.3,
  variable: 0.5,
};


/**
 * Default probable error for each water current component, kt.
 * PRD section 14: "Default 0.3 kt each if no better estimate exists."
 */
export const DEFAULT_CURRENT_ERROR_KT = 0.3;

/**
 * Default leeway error LWe, kt.
 *
 * PRD section 14 sources LWe from the leeway chart, but that chart is one of
 * the two pieces the reference transcription lists as NOT DIGITISED
 * (SAR_Reference_Tables.md section 6). Rather than invent a value the engine
 * defaults LWe to the same 0.3 kt the PRD uses for an unknown current
 * component and keeps it manually editable. It is flagged in the UI as a
 * manual estimate, not a table lookup.
 */
export const DEFAULT_LEEWAY_ERROR_KT = 0.3;

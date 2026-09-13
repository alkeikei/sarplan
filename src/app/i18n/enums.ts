/**
 * Dictionary keys for the app's and the engine's enumerated values.
 *
 * Each map is Record<EnumType, TextKey>, so adding a datum type or a search
 * stage to the engine fails the build here until it has a label in both
 * languages. That is deliberate: an unlabelled option in a select menu is a
 * silent gap, and the enum is the only place a new one can come from.
 */

import type { DatumType, SearchStage, WindSteadiness } from '../../engine';
import type { WeatherObjectClass } from '../../engine';
import type { DistressType } from '../types';
import type { TextKey } from './en';

export const DISTRESS_KEY: Record<DistressType, TextKey> = {
  lkp: 'opt.distress.lkp',
  eip: 'opt.distress.eip',
  'previous-datum': 'opt.distress.previousDatum',
};

export const STEADINESS_KEY: Record<WindSteadiness, TextKey> = {
  steady: 'opt.steadiness.steady',
  variable: 'opt.steadiness.variable',
};

export const DATUM_TYPE_KEY: Record<DatumType, TextKey> = {
  'single-point': 'opt.datumType.singlePoint',
  'leeway-divergence': 'opt.datumType.leewayDivergence',
  'widely-diverging': 'opt.datumType.widelyDiverging',
  line: 'opt.datumType.line',
};

export const WEATHER_CLASS_KEY: Record<WeatherObjectClass, TextKey> = {
  small: 'opt.weatherClass.small',
  other: 'opt.weatherClass.other',
};

export const SEARCH_STAGE_KEY: Record<SearchStage, TextKey> = {
  initial: 'opt.stage.initial',
  'first-expansion': 'opt.stage.firstExpansion',
  'second-expansion': 'opt.stage.secondExpansion',
  'third-expansion': 'opt.stage.thirdExpansion',
  'final-expansion': 'opt.stage.finalExpansion',
};

/**
 * Sweep width tables group by platform. Not a closed union in the engine (the
 * field is a plain string), so this falls back to the raw platform name.
 */
export const PLATFORM_KEY: Record<string, TextKey> = {
  'vessel-visual-water': 'platform.vesselWater',
  'merchant-ship-visual-water': 'platform.merchantShip',
  'fixed-wing-water': 'platform.fixedWing',
  'helicopter-water': 'platform.helicopter',
  'visual-land': 'platform.land',
};

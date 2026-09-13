/**
 * Application state.
 *
 * The one rule that shapes this store, from PRD 6.8: changing an upstream
 * value flags every downstream calculated value as stale until the user
 * recalculates. Nothing recalculates silently, because the coordinator needs
 * to see what changed before the numbers move under them.
 */

import { create } from 'zustand';
import {
  calculateCase,
  DEFAULT_LEEWAY_ERROR_KT,
  type CaseCalculationResult,
  type WeatherObjectClass,
} from '../engine';
import { newCase } from './defaults';
import { getLang, translator } from './i18n';
import { deriveCase } from './selectors';
import { listCases, loadCase, loadLastCase, saveCase, type CaseSummary } from './persistence';
import type { CaseState } from './types';

export interface CalculationRun {
  result: CaseCalculationResult;
  /** When this run was produced. */
  at: string;
  /** Wall-clock time the recalculation took, ms. Watched against PRD 10. */
  durationMs: number;
  /** The case state the run was produced from, for the PDF report. */
  input: CaseState;
}

interface Store {
  caseState: CaseState;
  run: CalculationRun | null;
  /** Inputs have moved since the last run: results on screen are stale. */
  stale: boolean;
  /** Human labels of the inputs that changed since the last run. */
  staleFields: string[];
  hydrated: boolean;
  saving: boolean;
  cases: CaseSummary[];
  calcError: string | null;

  hydrate: () => Promise<void>;
  /** Apply a change to the case and mark downstream results stale. */
  patch: (label: string, mutate: (draft: CaseState) => void) => void;
  /** Change something that does not affect the calculation, e.g. the name. */
  patchQuiet: (mutate: (draft: CaseState) => void) => void;
  recalculate: () => void;
  startNewCase: () => void;
  openCase: (id: string) => Promise<void>;
  refreshCaseList: () => Promise<void>;
}

let saveTimer: ReturnType<typeof setTimeout> | undefined;

function scheduleSave(state: CaseState, set: (p: Partial<Store>) => void): void {
  clearTimeout(saveTimer);
  set({ saving: true });
  saveTimer = setTimeout(() => {
    void saveCase(state)
      .catch((e) => console.error('Failed to save case', e))
      .finally(() => set({ saving: false }));
  }, 400);
}

function compute(caseState: CaseState): { run: CalculationRun | null; calcError: string | null } {
  try {
    const started = performance.now();
    const result = calculateCase(deriveCase(caseState).engineInput);
    return {
      run: {
        result,
        at: new Date().toISOString(),
        durationMs: performance.now() - started,
        input: structuredClone(caseState),
      },
      calcError: null,
    };
  } catch (e) {
    return { run: null, calcError: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * LWe used to be a plain number with a flat 0.3 kt default; it is now a table
 * value with an override. A figure the user had deliberately typed is kept as
 * that override. The old default is not, because carrying it forward would
 * pin every restored case to 0.3 and hide the measured value behind an
 * override the user never set.
 */
/**
 * The weather-correction class used to be asked per facility, even though it
 * describes the search object. It is now a case-level answer the facilities
 * inherit. A saved case takes its class from the first facility that had one,
 * and a facility that disagreed with that keeps its own as an override rather
 * than being quietly brought into line.
 */
/**
 * The two rows the reference table both labelled "PIW | Vertical" are now one
 * Vertical row and one Sitting row. A case pointing at either old id meant
 * vertical, so both land on the corrected vertical row; every other PIW id
 * keeps its name and simply gains the coefficients Table 8-1 gives that label.
 */
const LEEWAY_ID_MOVES: Record<string, string> = {
  'piw-vertical-a': 'piw-general',
  'piw-vertical-b': 'piw-vertical',
  'piw-horizontal-deceased-2': 'piw-horizontal-deceased',
  'raft-nb-nocanopy-nodrogue-a': 'raft-nb-general',
  'raft-nb-nocanopy-nodrogue-b': 'raft-nb-nocanopy-nodrogue',
  'raft-nb-canopy-drogue-2': 'raft-nb-canopy-drogue',
  'raft-sb-canopy-nodrogue-a': 'raft-sb-general',
  'raft-sb-canopy-nodrogue-b': 'raft-sb-nodrogue',
  'raft-sb-canopy-drogue': 'raft-sb-drogue',
  'raft-sb-canopy-capsized': 'raft-sb-capsized',
  'raft-sb-canopy-unlabelled': 'raft-sb-capsized',
  'raft-db-canopy-general': 'raft-db-general',
  'dbraft-4-6-base': 'dbraft-4-6-general',
  'dbraft-4-6-drogue-heavy-a': 'dbraft-4-6-drogue-heavy',
  'dbraft-4-6-drogue-heavy-b': 'dbraft-4-6-drogue-heavy',
  'dbraft-15-25-nodrogue-light-a': 'dbraft-15-25-general',
  'dbraft-15-25-nodrogue-light-b': 'dbraft-15-25-nodrogue-light',
  'dbraft-15-25-nodrogue': 'dbraft-15-25-general',
  'debris-bait-box-1m3-ice': 'debris-bait-box',
};

function migrateLeewayObjectId(c: CaseState): void {
  const moved = LEEWAY_ID_MOVES[c.leewayObjectId];
  if (moved) c.leewayObjectId = moved;
}

/**
 * fv was a plain number defaulting to 1.0 before Table D-5:8 was wired in. A
 * value the planner had deliberately typed is kept as an override; the old
 * default is dropped so the measured factor can take over.
 */
function migrateFv(c: CaseState): void {
  for (const asset of c.assets) {
    if (asset.fvOverride !== undefined) continue;
    asset.fvOverride = typeof asset.fv === 'number' && asset.fv !== 1 ? asset.fv : null;
    delete asset.fv;
  }
}

function migrateWeatherClass(c: CaseState): void {
  if (c.weatherObjectClass !== undefined) return;
  const legacy = c.assets.map((a) => (a as { weatherObjectClass?: WeatherObjectClass }).weatherObjectClass);
  c.weatherObjectClass = legacy.find((v) => v !== undefined) ?? 'small';
  c.assets.forEach((asset, i) => {
    const was = legacy[i];
    asset.weatherObjectClassOverride =
      was !== undefined && was !== c.weatherObjectClass ? was : null;
    delete (asset as { weatherObjectClass?: WeatherObjectClass }).weatherObjectClass;
  });
}

function migrateLwe(c: CaseState): void {
  if (c.lweOverride !== undefined) return;
  c.lweOverride =
    typeof c.lweKt === 'number' && c.lweKt !== DEFAULT_LEEWAY_ERROR_KT ? c.lweKt : null;
  delete c.lweKt;
}

export const useStore = create<Store>((set, get) => ({
  caseState: newCase(),
  run: null,
  stale: true,
  staleFields: [],
  hydrated: false,
  saving: false,
  cases: [],
  calcError: null,

  async hydrate() {
    let restored: CaseState | undefined;
    try {
      restored = await loadLastCase();
    } catch (e) {
      console.error('Failed to restore the last case', e);
    }
    // Nothing stored: start a case named in the user's language rather than
    // keeping the English placeholder the store was initialised with.
    if (restored) {
      migrateLwe(restored);
      migrateLeewayObjectId(restored);
      migrateWeatherClass(restored);
      migrateFv(restored);
    }
    const t0 = translator(getLang());
    const caseState =
      restored ?? newCase(t0('case.defaultName'), t0('facility.fallbackName', { n: 1 }));
    // Opening a case is a deliberate act, so run the chain once straight away
    // rather than showing an empty map.
    set({ caseState, hydrated: true, stale: false, staleFields: [], ...compute(caseState) });
    void get().refreshCaseList();
    if (!restored) scheduleSave(caseState, set);
  },

  patch(label, mutate) {
    const draft = structuredClone(get().caseState);
    mutate(draft);
    draft.updatedAt = new Date().toISOString();
    const staleFields = get().staleFields.includes(label)
      ? get().staleFields
      : [...get().staleFields, label];
    set({ caseState: draft, stale: true, staleFields });
    scheduleSave(draft, set);
  },

  patchQuiet(mutate) {
    const draft = structuredClone(get().caseState);
    mutate(draft);
    draft.updatedAt = new Date().toISOString();
    set({ caseState: draft });
    scheduleSave(draft, set);
  },

  recalculate() {
    const caseState = get().caseState;
    set({ stale: false, staleFields: [], ...compute(caseState) });
    void get().refreshCaseList();
  },

  startNewCase() {
    const t = translator(getLang());
    const caseState = newCase(
      t('case.newNamed', { stamp: new Date().toISOString().slice(0, 16).replace('T', ' ') }),
      t('facility.fallbackName', { n: 1 }),
    );
    set({ caseState, stale: false, staleFields: [], ...compute(caseState) });
    scheduleSave(caseState, set);
    void get().refreshCaseList();
  },

  async openCase(id) {
    const caseState = await loadCase(id);
    if (!caseState) return;
    set({ caseState, stale: false, staleFields: [], ...compute(caseState) });
    scheduleSave(caseState, set);
  },

  async refreshCaseList() {
    try {
      set({ cases: await listCases() });
    } catch (e) {
      console.error('Failed to list cases', e);
    }
  },
}));

/**
 * IndexedDB persistence.
 *
 * PRD 10: "Map and calculation state must be recoverable after a browser
 * refresh or connection drop, since this tool may be used in unstable network
 * conditions on a vessel or aircraft." No backend in this build, so the case
 * lives in the browser.
 */

import { openDB, type IDBPDatabase } from 'idb';
import type { CaseState } from './types';
import { ASSET_COLOURS } from './colours';

// Kept at the pre-rename name on purpose: the app was published as SARPlan,
// and renaming the database would orphan every case already saved in a
// coordinator's browser.
const DB_NAME = 'sarplan';
const DB_VERSION = 1;
const CASES = 'cases';
const META = 'meta';
const LAST_CASE_KEY = 'lastCaseId';

let dbPromise: Promise<IDBPDatabase> | null = null;

function db(): Promise<IDBPDatabase> {
  dbPromise ??= openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(CASES)) {
        database.createObjectStore(CASES, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(META)) {
        database.createObjectStore(META);
      }
    },
  });
  return dbPromise;
}

export interface CaseSummary {
  id: string;
  name: string;
  updatedAt: string;
}

export async function saveCase(state: CaseState): Promise<void> {
  const database = await db();
  await database.put(CASES, state);
  await database.put(META, state.id, LAST_CASE_KEY);
}

/**
 * Re-reads facility colours from the current palette.
 *
 * A facility's colour is assigned by position when it is created and is not
 * something the user picks, so a stored one is a copy of whatever palette was
 * current the day the case was saved. Leaving it alone meant a change to the
 * palette reached new cases only, and every case already on disk kept drawing
 * its track lines in the old colours — which, when the palette changed
 * precisely because those colours were illegible on the map, is the one set of
 * cases that most needed fixing.
 *
 * Nothing is written back. The case on disk keeps whatever it has, and takes
 * the current palette again the next time it is opened.
 */
function withCurrentColours(state: CaseState | undefined): CaseState | undefined {
  if (!state) return state;
  return {
    ...state,
    assets: state.assets.map((asset, index) => ({
      ...asset,
      colour: ASSET_COLOURS[index % ASSET_COLOURS.length],
    })),
  };
}

export async function loadCase(id: string): Promise<CaseState | undefined> {
  return withCurrentColours(await (await db()).get(CASES, id));
}

export async function loadLastCase(): Promise<CaseState | undefined> {
  const database = await db();
  const id = (await database.get(META, LAST_CASE_KEY)) as string | undefined;
  return id ? withCurrentColours(await database.get(CASES, id)) : undefined;
}

export async function listCases(): Promise<CaseSummary[]> {
  const all = (await (await db()).getAll(CASES)) as CaseState[];
  return all
    .map(({ id, name, updatedAt }) => ({ id, name, updatedAt }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function deleteCase(id: string): Promise<void> {
  await (await db()).delete(CASES, id);
}

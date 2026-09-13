/**
 * Meteorological visibility from BMKG's public maritime forecast.
 *
 * BMKG is the Indonesian met agency and its port forecast is the only
 * authoritative Indonesian source in this build. It is free, needs no key and
 * sends Access-Control-Allow-Origin: *, so the browser can call it directly.
 *
 * Only visibility is taken. The same payload also carries currents, wind and
 * waves, but those arrive as 12-hour min/max ranges with directions given as
 * 16-point compass NAMES ("Timur Laut"), which cannot be turned into a drift
 * vector without inventing precision the source does not have. Visibility is
 * a single number in metres, which is exactly what the sweep width lookup
 * wants, so that is what this reads.
 *
 * Two things about the data that shape the code below:
 *
 *  - Forecasts are issued for 294 named ports, not on a grid. The nearest one
 *    can be a long way from a search datum, so the distance is measured and
 *    returned, and a reading from far away is flagged rather than presented
 *    as conditions on scene.
 *
 *  - The API emits bare NaN, which is not valid JSON and makes JSON.parse
 *    throw outright (verified on Ajibata, a lake port with no sea state).
 *    The text is repaired before parsing.
 */

import { distanceNm, type LatLon } from '../engine';
import { translator, type Translator } from './i18n';
import type { ProvenanceFlag } from './types';

const PORT_LIST_URL = 'https://maritim.bmkg.go.id/public_api/pelabuhan_list';
const PORT_URL = 'https://maritim.bmkg.go.id/public_api/pelabuhan/';

/** Beyond this the reading is flagged as possibly not representing the datum. */
const FAR_PORT_NM = 20;

export class BmkgFetchError extends Error {}

export interface BmkgVisibilityResult {
  /** Visibility in km, converted from the metres BMKG reports. */
  visibilityKm: number;
  portName: string;
  distanceNm: number;
  fetchedAt: string;
  /**
   * Why the figure may not describe the datum: the port is far away, or the
   * only forecast period available does not cover the search start time.
   * Following the wind fetch, these are raised only when they apply rather
   * than narrating the validity window every time.
   */
  flags: ProvenanceFlag[];
}

interface PortIndexEntry {
  name: string;
  portname: string;
  coor: [number, number];
}

interface PortForecastRow {
  valid_from?: string;
  valid_to?: string;
  visibility?: number | null;
}

/** The index is 67 kB and changes only when a port is added, so fetch it once. */
let portIndex: PortIndexEntry[] | null = null;

/** BMKG states times as "2026-09-10 12:00 UTC". */
function parseBmkgTime(value: string | undefined): number {
  if (!value) return Number.NaN;
  return Date.parse(`${value.replace(' UTC', '').replace(' ', 'T')}Z`);
}

/**
 * Repair a BMKG payload so JSON.parse will accept it.
 *
 * Only a bare NaN in value position is replaced, so a port whose name happens
 * to contain those letters - and Indonesian has plenty, Nanga Pinoh among
 * them - is left alone. Exported for test.
 */
export function repairBmkgJson(text: string): string {
  return text.replace(/:\s*NaN\b/g, ': null');
}

async function readJson<T>(response: Response): Promise<T> {
  return JSON.parse(repairBmkgJson(await response.text())) as T;
}

async function get(url: string, t: Translator, signal?: AbortSignal): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e;
    throw new BmkgFetchError(t('bmkg.unreachable'));
  }
  if (!response.ok) throw new BmkgFetchError(t('bmkg.httpStatus', { status: response.status }));
  return response;
}

async function loadPortIndex(t: Translator, signal?: AbortSignal): Promise<PortIndexEntry[]> {
  if (portIndex) return portIndex;
  const body = await readJson<{ files?: PortIndexEntry[] }>(
    await get(PORT_LIST_URL, t, signal),
  );
  if (!body.files?.length) throw new BmkgFetchError(t('bmkg.noPorts'));
  portIndex = body.files;
  return portIndex;
}

/**
 * Visibility for a position and time, from the nearest BMKG port.
 * @param timeIso the time wanted, any parseable ISO string
 */
export async function fetchVisibility(
  lat: number,
  lon: number,
  timeIso: string,
  t: Translator = translator('en'),
  signal?: AbortSignal,
): Promise<BmkgVisibilityResult> {
  const at = Date.parse(timeIso);
  if (Number.isNaN(at)) throw new BmkgFetchError(t('bmkg.badTime'));

  const here: LatLon = { lat, lon };
  const ports = await loadPortIndex(t, signal);

  let nearest: PortIndexEntry | null = null;
  let nearestNm = Infinity;
  for (const port of ports) {
    // The index gives [lat, lon], the opposite order to GeoJSON.
    const d = distanceNm(here, { lat: port.coor[0], lon: port.coor[1] });
    if (d < nearestNm) {
      nearestNm = d;
      nearest = port;
    }
  }
  if (!nearest) throw new BmkgFetchError(t('bmkg.noPorts'));

  const body = await readJson<{ data?: PortForecastRow[] }>(
    await get(PORT_URL + encodeURIComponent(nearest.name), t, signal),
  );
  const rows = (body.data ?? []).filter((r) => typeof r.visibility === 'number');
  if (!rows.length) throw new BmkgFetchError(t('bmkg.noVisibility', { port: nearest.portname }));

  // The period covering the wanted time, else the one whose midpoint is
  // closest to it: a search often starts outside the published window.
  const covering = rows.find((r) => {
    const from = parseBmkgTime(r.valid_from);
    const to = parseBmkgTime(r.valid_to);
    return Number.isFinite(from) && Number.isFinite(to) && at >= from && at < to;
  });
  const row =
    covering ??
    rows.reduce((best, r) => {
      const mid = (x: PortForecastRow) =>
        (parseBmkgTime(x.valid_from) + parseBmkgTime(x.valid_to)) / 2;
      return Math.abs(mid(r) - at) < Math.abs(mid(best) - at) ? r : best;
    }, rows[0]);

  const distance = Math.round(nearestNm * 10) / 10;
  const flags: ProvenanceFlag[] = [];
  if (nearestNm > FAR_PORT_NM) {
    flags.push({ key: 'bmkg.farPort', params: { port: nearest.portname, distance } });
  }
  if (!covering) {
    // BMKG publishes 12-hour blocks. Reading the wrong block is a real error,
    // so say so rather than letting a neighbouring period pass as current.
    flags.push({
      key: 'bmkg.outsidePeriod',
      params: { from: row.valid_from ?? '?', to: row.valid_to ?? '?' },
    });
  }

  return {
    visibilityKm: Math.round((row.visibility as number) / 100) / 10,
    portName: nearest.portname,
    distanceNm: distance,
    fetchedAt: new Date().toISOString(),
    flags,
  };
}

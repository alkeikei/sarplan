/**
 * Wind data from Open-Meteo.
 *
 * One external source for this build, chosen because it needs no API key
 * (PRD 9 leaves the final source open, pending the operating agency's data
 * agreements). Ocean current data is NOT fetched: current inputs are manual
 * entry only in this build and are labelled as such in the UI.
 *
 * Every value this returns is written into a field the user can overwrite,
 * and is tagged with its source and fetch time (PRD 6.3).
 */

const ENDPOINT = 'https://api.open-meteo.com/v1/forecast';

export interface WindFetchResult {
  speedKt: number;
  fromDirectionDeg: number;
  /** The forecast hour actually used, ISO 8601 UTC. */
  actualTimeIso: string;
  /** The hour that was asked for, ISO 8601 UTC. */
  requestedTimeIso: string;
  /**
   * Set when the nearest available forecast is not the requested hour
   * (PRD 6.3: fall back to the nearest available forecast and flag it).
   */
  flags: ProvenanceFlag[];
  source: string;
  fetchedAt: string;
}

import { translator, type Translator } from './i18n';
import type { ProvenanceFlag } from './types';

export class WindFetchError extends Error {}

const utcDate = (iso: string): string => new Date(iso).toISOString().slice(0, 10);

/**
 * Fetch wind speed and direction for a position and time.
 * @param timeIso the time wanted, any parseable ISO string
 */
export async function fetchWind(
  lat: number,
  lon: number,
  timeIso: string,
  t: Translator = translator('en'),
  signal?: AbortSignal,
): Promise<WindFetchResult> {
  const wanted = new Date(timeIso);
  if (Number.isNaN(wanted.getTime())) throw new WindFetchError(t('wind.badTime'));

  const day = utcDate(timeIso);
  const url =
    `${ENDPOINT}?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}` +
    `&hourly=wind_speed_10m,wind_direction_10m&wind_speed_unit=kn` +
    `&timezone=UTC&start_date=${day}&end_date=${day}`;

  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e;
    throw new WindFetchError(t('wind.unreachable'));
  }

  if (!response.ok) {
    throw new WindFetchError(t('wind.httpStatus', { status: response.status }));
  }

  const body = (await response.json()) as {
    hourly?: { time?: string[]; wind_speed_10m?: (number | null)[]; wind_direction_10m?: (number | null)[] };
    reason?: string;
  };

  const times = body.hourly?.time;
  const speeds = body.hourly?.wind_speed_10m;
  const directions = body.hourly?.wind_direction_10m;
  if (!times?.length || !speeds || !directions) {
    throw new WindFetchError(body.reason ?? t('wind.noData'));
  }

  // Nearest available hour to the one requested.
  let bestIndex = -1;
  let bestGap = Infinity;
  for (let i = 0; i < times.length; i++) {
    if (speeds[i] == null || directions[i] == null) continue;
    const gap = Math.abs(new Date(`${times[i]}Z`).getTime() - wanted.getTime());
    if (gap < bestGap) {
      bestGap = gap;
      bestIndex = i;
    }
  }
  if (bestIndex < 0) throw new WindFetchError(t('wind.noHours'));

  const gapHours = bestGap / 3_600_000;
  const actualTimeIso = `${times[bestIndex]}Z`;

  return {
    speedKt: speeds[bestIndex] as number,
    fromDirectionDeg: directions[bestIndex] as number,
    actualTimeIso,
    requestedTimeIso: wanted.toISOString(),
    flags:
      gapHours >= 0.5
        ? [
            {
              key: 'wind.nearestHour' as const,
              params: {
                gap: gapHours.toFixed(1),
                time: actualTimeIso.slice(0, 16).replace('T', ' '),
              },
            },
          ]
        : [],
    source: 'Open-Meteo',
    fetchedAt: new Date().toISOString(),
  };
}

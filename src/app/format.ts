/**
 * Display formatting. Numbers a coordinator reads under time pressure.
 *
 * The locale is pinned rather than taken from the browser: the inputs write a
 * full stop as the decimal mark, and half the screen switching to a comma
 * because of the operating system's locale would make two figures side by
 * side read differently.
 */

const LOCALE = 'en-GB';

export function num(value: number | undefined, dp = 2): string {
  if (value === undefined || !Number.isFinite(value)) return '--';
  return value.toLocaleString(LOCALE, {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });
}

export function bearing(value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value)) return '--';
  return `${Math.round(value).toString().padStart(3, '0')}°`;
}

export function percent(fraction: number | undefined, dp = 1): string {
  if (fraction === undefined || !Number.isFinite(fraction)) return '--';
  return `${(fraction * 100).toFixed(dp)}%`;
}

/** Degrees and decimal minutes, the format a chart plot is worked in. */
export function latitude(lat: number): string {
  return degreesMinutes(Math.abs(lat), lat >= 0 ? 'N' : 'S', 2);
}

export function longitude(lon: number): string {
  return degreesMinutes(Math.abs(lon), lon >= 0 ? 'E' : 'W', 3);
}

function degreesMinutes(absValue: number, hemisphere: string, degreeDigits: number): string {
  const degrees = Math.floor(absValue);
  const minutes = (absValue - degrees) * 60;
  return `${degrees.toString().padStart(degreeDigits, '0')}° ${minutes
    .toFixed(3)
    .padStart(6, '0')}' ${hemisphere}`;
}

export function position(p: { lat: number; lon: number }): string {
  return `${latitude(p.lat)}  ${longitude(p.lon)}`;
}

export function timestamp(iso: string | undefined): string {
  if (!iso) return '--';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '--';
  return `${d.toISOString().slice(0, 16).replace('T', ' ')} UTC`;
}

export function duration(hours: number): string {
  if (!Number.isFinite(hours)) return '--';
  const whole = Math.floor(hours);
  const minutes = Math.round((hours - whole) * 60);
  return `${whole} h ${minutes.toString().padStart(2, '0')} min`;
}

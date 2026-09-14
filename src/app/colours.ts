/**
 * The overlay palette.
 *
 * One module because these colours are drawn twice — once by Leaflet onto the
 * screen, once by hand onto the PDF capture — and a report that does not match
 * the screen it was exported from is worse than no report.
 *
 * Chosen against the base map, not in the abstract. Protomaps' light flavour
 * puts cyan water under most of a maritime search and warm off-white land
 * under the rest, with white roads and pale green parks, so everything here is
 * dark and saturated enough to sit on any of them and survive being printed in
 * a way the earlier light-on-dark set did not.
 *
 * Three families, so the map can be read before it is studied:
 *
 *   - orange is what the coordinator entered: the start point, the line end,
 *     and the drift that carries one to the other;
 *   - the answer is black at the datum, and the two figures drawn around it
 *     are a pink-red box and an indigo circle — no relation to each other by
 *     colour, because they are different quantities and confusing them is
 *     the mistake worth designing against;
 *   - the facilities get their own set below, none of them in those hues.
 *
 * Nothing here is green or cyan. Green is the base map's parks, cyan is its
 * water, and a search plan should not be either.
 */
export const OVERLAY_COLOURS = {
  /** Where the search object was last known, and where the coordinator put it. */
  startPoint: '#EF6C00',
  /** The far end of a line datum. Lighter: it is the same kind of input. */
  lineEndPoint: '#FFB74D',
  /** Start point to datum, dashed. */
  driftTrack: '#EF6C00',
  /** The datum itself. Black, with a white halo, over anything. */
  datum: '#1A1A1A',
  /** The optimal search area. The most prominent thing on the map. */
  searchArea: '#D81B60',
  /** Total probable error, dashed. */
  errorCircle: '#512DA8',
} as const;

/**
 * Track lines, one colour per search facility.
 *
 * Drawn thin and in quantity inside the search rectangle, so each has to stay
 * legible against cyan water at one-pixel widths and stay clear of the box and
 * circle it is drawn inside.
 */
export const ASSET_COLOURS = [
  '#0D47A1',
  '#00695C',
  '#33691E',
  '#5D4037',
  '#37474F',
  '#827717',
];

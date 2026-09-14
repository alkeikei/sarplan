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
 * Thin, drawn in quantity, and almost always over open water, so each has to
 * hold up against cyan at close to a hairline. That rules out the whole
 * blue-green band — a dark teal reads as sea, not as a helicopter's track —
 * and it rules out anything pale, because opacity is already working against
 * these lines.
 *
 * So: dark and saturated, spread across hues nothing else on the map is
 * using. The nearest collision is the deep purple against the indigo error
 * circle, which is tolerable only because the circle is dashed and an order
 * of magnitude larger; if a third figure ever wants indigo, this is the one
 * to move.
 */
export const ASSET_COLOURS = [
  '#0D47A1',
  '#B71C1C',
  '#4A148C',
  '#5D4037',
  '#263238',
  '#827717',
];

/**
 * The base map layer.
 *
 * MapTiler rather than tile.openstreetmap.org: that server is volunteer-run,
 * donation-funded infrastructure whose usage policy excludes production apps,
 * so it may throttle or block without warning. A basemap that disappears
 * mid-search is not a failure this tool should be capable of having. The data
 * underneath is still OpenStreetMap — only the server changes.
 *
 * Two safety nets, because a blank map is worse than an imperfect one:
 *
 *   - with no key configured the layer starts on OSM, so `npm run dev` works
 *     for anyone who clones this. Development is the small-scale use OSM's
 *     policy does allow; production builds set the key.
 *   - if MapTiler tiles fail repeatedly — quota exhausted, outage, a style
 *     name that does not exist on the account's plan — the layer falls back
 *     to OSM rather than leaving the coordinator with empty grey squares.
 */

import L from 'leaflet';

const KEY = import.meta.env.VITE_MAPTILER_KEY as string | undefined;

/**
 * `ocean` carries bathymetry and shipping detail, which is what a maritime
 * search is read against. Overridable because style availability depends on
 * the MapTiler plan, and the fallback below cannot tell a bad style name from
 * an outage.
 */
const STYLE = (import.meta.env.VITE_MAPTILER_STYLE as string | undefined) ?? 'ocean';

/** Tile errors arrive per tile, so a whole failed screen is one incident. */
const FALLBACK_AFTER_ERRORS = 8;

const OSM_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/** MapTiler's terms require the attribution link, not just the name. */
const MAPTILER_ATTRIBUTION =
  '<a href="https://www.maptiler.com/copyright/">&copy; MapTiler</a> ' + OSM_ATTRIBUTION;

/**
 * `crossOrigin` is load-bearing: the PDF export rasterises the map through
 * html2canvas, which taints the canvas without it. Both servers send
 * Access-Control-Allow-Origin: *.
 */
const common: L.TileLayerOptions = { maxZoom: 19, crossOrigin: 'anonymous' };

type Coord = number | string;

/** Takes Leaflet's `{z}/{x}/{y}` placeholders as readily as real numbers. */
const tileUrl = (z: Coord, x: Coord, y: Coord, scale = ''): string =>
  `https://api.maptiler.com/maps/${STYLE}/${z}/${x}/${y}${scale}.png?key=${KEY}`;

const osmLayer = (): L.TileLayer =>
  L.tileLayer(OSM_URL, { ...common, attribution: OSM_ATTRIBUTION });

function maptilerLayer(): L.TileLayer {
  // @2x is served as one tile, so the sharper asset costs no extra quota.
  const scale = (globalThis.devicePixelRatio ?? 1) > 1 ? '@2x' : '';
  return L.tileLayer(tileUrl('{z}', '{x}', '{y}', scale), {
    ...common,
    attribution: MAPTILER_ATTRIBUTION,
  });
}

/**
 * Is the key actually good?
 *
 * This cannot be left to Leaflet's `tileerror`. A rejected key — invalid,
 * domain-restricted, or over quota — comes back as 403 carrying a *valid* PNG
 * that says so, which an <img> loads perfectly happily: the event never fires
 * and the coordinator gets a map tiled with error messages. Only a fetch sees
 * the status code. One z0 tile, once per load, is a rounding error against the
 * monthly allowance.
 */
async function keyRejected(): Promise<boolean> {
  try {
    const res = await fetch(tileUrl(0, 0, 0), { mode: 'cors' });
    return !res.ok;
  } catch {
    // Offline or DNS failure. OSM would fare no better, so keep MapTiler and
    // let the tiles resolve when the connection returns.
    return false;
  }
}

/** Adds the base layer to the map and returns it. */
export function addBaseLayer(map: L.Map): L.TileLayer {
  if (!KEY) return osmLayer().addTo(map);

  const layer = maptilerLayer().addTo(map);

  const fallBack = (why: string): void => {
    if (!map.hasLayer(layer)) return;
    console.warn(`[basemap] ${why}; falling back to OpenStreetMap.`);
    osmLayer().addTo(map);
    map.removeLayer(layer);
  };

  void keyRejected().then((bad) => bad && fallBack('MapTiler rejected the key'));

  // Still worth watching: an outage mid-session fails as a real tile error.
  let errors = 0;
  layer.on('tileerror', () => {
    if (++errors >= FALLBACK_AFTER_ERRORS) fallBack('MapTiler tiles failing');
  });

  return layer;
}

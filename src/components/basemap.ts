/**
 * The base map layer.
 *
 * Protomaps vector tiles, read from a single `.pmtiles` archive this project
 * hosts itself in Cloudflare R2 and serves through its own Worker. The data
 * underneath is still OpenStreetMap; only the server changes.
 *
 * Why not a public tile server. `tile.openstreetmap.org` is volunteer-run
 * infrastructure whose usage policy excludes production apps, so it may
 * throttle or block without warning. Keyed commercial tiles (MapTiler and
 * friends) trade that for a monthly quota and an API key, which an
 * open-source tool everyone can access cannot honestly promise to stay
 * inside. A basemap that disappears mid-search is not a failure this tool
 * should be capable of having.
 *
 * Self-hosting removes the failure mode rather than adding a fallback for it.
 * The archive is served from the same origin as the app, by the same Worker,
 * so the map now has exactly the availability the app itself has: if the
 * tiles are unreachable, the page that would have drawn them did not load
 * either. There is no third party left to fall back from.
 *
 * Rendering is protomaps-leaflet, which draws vector tiles to a 2D canvas
 * inside Leaflet's own grid. Deliberately not MapLibre GL: this keeps one map
 * engine rather than two, needs no WebGL — operations rooms run whatever
 * hardware they run — and leaves the PDF capture in `mapCapture.ts` working,
 * because a 2D canvas keeps its contents for html2canvas to read.
 */

import L from 'leaflet';
// Pinned to the major protomaps-leaflet itself depends on. If they diverge,
// npm nests a second copy and the two PMTiles types stop being the same type,
// which fails the build rather than shipping two readers and two caches.
import { PMTiles } from 'pmtiles';
import { labelRules, leafletLayer, paintRules } from 'protomaps-leaflet';
import { namedFlavor, type Flavor } from '@protomaps/basemaps';
import type { Lang } from '../app/i18n';

/**
 * Same-origin by default: `/tiles/basemap.pmtiles` is the Worker route backed
 * by R2. Overridable so a deployment can point at its own bucket, and so
 * `npm run dev` can be aimed at a deployed instance instead of a local
 * archive.
 */
const PMTILES_URL =
  (import.meta.env.VITE_PMTILES_URL as string | undefined) ?? '/tiles/basemap.pmtiles';

/** Protomaps planet builds carry data to z15; past that the tiles overzoom. */
const MAX_DATA_ZOOM = 15;

/**
 * Both attributions are required: Protomaps for the tile schema and build,
 * OpenStreetMap for the data.
 */
const ATTRIBUTION =
  '<a href="https://protomaps.com">Protomaps</a> &copy; ' +
  '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/**
 * Water, as drawn under a search plan.
 *
 * Protomaps' light flavour is the base: a plain, legible road map, which is
 * what someone under pressure should be reading rather than anything styled
 * for effect. The one change is the water, taken from the flavour's own
 * saturated cyan down to a pale tint of it.
 *
 * That is not a taste call. Everything the app draws on top — the search
 * rectangle, the error circle, the track legs — is cyan or teal, and almost
 * all of it lands on open water. Against #80deea those lines are another
 * shade of the same colour; against this they are unmistakable. The base map
 * gives up saturation it was not using so the plan can have it.
 */
export const WATER = '#d6ebf2';

const flavor = (): Flavor => ({
  ...namedFlavor('light'),
  background: WATER,
  water: WATER,
});

/**
 * Protomaps carries OSM's `name:<lang>` tags, so labels follow the app's
 * language where the data has a translation and fall back to the local name
 * where it does not.
 */
const rulesFor = (lang: Lang): { paintRules: ReturnType<typeof paintRules>; labelRules: ReturnType<typeof labelRules> } => {
  const f = flavor();
  return { paintRules: paintRules(f), labelRules: labelRules(f, lang) };
};

export type BaseLayer = ReturnType<typeof leafletLayer> & L.GridLayer;

/**
 * The archive, owned here rather than left to the renderer to open from a URL.
 *
 * This is load-bearing, not tidiness. protomaps-leaflet cancels any request
 * still in flight for a zoom level the map has since left, which is right for
 * tile bodies and wrong for the archive header: the header and root directory
 * are read once, lazily, on whichever tile happens to ask first, and every
 * later read is served from that one cached result. This app changes zoom
 * within a few hundred milliseconds of mounting — the store restores the last
 * case and the map fits to its results — so that first read was being
 * cancelled mid-flight, the failure cached, and every tile afterwards failed
 * instantly against it. A map that came up blank, with no request left in the
 * network panel to explain why, and that came up fine on a reload when the
 * race fell the other way.
 *
 * Reading the header here, before the layer exists, takes it off that path:
 * the fetch is started with no abort signal on it, and the reader's cache
 * hands the same result to the tiles that follow.
 */
const archive = new PMTiles(PMTILES_URL);

/**
 * Opens the archive, and says so plainly if it cannot be opened.
 *
 * A missing bucket binding or an archive that was never uploaded otherwise
 * shows up only as a map that stays the background colour, with nothing in
 * the console to say why — and that is a deployment mistake the person who
 * made it should be told about in words.
 */
const opened = archive.getHeader().catch((e: unknown) => {
  console.error(
    `[basemap] Could not read ${PMTILES_URL}: ${String(e)}\n` +
      'The map will not draw. In development, run `npm run tiles` to cut an ' +
      'archive, or set VITE_PMTILES_URL to a deployed one. In production, ' +
      "check that the archive is in R2 and that the Worker's binding points at it.",
  );
});

/** Adds the base layer to the map and returns it. */
export function addBaseLayer(map: L.Map, lang: Lang): BaseLayer {
  const layer = leafletLayer({
    url: archive,
    attribution: ATTRIBUTION,
    maxDataZoom: MAX_DATA_ZOOM,
    backgroundColor: WATER,
    ...rulesFor(lang),
  }) as BaseLayer;

  layer.addTo(map);

  // The first tiles are requested before the header resolves and come back
  // empty; once it has, they need asking for again.
  void opened.then(() => layer.rerenderTiles());

  return layer;
}

/**
 * Re-labels the base map in the given language.
 *
 * Place names are part of the translation, not furniture around it: a
 * coordinator reading the panels in Indonesian should not be reading the map
 * underneath them in English. Only the label rules change — the paint rules
 * have no text in them, so the geometry does not re-style.
 */
export function setBaseLayerLanguage(layer: BaseLayer, lang: Lang): void {
  layer.labelRules = rulesFor(lang).labelRules;
  layer.clearLayout();
  layer.rerenderTiles();
}

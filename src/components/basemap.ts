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

/**
 * Both attributions are required: Protomaps for the tile schema and build,
 * OpenStreetMap for the data.
 */
const ATTRIBUTION =
  '<a href="https://protomaps.com">Protomaps</a> &copy; ' +
  '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/**
 * Protomaps' light flavour, unmodified: a plain, legible road map. Someone
 * working a search should be reading the map, not a theme. What is drawn on
 * top of it is coloured to stand off it — see `src/app/colours.ts`.
 */
const flavor = (): Flavor => namedFlavor('light');

/**
 * The flavour's own water tone, which is what most of a maritime search sits
 * on. Exported so the PDF capture can fill with it where no tile has loaded
 * rather than leaving a hole in a different colour.
 */
export const WATER = flavor().water;

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
 * What the archive actually holds, read from its own header rather than
 * assumed. A regional extract cut at a different zoom or a different bounding
 * box is a normal thing to do — `npm run tiles` takes both as arguments — and
 * the app should follow it rather than have to be edited to match.
 */
export interface Coverage {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
  /** Deepest zoom with data. Past it the renderer overzooms what it has. */
  maxZoom: number;
}

/** A base map on a live Leaflet map. */
export interface BaseMap {
  /** Re-labels the map. See the note on place names below. */
  setLanguage(lang: Lang): void;
  /** Resolves once the archive header is read, or to null if it cannot be. */
  readonly coverage: Promise<Coverage | null>;
  /**
   * Detaches. Required, not optional tidiness: the layer is attached after an
   * await, so a map torn down in between would otherwise be given a layer it
   * no longer has panes for.
   */
  remove(): void;
}

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
  return null;
});

/**
 * Adds the base map to a Leaflet map.
 *
 * The layer is created after the archive header arrives rather than before,
 * because protomaps-leaflet reads `maxDataZoom` once, when the layer is
 * constructed, and keeps it. Hardcoding 15 worked only for as long as nobody
 * re-cut the archive at another zoom; read from the header it cannot drift.
 * The wait is one range request against a file the tiles need anyway.
 */
export function addBaseLayer(map: L.Map, lang: Lang): BaseMap {
  let layer: BaseLayer | null = null;
  let current = lang;
  let attached = true;

  const coverage = opened.then((header) =>
    header
      ? {
          minLon: header.minLon,
          minLat: header.minLat,
          maxLon: header.maxLon,
          maxLat: header.maxLat,
          maxZoom: header.maxZoom,
        }
      : null,
  );

  void opened.then((header) => {
    // React mounts, unmounts and remounts in development, and the header can
    // arrive after the map it was for has been removed.
    if (!header || !attached) return;
    layer = leafletLayer({
      url: archive,
      attribution: ATTRIBUTION,
      maxDataZoom: header.maxZoom,
      backgroundColor: WATER,
      ...rulesFor(current),
    }) as BaseLayer;
    layer.addTo(map);
  });

  return {
    coverage,
    remove(): void {
      attached = false;
      if (layer) map.removeLayer(layer);
      layer = null;
    },
    setLanguage(next: Lang): void {
      current = next;
      // Only the label rules change; the paint rules carry no text, so the
      // geometry does not re-style.
      if (!layer) return;
      layer.labelRules = rulesFor(next).labelRules;
      layer.clearLayout();
      layer.rerenderTiles();
    },
  };
}

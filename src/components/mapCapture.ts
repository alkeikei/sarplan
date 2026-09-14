/**
 * Rasterises the map for the PDF report.
 *
 * html2canvas is used for the map furniture only - the attribution and the
 * scale bar. Everything that carries information is composited here, by hand,
 * because html2canvas silently drops both halves of it:
 *
 *   - the base map. Protomaps draws each tile into its own <canvas>, and
 *     html2canvas comes back with those blank. They are canvases we can read,
 *     so they are copied straight across at the position the live map has
 *     them at, which is also faster and exact rather than re-rendered.
 *   - the overlays. Leaflet's vector pane is a single SVG element positioned
 *     by transform, and in some browsers that rasterises empty - a report
 *     showing the base map and the datum marker but silently missing the
 *     search area and the error circle. That is the one thing the report
 *     exists to carry, so it is not left to a library quirk.
 *
 * So the composition order here is the screen's own: background, tiles,
 * furniture, overlays. Leaflet's tile, vector, marker and tooltip panes are
 * all hidden from html2canvas, so nothing is drawn twice.
 */

import type L from 'leaflet';
import type { CaseCalculationResult, LatLon } from '../engine';

export interface LayerVisibility {
  driftTrack: boolean;
  errorCircle: boolean;
  searchArea: boolean;
  trackLines: boolean;
}

/** Everything the capture needs, read fresh from the live map at export time. */
export interface MapCaptureSource {
  map: L.Map;
  container: HTMLElement;
  layers: LayerVisibility;
  /** Asset id whose track lines are shown, or 'all'. */
  trackAssetId: string;
  assetColours: Map<string, string>;
  result: CaseCalculationResult | null;
  lineEndPoint: LatLon | null;
  startPoint: LatLon;
}

export interface MapImage {
  dataUrl: string;
  width: number;
  height: number;
}

/** Overlay colours, kept in step with MapView so the report matches the screen. */
export const OVERLAY_COLOURS = {
  driftTrack: '#FBBF24',
  searchArea: '#38BDF8',
  errorCircle: '#2DD4BF',
  datum: '#0E9384',
  startPoint: '#FBBF24',
  lineEndPoint: '#FDE68A',
} as const;

let readSource: (() => MapCaptureSource | null) | null = null;

/** MapView registers a getter here while it is mounted. */
export function setMapCaptureSource(getter: (() => MapCaptureSource | null) | null): void {
  readSource = getter;
}

export function isMapCaptureAvailable(): boolean {
  return readSource?.() != null;
}

import { translator, type Translator } from '../app/i18n';

export class MapCaptureError extends Error {}

/** Panes Leaflet renders itself that this module composites instead. */
const HIDDEN_PANES = [
  'leaflet-tile-pane',
  'leaflet-overlay-pane',
  'leaflet-marker-pane',
  'leaflet-tooltip-pane',
];

/** The open-water tone the app uses, and what shows through where no tile has loaded. */
const BACKGROUND = '#0A2E44';

export async function captureMapImage(t: Translator = translator('en')): Promise<MapImage> {
  const source = readSource?.();
  if (!source) throw new MapCaptureError(t('capture.notReady'));

  const { container } = source;
  const { default: html2canvas } = await import('html2canvas');

  // The map's own CSS background is the opaque ocean tone, and html2canvas
  // paints it whatever `backgroundColor` is set to here — which would put a
  // solid fill straight over the tiles composited below. Lifting it for the
  // duration is the only way to get a transparent plate back.
  const ownBackground = container.style.backgroundColor;
  container.style.backgroundColor = 'transparent';

  let furniture: HTMLCanvasElement;
  try {
    furniture = await html2canvas(container, {
      useCORS: true,
      allowTaint: false,
      // Transparent, so what is drawn underneath it here survives.
      backgroundColor: null,
      scale: Math.min(2, window.devicePixelRatio || 1),
      logging: false,
      ignoreElements: (el) => {
        const cls = el.classList;
        if (!cls) return false;
        // The zoom buttons are app furniture, not part of the plan. The
        // attribution and scale controls stay: the map data is used under a
        // licence that requires attribution, including in a printed extract,
        // and a scale bar is worth having on a search plan.
        if (cls.contains('leaflet-control-zoom')) return true;
        return HIDDEN_PANES.some((pane) => cls.contains(pane));
      },
    });
  } finally {
    container.style.backgroundColor = ownBackground;
  }

  // Compose onto a canvas of our own rather than drawing straight onto the
  // one html2canvas returns. Its context is left carrying the transform it
  // rendered with - a scale by the device ratio and a translate by the
  // element's position in the document - which would silently apply to
  // everything drawn afterwards and put the overlays somewhere else entirely.
  // drawImage copies the bitmap, not the transform, so this starts clean.
  const out = document.createElement('canvas');
  out.width = furniture.width;
  out.height = furniture.height;
  const ctx = out.getContext('2d');
  if (!ctx) throw new MapCaptureError(t('capture.noContext'));

  // html2canvas renders at a scale factor; everything below is measured in
  // CSS pixels, so it all has to be scaled to match.
  const scale = out.width / container.offsetWidth;

  ctx.fillStyle = BACKGROUND;
  ctx.fillRect(0, 0, out.width, out.height);
  drawTiles(ctx, container, scale);
  ctx.drawImage(furniture, 0, 0);
  drawOverlays(ctx, source, scale);

  return { dataUrl: out.toDataURL('image/png'), width: out.width, height: out.height };
}

/**
 * Copies the base map across.
 *
 * Each tile is a canvas the vector renderer has already drawn, so this is a
 * bitmap copy rather than a re-render: nothing can come out looking different
 * from what the coordinator was looking at. Positions are read from the live
 * layout rather than recomputed, which is what makes it land correctly
 * through Leaflet's nested pane transforms and mid-zoom scaling.
 */
function drawTiles(ctx: CanvasRenderingContext2D, container: HTMLElement, scale: number): void {
  const base = container.getBoundingClientRect();
  // In DOM order, so overlapping zoom levels stack the way Leaflet stacks them.
  const tiles = container.querySelectorAll<HTMLCanvasElement>('.leaflet-tile-pane canvas');

  ctx.save();
  for (const tile of tiles) {
    // A tile still loading holds either nothing or the previous zoom's
    // content, and either would print as a seam.
    if (!tile.classList.contains('leaflet-tile-loaded')) continue;
    if (tile.width === 0 || tile.height === 0) continue;

    const rect = tile.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;

    // Mid-fade tiles are half drawn; carry that rather than popping them in.
    const opacity = Number.parseFloat(getComputedStyle(tile).opacity);
    ctx.globalAlpha = Number.isFinite(opacity) ? opacity : 1;

    ctx.drawImage(
      tile,
      (rect.left - base.left) * scale,
      (rect.top - base.top) * scale,
      rect.width * scale,
      rect.height * scale,
    );
  }
  ctx.restore();
}

function drawOverlays(ctx: CanvasRenderingContext2D, source: MapCaptureSource, scale: number): void {
  const { map, result, layers } = source;
  const project = (p: LatLon): { x: number; y: number } => {
    const pt = map.latLngToContainerPoint([p.lat, p.lon]);
    return { x: pt.x * scale, y: pt.y * scale };
  };
  const line = (width: number): number => Math.max(1, width * scale);

  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (result) {
    const { geometry, datum } = result;

    if (layers.driftTrack) {
      ctx.strokeStyle = OVERLAY_COLOURS.driftTrack;
      ctx.lineWidth = line(2);
      ctx.globalAlpha = 0.85;
      ctx.setLineDash([line(4), line(5)]);
      for (const track of geometry.driftTrack) strokePath(ctx, track.points.map(project), false);
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }

    if (layers.searchArea) {
      for (const rect of geometry.searchRectangles) {
        const points = rect.corners.map(project);
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = OVERLAY_COLOURS.searchArea;
        fillPath(ctx, points);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = OVERLAY_COLOURS.searchArea;
        ctx.lineWidth = line(2.5);
        strokePath(ctx, points, true);
      }
    }

    if (layers.trackLines) {
      const shown =
        source.trackAssetId === 'all'
          ? geometry.tracksByAsset
          : geometry.tracksByAsset.filter((a) => a.assetId === source.trackAssetId);
      ctx.globalAlpha = 0.65;
      ctx.lineWidth = line(1);
      for (const asset of shown) {
        ctx.strokeStyle = source.assetColours.get(asset.assetId) ?? OVERLAY_COLOURS.errorCircle;
        for (const plan of asset.plans) {
          // Match the on-screen thinning, so the report shows the same legs
          // the coordinator was looking at.
          const stride = Math.max(1, Math.ceil(plan.legs.length / 60));
          plan.legs.forEach((leg, i) => {
            if (i % stride !== 0) return;
            strokePath(ctx, [project(leg.from), project(leg.to)], false);
          });
        }
      }
      ctx.globalAlpha = 1;
    }

    if (layers.errorCircle) {
      ctx.strokeStyle = OVERLAY_COLOURS.errorCircle;
      ctx.lineWidth = line(1.5);
      ctx.globalAlpha = 0.9;
      ctx.setLineDash([line(5), line(5)]);
      for (const circle of geometry.errorCircles) {
        strokePath(ctx, circle.polygon.map(project), true);
      }
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }

    // Datum marks sit above the overlays, as they do on screen.
    const marks =
      datum.datumType === 'single-point' || datum.datumType === 'line'
        ? [datum.datumCentre]
        : [datum.datumLeft, datum.datumRight];
    for (const mark of marks) drawCross(ctx, project(mark), scale);
  }

  if (source.lineEndPoint) {
    // The drifting start line itself, drawn the same way MapView draws it.
    ctx.strokeStyle = OVERLAY_COLOURS.startPoint;
    ctx.lineWidth = line(2);
    ctx.setLineDash([line(6), line(4)]);
    strokePath(ctx, [project(source.startPoint), project(source.lineEndPoint)], false);
    ctx.setLineDash([]);
  }

  drawPin(ctx, project(source.startPoint), OVERLAY_COLOURS.startPoint, scale);
  if (source.lineEndPoint) {
    drawPin(ctx, project(source.lineEndPoint), OVERLAY_COLOURS.lineEndPoint, scale);
  }

  ctx.restore();
}

function tracePath(ctx: CanvasRenderingContext2D, points: { x: number; y: number }[]): void {
  ctx.beginPath();
  points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
}

function strokePath(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  close: boolean,
): void {
  if (points.length < 2) return;
  tracePath(ctx, points);
  if (close) ctx.closePath();
  ctx.stroke();
}

function fillPath(ctx: CanvasRenderingContext2D, points: { x: number; y: number }[]): void {
  if (points.length < 3) return;
  tracePath(ctx, points);
  ctx.closePath();
  ctx.fill();
}

/** The datum mark: a precise cross, white-backed so it reads over any tile. */
function drawCross(ctx: CanvasRenderingContext2D, p: { x: number; y: number }, scale: number): void {
  const arm = 11 * scale;
  for (const [colour, width] of [
    ['#FFFFFF', 4 * scale],
    [OVERLAY_COLOURS.datum, 2 * scale],
  ] as const) {
    ctx.strokeStyle = colour;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(p.x - arm, p.y);
    ctx.lineTo(p.x + arm, p.y);
    ctx.moveTo(p.x, p.y - arm);
    ctx.lineTo(p.x, p.y + arm);
    ctx.stroke();
  }
}

function drawPin(
  ctx: CanvasRenderingContext2D,
  p: { x: number; y: number },
  colour: string,
  scale: number,
): void {
  ctx.beginPath();
  ctx.arc(p.x, p.y, 8 * scale, 0, Math.PI * 2);
  ctx.fillStyle = colour;
  ctx.fill();
  ctx.lineWidth = 2.5 * scale;
  ctx.strokeStyle = '#FFFFFF';
  ctx.stroke();
}

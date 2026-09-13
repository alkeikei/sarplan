/**
 * Rasterises the map for the PDF report.
 *
 * html2canvas is used for the tile layer only. It does NOT reliably rasterise
 * Leaflet's vector overlay pane, which is a single SVG element positioned by
 * transform: in some browsers it comes back empty, so a report would show the
 * base map and the datum marker but silently lose the search area and the
 * error circle. That is the one thing the report exists to carry, so it is
 * not left to a library quirk.
 *
 * Instead every overlay is drawn here onto the captured canvas with the 2D
 * API, projected through the live map so it lands exactly where it sits on
 * screen. Leaflet's own vector, marker and tooltip panes are hidden during
 * the capture, so each shape is drawn exactly once, by this code.
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

/** Panes Leaflet renders itself that this module redraws instead. */
const HIDDEN_PANES = ['leaflet-overlay-pane', 'leaflet-marker-pane', 'leaflet-tooltip-pane'];

export async function captureMapImage(t: Translator = translator('en')): Promise<MapImage> {
  const source = readSource?.();
  if (!source) throw new MapCaptureError(t('capture.notReady'));

  const { container } = source;
  const { default: html2canvas } = await import('html2canvas');

  const canvas = await html2canvas(container, {
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#0A2E44',
    scale: Math.min(2, window.devicePixelRatio || 1),
    logging: false,
    ignoreElements: (el) => {
      const cls = el.classList;
      if (!cls) return false;
      // The zoom buttons are app furniture, not part of the plan. The
      // attribution and scale controls stay: the OSM tiles are used under a
      // licence that requires attribution, including in a printed extract,
      // and a scale bar is worth having on a search plan.
      if (cls.contains('leaflet-control-zoom')) return true;
      return HIDDEN_PANES.some((pane) => cls.contains(pane));
    },
  });

  // Compose onto a canvas of our own rather than drawing straight onto the
  // one html2canvas returns. Its context is left carrying the transform it
  // rendered with - a scale by the device ratio and a translate by the
  // element's position in the document - which would silently apply to
  // everything drawn afterwards and put the overlays somewhere else entirely.
  // drawImage copies the bitmap, not the transform, so this starts clean.
  const out = document.createElement('canvas');
  out.width = canvas.width;
  out.height = canvas.height;
  const ctx = out.getContext('2d');
  if (!ctx) throw new MapCaptureError(t('capture.noContext'));
  ctx.drawImage(canvas, 0, 0);

  // html2canvas renders at a scale factor; the projection below is in CSS
  // pixels, so everything drawn has to be scaled to match.
  const scale = out.width / container.offsetWidth;
  drawOverlays(ctx, source, scale);

  return { dataUrl: out.toDataURL('image/png'), width: out.width, height: out.height };
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

/**
 * The map. Leaflet directly, over OpenStreetMap data. The tile source lives in
 * ./basemap, so the base layer choice stays open per PRD 12 and nothing here
 * assumes a particular provider.
 *
 * The map takes the dominant visual space and every result is drawn on it:
 * drift tracks, datum marks, the error circle, the optimal search area, and
 * one set of track lines per assigned facility.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { useStore } from '../app/store';
import { num, position } from '../app/format';
import { addBaseLayer, setBaseLayerLanguage, type BaseLayer } from './basemap';
import { ASSET_COLOURS, OVERLAY_COLOURS } from '../app/colours';
import { setMapCaptureSource, type LayerVisibility } from './mapCapture';
import type { LatLon } from '../engine';
import { useLang, useT, type HelpId, type TextKey } from '../app/i18n';
import { HelpTip } from './ui/HelpTip';

export const MAP_ELEMENT_ID = 'navsar-map';

export type { LayerVisibility };

/** The overlay key: label, colour and line style, matching what is drawn. */
const LAYER_KEY: {
  key: keyof LayerVisibility;
  label: TextKey;
  colour: string;
  dashed: boolean;
  help: HelpId;
}[] = [
  { key: 'driftTrack', label: 'map.driftTrack', colour: OVERLAY_COLOURS.driftTrack, dashed: true, help: 'driftDistance' },
  { key: 'errorCircle', label: 'map.errorCircle', colour: OVERLAY_COLOURS.errorCircle, dashed: true, help: 'e' },
  { key: 'searchArea', label: 'map.searchArea', colour: OVERLAY_COLOURS.searchArea, dashed: false, help: 'ao' },
  { key: 'trackLines', label: 'map.trackLines', colour: ASSET_COLOURS[0], dashed: false, help: 'so' },
];

const DEFAULT_LAYERS: LayerVisibility = {
  driftTrack: true,
  errorCircle: true,
  searchArea: true,
  trackLines: true,
};

const toLatLng = (p: LatLon): L.LatLngExpression => [p.lat, p.lon];

function pinIcon(colour: string, label: string): L.DivIcon {
  return L.divIcon({
    className: 'datum-marker',
    html: `<div style="
      width:16px;height:16px;border-radius:9999px;
      background:${colour};border:2.5px solid #fff;
      box-shadow:0 1px 4px rgba(0,0,0,.5);
    " title="${label}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function crossIcon(colour: string): L.DivIcon {
  return L.divIcon({
    className: 'datum-marker',
    html: `<svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
      <line x1="11" y1="1" x2="11" y2="21" stroke="#fff" stroke-width="4"/>
      <line x1="1" y1="11" x2="21" y2="11" stroke="#fff" stroke-width="4"/>
      <line x1="11" y1="1" x2="11" y2="21" stroke="${colour}" stroke-width="2"/>
      <line x1="1" y1="11" x2="21" y2="11" stroke="${colour}" stroke-width="2"/>
    </svg>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

export function MapView({
  placing,
  onPlacingChange,
}: {
  placing: 'start' | 'line-end' | null;
  onPlacingChange: (mode: 'start' | 'line-end' | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const overlayRef = useRef<L.LayerGroup | null>(null);
  const markerRef = useRef<L.LayerGroup | null>(null);
  const baseRef = useRef<BaseLayer | null>(null);
  const [layers, setLayers] = useState<LayerVisibility>(DEFAULT_LAYERS);
  const [cursor, setCursor] = useState<LatLon | null>(null);
  /** Which facility's track lines to draw. 'all' is legible only with one facility. */
  const [trackAssetId, setTrackAssetId] = useState<string>('all');

  const caseState = useStore((s) => s.caseState);
  const run = useStore((s) => s.run);
  const stale = useStore((s) => s.stale);
  const patch = useStore((s) => s.patch);
  const t = useT();
  const lang = useLang();

  // The Leaflet layers below are imperative, so the draw effects have to list
  // the translator as a dependency: switching language must redraw the
  // tooltips, not leave the previous language pinned to the shapes.
  // Keep the click handler fresh without tearing the map down on every render.
  const placingRef = useRef(placing);
  placingRef.current = placing;

  // The mount-once effect below must not list the language as a dependency —
  // that would rebuild the whole map on an EN/ID switch. It reads the current
  // value through this ref, and the effect further down re-labels in place.
  const langRef = useRef(lang);
  langRef.current = lang;

  // --- map lifecycle -------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [caseState.startPoint.lat, caseState.startPoint.lon],
      zoom: 9,
      zoomControl: true,
      attributionControl: true,
      worldCopyJump: true,
    });

    baseRef.current = addBaseLayer(map, langRef.current);

    L.control.scale({ imperial: false, metric: true }).addTo(map);

    map.on('mousemove', (e: L.LeafletMouseEvent) =>
      setCursor({ lat: e.latlng.lat, lon: e.latlng.lng }),
    );
    map.on('mouseout', () => setCursor(null));
    map.on('click', (e: L.LeafletMouseEvent) => {
      const mode = placingRef.current;
      if (!mode) return;
      const point = { lat: e.latlng.lat, lon: e.latlng.lng };
      if (mode === 'start') patch('Start point (map)', (d) => void (d.startPoint = point));
      else patch('Line end point (map)', (d) => void (d.lineEndPoint = point));
      onPlacingChange(null);
    });

    overlayRef.current = L.layerGroup().addTo(map);
    markerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      baseRef.current = null;
    };
    // Mount once. Later state changes are handled by the draw effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.cursor = placing ? 'crosshair' : '';
    }
  }, [placing]);

  // Place names are part of the translation, not furniture around it: the map
  // under an Indonesian panel should not be labelled in English.
  useEffect(() => {
    if (baseRef.current) setBaseLayerLanguage(baseRef.current, lang);
  }, [lang]);

  // --- input markers -------------------------------------------------------
  useEffect(() => {
    const group = markerRef.current;
    if (!group) return;
    group.clearLayers();

    const start = L.marker(toLatLng(caseState.startPoint), {
      icon: pinIcon(OVERLAY_COLOURS.startPoint, t('map.startPointTip')),
      draggable: true,
      zIndexOffset: 500,
    })
      .bindTooltip(t('map.startPointTip'), { direction: 'top', offset: [0, -10] })
      .on('dragend', (e) => {
        const p = (e.target as L.Marker).getLatLng();
        patch('Start point (map)', (d) => void (d.startPoint = { lat: p.lat, lon: p.lng }));
      });
    group.addLayer(start);

    if (caseState.lineEndPoint) {
      const end = L.marker(toLatLng(caseState.lineEndPoint), {
        icon: pinIcon(OVERLAY_COLOURS.lineEndPoint, t('map.lineEndTip')),
        draggable: true,
        zIndexOffset: 500,
      })
        .bindTooltip(t('map.lineEndTip'), { direction: 'top', offset: [0, -10] })
        .on('dragend', (e) => {
          const p = (e.target as L.Marker).getLatLng();
          patch('Line end point (map)', (d) => void (d.lineEndPoint = { lat: p.lat, lon: p.lng }));
        });
      group.addLayer(end);
      group.addLayer(
        L.polyline([toLatLng(caseState.startPoint), toLatLng(caseState.lineEndPoint)], {
          color: OVERLAY_COLOURS.driftTrack,
          weight: 2,
          dashArray: '6 4',
        }),
      );
    }
  }, [caseState.startPoint, caseState.lineEndPoint, patch, t]);

  // --- calculated overlays -------------------------------------------------
  const assetColours = useMemo(
    () => new Map(caseState.assets.map((a) => [a.id, a.colour])),
    [caseState.assets],
  );

  useEffect(() => {
    const group = overlayRef.current;
    if (!group) return;
    group.clearLayers();
    if (!run) return;

    const { geometry, datum } = run.result;
    // Stale results are drawn faded, so the map never looks more current than
    // the numbers behind it (PRD 6.8).
    const alpha = stale ? 0.45 : 1;

    if (layers.driftTrack) {
      for (const track of geometry.driftTrack) {
        group.addLayer(
          L.polyline(track.points.map(toLatLng), {
            color: OVERLAY_COLOURS.driftTrack,
            weight: 2,
            opacity: 0.85 * alpha,
            dashArray: '4 5',
          }).bindTooltip(
            t('map.driftTrackTip', {
              label: t.data(track.label),
              distance: num(track.distanceNm, 2),
            }),
            { sticky: true },
          ),
        );
      }
    }

    if (layers.searchArea) {
      for (const rect of geometry.searchRectangles) {
        group.addLayer(
          L.polygon(rect.corners.map(toLatLng), {
            color: OVERLAY_COLOURS.searchArea,
            weight: 2.5,
            opacity: alpha,
            fillColor: OVERLAY_COLOURS.searchArea,
            fillOpacity: 0.1 * alpha,
          }).bindTooltip(
            t('map.rectTip', {
              label: t.data(rect.label),
              width: rect.widthNm.toFixed(2),
              length: rect.lengthNm.toFixed(2),
            }),
            { sticky: true },
          ),
        );
      }
    }

    if (layers.errorCircle) {
      for (const circle of geometry.errorCircles) {
        group.addLayer(
          L.polygon(circle.polygon.map(toLatLng), {
            color: OVERLAY_COLOURS.errorCircle,
            weight: 1.5,
            opacity: 0.9 * alpha,
            dashArray: '5 5',
            fill: false,
          }).bindTooltip(
            t('map.circleTip', {
              label: t.data(circle.label),
              radius: circle.radiusNm.toFixed(2),
            }),
            { sticky: true },
          ),
        );
      }
    }

    if (layers.trackLines) {
      const shown =
        trackAssetId === 'all'
          ? geometry.tracksByAsset
          : geometry.tracksByAsset.filter((a) => a.assetId === trackAssetId);
      for (const asset of shown) {
        const colour = assetColours.get(asset.assetId) ?? ASSET_COLOURS[0];
        for (const plan of asset.plans) {
          // A very tight spacing can produce hundreds of legs, which is real
          // but unreadable; draw a representative subset and say so.
          const stride = Math.max(1, Math.ceil(plan.legs.length / 60));
          plan.legs.forEach((leg, i) => {
            if (i % stride !== 0) return;
            group.addLayer(
              L.polyline([toLatLng(leg.from), toLatLng(leg.to)], {
                color: colour,
                weight: 1,
                opacity: 0.65 * alpha,
              }).bindTooltip(
                t(stride > 1 ? 'map.legsTipStride' : 'map.legsTip', {
                  name: asset.assetName,
                  legs: plan.legCount,
                  spacing: plan.actualSpacingNm.toFixed(3),
                  stride,
                }),
                { sticky: true },
              ),
            );
          });
        }
      }
    }

    // Datum marks sit above everything else.
    const marks: { point: LatLon; label: string }[] =
      datum.datumType === 'single-point' || datum.datumType === 'line'
        ? [{ point: datum.datumCentre, label: t('map.datum') }]
        : [
            { point: datum.datumLeft, label: t('map.datumLeftTip') },
            { point: datum.datumRight, label: t('map.datumRightTip') },
          ];
    for (const mark of marks) {
      group.addLayer(
        L.marker(toLatLng(mark.point), { icon: crossIcon(OVERLAY_COLOURS.datum), zIndexOffset: 400 }).bindTooltip(
          `${mark.label}<br>${position(mark.point)}`,
          { direction: 'top', offset: [0, -12] },
        ),
      );
    }
  }, [run, stale, layers, assetColours, trackAssetId, t]);

  // The PDF export reads the live map through this, so it can project the
  // overlays itself rather than trusting html2canvas with Leaflet's SVG pane.
  const captureSource = useRef<(() => ReturnType<typeof buildSource>) | null>(null);
  const buildSource = () => {
    const map = mapRef.current;
    const container = containerRef.current;
    if (!map || !container) return null;
    return {
      map,
      container,
      layers,
      trackAssetId,
      assetColours,
      result: run?.result ?? null,
      startPoint: caseState.startPoint,
      lineEndPoint: caseState.lineEndPoint,
    };
  };
  captureSource.current = buildSource;

  useEffect(() => {
    setMapCaptureSource(() => captureSource.current?.() ?? null);
    return () => setMapCaptureSource(null);
  }, []);

  function fitToResults() {
    const map = mapRef.current;
    if (!map) return;
    const points: L.LatLngExpression[] = [toLatLng(caseState.startPoint)];
    if (caseState.lineEndPoint) points.push(toLatLng(caseState.lineEndPoint));
    if (run) {
      for (const rect of run.result.geometry.searchRectangles) {
        points.push(...rect.corners.map(toLatLng));
      }
      for (const circle of run.result.geometry.errorCircles) {
        points.push(...circle.polygon.map(toLatLng));
      }
    }
    map.fitBounds(L.latLngBounds(points).pad(0.15));
  }

  return (
    <div className="relative h-full w-full">
      <div id={MAP_ELEMENT_ID} ref={containerRef} className="h-full w-full" />

      {placing && (
        <div className="pointer-events-none absolute top-3 left-1/2 z-[1000] -translate-x-1/2 rounded-md bg-ocean-900/90 px-3 py-1.5 text-xs font-medium text-white shadow-lg">
          {placing === 'start' ? t('map.placeStart') : t('map.placeLineEnd')}
        </div>
      )}

      {/* Wide enough for the Indonesian layer names, which run longer than
          the English ones and otherwise wrap onto two lines each. */}
      <div className="absolute top-3 right-3 z-[1000] w-60 rounded-lg border border-white/10 bg-ocean-900/85 p-2.5 text-white shadow-lg backdrop-blur">
        <p className="mb-1.5 text-[10px] font-semibold tracking-wider text-ocean-100 uppercase">
          {t('map.layers')}
        </p>
        {/* The swatch doubles as the map key: it names each overlay and shows
            the colour it is drawn in, so the layers read as distinct. */}
        <div className="space-y-1">
          {LAYER_KEY.map(({ key, label, colour, dashed, help }) => (
            <label key={key} className="flex cursor-pointer items-center gap-2 text-xs">
              <input
                type="checkbox"
                /* Tailwind needs a literal here, so this one cannot read
                   ASSET_COLOURS[0] and has to be kept in step with it. */
                className="h-3.5 w-3.5 accent-[#0D47A1]"
                checked={layers[key]}
                onChange={(e) => setLayers((l) => ({ ...l, [key]: e.target.checked }))}
              />
              <span
                aria-hidden
                className="h-0 w-4 shrink-0 border-t-2"
                style={{ borderColor: colour, borderTopStyle: dashed ? 'dashed' : 'solid' }}
              />
              <span className="min-w-0 flex-1">{t(label)}</span>
              <HelpTip id={help} tone="dark" />
            </label>
          ))}
        </div>

        {layers.trackLines && caseState.assets.length > 1 && (
          <select
            className="mt-2 w-full rounded border border-white/15 bg-ocean-800 px-1.5 py-1 text-[11px] text-white"
            value={trackAssetId}
            onChange={(e) => setTrackAssetId(e.target.value)}
          >
            <option value="all">{t('map.tracksAll')}</option>
            {caseState.assets.map((a) => (
              <option key={a.id} value={a.id}>
                {t('map.tracksOne', { name: a.name })}
              </option>
            ))}
          </select>
        )}

        <p className="mt-2 flex items-center gap-2 border-t border-white/10 pt-2 text-xs">
          <svg width="12" height="12" viewBox="0 0 22 22" aria-hidden className="shrink-0">
            <line x1="11" y1="1" x2="11" y2="21" stroke={OVERLAY_COLOURS.datum} strokeWidth="3" />
            <line x1="1" y1="11" x2="21" y2="11" stroke={OVERLAY_COLOURS.datum} strokeWidth="3" />
          </svg>
          {t('map.datum')}
          <HelpTip id="datum" tone="dark" />
          {/* Literal for the same Tailwind reason: OVERLAY_COLOURS.startPoint. */}
          <span className="ml-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#EF6C00]" aria-hidden />
          {t('map.startPoint')}
          <HelpTip id="startPoint" tone="dark" />
        </p>

        <button
          type="button"
          onClick={fitToResults}
          className="mt-2 w-full rounded bg-white/10 px-2 py-1 text-xs font-medium hover:bg-white/20"
        >
          {t('map.fitToResults')}
        </button>
      </div>

      {cursor && (
        <div className="tnum pointer-events-none absolute bottom-10 left-3 z-[1000] rounded bg-ocean-900/85 px-2 py-1 text-[11px] text-ocean-100 shadow">
          {position(cursor)}
        </div>
      )}
    </div>
  );
}

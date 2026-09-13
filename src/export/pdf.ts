/**
 * PDF search plan report (PRD 6.7): the inputs used, every calculated value,
 * and the map view with its overlays.
 *
 * The report is built from the case state captured at the moment the
 * calculation ran, not from whatever is on screen now, so a report can never
 * pair current inputs with stale numbers.
 */

import { jsPDF } from 'jspdf';
import type { CalculationRun } from '../app/store';
import type { MapImage } from '../components/mapCapture';
import { AUTHOR_NAME } from '../app/author';
import { deriveCase } from '../app/selectors';
import { bearing, duration, num, percent, position, timestamp } from '../app/format';
import { getLeewayEntry } from '../engine';
import {
  DATUM_TYPE_KEY,
  DISTRESS_KEY,
  STEADINESS_KEY,
  translator,
  type Translator,
  WEATHER_CLASS_KEY,
} from '../app/i18n';

/**
 * jsPDF's built-in Helvetica is WinAnsi-encoded. Anything outside that set is
 * rendered as a wrong glyph or a blank box rather than raising, so text is
 * checked on the way in during development. Embedding a Unicode font would
 * lift the restriction, at the cost of ~300 kB in the export bundle.
 */
const WIN_ANSI_EXTRAS = '\u20ac\u201a\u0192\u201e\u2026\u2020\u2021\u02c6\u2030\u0160\u2039\u0152\u017d\u2018\u2019\u201c\u201d\u2022\u2013\u2014\u02dc\u2122\u0161\u203a\u0153\u017e\u0178';

function assertWinAnsi(text: string): string {
  if (import.meta.env?.DEV) {
    for (const ch of text) {
      const code = ch.codePointAt(0)!;
      if (code < 0x20 || (code > 0x7e && code < 0xa0) || (code > 0xff && !WIN_ANSI_EXTRAS.includes(ch))) {
        console.warn(
          `PDF text contains "${ch}" (U+${code.toString(16).toUpperCase().padStart(4, '0')}), which the built-in font cannot render: ${text}`,
        );
      }
    }
  }
  return text;
}

const MARGIN = 14;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const OCEAN: [number, number, number] = [11, 61, 92];
const INK: [number, number, number] = [16, 41, 58];
const MUTED: [number, number, number] = [74, 98, 115];
const RULE: [number, number, number] = [199, 216, 226];


class Report {
  readonly doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  private y = MARGIN;
  private readonly caseName: string;
  private readonly t: Translator;

  constructor(caseName: string, t: Translator) {
    this.caseName = caseName;
    this.t = t;
  }

  private ensure(height: number): void {
    if (this.y + height > PAGE_HEIGHT - MARGIN - 10) this.newPage();
  }

  newPage(): void {
    this.doc.addPage();
    this.y = MARGIN;
  }

  title(text: string, subtitle: string): void {
    this.doc.setFillColor(...OCEAN);
    this.doc.rect(0, 0, PAGE_WIDTH, 26, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFont('helvetica', 'bold').setFontSize(16);
    this.doc.text(assertWinAnsi(text), MARGIN, 13);
    this.doc.setFont('helvetica', 'normal').setFontSize(9);
    this.doc.text(assertWinAnsi(subtitle), MARGIN, 19.5);
    this.y = 34;
  }

  heading(text: string): void {
    this.ensure(12);
    this.doc.setTextColor(...OCEAN);
    this.doc.setFont('helvetica', 'bold').setFontSize(10.5);
    this.doc.text(assertWinAnsi(text.toUpperCase()), MARGIN, this.y);
    this.y += 2;
    this.doc.setDrawColor(...RULE).setLineWidth(0.3);
    this.doc.line(MARGIN, this.y, PAGE_WIDTH - MARGIN, this.y);
    this.y += 5;
  }

  /**
   * Two columns of label/value pairs. Each column flows independently so a
   * long value can wrap onto its own line instead of running back over its
   * label.
   */
  pairs(rows: [string, string][]): void {
    this.doc.setFontSize(8.5);
    const colWidth = CONTENT_WIDTH / 2;
    const inner = colWidth - 5;
    const perColumn = Math.ceil(rows.length / 2);
    const columns = [rows.slice(0, perColumn), rows.slice(perColumn)];
    const startY = this.y;
    let maxY = startY;

    columns.forEach((column, col) => {
      const x = MARGIN + col * colWidth;
      const right = x + inner;
      let y = startY;

      for (const [label, value] of column) {
        this.doc.setFont('helvetica', 'normal');
        const labelWidth = this.doc.getTextWidth(label);
        this.doc.setFont('helvetica', 'bold');
        const valueWidth = this.doc.getTextWidth(value);

        this.doc.setTextColor(...MUTED).setFont('helvetica', 'normal');
        this.doc.text(assertWinAnsi(label), x, y);

        this.doc.setTextColor(...INK).setFont('helvetica', 'bold');
        if (labelWidth + valueWidth + 3 <= inner) {
          this.doc.text(assertWinAnsi(value), right, y, { align: 'right' });
          y += 5;
        } else {
          // Not enough room beside the label: wrap the value underneath it.
          const lines = this.doc.splitTextToSize(assertWinAnsi(value), inner) as string[];
          y += 3.6;
          for (const line of lines) {
            this.doc.text(line, right, y, { align: 'right' });
            y += 3.6;
          }
          y += 1.4;
        }
      }
      maxY = Math.max(maxY, y);
    });

    this.y = maxY + 3;
  }

  table(headers: string[], rows: string[][], widths: number[]): void {
    this.ensure(10 + rows.length * 5);
    const xs: number[] = [];
    let x = MARGIN;
    for (const w of widths) {
      xs.push(x);
      x += (w / 100) * CONTENT_WIDTH;
    }

    this.doc.setFillColor(232, 240, 245);
    this.doc.rect(MARGIN, this.y - 3.5, CONTENT_WIDTH, 5.5, 'F');
    this.doc.setFontSize(8).setFont('helvetica', 'bold').setTextColor(...OCEAN);
    headers.forEach((h, i) => this.doc.text(assertWinAnsi(h), xs[i] + 1.5, this.y));
    this.y += 6;

    this.doc.setFont('helvetica', 'normal').setTextColor(...INK);
    for (const row of rows) {
      this.ensure(6);
      row.forEach((cell, i) => this.doc.text(assertWinAnsi(cell), xs[i] + 1.5, this.y));
      this.y += 5;
      this.doc.setDrawColor(...RULE).setLineWidth(0.15);
      this.doc.line(MARGIN, this.y - 3.4, PAGE_WIDTH - MARGIN, this.y - 3.4);
    }
    this.y += 3;
  }

  note(text: string): void {
    this.doc.setFontSize(7.5).setFont('helvetica', 'italic').setTextColor(...MUTED);
    const lines = this.doc.splitTextToSize(assertWinAnsi(text), CONTENT_WIDTH);
    this.ensure(lines.length * 3.6 + 3);
    this.doc.text(lines, MARGIN, this.y);
    this.y += lines.length * 3.6 + 3;
  }

  /** Space left on the current page before the footer rule. */
  private get available(): number {
    return PAGE_HEIGHT - MARGIN - 12 - this.y;
  }

  /**
   * Fit a capture into whatever is left on the page, preserving its aspect.
   * A map screenshot can be any shape depending on the window, so scaling to
   * the page width alone either overflows or wastes most of a page.
   */
  image(dataUrl: string, width: number, height: number): void {
    const MIN_HEIGHT = 70;
    if (this.available < MIN_HEIGHT) this.newPage();
    const aspect = height / width;
    let w = CONTENT_WIDTH;
    let h = aspect * w;
    if (h > this.available) {
      h = this.available;
      w = h / aspect;
    }
    const x = MARGIN + (CONTENT_WIDTH - w) / 2;
    this.doc.addImage(dataUrl, 'PNG', x, this.y, w, h, undefined, 'FAST');
    this.doc.setDrawColor(...RULE).setLineWidth(0.3);
    this.doc.rect(x, this.y, w, h);
    this.y += h + 6;
  }

  /**
   * Start a block that needs at least `minHeight` of room, so a heading is
   * never left stranded at the foot of a page away from what it introduces.
   */
  headingFor(text: string, minHeight: number): void {
    if (this.available < minHeight + 12) this.newPage();
    this.heading(text);
  }

  /** A colour key for the map overlays. */
  legend(items: [string, [number, number, number]][]): void {
    this.doc.setFontSize(7.5).setFont('helvetica', 'normal');
    let x = MARGIN;
    for (const [label, colour] of items) {
      this.doc.setFillColor(...colour);
      this.doc.rect(x, this.y - 2, 3, 3, 'F');
      this.doc.setTextColor(...MUTED);
      this.doc.text(assertWinAnsi(label), x + 4.5, this.y);
      x += this.doc.getTextWidth(label) + 12;
    }
    this.y += 6;
  }

  /**
   * Footer on every page: the planning-aid note, who built the tool, and the
   * page number. The attribution is bold but small, and sits on its own line
   * under the note so it cannot be mistaken for part of the caveat.
   */
  finish(): void {
    const pages = this.doc.getNumberOfPages();
    const credit = `${this.t('app.developedBy')} ${AUTHOR_NAME}`;
    for (let p = 1; p <= pages; p++) {
      this.doc.setPage(p);
      this.doc.setDrawColor(...RULE).setLineWidth(0.3);
      this.doc.line(MARGIN, PAGE_HEIGHT - 16, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 16);
      this.doc.setFontSize(6.8).setFont('helvetica', 'normal').setTextColor(...MUTED);
      const lines = this.doc.splitTextToSize(
        assertWinAnsi(this.t('app.planningAid')),
        CONTENT_WIDTH - 20,
      );
      this.doc.text(lines, MARGIN, PAGE_HEIGHT - 12);
      this.doc.text(`${p} / ${pages}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 12, { align: 'right' });

      this.doc.setFontSize(6.8).setFont('helvetica', 'bold').setTextColor(...MUTED);
      this.doc.text(assertWinAnsi(credit), MARGIN, PAGE_HEIGHT - 12 + lines.length * 3.2);
      this.doc.setFont('helvetica', 'normal');
    }
  }

  save(): void {
    const safe = this.caseName.replace(/[^a-z0-9-_ ]/gi, '').trim() || this.t('report.fileCase');
    this.doc.save(`SARPlan ${safe} ${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '')}.pdf`);
  }
}

export interface ExportOptions {
  /** Language for the report. Defaults to English when the caller has none. */
  t?: Translator;
  /** A rasterised map view. Omit for a text-only report. */
  mapImage?: MapImage | null;
  /** Why no map image is being supplied, so the report can say so. */
  mapError?: string;
}

export interface ExportOutcome {
  mapIncluded: boolean;
  mapError?: string;
}

export async function exportCasePdf(
  run: CalculationRun,
  options: ExportOptions = {},
): Promise<ExportOutcome> {
  const c = run.input;
  const r = run.result;
  const t = options.t ?? translator('en');
  const derived = deriveCase(c, t);
  const report = new Report(c.name, t);

  report.title(
    c.name || t('report.untitled'),
    t('report.subtitle', {
      calc: timestamp(run.at),
      gen: timestamp(new Date().toISOString()),
    }),
  );

  // --- headline results ----------------------------------------------------
  report.heading(t('report.h.summary'));
  report.pairs([
    [t('report.lbl.datumType'), t(DATUM_TYPE_KEY[r.datum.datumType])],
    [t('report.lbl.e'), `${num(r.error.eNm, 2)} nm`],
    [t('report.lbl.ro'), `${num(r.area.roNm, 2)} nm`],
    [t('report.lbl.ao'), `${num(r.area.aoNm2, 1)} nm²`],
    [t('report.lbl.co'), num(r.area.co, 2)],
    [t('report.lbl.zta'), `${num(r.effort.ztaNm2, 1)} nm²`],
    [t('report.lbl.sr'), num(r.datum.srValue, 2)],
    [t('report.lbl.pos'), percent(r.success.pos)],
  ]);

  // --- positions -----------------------------------------------------------
  report.heading(t('report.h.positions'));
  const positionRows: [string, string][] = [
    [t('report.lbl.startPoint'), position(c.startPoint)],
    [t('report.lbl.distressType'), t(DISTRESS_KEY[c.distressType])],
  ];
  if (r.datum.datumType === 'single-point' || r.datum.datumType === 'line') {
    positionRows.push([t('report.lbl.datum'), position(r.datum.datumCentre)]);
  } else {
    positionRows.push(
      [t('report.lbl.datumLeft'), position(r.datum.datumLeft)],
      [t('report.lbl.datumRight'), position(r.datum.datumRight)],
    );
  }
  if (c.lineEndPoint) positionRows.push([t('report.lbl.lineEnd'), position(c.lineEndPoint)]);
  positionRows.push(
    [t('report.lbl.driftDistance'), `${num(r.drift.displacementCentre.magnitude, 2)} nm`],
    [t('report.lbl.dd'), `${num(r.datum.ddNm, 2)} nm`],
  );
  report.pairs(positionRows);

  // --- map -----------------------------------------------------------------
  // The image arrives already rasterised, overlays and all: see
  // components/mapCapture.
  let outcome: ExportOutcome = { mapIncluded: false };
  if (options.mapImage) {
    report.headingFor(t('report.h.map'), 70);
    report.image(options.mapImage.dataUrl, options.mapImage.width, options.mapImage.height);
    report.legend([
      [t('report.legend.searchArea'), [56, 189, 248]],
      [t('report.legend.errorCircle'), [45, 212, 191]],
      [t('report.legend.datum'), [14, 147, 132]],
      [t('report.legend.driftTrack'), [251, 191, 36]],
    ]);
    outcome = { mapIncluded: true };
  } else if (options.mapError) {
    report.heading(t('report.h.map'));
    report.note(t('report.mapUnavailable', { reason: options.mapError }));
    outcome = { mapIncluded: false, mapError: options.mapError };
  }

  // --- inputs --------------------------------------------------------------
  const leeway = getLeewayEntry(c.leewayObjectId);
  const manual = ` ${t('report.val.manual')}`;
  report.heading(t('report.h.inputs'));
  report.pairs([
    [
      t('report.lbl.searchObject'),
      [leeway.category, leeway.subCategory, leeway.descriptor].filter(Boolean).map(t.data).join(' - '),
    ],
    [t('report.lbl.weatherClass'), t(WEATHER_CLASS_KEY[c.weatherObjectClass])],
    [t('report.lbl.leewayMultiplier'), `${num(derived.leeway.multiplier.value, 3)}${derived.leeway.multiplier.isAuto ? '' : manual}`],
    [t('report.lbl.leewayModifier'), `${num(derived.leeway.modifier.value, 2)} kt${derived.leeway.modifier.isAuto ? '' : manual}`],
    [t('report.lbl.leewayDivergence'), `${num(derived.leeway.divergenceAngleDeg.value, 0)}°${c.applyDivergence ? '' : ` ${t('report.val.notApplied')}`}`],
    [t('report.lbl.distressTime'), timestamp(`${c.distressTimeIso}:00Z`)],
    [t('report.lbl.searchStartTime'), timestamp(`${c.searchStartTimeIso}:00Z`)],
    [t('report.lbl.driftTime'), duration(derived.driftTime.value)],
    [t('report.lbl.wind'), t('report.windValue', { speed: num(c.windSpeedKt, 1), bearing: bearing(c.windFromDirectionDeg) })],
    [
      t('report.lbl.windSource'),
      c.windProvenance.kind === 'fetched'
        ? `${typeof c.windProvenance.source === 'object' ? t(c.windProvenance.source.key, c.windProvenance.source.params) : (c.windProvenance.source ?? 'Open-Meteo')}, ${timestamp(c.windProvenance.at)}`
        : t('report.val.manualEntry'),
    ],
    [t('report.lbl.windSteadiness'), t(STEADINESS_KEY[c.windSteadiness])],
    [t('report.lbl.visibility'), `${num(c.visibilityKm, 0)} km`],
    [t('report.lbl.seaHeight'), c.seaHeightM === null ? t('report.val.notUsed') : `${num(c.seaHeightM, 1)} m`],
    [t('report.lbl.x'), `${num(derived.x.value, 2)} nm — ${derived.x.isAuto ? derived.x.sourceLabel : t('report.val.manualShort')}`],
    [t('report.lbl.y'), `${num(derived.y.value, 2)} nm — ${derived.y.isAuto ? derived.y.sourceLabel : t('report.val.manualShort')}`],
    [
      t('report.lbl.lwe'),
      `${num(derived.lwe.value, 3)} kt — ${derived.lwe.isAuto ? derived.lwe.sourceLabel : t('report.val.manualShort')}`,
    ],
    [t('report.lbl.fs'), `${num(derived.fs.value, 2)}${derived.fs.isAuto ? ` — ${derived.fs.sourceLabel}` : manual}`],
  ]);
  for (const flag of c.windProvenance.flags ?? []) {
    report.note(t('report.windFlag', { reason: t(flag.key, flag.params) }));
  }
  if (!c.windProvenance.flags?.length && c.windProvenance.staleReason) {
    report.note(t('report.windFlag', { reason: c.windProvenance.staleReason }));
  }

  report.heading(t('report.h.currents'));
  report.table(
    [t('report.tbl.component'), t('report.tbl.speedKt'), t('report.tbl.setsToward'), t('report.tbl.errorKt')],
    (
      [
        ['report.cur.tidal', c.currents.tidal],
        ['report.cur.sea', c.currents.sea],
        ['report.cur.wind', c.currents.wind],
        ['report.cur.other', c.currents.other],
      ] as const
    ).map(([label, cur]) => [
      t(label),
      num(cur.speedKt, 2),
      bearing(cur.setDirectionDeg),
      num(cur.errorKt, 2),
    ]),
    [34, 22, 22, 22],
  );

  // --- calculation chain ---------------------------------------------------
  report.heading(t('report.h.chain'));
  const toward = (m: number, d: number) =>
    t('report.ktToward', { speed: num(m, 3), bearing: bearing(d) });
  report.table(
    [t('report.tbl.step'), t('report.tbl.formula'), t('report.tbl.value')],
    [
      [t('report.step.leewaySpeed'), t('report.formula.leeway'), `${num(r.drift.leeway.speedKt, 3)} kt`],
      [t('report.step.twc'), t('report.formula.vectorSum'), toward(r.drift.totalWaterCurrent.magnitude, r.drift.totalWaterCurrent.directionDeg)],
      [t('report.step.driftVector'), t('report.formula.driftSum'), toward(r.drift.driftVectorCentre.magnitude, r.drift.driftVectorCentre.directionDeg)],
      ['TWCe', 'sqrt(TCe² + SCe² + WCe² + OWCe²)', `${num(r.error.twceKt, 3)} kt`],
      ['Dve', 'sqrt(ASWDve² + TWCe² + LWe²)', `${num(r.error.dveKt, 3)} kt`],
      ['De', t('report.formula.driftTime'), `${num(r.error.deNm, 2)} nm`],
      ['E', 'sqrt(X² + De² + Y²)', `${num(r.error.eNm, 2)} nm`],
      ['SR', 'DD / E', num(r.datum.srValue, 2)],
      [t('report.lbl.datumType'), r.datum.overridden ? t('report.val.manualOverride') : t('report.val.fromSr'), t(DATUM_TYPE_KEY[r.datum.datumType])],
      ['Zta', t('report.formula.sumZ'), `${num(r.effort.ztaNm2, 1)} nm²`],
      ['fz', r.datum.datumType === 'line' ? `E × L, L = ${num(r.effort.lNm ?? 0, 2)} nm` : 'E²', `${num(r.effort.fz, 2)} nm²`],
      ['Zr', 'Zta / fz', num(r.effort.zr, 2)],
      ['Zrc', t('report.formula.sumZr'), num(r.effort.zrc, 2)],
      ['Ro', 'fs × E', `${num(r.area.roNm, 2)} nm`],
      ['Ao', areaFormula(r.datum.datumType), `${num(r.area.aoNm2, 1)} nm²`],
      ['Co', 'Zta / Ao', num(r.area.co, 2)],
      ['POS', 'POC × POD', `${percent(r.success.poc, 0)} × ${percent(r.success.pod, 0)} = ${percent(r.success.pos)}`],
    ],
    [24, 42, 34],
  );

  // --- facilities ----------------------------------------------------------
  report.heading(t('report.h.facilities'));
  if (r.assets.length === 0) {
    report.note(t('report.noFacilities'));
  } else {
    report.table(
      [t('report.tbl.facility'), 'W0', 'fw', 'fv', 'ff', 'W', 'V', 'T', 'Z', 'So'],
      r.assets.map((a) => {
        const input = derived.assets.find((d) => d.asset.id === a.id);
        return [
          a.name.slice(0, 16),
          num(input?.w0.value ?? 0, 2),
          num(input?.fw.value ?? 0, 2),
          num(input?.fv.value ?? 1, 2),
          num(input?.ff.value ?? 1, 2),
          num(a.wNm, 2),
          num(input?.asset.speedKt ?? 0, 0),
          num(input?.asset.enduranceHours ?? 0, 1),
          num(a.zNm2, 1),
          num(a.soNm, 3),
        ];
      }),
      [20, 9, 8, 8, 8, 9, 8, 8, 11, 11],
    );
    report.note(t('report.facilityKey'));
  }

  report.heading(t('report.h.sources'));
  report.note(t('report.sources'));

  report.finish();
  report.save();
  return outcome;
}

function areaFormula(datumType: string): string {
  switch (datumType) {
    case 'single-point':
      return '4 Ro²';
    case 'leeway-divergence':
      return '4 Ro² + 2 Ro DD';
    case 'widely-diverging':
      return '2 × 4 Ro²';
    default:
      return '2 Ro L';
  }
}

import { useState } from 'react';
import { useStore } from '../../app/store';
import { DATUM_TYPE_KEY, useT } from '../../app/i18n';
import { num, percent, timestamp } from '../../app/format';
import { Button, ErrorNote, FlagNote, Grid, Metric, Section } from '../ui/primitives';
import { StaleNotice } from './StaleNotice';

export function ExportPanel() {
  const run = useStore((s) => s.run);
  const stale = useStore((s) => s.stale);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const t = useT();

  async function onExport() {
    if (!run) return;
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      // jsPDF and html2canvas are ~1 MB together and are only needed here, so
      // they load on the first export rather than at app start.
      const [{ captureMapImage }, { exportCasePdf }] = await Promise.all([
        import('../mapCapture'),
        import('../../export/pdf'),
      ]);

      // A failed map capture must not cost the whole report: fall through to
      // a text-only one that says what happened.
      let mapImage = null;
      let mapError: string | undefined;
      try {
        mapImage = await captureMapImage(t);
      } catch (e) {
        mapError = e instanceof Error ? e.message : String(e);
      }

      const outcome = await exportCasePdf(run, { mapImage, mapError, t });
      setMessage(
        outcome.mapIncluded
          ? t('export.savedWithMap')
          : t('export.savedWithoutMap', {
              reason: outcome.mapError ? ` (${outcome.mapError})` : '',
            }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : t('export.failed'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <StaleNotice />

      <Section
        title={t('section.export')}
        help="report"
        subtitle={t('section.export.sub')}
        right={
          <Button variant="primary" onClick={() => void onExport()} disabled={!run || busy}>
            {busy ? t('action.generating') : t('action.exportPdf')}
          </Button>
        }
      >
        {!run && <p className="text-xs text-ink-muted">{t('note.calculateFirst')}</p>}
        {stale && run && (
          <FlagNote>{t('note.exportStale')}</FlagNote>
        )}
        {message && (
          <p className="mt-2 rounded border border-surface-3 bg-surface-2 px-2 py-1.5 text-[11px] text-ink">
            {message}
          </p>
        )}
        {error && <ErrorNote>{error}</ErrorNote>}
        <p className="mt-2 text-[11px] leading-snug text-ink-muted">{t('note.exportMapHint')}</p>
      </Section>

      {run && (
        <Section
          title={t('section.reportPreview')}
          subtitle={t('section.reportPreview.sub', {
            time: timestamp(run.at),
            ms: num(run.durationMs, 0),
          })}
        >
          <Grid>
            <Metric
              label={t('metric.datumType')}
              help="datumType"
              value={t(DATUM_TYPE_KEY[run.result.datum.datumType])}
              stale={stale}
              size="compact"
            />
            <Metric label="E" help="e" value={num(run.result.error.eNm, 2)} unit="nm" stale={stale} />
            <Metric label="Ro" help="ro" value={num(run.result.area.roNm, 2)} unit="nm" stale={stale} />
            <Metric label="Ao" help="ao" value={num(run.result.area.aoNm2, 1)} unit="nm²" stale={stale} />
            <Metric label="Co" help="co" value={num(run.result.area.co, 2)} stale={stale} />
            <Metric label="POS" help="pos" value={percent(run.result.success.pos)} stale={stale} />
          </Grid>
        </Section>
      )}

      <Section title={t('section.reportNote')}>
        <p className="text-[11px] leading-relaxed text-ink-muted">{t('app.planningAid')}</p>
      </Section>
    </>
  );
}

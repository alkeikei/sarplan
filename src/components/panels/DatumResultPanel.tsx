import { useStore } from '../../app/store';
import { bearing, num, position } from '../../app/format';
import type { DatumType } from '../../engine';
import { DATUM_TYPE_KEY, useT } from '../../app/i18n';
import { Field, Grid, Metric, Section, Select, SourceTag } from '../ui/primitives';
import { StaleNotice } from './StaleNotice';

export function DatumResultPanel() {
  const run = useStore((s) => s.run);
  const stale = useStore((s) => s.stale);
  const caseState = useStore((s) => s.caseState);
  const patch = useStore((s) => s.patch);
  const t = useT();

  if (!run) return <StaleNotice />;
  const { datum, error, drift } = run.result;

  return (
    <>
      <StaleNotice />

      <Section title={t('section.datum')} subtitle={t('section.datum.sub')}>
        <Grid cols={1}>
          <Metric
            label={
              datum.datumType === 'single-point' || datum.datumType === 'line'
                ? t('metric.datumPosition')
                : t('metric.datumLeft')
            }
            value={position(datum.datumType === 'single-point' ? datum.datumCentre : datum.datumLeft)}
            help="datum"
            stale={stale}
            size="compact"
          />
          {(datum.datumType === 'leeway-divergence' || datum.datumType === 'widely-diverging') && (
            <Metric
              label={t('metric.datumRight')}
              help="datum"
              value={position(datum.datumRight)}
              stale={stale}
              size="compact"
            />
          )}
        </Grid>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Metric
            label={t('metric.drift')}
            help="driftDistance"
            value={num(drift.displacementCentre.magnitude, 2)}
            unit="nm"
            sub={t('metric.drift.sub', {
              bearing: bearing(drift.driftVectorCentre.directionDeg),
              speed: num(drift.driftVectorCentre.magnitude, 2),
            })}
            stale={stale}
          />
          <Metric
            label={t('metric.leeway')}
            help="leewaySpeed"
            value={num(drift.leeway.speedKt, 2)}
            unit="kt"
            sub={t('metric.leeway.sub', {
              bearing: bearing(drift.leeway.downwindDeg),
              angle: num(drift.leeway.divergenceAngleDeg, 0),
            })}
            stale={stale}
          />
        </div>
      </Section>

      <Section title={t('section.probableError')} subtitle="E = √(X² + De² + Y²)">
        <div className="grid grid-cols-2 gap-3">
          <Metric
            label={t('metric.e')}
            help="e"
            value={num(error.eNm, 2)}
            unit="nm"
            stale={stale}
            emphasis
          />
          <Metric label={t('metric.de')} help="de" value={num(error.deNm, 2)} unit="nm" stale={stale} />
          <Metric
            label={t('metric.dve')}
            help="dve"
            value={num(error.dveKt, 3)}
            unit="kt"
            stale={stale}
          />
          <Metric
            label={t('metric.twce')}
            help="twce"
            value={num(error.twceKt, 3)}
            unit="kt"
            stale={stale}
          />
          <Metric label={t('metric.x')} help="x" value={num(error.xNm, 2)} unit="nm" stale={stale} />
          <Metric label={t('metric.y')} help="y" value={num(error.yNm, 2)} unit="nm" stale={stale} />
        </div>
      </Section>

      <Section
        title={t('section.datumType')}
        subtitle={t('section.datumType.sub')}
      >
        <div className="grid grid-cols-2 gap-3">
          <Metric label={t('metric.dd')} help="dd" value={num(datum.ddNm, 2)} unit="nm" stale={stale} />
          <Metric
            label={t('metric.sr')}
            help="sr"
            value={num(datum.srValue, 2)}
            sub={datum.srValue >= 4 ? t('metric.sr.above') : t('metric.sr.below')}
            stale={stale}
          />
        </div>

        <div className="mt-3">
          <Field label={t('field.datumType')} help="datumType" hint={t('field.datumType.hint')}>
            <Select<DatumType | 'auto'>
              value={caseState.datumTypeOverride ?? 'auto'}
              onChange={(v) =>
                patch('Datum type', (d) => {
                  d.datumTypeOverride = v === 'auto' ? null : v;
                })
              }
              options={[
                {
                  value: 'auto',
                  label: t('opt.datumTypeAuto', { type: t(DATUM_TYPE_KEY[datum.autoDatumType]) }),
                },
                ...(Object.keys(DATUM_TYPE_KEY) as DatumType[]).map((k) => ({
                  value: k,
                  label: t(DATUM_TYPE_KEY[k]),
                })),
              ]}
            />
          </Field>
          <SourceTag
            isAuto={!datum.overridden}
            sourceLabel={t('source.separationRatio', { value: num(datum.srValue, 2) })}
            onReset={() => patch('Datum type', (d) => void (d.datumTypeOverride = null))}
          />
          {datum.datumType === 'line' && !caseState.lineEndPoint && (
            <p className="mt-2 rounded border border-flag-border bg-flag-bg px-2 py-1 text-[11px] text-flag">
              {t('note.lineDatumNoEnd')}
            </p>
          )}
        </div>
      </Section>
    </>
  );
}

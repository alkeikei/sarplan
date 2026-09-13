import { useStore } from '../../app/store';
import { resolveFs } from '../../app/selectors';
import { num, percent } from '../../app/format';
import {
  MINIMUM_RECOMMENDED_COVERAGE_FACTOR,
  POD_REFERENCE_POINTS,
  SAFETY_FACTOR_TABLE,
  type SearchStage,
} from '../../engine';
import { DATUM_TYPE_KEY, SEARCH_STAGE_KEY, useT } from '../../app/i18n';
import { Field, FlagNote, Grid, Metric, NumberInput, Section, Select } from '../ui/primitives';
import { OverrideField } from '../ui/OverrideField';
import { StaleNotice } from './StaleNotice';

export function SearchAreaPanel() {
  const caseState = useStore((s) => s.caseState);
  const patch = useStore((s) => s.patch);
  const run = useStore((s) => s.run);
  const stale = useStore((s) => s.stale);
  const t = useT();
  const fs = resolveFs(caseState, t);

  return (
    <>
      <StaleNotice />

      <Section
        title={t('section.searchFactor')}
        subtitle={t('section.searchFactor.sub')}
      >
        <Field label={t('field.searchStage')} help="searchStage">
          <Select<SearchStage>
            value={caseState.searchStage}
            onChange={(v) =>
              patch('Search stage', (d) => {
                d.searchStage = v;
                d.fsOverride = null;
              })
            }
            options={SAFETY_FACTOR_TABLE.map((e) => ({
              value: e.stage,
              label: t('opt.stageWithFs', { label: t(SEARCH_STAGE_KEY[e.stage]), fs: e.fs }),
            }))}
          />
        </Field>
        <div className="mt-3">
          <OverrideField
            label={t('field.fs')}
            help="fs"
            resolved={fs}
            step={0.1}
            min={0}
            onOverride={(v) => patch('Safety factor fs', (d) => void (d.fsOverride = v))}
            onReset={() => patch('Safety factor fs', (d) => void (d.fsOverride = null))}
          />
        </div>
      </Section>

      {run && (
        <>
          <Section
            title={t('section.searchArea')}
            subtitle={t(DATUM_TYPE_KEY[run.result.datum.datumType])}
          >
            <div className="grid grid-cols-2 gap-3">
              <Metric
                label={t('metric.ro')}
                help="ro"
                value={num(run.result.area.roNm, 2)}
                unit="nm"
                stale={stale}
              />
              <Metric
                label={t('metric.ao')}
                help="ao"
                value={num(run.result.area.aoNm2, 1)}
                unit="nm²"
                stale={stale}
                emphasis
              />
              <Metric
                label={t('metric.co')}
                help="co"
                value={num(run.result.area.co, 2)}
                sub={
                  run.result.area.co < MINIMUM_RECOMMENDED_COVERAGE_FACTOR
                    ? t('metric.co.unsatisfactory')
                    : run.result.area.co < 1
                      ? t('metric.co.below')
                      : undefined
                }
                stale={stale}
              />
              <Metric
                label={t('metric.zta')}
                help="zta"
                value={num(run.result.effort.ztaNm2, 1)}
                unit="nm²"
                stale={stale}
              />
            </div>

            {run.result.area.co < MINIMUM_RECOMMENDED_COVERAGE_FACTOR && (
              <FlagNote>{t('note.coverageTooLow')}</FlagNote>
            )}

            <div className="mt-3 space-y-2">
              {run.result.area.subAreas.map((sub) => (
                <div
                  key={sub.label}
                  className="tnum flex items-baseline justify-between rounded border border-surface-3 bg-white px-2.5 py-2 text-xs"
                >
                  <span className="font-medium text-ocean-800">{sub.label}</span>
                  <span className="text-ink-muted">
                    {num(sub.widthNm, 2)} × {num(sub.lengthNm, 2)} nm = {num(sub.areaNm2, 1)} nm²
                  </span>
                </div>
              ))}
            </div>
          </Section>

          <Section title={t('section.effort')} subtitle={t('section.effort.sub')}>
            <div className="grid grid-cols-2 gap-3">
              <Metric
                label={t('metric.fz')}
                help="fz"
                value={num(run.result.effort.fz, 2)}
                unit="nm²"
                sub={run.result.effort.lNm !== undefined ? `L = ${num(run.result.effort.lNm, 2)} nm` : 'E²'}
                stale={stale}
              />
              <Metric label={t('metric.zr')} help="zr" value={num(run.result.effort.zr, 2)} stale={stale} />
              <Metric label={t('metric.zrc')} help="zrc" value={num(run.result.effort.zrc, 2)} stale={stale} />
              <Metric
                label={t('metric.searchCondition')}
                help="searchCondition"
                value={
                  run.result.effort.searchCondition === 'ideal'
                    ? t('opt.conditionIdeal')
                    : t('opt.conditionNormal')
                }
                sub={t('metric.searchCondition.sub')}
                stale={stale}
              />
            </div>
          </Section>

          <Section
            title={t('section.trackSpacing')}
            help="so"
            subtitle={t('section.trackSpacing.sub')}
          >
            {run.result.assets.length === 0 ? (
              <p className="text-xs text-ink-muted">{t('note.needFacility')}</p>
            ) : (
              <div className="space-y-2">
                {run.result.assets.map((a) => {
                  const colour = caseState.assets.find((x) => x.id === a.id)?.colour ?? '#2DD4BF';
                  const plan = run.result.geometry.tracksByAsset.find((t) => t.assetId === a.id)
                    ?.plans[0];
                  return (
                    <div key={a.id} className="rounded border border-surface-3 bg-white p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-xs font-semibold text-ocean-800">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ background: colour }}
                            aria-hidden
                          />
                          {a.name}
                        </span>
                        <span className="tnum text-lg font-semibold text-ocean-900">
                          {num(a.soNm, 3)} <span className="text-xs font-medium text-ink-muted">nm</span>
                        </span>
                      </div>
                      <p className="tnum mt-1 text-[11px] text-ink-muted">
                        {t('asset.summary', {
                          w: num(a.wNm, 3),
                          z: num(a.zNm2, 1),
                          share: percent(a.effortShare, 0),
                        })}
                        {plan && plan.legCount > 0
                          ? ` · ${t('asset.summaryLegs', {
                              legs: plan.legCount,
                              spacing: num(plan.actualSpacingNm, 3),
                              total: num(plan.totalTrackLengthNm, 1),
                            })}`
                          : ''}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>
        </>
      )}

      <Section
        title={t('section.evaluation')}
        subtitle={t('section.evaluation.sub')}
      >
        <Grid>
          <Field label={t('field.poc')} unit="0-1" help="poc">
            <NumberInput
              value={caseState.poc}
              step={0.05}
              min={0}
              max={1}
              onCommit={(v) => patch('POC', (d) => void (d.poc = v))}
            />
          </Field>
          <Field
            label={t('field.pod')}
            unit="0-1"
            help="pod"
            hint={t('field.pod.reference', {
              points: POD_REFERENCE_POINTS.map(
                (p) => `C ${num(p.coverageFactor, 1)} = ${percent(p.pod, 0)}`,
              ).join(', '),
            })}
          >
            <NumberInput
              value={caseState.pod}
              step={0.05}
              min={0}
              max={1}
              onCommit={(v) => patch('POD', (d) => void (d.pod = v))}
            />
          </Field>
        </Grid>
        {run && (
          <div className="mt-3">
            <Metric
              label={t('metric.pos')}
              help="pos"
              value={percent(run.result.success.pos)}
              stale={stale}
              emphasis
            />
          </div>
        )}
      </Section>
    </>
  );
}

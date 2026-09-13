import { leewayCategories, type WeatherObjectClass } from '../../engine';
import { DISTRESS_KEY, useT, WEATHER_CLASS_KEY } from '../../app/i18n';
import { useStore } from '../../app/store';
import { resolveLeeway } from '../../app/selectors';
import type { DistressType } from '../../app/types';
import { Checkbox, Field, Grid, Section, Select, SourceTag, TextInput } from '../ui/primitives';
import { OverrideField } from '../ui/OverrideField';

export function CaseSetupPanel() {
  const caseState = useStore((s) => s.caseState);
  const patch = useStore((s) => s.patch);
  const patchQuiet = useStore((s) => s.patchQuiet);
  const t = useT();
  const leeway = resolveLeeway(caseState, t);
  const allFromTable =
    leeway.multiplier.isAuto && leeway.modifier.isAuto && leeway.divergenceAngleDeg.isAuto;

  // The leeway table's own wording is translated part by part and put back
  // together here, so a new table row needs no new composite entry.
  const objectOptions = leewayCategories().flatMap((group) =>
    group.entries.map((e) => ({
      value: e.id,
      label:
        [e.subCategory, e.descriptor].filter(Boolean).map(t.data).join(' - ') || t.data(e.category),
      group: t.data(group.category),
    })),
  );
  const selected = leewayCategories()
    .flatMap((g) => g.entries)
    .find((e) => e.id === caseState.leewayObjectId)!;
  const selectedLabel = [selected.category, selected.subCategory, selected.descriptor]
    .filter(Boolean)
    .map(t.data)
    .join(' - ');

  return (
    <>
      <Section title={t('section.case')} subtitle={t('section.case.sub')}>
        <div className="space-y-3">
          <Field label={t('field.caseName')} help="caseName">
            <TextInput
              value={caseState.name}
              onChange={(e) => patchQuiet((d) => void (d.name = e.target.value))}
            />
          </Field>
          <Field
            label={t('field.distressType')}
            help="distressType"
            hint={t('field.distressType.hint')}
          >
            <Select<DistressType>
              value={caseState.distressType}
              onChange={(v) => patch('Distress type', (d) => void (d.distressType = v))}
              options={(Object.keys(DISTRESS_KEY) as DistressType[]).map((k) => ({
                value: k,
                label: t(DISTRESS_KEY[k]),
              }))}
            />
          </Field>
          {caseState.distressType === 'previous-datum' && (
            <p className="rounded border border-surface-3 bg-surface-2 px-2 py-1.5 text-[11px] leading-snug text-ink-muted">
              {t('note.previousDatum')}
            </p>
          )}
        </div>
      </Section>

      <Section
        title={t('section.searchObject')}
        subtitle={t('section.searchObject.sub')}
      >
        <div className="space-y-3">
          <Field label={t('field.objectType')} help="searchObject">
            <Select
              value={caseState.leewayObjectId}
              onChange={(v) =>
                patch('Search object type', (d) => {
                  d.leewayObjectId = v;
                  d.leewayMultiplierOverride = null;
                  d.leewayModifierOverride = null;
                  d.leewayDivergenceOverride = null;
                })
              }
              options={objectOptions}
            />
          </Field>
          <p className="text-[11px] leading-snug text-ink-muted">{selectedLabel}</p>

          <Field label={t('field.weatherObjectClass')} help="weatherObjectClass">
            <Select<WeatherObjectClass>
              value={caseState.weatherObjectClass}
              onChange={(v) =>
                patch('Weather correction class', (d) => {
                  d.weatherObjectClass = v;
                  // Every facility reads fw through this, so their lookups
                  // are no longer current.
                  for (const a of d.assets) a.fwOverride = null;
                })
              }
              options={[
                { value: 'small', label: t(WEATHER_CLASS_KEY.small) },
                { value: 'other', label: t(WEATHER_CLASS_KEY.other) },
              ]}
            />
          </Field>

          <Grid cols={3}>
            <OverrideField
              label={t('field.leewayMultiplier')}
              help="leewayMultiplier"
              resolved={leeway.multiplier}
              step={0.001}
              hideSourceTag
              onOverride={(v) => patch('Leeway multiplier', (d) => void (d.leewayMultiplierOverride = v))}
              onReset={() => patch('Leeway multiplier', (d) => void (d.leewayMultiplierOverride = null))}
            />
            <OverrideField
              label={t('field.leewayModifier')}
              unit="kt"
              help="leewayModifier"
              resolved={leeway.modifier}
              step={0.01}
              hideSourceTag
              onOverride={(v) => patch('Leeway modifier', (d) => void (d.leewayModifierOverride = v))}
              onReset={() => patch('Leeway modifier', (d) => void (d.leewayModifierOverride = null))}
            />
            <OverrideField
              label={t('field.leewayDivergence')}
              unit="deg"
              help="leewayDivergence"
              resolved={leeway.divergenceAngleDeg}
              step={1}
              min={0}
              max={90}
              hideSourceTag
              onOverride={(v) => patch('Leeway divergence angle', (d) => void (d.leewayDivergenceOverride = v))}
              onReset={() => patch('Leeway divergence angle', (d) => void (d.leewayDivergenceOverride = null))}
            />
          </Grid>

          {/* One tag for the three coefficients: they all come from the same
              table row, and three identical tags is just noise. */}
          <SourceTag
            isAuto={allFromTable}
            sourceLabel={leeway.multiplier.sourceLabel}
            onReset={() =>
              patch('Leeway coefficients', (d) => {
                d.leewayMultiplierOverride = null;
                d.leewayModifierOverride = null;
                d.leewayDivergenceOverride = null;
              })
            }
          />

          <Checkbox
            checked={caseState.applyDivergence}
            onChange={(v) => patch('Apply leeway divergence', (d) => void (d.applyDivergence = v))}
            label={t('field.applyDivergence')}
            help="applyDivergence"
          />
          <p className="text-[11px] leading-snug text-ink-muted">{t('note.leewayFormula')}</p>
        </div>
      </Section>
    </>
  );
}

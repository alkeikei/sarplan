import { useStore } from '../../app/store';
import { newAsset } from '../../app/defaults';
import { resolveAsset } from '../../app/selectors';
import { num } from '../../app/format';
import {
  SWEEP_WIDTH_TABLES,
  correctedSweepWidth,
  getSweepWidthTable,
  searchEffort,
  type WeatherObjectClass,
} from '../../engine';
import { PLATFORM_KEY, WEATHER_CLASS_KEY, useT, type Translator } from '../../app/i18n';
import type { AssetState } from '../../app/types';
import {
  Button,
  Checkbox,
  Field,
  FlagNote,
  Grid,
  NumberInput,
  Section,
  Select,
  SourceTag,
  TextInput,
} from '../ui/primitives';
import { OverrideField } from '../ui/OverrideField';
import { HelpTip } from '../ui/HelpTip';

export function AssetsPanel() {
  const caseState = useStore((s) => s.caseState);
  const patch = useStore((s) => s.patch);
  const t = useT();

  return (
    <>
      <Section
        title={t('section.facilities')}
        help="facilities"
        subtitle={t('section.facilities.sub')}
        right={
          <Button
            variant="primary"
            onClick={() =>
              patch(
                'Search facilities',
                (d) =>
                  void d.assets.push(
                    newAsset(d.assets.length, t('facility.fallbackName', { n: d.assets.length + 1 })),
                  ),
              )
            }
          >
            {t('action.addFacility')}
          </Button>
        }
      >
        {caseState.assets.length === 0 && (
          <p className="text-xs text-ink-muted">{t('note.noFacilities')}</p>
        )}
      </Section>

      {caseState.assets.map((asset, index) => (
        <AssetCard key={asset.id} asset={asset} index={index} />
      ))}
    </>
  );
}

function AssetCard({ asset, index }: { asset: AssetState; index: number }) {
  const caseState = useStore((s) => s.caseState);
  const patch = useStore((s) => s.patch);
  const t: Translator = useT();
  const resolved = resolveAsset(asset, caseState, t);

  const update = (label: string, mutate: (a: AssetState) => void) =>
    patch(`${asset.name}: ${label}`, (d) => {
      const target = d.assets.find((a) => a.id === asset.id);
      if (target) mutate(target);
    });

  const table = (() => {
    try {
      return getSweepWidthTable(asset.sweepTableId);
    } catch {
      return undefined;
    }
  })();

  const w = correctedSweepWidth(resolved.w0.value, resolved.fw.value, resolved.fv.value, resolved.ff.value);
  const z = searchEffort(w, asset.speedKt, asset.enduranceHours);

  return (
    <Section
      title={asset.name || t('facility.fallbackName', { n: index + 1 })}
      subtitle={table ? t.data(table.label) : undefined}
      right={
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full ring-2 ring-white"
            style={{ background: asset.colour }}
            aria-hidden
          />
          <Button
            variant="danger"
            onClick={() =>
              patch('Search facilities', (d) => {
                d.assets = d.assets.filter((a) => a.id !== asset.id);
              })
            }
          >
            {t('action.remove')}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <Field label={t('field.facilityName')} help="assetName">
          <TextInput
            value={asset.name}
            onChange={(e) => update('name', (a) => void (a.name = e.target.value))}
          />
        </Field>

        <Field label={t('field.sweepTable')} help="sweepTable">
          <Select
            value={asset.sweepTableId}
            onChange={(v) =>
              update('platform', (a) => {
                a.sweepTableId = v;
                a.w0Override = null;
                const rows = getSweepWidthTable(v).rows;
                if (!rows.some((r) => r.object === a.sweepObject)) a.sweepObject = rows[0].object;
              })
            }
            options={SWEEP_WIDTH_TABLES.map((table) => ({
              value: table.id,
              label: t.data(table.label),
              group: PLATFORM_KEY[table.platform] ? t(PLATFORM_KEY[table.platform]) : table.platform,
            }))}
          />
        </Field>

        <Field label={t('field.sweepObject')} help="sweepObject">
          <Select
            value={asset.sweepObject}
            onChange={(v) =>
              update('sweep object', (a) => {
                a.sweepObject = v;
                a.w0Override = null;
              })
            }
            options={(table?.rows ?? []).map((r) => ({ value: r.object, label: t.data(r.object) }))}
          />
        </Field>

        <OverrideField
          label={t('field.w0')}
          unit="nm"
          help="w0"
          resolved={resolved.w0}
          step={0.1}
          min={0}
          hint={t('field.w0.hint', { km: caseState.visibilityKm })}
          onOverride={(v) => update('W0', (a) => void (a.w0Override = v))}
          onReset={() => update('W0', (a) => void (a.w0Override = null))}
        />
        {resolved.w0Note && <FlagNote>{resolved.w0Note}</FlagNote>}

        <div>
          <Field label={t('field.weatherObjectClass')} help="weatherObjectClass">
            <Select<WeatherObjectClass>
              value={resolved.weatherClass}
              onChange={(v) =>
                update('weather object class', (a) => {
                  a.weatherObjectClassOverride = v;
                  a.fwOverride = null;
                })
              }
              options={[
                { value: 'small', label: t(WEATHER_CLASS_KEY.small) },
                { value: 'other', label: t(WEATHER_CLASS_KEY.other) },
              ]}
            />
          </Field>
          <SourceTag
            isAuto={resolved.weatherClassIsAuto}
            sourceLabel={t('source.weatherClassFromCase')}
            autoValue={t(WEATHER_CLASS_KEY[caseState.weatherObjectClass])}
            onReset={() =>
              update('weather object class', (a) => {
                a.weatherObjectClassOverride = null;
                a.fwOverride = null;
              })
            }
          />
        </div>

        <Grid cols={3}>
          <OverrideField
            label={t('field.fw')}
            help="fw"
            resolved={resolved.fw}
            step={0.05}
            min={0}
            onOverride={(v) => update('fw', (a) => void (a.fwOverride = v))}
            onReset={() => update('fw', (a) => void (a.fwOverride = null))}
          />
          <OverrideField
            label={t('field.fv')}
            help="fv"
            resolved={resolved.fv}
            step={0.05}
            min={0}
            onOverride={(v) => update('fv', (a) => void (a.fvOverride = v))}
            onReset={() => update('fv', (a) => void (a.fvOverride = null))}
          />
          <OverrideField
            label={t('field.ff')}
            help="ff"
            resolved={resolved.ff}
            step={0.05}
            min={0}
            onOverride={(v) => update('ff', (a) => void (a.ffOverride = v))}
            onReset={() => update('ff', (a) => void (a.ffOverride = null))}
          />
        </Grid>

        <Checkbox
          checked={asset.crewFatigued}
          onChange={(v) =>
            update('crew fatigue', (a) => {
              a.crewFatigued = v;
              a.ffOverride = null;
            })
          }
          label={t('field.crewFatigued')}
          help="crewFatigue"
        />

        <Grid>
          <Field label={t('field.assetSpeed')} unit="kt" help="assetSpeed">
            <NumberInput
              value={asset.speedKt}
              step={1}
              min={0}
              onCommit={(v) => update('speed', (a) => void (a.speedKt = v))}
            />
          </Field>
          <Field label={t('field.assetEndurance')} unit={t('unit.hours')} help="assetEndurance">
            <NumberInput
              value={asset.enduranceHours}
              step={0.5}
              min={0}
              onCommit={(v) => update('endurance', (a) => void (a.enduranceHours = v))}
            />
          </Field>
        </Grid>

        <div className="tnum rounded border border-surface-3 bg-surface-2 px-2.5 py-2 text-xs text-ink">
          <p className="flex items-start gap-1.5">
            <HelpTip id="w" className="mt-0.5" />
            <span className="min-w-0 flex-1">
              W = W0 × fw × fv × ff = {num(resolved.w0.value, 2)} × {num(resolved.fw.value, 2)} ×{' '}
              {num(resolved.fv.value, 2)} × {num(resolved.ff.value, 2)} ={' '}
              <strong>{num(w, 3)} nm</strong>
            </span>
          </p>
          <p className="mt-1 flex items-start gap-1.5">
            <HelpTip id="z" className="mt-0.5" />
            <span className="min-w-0 flex-1">
              Z = W × V × T = {num(w, 3)} × {num(asset.speedKt, 1)} ×{' '}
              {num(asset.enduranceHours, 2)} = <strong>{num(z, 1)} nm²</strong>
            </span>
          </p>
        </div>
      </div>
    </Section>
  );
}

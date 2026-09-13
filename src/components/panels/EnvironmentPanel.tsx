import { useState } from 'react';
import { useStore } from '../../app/store';
import { fetchWind, WindFetchError } from '../../app/windService';
import { fetchVisibility, BmkgFetchError } from '../../app/bmkgService';
import { fixErrorOptions, resolveLwe, resolveX, resolveY } from '../../app/selectors';
import { timestamp } from '../../app/format';
import {
  DEFAULT_CURRENT_ERROR_KT,
  LEEWAY_ERROR_SOURCE,
  type WindSteadiness,
} from '../../engine';
import { STEADINESS_KEY, useT, type Translator } from '../../app/i18n';
import type { HelpId, TextKey } from '../../app/i18n';
import type { CurrentState, Provenance } from '../../app/types';
import { HelpTip } from '../ui/HelpTip';
import {
  Button,
  Checkbox,
  ErrorNote,
  Field,
  FlagNote,
  Grid,
  NumberInput,
  Section,
  Select,
  SourceTag,
} from '../ui/primitives';
import { OverrideField } from '../ui/OverrideField';

const CURRENT_KEYS = ['tidal', 'sea', 'wind', 'other'] as const;
const CURRENT_LABEL_KEY: Record<(typeof CURRENT_KEYS)[number], TextKey> = {
  tidal: 'current.tidal',
  sea: 'current.sea',
  wind: 'current.wind',
  other: 'current.other',
};

/** Each component is a different physical thing, so each gets its own entry. */
const CURRENT_HELP: Record<(typeof CURRENT_KEYS)[number], HelpId> = {
  tidal: 'currentTidal',
  sea: 'currentSea',
  wind: 'currentWind',
  other: 'currentOther',
};

/**
 * The amber notes attached to a fetched value. One note per flag reads better
 * than one run-on sentence, and the legacy string form is still rendered so
 * cases saved before flags were structured do not lose their warning.
 */
/** A provenance source is either a bare provider name or a translatable label. */
function sourceText(t: Translator, source: Provenance['source'], fallback: string): string {
  if (!source) return fallback;
  return typeof source === 'string' ? source : t(source.key, source.params);
}

function ProvenanceFlags({ provenance }: { provenance: Provenance }) {
  const t = useT();
  if (provenance.flags?.length) {
    return (
      <>
        {provenance.flags.map((flag) => (
          <FlagNote key={flag.key}>{t(flag.key, flag.params)}</FlagNote>
        ))}
      </>
    );
  }
  if (provenance.staleReason) return <FlagNote>{provenance.staleReason}</FlagNote>;
  return null;
}

export function EnvironmentPanel() {
  const caseState = useStore((s) => s.caseState);
  const patch = useStore((s) => s.patch);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchingVis, setFetchingVis] = useState(false);
  const [visError, setVisError] = useState<string | null>(null);
  const t = useT();

  const lwe = resolveLwe(caseState, t);
  const x = resolveX(caseState, t);
  const y = resolveY(caseState, t);
  const wind = caseState.windProvenance;
  // Cases saved before the BMKG fetch existed carry no provenance at all.
  const visibility = caseState.visibilityProvenance ?? { kind: 'manual' as const };

  async function onFetchWind() {
    setFetching(true);
    setFetchError(null);
    try {
      const r = await fetchWind(
        caseState.startPoint.lat,
        caseState.startPoint.lon,
        caseState.distressTimeIso,
        t,
      );
      patch('Wind (fetched)', (d) => {
        d.windSpeedKt = Math.round(r.speedKt * 10) / 10;
        d.windFromDirectionDeg = Math.round(r.fromDirectionDeg);
        d.windProvenance = {
          kind: 'fetched',
          source: r.source,
          at: r.fetchedAt,
          flags: r.flags,
        };
      });
    } catch (e) {
      setFetchError(e instanceof WindFetchError ? e.message : t('wind.failed'));
    } finally {
      setFetching(false);
    }
  }

  async function onFetchVisibility() {
    setFetchingVis(true);
    setVisError(null);
    try {
      const r = await fetchVisibility(
        caseState.startPoint.lat,
        caseState.startPoint.lon,
        caseState.searchStartTimeIso,
        t,
      );
      patch('Visibility (fetched)', (d) => {
        d.visibilityKm = r.visibilityKm;
        d.visibilityProvenance = {
          kind: 'fetched',
          source: {
            key: 'source.bmkgVisibility' as const,
            params: { port: r.portName, distance: r.distanceNm },
          },
          at: r.fetchedAt,
          flags: r.flags,
        };
      });
    } catch (e) {
      setVisError(e instanceof BmkgFetchError ? e.message : t('bmkg.failed'));
    } finally {
      setFetchingVis(false);
    }
  }

  const setCurrent = (
    key: (typeof CURRENT_KEYS)[number],
    field: keyof CurrentState,
    value: number,
  ) => patch(`${t(CURRENT_LABEL_KEY[key])} ${field}`, (d) => void (d.currents[key][field] = value));

  return (
    <>
      <Section
        title={t('section.wind')}
        subtitle={t('section.wind.sub')}
        right={
          <Button variant="primary" onClick={() => void onFetchWind()} disabled={fetching}>
            {fetching ? t('action.fetching') : t('action.fetchWind')}
          </Button>
        }
      >
        <Grid>
          <Field label={t('field.windSpeed')} unit="kt" help="windSpeed">
            <NumberInput
              value={caseState.windSpeedKt}
              step={0.5}
              min={0}
              onCommit={(v) =>
                patch('Wind speed', (d) => {
                  d.windSpeedKt = v;
                  d.windProvenance = { kind: 'manual' };
                })
              }
            />
          </Field>
          <Field label={t('field.windFrom')} unit={t('unit.degTrue')} help="windDirection">
            <NumberInput
              value={caseState.windFromDirectionDeg}
              step={1}
              min={0}
              max={360}
              onCommit={(v) =>
                patch('Wind direction', (d) => {
                  d.windFromDirectionDeg = v;
                  d.windProvenance = { kind: 'manual' };
                })
              }
            />
          </Field>
        </Grid>
        <SourceTag
          isAuto={wind.kind === 'fetched'}
          sourceLabel={t('source.windFetched', {
            source: sourceText(t, wind.source, 'Open-Meteo'),
            time: timestamp(wind.at),
          })}
        />
        <ProvenanceFlags provenance={wind} />
        {fetchError && <ErrorNote>{fetchError}</ErrorNote>}
        <div className="mt-3">
          <Field
            label={t('field.windSteadiness')}
            help="windSteadiness"
            hint={t('field.windSteadiness.hint')}
          >
            <Select<WindSteadiness>
              value={caseState.windSteadiness}
              onChange={(v) => patch('Wind steadiness', (d) => void (d.windSteadiness = v))}
              options={(Object.keys(STEADINESS_KEY) as WindSteadiness[]).map((k) => ({
                value: k,
                label: t(STEADINESS_KEY[k]),
              }))}
            />
          </Field>
        </div>
      </Section>

      <Section
        title={t('section.seaState')}
        subtitle={t('section.seaState.sub')}
        right={
          <Button variant="primary" onClick={() => void onFetchVisibility()} disabled={fetchingVis}>
            {fetchingVis ? t('action.fetching') : t('action.fetchVisibility')}
          </Button>
        }
      >
        <Grid>
          <Field
            label={t('field.visibility')}
            unit="km"
            help="visibility"
            // The tag goes in the hint slot so it lands in the subgrid's third
            // row, keeping this input level with the sea height one beside it.
            hint={
              <SourceTag
                isAuto={visibility.kind === 'fetched'}
                sourceLabel={sourceText(t, visibility.source, 'BMKG')}
              />
            }
          >
            <NumberInput
              value={caseState.visibilityKm}
              step={1}
              min={0}
              onCommit={(v) =>
                patch('Visibility', (d) => {
                  d.visibilityKm = v;
                  d.visibilityProvenance = { kind: 'manual' };
                })
              }
            />
          </Field>
          <Field
            label={t('field.seaHeight')}
            unit="m"
            help="seaHeight"
            hint={
              caseState.seaHeightM === null ? t('field.seaHeight.off') : t('field.seaHeight.on')
            }
          >
            <NumberInput
              value={caseState.seaHeightM ?? 0}
              step={0.1}
              min={0}
              disabled={caseState.seaHeightM === null}
              onCommit={(v) => patch('Sea height', (d) => void (d.seaHeightM = v))}
            />
          </Field>
        </Grid>
        <ProvenanceFlags provenance={visibility} />
        {visError && <ErrorNote>{visError}</ErrorNote>}
        <div className="mt-2">
          <Checkbox
            checked={caseState.seaHeightM !== null}
            onChange={(on) => patch('Sea height', (d) => void (d.seaHeightM = on ? 1.0 : null))}
            label={t('field.useSeaHeight')}
          />
        </div>
      </Section>

      <Section
        title={t('section.currents')}
        help="currents"
        subtitle={t('section.currents.sub')}
      >
        <div className="space-y-4">
          {CURRENT_KEYS.map((key) => (
            <div key={key} className="rounded border border-surface-3 bg-surface/60 p-2.5">
              <p className="mb-2 text-xs font-semibold text-ocean-800">
                {t(CURRENT_LABEL_KEY[key])}
                <HelpTip id={CURRENT_HELP[key]} className="ml-1.5" />
              </p>
              <Grid cols={3}>
                <Field label={t('field.currentSpeed')} unit="kt" help="currentSpeed">
                  <NumberInput
                    value={caseState.currents[key].speedKt}
                    step={0.1}
                    min={0}
                    onCommit={(v) => setCurrent(key, 'speedKt', v)}
                  />
                </Field>
                <Field label={t('field.currentSet')} unit={t('unit.deg')} help="currentSet">
                  <NumberInput
                    value={caseState.currents[key].setDirectionDeg}
                    step={1}
                    min={0}
                    max={360}
                    onCommit={(v) => setCurrent(key, 'setDirectionDeg', v)}
                  />
                </Field>
                <Field label={t('field.currentError')} unit="kt" help="currentError">
                  <NumberInput
                    value={caseState.currents[key].errorKt}
                    step={0.05}
                    min={0}
                    onCommit={(v) => setCurrent(key, 'errorKt', v)}
                  />
                </Field>
              </Grid>
              {caseState.currents[key].errorKt === DEFAULT_CURRENT_ERROR_KT && (
                <SourceTag isAuto sourceLabel={t('source.currentDefault')} />
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section
        title={t('section.leewayError')}
        subtitle={t('section.leewayError.sub')}
      >
        <OverrideField
          label={t('field.lwe')}
          unit="kt"
          help="lwe"
          resolved={lwe}
          step={0.005}
          min={0}
          onOverride={(v) => patch('Leeway error', (d) => void (d.lweOverride = v))}
          onReset={() => patch('Leeway error', (d) => void (d.lweOverride = null))}
        />
        {/* The citation sits with the field, not only in the help, so the
            provenance of the number is readable without opening anything. */}
        <p className="mt-2 text-[11px] leading-snug text-ink-muted">
          {t('field.lwe.caption', { source: LEEWAY_ERROR_SOURCE })}
        </p>
      </Section>

      <Section
        title={t('section.positionError')}
        help="positionError"
        subtitle={t('section.positionError.sub')}
      >
        <div className="space-y-4">
          <div>
            <Field label={t('field.xSource')} help="xSource">
              <Select
                value={caseState.xSourceId}
                onChange={(v) =>
                  patch('Start point fix source', (d) => {
                    d.xSourceId = v;
                    d.xOverride = null;
                  })
                }
                options={fixErrorOptions(t).map((o) => ({
                  value: o.id,
                  label: o.label,
                  group: o.group,
                }))}
              />
            </Field>
            <div className="mt-2">
              <OverrideField
                label={t('field.x')}
                unit="nm"
                help="x"
                resolved={x}
                step={0.1}
                min={0}
                onOverride={(v) => patch('Start point error X', (d) => void (d.xOverride = v))}
                onReset={() => patch('Start point error X', (d) => void (d.xOverride = null))}
              />
            </div>
          </div>

          <div>
            <Field label={t('field.ySource')} help="ySource">
              <Select
                value={caseState.ySourceId}
                onChange={(v) =>
                  patch('Facility fix source', (d) => {
                    d.ySourceId = v;
                    d.yOverride = null;
                  })
                }
                options={fixErrorOptions(t).map((o) => ({
                  value: o.id,
                  label: o.label,
                  group: o.group,
                }))}
              />
            </Field>
            <div className="mt-2">
              <OverrideField
                label={t('field.y')}
                unit="nm"
                help="y"
                resolved={y}
                step={0.1}
                min={0}
                onOverride={(v) => patch('Facility error Y', (d) => void (d.yOverride = v))}
                onReset={() => patch('Facility error Y', (d) => void (d.yOverride = null))}
              />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

import { useStore } from '../../app/store';
import { resolveDriftTime } from '../../app/selectors';
import { DISTRESS_KEY, useT } from '../../app/i18n';
import { duration, position } from '../../app/format';
import { Button, Field, Grid, NumberInput, Section, TextInput } from '../ui/primitives';
import { OverrideField } from '../ui/OverrideField';

/** Datetime-local inputs work in whole minutes and no timezone suffix. */
const toLocalInput = (iso: string): string => iso.slice(0, 16);

export function StartPointPanel({
  placing,
  onPlacingChange,
}: {
  placing: 'start' | 'line-end' | null;
  onPlacingChange: (mode: 'start' | 'line-end' | null) => void;
}) {
  const caseState = useStore((s) => s.caseState);
  const patch = useStore((s) => s.patch);
  const t = useT();
  const driftTime = resolveDriftTime(caseState, t);

  return (
    <>
      <Section
        title={t('section.startPoint')}
        help="startPoint"
        subtitle={t(DISTRESS_KEY[caseState.distressType])}
        right={
          <Button
            variant={placing === 'start' ? 'primary' : 'secondary'}
            onClick={() => onPlacingChange(placing === 'start' ? null : 'start')}
          >
            {placing === 'start' ? t('action.clickMap') : t('action.dropPin')}
          </Button>
        }
      >
        <Grid>
          <Field label={t('field.latitude')} unit={t('unit.degNorth')}>
            <NumberInput
              value={caseState.startPoint.lat}
              step={0.0001}
              min={-90}
              max={90}
              onCommit={(v) => patch('Start point latitude', (d) => void (d.startPoint.lat = v))}
            />
          </Field>
          <Field label={t('field.longitude')} unit={t('unit.degEast')}>
            <NumberInput
              value={caseState.startPoint.lon}
              step={0.0001}
              min={-180}
              max={180}
              onCommit={(v) => patch('Start point longitude', (d) => void (d.startPoint.lon = v))}
            />
          </Field>
        </Grid>
        <p className="tnum mt-2 text-xs text-ink-muted">{position(caseState.startPoint)}</p>
        <p className="mt-1 text-[11px] leading-snug text-ink-muted">{t('note.pinOrType')}</p>
      </Section>

      <Section
        title={t('section.driftTime')} subtitle={t('section.driftTime.sub')}>
        <Grid cols={1}>
          <Field label={t('field.distressTime')} unit="UTC" help="distressTime">
            <TextInput
              type="datetime-local"
              value={toLocalInput(caseState.distressTimeIso)}
              onChange={(e) => patch('Distress time', (d) => void (d.distressTimeIso = e.target.value))}
            />
          </Field>
          <Field label={t('field.searchStartTime')} unit="UTC" help="searchStartTime">
            <TextInput
              type="datetime-local"
              value={toLocalInput(caseState.searchStartTimeIso)}
              onChange={(e) =>
                patch('Search start time', (d) => void (d.searchStartTimeIso = e.target.value))
              }
            />
          </Field>
        </Grid>
        <div className="mt-3">
          <OverrideField
            label={t('field.driftTime')}
            unit={t('unit.hours')}
            help="driftTime"
            resolved={driftTime}
            step={0.25}
            min={0}
            displayDp={2}
            onOverride={(v) => patch('Drift time', (d) => void (d.driftTimeOverride = v))}
            onReset={() => patch('Drift time', (d) => void (d.driftTimeOverride = null))}
          />
          <p className="tnum mt-1 text-[11px] text-ink-muted">{duration(driftTime.value)}</p>
        </div>
      </Section>

      <Section
        title={t('section.lineDatum')}
        help="lineDatumEnd"
        subtitle={t('section.lineDatum.sub')}
        right={
          <Button
            variant={placing === 'line-end' ? 'primary' : 'secondary'}
            disabled={!caseState.lineEndPoint && placing !== 'line-end'}
            onClick={() => onPlacingChange(placing === 'line-end' ? null : 'line-end')}
          >
            {placing === 'line-end' ? t('action.clickMap') : t('action.moveEndPoint')}
          </Button>
        }
      >
        {caseState.lineEndPoint ? (
          <>
            <Grid>
              <Field label={t('field.endLatitude')} unit={t('unit.deg')}>
                <NumberInput
                  value={caseState.lineEndPoint.lat}
                  step={0.0001}
                  onCommit={(v) =>
                    patch('Line end latitude', (d) => {
                      if (d.lineEndPoint) d.lineEndPoint.lat = v;
                    })
                  }
                />
              </Field>
              <Field label={t('field.endLongitude')} unit={t('unit.deg')}>
                <NumberInput
                  value={caseState.lineEndPoint.lon}
                  step={0.0001}
                  onCommit={(v) =>
                    patch('Line end longitude', (d) => {
                      if (d.lineEndPoint) d.lineEndPoint.lon = v;
                    })
                  }
                />
              </Field>
            </Grid>
            <div className="mt-3 flex gap-2">
              <Button
                variant="danger"
                onClick={() =>
                  patch('Line datum end point', (d) => {
                    d.lineEndPoint = null;
                    if (d.datumTypeOverride === 'line') d.datumTypeOverride = null;
                  })
                }
              >
                {t('action.removeLineEnd')}
              </Button>
            </div>
            <p className="mt-2 text-[11px] leading-snug text-ink-muted">{t('note.lineDatum')}</p>
          </>
        ) : (
          <Button
            onClick={() =>
              patch('Line datum end point', (d) => {
                // Start the line 6 nm north of the start point; the user drags
                // or types from there.
                d.lineEndPoint = { lat: d.startPoint.lat + 0.1, lon: d.startPoint.lon };
              })
            }
          >
            {t('action.addLineEnd')}
          </Button>
        )}
      </Section>
    </>
  );
}

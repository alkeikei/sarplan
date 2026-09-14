/**
 * App shell: a deep ocean blue frame around a map that keeps the visual
 * weight, with the input and result panels in a collapsible side panel so the
 * map is never hidden behind a modal.
 */

import { useEffect, useState } from 'react';
import { useStore } from './app/store';
import { num, timestamp } from './app/format';
import { MapView } from './components/MapView';
import { CaseSetupPanel } from './components/panels/CaseSetupPanel';
import { StartPointPanel } from './components/panels/StartPointPanel';
import { EnvironmentPanel } from './components/panels/EnvironmentPanel';
import { DatumResultPanel } from './components/panels/DatumResultPanel';
import { AssetsPanel } from './components/panels/AssetsPanel';
import { SearchAreaPanel } from './components/panels/SearchAreaPanel';
import { ExportPanel } from './components/panels/ExportPanel';
import { Button } from './components/ui/primitives';
import { Attribution } from './components/ui/Attribution';
import { LanguageToggle } from './components/ui/LanguageToggle';
import { useT, type TextKey } from './app/i18n';

const STEPS = [
  { id: 'case', label: 'nav.case', title: 'nav.case.title' },
  { id: 'start', label: 'nav.start', title: 'nav.start.title' },
  { id: 'environment', label: 'nav.environment', title: 'nav.environment.title' },
  { id: 'datum', label: 'nav.datum', title: 'nav.datum.title' },
  { id: 'assets', label: 'nav.assets', title: 'nav.assets.title' },
  { id: 'area', label: 'nav.area', title: 'nav.area.title' },
  { id: 'export', label: 'nav.export', title: 'nav.export.title' },
] as const satisfies { id: string; label: TextKey; title: TextKey }[];

type StepId = (typeof STEPS)[number]['id'];

export default function App() {
  const hydrate = useStore((s) => s.hydrate);
  const hydrated = useStore((s) => s.hydrated);
  const caseState = useStore((s) => s.caseState);
  const stale = useStore((s) => s.stale);
  const staleFields = useStore((s) => s.staleFields);
  const saving = useStore((s) => s.saving);
  const run = useStore((s) => s.run);
  const recalculate = useStore((s) => s.recalculate);
  const startNewCase = useStore((s) => s.startNewCase);
  const openCase = useStore((s) => s.openCase);
  const cases = useStore((s) => s.cases);
  const t = useT();

  const [step, setStep] = useState<StepId>('case');
  const [panelOpen, setPanelOpen] = useState(true);
  const [placing, setPlacing] = useState<'start' | 'line-end' | null>(null);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  /** Placing a pin only makes sense while the start point step is showing. */
  function goToStep(id: StepId): void {
    if (id !== 'start') setPlacing(null);
    setStep(id);
  }

  return (
    <div className="flex h-full flex-col bg-ocean-900">
      <header className="flex shrink-0 items-center gap-4 border-b border-white/10 bg-ocean-800 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <Compass />
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-white">NavSAR</h1>
            <p className="text-[10px] leading-tight text-ocean-100">{t('app.tagline')}</p>
          </div>
        </div>

        <div className="min-w-0 flex-1 truncate text-xs text-ocean-100">
          <span className="font-medium text-white">{caseState.name}</span>
          <span
            className="hidden xl:inline"
            title={
              run
                ? t('app.calculatedIn', { time: timestamp(run.at), ms: num(run.durationMs, 0) })
                : undefined
            }
          >
            <span className="mx-2 text-white/30">|</span>
            {saving ? t('app.saving') : t('app.savedAt', { time: timestamp(caseState.updatedAt) })}
            {run && !stale && (
              <>
                <span className="mx-2 text-white/30">|</span>
                <span className="tnum">
                  {t('app.calculatedIn', { time: timestamp(run.at), ms: num(run.durationMs, 0) })}
                </span>
              </>
            )}
          </span>
        </div>

        {stale && (
          <span
            className="rounded bg-flag-bg px-2 py-1 text-[10px] font-semibold tracking-wide text-flag uppercase"
            title={
              staleFields.length
                ? t('app.changedFields', { fields: staleFields.join(', ') })
                : undefined
            }
          >
            {run
              ? t(staleFields.length === 1 ? 'app.changesPending' : 'app.changesPending.plural', {
                  count: staleFields.length,
                })
              : t('app.notCalculated')}
          </span>
        )}

        <Button variant={stale ? 'primary' : 'secondary'} onClick={recalculate}>
          {t('app.recalculate')}
        </Button>

        <LanguageToggle />

        <select
          className="rounded-md border border-white/15 bg-white/10 px-2 py-1.5 text-xs text-white"
          value=""
          onChange={(e) => {
            if (e.target.value === '__new') startNewCase();
            else if (e.target.value) void openCase(e.target.value);
          }}
        >
          <option value="">{t('app.cases')}</option>
          <option value="__new">{t('app.newCase')}</option>
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </header>

      <div className="flex min-h-0 flex-1">
        {panelOpen && (
          <aside className="flex w-[420px] shrink-0 flex-col border-r border-white/10 bg-surface">
            <nav className="flex shrink-0 items-start gap-1 border-b border-surface-3 bg-surface-2 px-2 py-2">
              <div className="flex flex-1 flex-wrap gap-1">
                {STEPS.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => goToStep(s.id)}
                    className={`rounded px-2 py-1 text-[11px] font-medium transition ${
                      s.id === step
                        ? 'bg-ocean-800 text-white'
                        : 'text-ink-muted hover:bg-white hover:text-ocean-800'
                    }`}
                  >
                    <span className="tnum mr-1 opacity-60">{i + 1}</span>
                    {t(s.label)}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                title={t('app.hidePanelTitle')}
                className="shrink-0 rounded px-2 py-1 text-[11px] font-medium text-ink-muted hover:bg-white hover:text-ocean-800"
              >
                {t('app.hidePanel')}
              </button>
            </nav>

            <div className="panel-scroll min-h-0 flex-1 overflow-y-auto px-3 py-3">
              <h2 className="mb-3 text-base font-semibold text-ocean-900">
                {t(STEPS[stepIndex].title)}
              </h2>

              {step === 'case' && <CaseSetupPanel />}
              {step === 'start' && (
                <StartPointPanel placing={placing} onPlacingChange={setPlacing} />
              )}
              {step === 'environment' && <EnvironmentPanel />}
              {step === 'datum' && <DatumResultPanel />}
              {step === 'assets' && <AssetsPanel />}
              {step === 'area' && <SearchAreaPanel />}
              {step === 'export' && <ExportPanel />}

              <div className="mt-4 mb-2 flex items-center justify-between gap-2">
                <Button
                  disabled={stepIndex === 0}
                  onClick={() => goToStep(STEPS[Math.max(0, stepIndex - 1)].id)}
                >
                  {t('app.back')}
                </Button>
                <Button
                  variant="primary"
                  disabled={stepIndex === STEPS.length - 1}
                  onClick={() => goToStep(STEPS[Math.min(STEPS.length - 1, stepIndex + 1)].id)}
                >
                  {t('app.next', { step: t(STEPS[Math.min(STEPS.length - 1, stepIndex + 1)].label) })}
                </Button>
              </div>
            </div>
          </aside>
        )}

        <main className="relative min-w-0 flex-1">
          {!panelOpen && (
            <button
              type="button"
              onClick={() => setPanelOpen(true)}
              className="absolute top-3 left-3 z-[1000] rounded-md border border-white/10 bg-ocean-900/85 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur hover:bg-ocean-800"
            >
              {t('app.showPanel')}
            </button>
          )}
          {hydrated ? (
            <MapView placing={placing} onPlacingChange={setPlacing} />
          ) : (
            <div className="grid h-full place-items-center text-sm text-ocean-100">
              {t('app.restoring')}
            </div>
          )}
        </main>
      </div>

      <footer className="flex shrink-0 items-center gap-4 border-t border-white/10 bg-ocean-900 px-4 py-2 text-[12px] leading-snug">
        <span className="min-w-0 flex-1 text-ocean-100/45">{t('app.planningAidShort')}</span>
        <Attribution />
      </footer>
    </div>
  );
}

function Compass() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
      <circle cx="16" cy="16" r="14" fill="none" stroke="#2DD4BF" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="1.8" fill="#2DD4BF" />
      <path d="M16 4 L19 15 L16 16 L13 15 Z" fill="#38BDF8" />
      <path d="M16 28 L13 17 L16 16 L19 17 Z" fill="#ffffff" opacity="0.6" />
    </svg>
  );
}

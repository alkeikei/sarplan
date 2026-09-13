import { useStore } from '../../app/store';
import { useT } from '../../app/i18n';
import { Button } from '../ui/primitives';
import { HelpTip } from '../ui/HelpTip';

/**
 * PRD 6.8: results stay visibly flagged until the user recalculates. Amber,
 * not red, because a stale result is the expected state after any edit.
 */
export function StaleNotice() {
  const stale = useStore((s) => s.stale);
  const staleFields = useStore((s) => s.staleFields);
  const recalculate = useStore((s) => s.recalculate);
  const run = useStore((s) => s.run);
  const calcError = useStore((s) => s.calcError);
  const t = useT();

  if (calcError) {
    return (
      <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3">
        <p className="text-sm font-semibold text-red-800">{t('stale.failed')}</p>
        <p className="mt-1 text-xs text-red-700">{calcError}</p>
      </div>
    );
  }

  if (!stale) {
    if (!run) return null;
    return null;
  }

  return (
    <div className="mb-4 rounded-lg border border-flag-border bg-flag-bg p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-flag">
            {run ? t('stale.title') : t('stale.titleNever')}
            <HelpTip id="staleness" className="ml-1.5" />
          </p>
          <p className="mt-1 text-xs leading-snug text-flag">
            {run ? t('stale.body') : t('stale.bodyNever')}
          </p>
          {staleFields.length > 0 && (
            <p className="mt-1.5 text-[11px] leading-snug text-flag">
              {t('app.changedFields', { fields: staleFields.join(', ') })}
            </p>
          )}
        </div>
        <Button variant="primary" onClick={recalculate}>
          {t('app.recalculate')}
        </Button>
      </div>
    </div>
  );
}

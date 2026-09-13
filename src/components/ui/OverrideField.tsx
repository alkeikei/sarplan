/**
 * A numeric field backed by a table or formula, which the user can override.
 *
 * PRD 6.3 and 6.8: the value is tagged with where it came from, the input
 * itself is the edit affordance, and an override can always be reset back to
 * the source value.
 */

import type { HelpId } from '../../app/i18n';
import type { Resolved } from '../../app/selectors';
import { Field, FlagNote, NumberInput, SourceTag } from './primitives';

export function OverrideField({
  label,
  unit,
  hint,
  resolved,
  onOverride,
  onReset,
  step,
  min,
  max,
  displayDp = 3,
  hideSourceTag = false,
  help,
}: {
  label: string;
  unit?: string;
  hint?: string;
  resolved: Resolved;
  onOverride: (value: number) => void;
  onReset: () => void;
  step?: number;
  min?: number;
  max?: number;
  displayDp?: number;
  /** Suppress the per-field tag where one tag covers a whole group of fields. */
  hideSourceTag?: boolean;
  help?: HelpId;
}) {
  return (
    <div>
      <Field label={label} unit={unit} hint={hint} help={help}>
        <NumberInput
          value={resolved.value}
          onCommit={onOverride}
          step={step ?? 'any'}
          min={min}
          max={max}
        />
      </Field>
      {!hideSourceTag && (
        <SourceTag
          isAuto={resolved.isAuto}
          sourceLabel={resolved.sourceLabel}
          autoValue={formatAuto(resolved.autoValue, displayDp)}
          onReset={onReset}
        />
      )}
      {resolved.warning && <FlagNote>{resolved.warning}</FlagNote>}
    </div>
  );
}

function formatAuto(v: number, dp: number): string {
  return Number.isFinite(v) ? String(Number(v.toFixed(dp))) : '--';
}

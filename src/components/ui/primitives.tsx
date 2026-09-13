/**
 * Shared UI primitives.
 *
 * Two of these carry requirements rather than just style:
 *   SourceTag  every auto-filled field shows where the value came from and
 *              stays editable (PRD 6.3, 6.8)
 *   StaleBadge downstream results are visibly flagged when an upstream input
 *              has moved (PRD 6.8), in amber, because stale is expected and
 *              not an error
 */

import type { ReactNode } from 'react';
import { useState } from 'react';
import { useT, type HelpId } from '../../app/i18n';
import { HelpTip } from './HelpTip';

/**
 * A label with its "?" attached.
 *
 * The button flows inline so it follows the last word rather than floating
 * off to the side of a label that has wrapped. The last word and the button
 * are kept together in a nowrap span, otherwise a two-line label such as
 * "X, start point error" leaves the "?" stranded alone on the second line.
 */
function LabelWithHelp({
  label,
  help,
  className,
}: {
  label: string;
  help?: HelpId;
  className?: string;
}) {
  if (!help) return <span className={className}>{label}</span>;
  const split = label.lastIndexOf(' ');
  return (
    <span className={className}>
      {split === -1 ? null : label.slice(0, split + 1)}
      <span className="whitespace-nowrap">
        {split === -1 ? label : label.slice(split + 1)}
        <HelpTip id={help} className="ml-1" />
      </span>
    </span>
  );
}

export function Section({
  title,
  subtitle,
  children,
  right,
  help,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  right?: ReactNode;
  help?: HelpId;
}) {
  return (
    <section className="mb-5 rounded-lg border border-surface-3 bg-white/70 p-4">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-wide text-ocean-800 uppercase">
            <LabelWithHelp label={title} help={help} />
          </h3>
          {subtitle && <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>}
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </header>
      {children}
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
  unit,
  help,
}: {
  label: string;
  /** A string renders as a note; a node (a SourceTag, say) renders as-is. */
  hint?: ReactNode;
  unit?: string;
  children: ReactNode;
  help?: HelpId;
}) {
  return (
    /*
     * A grid of three rows - label, input, hint - subgridded onto the
     * enclosing Grid so that the inputs of a row line up even when one
     * label wraps to two lines and its neighbours do not. Laying each field
     * out independently leaves the boxes at different heights, which reads
     * as a broken form.
     *
     * gap-y-0 is required: a subgrid inherits its parent's gutters, so
     * without it the 12px column gap would also appear between the label and
     * its input. Every Field carries it, so the override stays uniform.
     *
     * Outside a Grid the subgrid has no parent tracks to adopt and the rows
     * fall back to auto, which lays out exactly as the old block did.
     */
    <label className="row-span-3 grid grid-rows-subgrid gap-y-0">
      <span className="flex items-baseline justify-between gap-2">
        <LabelWithHelp label={label} help={help} className="text-xs font-medium text-ink" />
        {unit && <span className="shrink-0 text-[11px] text-ink-muted">{unit}</span>}
      </span>
      <div className="mt-1">{children}</div>
      {typeof hint === 'string' ? (
        <p className="mt-1 text-[11px] leading-snug text-ink-muted">{hint}</p>
      ) : (
        hint
      )}
    </label>
  );
}

const inputClass =
  'w-full rounded-md border border-surface-3 bg-white px-2.5 py-1.5 text-sm text-ink tnum ' +
  'outline-none transition focus:border-accent-deep focus:ring-2 focus:ring-accent/40 ' +
  'disabled:bg-surface-2 disabled:text-ink-muted';

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ''}`} />;
}

/**
 * A numeric field.
 *
 * Deliberately a text input rather than type="number": Chrome renders a
 * number input's value in the operating system's locale, so 1.1 shows as
 * "1,1" next to a calculated "4.04" formatted by the app. A search planner
 * reading both in one glance should not have to reconcile two decimal marks.
 * Either separator is accepted on entry; the app always writes a full stop.
 *
 * Local text state keeps a half-typed value like "-" or "0." intact.
 */
export function NumberInput({
  value,
  onCommit,
  step,
  min,
  max,
  disabled,
  placeholder,
}: {
  value: number;
  onCommit: (value: number) => void;
  step?: number | 'any';
  min?: number;
  max?: number;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [text, setText] = useState(() => String(roundForDisplay(value)));
  const [focused, setFocused] = useState(false);
  const [lastValue, setLastValue] = useState(value);

  // The field follows the value while the user is not in it, so a
  // recalculation or a "reset to auto" shows through. Adjusting during render
  // rather than in an effect avoids a second render pass on every keystroke
  // elsewhere in the form.
  if (!focused && value !== lastValue) {
    setLastValue(value);
    setText(Number.isFinite(value) ? String(roundForDisplay(value)) : '');
  }

  const clamp = (n: number): number => {
    let out = n;
    if (min !== undefined) out = Math.max(min, out);
    if (max !== undefined) out = Math.min(max, out);
    return out;
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      className={inputClass}
      value={text}
      disabled={disabled}
      placeholder={placeholder}
      step={step}
      onFocus={() => setFocused(true)}
      onChange={(e) => {
        const raw = e.target.value;
        setText(raw);
        const parsed = Number.parseFloat(raw.replace(',', '.'));
        if (Number.isFinite(parsed)) onCommit(clamp(parsed));
      }}
      onBlur={() => {
        setFocused(false);
        const parsed = Number.parseFloat(text.replace(',', '.'));
        setText(String(roundForDisplay(Number.isFinite(parsed) ? clamp(parsed) : value)));
      }}
    />
  );
}

function roundForDisplay(v: number): number {
  return Math.abs(v) >= 1000 ? Math.round(v * 100) / 100 : Math.round(v * 1e6) / 1e6;
}

export function Select<T extends string>({
  value,
  onChange,
  options,
  disabled,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; group?: string }[];
  disabled?: boolean;
}) {
  const groups = new Map<string, typeof options>();
  for (const o of options) {
    const key = o.group ?? '';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(o);
  }
  return (
    <select
      className={inputClass}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as T)}
    >
      {[...groups.entries()].map(([group, items]) =>
        group ? (
          <optgroup key={group} label={group}>
            {items.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </optgroup>
        ) : (
          items.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))
        ),
      )}
    </select>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  help,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  help?: HelpId;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-surface-3 text-accent-deep accent-[#0e9384]"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <LabelWithHelp label={label} help={help} />
    </label>
  );
}

/** "Auto-filled from [source]", with the reset affordance when overridden. */
export function SourceTag({
  isAuto,
  sourceLabel,
  autoValue,
  onReset,
}: {
  isAuto: boolean;
  sourceLabel: string;
  autoValue?: string;
  onReset?: () => void;
}) {
  const t = useT();
  if (isAuto) {
    return (
      <span className="mt-1 inline-flex items-center gap-1 rounded bg-surface-2 px-1.5 py-0.5 text-[10px] leading-tight text-ink-muted">
        <svg viewBox="0 0 8 8" className="h-1.5 w-1.5 fill-accent-deep" aria-hidden>
          <circle cx="4" cy="4" r="4" />
        </svg>
        {t('ui.autoFilledFrom', { source: sourceLabel })}
      </span>
    );
  }
  return (
    <span className="mt-1 inline-flex flex-wrap items-center gap-1 text-[10px] leading-tight">
      <span className="rounded bg-ocean-100 px-1.5 py-0.5 font-medium text-ocean-800">
        {t('ui.manualOverride')}
      </span>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="rounded px-1 py-0.5 text-ocean-700 underline decoration-dotted underline-offset-2 hover:bg-surface-2"
        >
          {autoValue ? t('ui.resetToAutoValue', { value: autoValue }) : t('ui.resetToAuto')}
        </button>
      )}
    </span>
  );
}

/** Amber, calm: a flagged value is expected, not an error. */
export function FlagNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1 flex gap-1.5 rounded border border-flag-border bg-flag-bg px-2 py-1 text-[11px] leading-snug text-flag">
      <span aria-hidden>▲</span>
      <span>{children}</span>
    </p>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1 rounded border border-red-300 bg-red-50 px-2 py-1 text-[11px] leading-snug text-red-700">
      {children}
    </p>
  );
}

export function StaleBadge({ label }: { label?: string }) {
  const t = useT();
  return (
    <span className="inline-flex items-center gap-1 rounded bg-flag-bg px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-flag uppercase">
      {label ?? t('ui.stale')}
    </span>
  );
}

/** A calculated value, sized to be read at a glance. */
export function Metric({
  label,
  value,
  unit,
  sub,
  stale,
  emphasis = false,
  size = 'normal',
  help,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  stale?: boolean;
  emphasis?: boolean;
  /** 'compact' for long strings such as a lat/long, which must not wrap mid-figure. */
  size?: 'normal' | 'compact';
  help?: HelpId;
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        stale ? 'border-flag-border bg-flag-bg/40' : 'border-surface-3 bg-white'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <LabelWithHelp
          label={label}
          help={help}
          className="text-[11px] font-medium tracking-wide text-ink-muted uppercase"
        />
        {stale && <StaleBadge />}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span
          className={`tnum font-semibold text-ocean-900 ${
            size === 'compact' ? 'text-base' : emphasis ? 'text-3xl' : 'text-2xl'
          }`}
        >
          {value}
        </span>
        {unit && <span className="text-xs font-medium text-ink-muted">{unit}</span>}
      </div>
      {sub && <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">{sub}</p>}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = 'secondary',
  disabled,
  type = 'button',
  title,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  type?: 'button' | 'submit';
  title?: string;
  className?: string;
}) {
  const base =
    'inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50';
  const variants = {
    primary: 'bg-accent text-ocean-900 hover:bg-accent-2 shadow-sm',
    secondary: 'border border-surface-3 bg-white text-ocean-800 hover:bg-surface-2',
    ghost: 'text-ocean-100 hover:bg-white/10',
    danger: 'border border-red-300 bg-white text-red-700 hover:bg-red-50',
  } as const;
  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Grid({ cols = 2, children }: { cols?: 1 | 2 | 3; children: ReactNode }) {
  // A single column is a stack, not a grid. Kept out of the grid so that
  // Field's subgrid stays inert here: with nothing to line up sideways, its
  // empty hint row would only add a second gap between stacked fields.
  if (cols === 1) return <div className="flex flex-col gap-3">{children}</div>;
  return (
    <div className={`grid ${cols === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-3`}>{children}</div>
  );
}

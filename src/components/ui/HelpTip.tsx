/**
 * The "?" beside a field label or a result.
 *
 * The app is used by trained SAR coordinators and by people who have never
 * planned a search, so every input and every calculated value carries one of
 * these. Content lives in src/app/help.ts; this file is only the behaviour.
 *
 * Three things it has to get right:
 *
 *  - It must escape the side panel. The panel scrolls and clips, so the
 *    popover is rendered into a portal on document.body and positioned in
 *    viewport coordinates, flipping above the button when there is no room
 *    below and clamping to the window edges.
 *
 *  - It must work without a mouse. Hover opens it; so does keyboard focus.
 *    Clicking pins it open, which is also what a touch tap does, so a phone
 *    or tablet user is not locked out of a hover-only affordance. Escape
 *    closes it, and a click anywhere else closes a pinned one.
 *
 *  - It must not act as the field label. Field wraps its contents in a
 *    <label>, and a click inside a label is forwarded to the labelled input,
 *    which would drag focus into the box every time someone asked for help.
 *    The click handler stops that.
 */

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useT, type HelpId } from '../../app/i18n';

const PANEL_WIDTH = 300;
const VIEWPORT_MARGIN = 8;
const GAP = 6;
const OPEN_DELAY_MS = 90;
const CLOSE_DELAY_MS = 140;

interface Placement {
  top: number;
  left: number;
  /** Which way the panel grows, so the caret sits on the right edge. */
  above: boolean;
}

export function HelpTip({
  id,
  className = '',
  tone = 'light',
}: {
  id: HelpId;
  className?: string;
  /** 'dark' for the map legend, which sits on the deep ocean blue shell. */
  tone?: 'light' | 'dark';
}) {
  const t = useT();
  const entry = t.help(id);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const panelId = useId();

  const cancelTimer = () => {
    if (timer.current !== undefined) window.clearTimeout(timer.current);
    timer.current = undefined;
  };

  const openNow = useCallback(() => {
    cancelTimer();
    setOpen(true);
  }, []);

  const closeNow = useCallback(() => {
    cancelTimer();
    setOpen(false);
    setPinned(false);
  }, []);

  const openSoon = () => {
    cancelTimer();
    timer.current = window.setTimeout(() => setOpen(true), OPEN_DELAY_MS);
  };

  const closeSoon = () => {
    if (pinned) return;
    cancelTimer();
    timer.current = window.setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  };

  useEffect(() => cancelTimer, []);

  const reposition = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;
    const r = button.getBoundingClientRect();
    const height = panelRef.current?.offsetHeight ?? 0;
    const width = Math.min(PANEL_WIDTH, window.innerWidth - 2 * VIEWPORT_MARGIN);

    // Below by default; above when the panel would run off the bottom and
    // there is more room up there.
    const roomBelow = window.innerHeight - r.bottom - GAP - VIEWPORT_MARGIN;
    const roomAbove = r.top - GAP - VIEWPORT_MARGIN;
    const above = height > roomBelow && roomAbove > roomBelow;

    // Right-aligned to the button, which keeps the panel inside the side
    // panel rather than hanging over the map, then clamped to the window.
    const rawLeft = r.right - width;
    const left = Math.min(
      Math.max(VIEWPORT_MARGIN, rawLeft),
      window.innerWidth - width - VIEWPORT_MARGIN,
    );
    const top = above ? Math.max(VIEWPORT_MARGIN, r.top - GAP - height) : r.bottom + GAP;

    setPlacement({ top, left, above });
  }, []);

  // Measured after the panel is in the DOM, because the flip decision needs
  // its real height, and before paint, so the flip never flickers. Scrolling
  // the side panel moves the button under it, so the position is recomputed
  // rather than the popover being left behind. A placement left over from the
  // previous open is harmless: this runs before the browser paints it.
  useLayoutEffect(() => {
    if (!open) return;
    reposition();
    const onScroll = () => reposition();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open, reposition]);

  // Scrolling the side panel far enough clips the button away, and a popover
  // anchored to something no longer on screen ends up floating over the
  // header. Intersection against the viewport accounts for the clipping done
  // by the panel, which a plain scroll handler would not see.
  useEffect(() => {
    const button = buttonRef.current;
    if (!open || !button) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) closeNow();
      },
      { threshold: 0 },
    );
    observer.observe(button);
    return () => observer.disconnect();
  }, [open, closeNow]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      closeNow();
      buttonRef.current?.focus();
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      closeNow();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown, true);
    };
  }, [open, closeNow]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={t('ui.helpAria', { title: entry.title })}
        aria-expanded={open}
        aria-describedby={open ? panelId : undefined}
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') openSoon();
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse') closeSoon();
        }}
        onFocus={openNow}
        onBlur={() => {
          if (!pinned) closeNow();
        }}
        onClick={(e) => {
          // Field's <label> would otherwise forward this to the input.
          e.preventDefault();
          e.stopPropagation();
          if (pinned) {
            closeNow();
          } else {
            setPinned(true);
            openNow();
          }
        }}
        className={
          // align-[-2px] lets it sit on the text baseline, so it can follow the
          // last word of a label that has wrapped rather than float beside it.
          'inline-grid h-[15px] w-[15px] shrink-0 cursor-help place-items-center rounded-full ' +
          'align-[-2px] ' +
          'border text-[10px] leading-none font-semibold transition ' +
          'focus:ring-2 focus:ring-accent/50 focus:outline-none ' +
          (open
            ? 'border-accent-deep bg-accent-deep text-white'
            : tone === 'dark'
              ? 'border-white/30 bg-white/10 text-ocean-100 hover:border-accent hover:text-accent'
              : 'border-surface-3 bg-white text-ink-muted hover:border-accent-deep hover:text-accent-deep') +
          (className ? ` ${className}` : '')
        }
      >
        ?
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            role="tooltip"
            onPointerEnter={cancelTimer}
            onPointerLeave={closeSoon}
            style={{
              position: 'fixed',
              top: placement?.top ?? -9999,
              left: placement?.left ?? -9999,
              width: Math.min(PANEL_WIDTH, window.innerWidth - 2 * VIEWPORT_MARGIN),
              // Measured before it is shown, so the flip does not flicker.
              visibility: placement ? 'visible' : 'hidden',
            }}
            className="z-[3000] rounded-lg border border-surface-3 bg-white p-3 text-left shadow-xl shadow-ocean-900/20"
          >
            <p className="text-[12px] font-semibold text-ocean-900">{entry.title}</p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-ink">{entry.what}</p>

            {entry.formula && (
              <p className="tnum mt-2 rounded border border-surface-3 bg-surface-2 px-2 py-1 text-[11px] leading-snug break-words text-ocean-800">
                {entry.formula}
              </p>
            )}

            {entry.entering && (
              <p className="mt-2 text-[11px] leading-relaxed text-ink-muted">
                <span className="font-semibold text-ocean-800">{t('ui.helpWhatToDo')} </span>
                {entry.entering}
              </p>
            )}

            {entry.source && (
              <p className="mt-2 text-[10.5px] leading-snug text-ink-muted italic">
                {t('ui.helpSource', { source: entry.source })}
              </p>
            )}

            {pinned && (
              <p className="mt-2 text-[10px] text-ink-muted">{t('ui.helpDismiss')}</p>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}

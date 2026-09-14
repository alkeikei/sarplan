/**
 * The translator, and the store that holds the chosen language.
 *
 * The language is a user preference rather than part of a case, so it lives
 * in localStorage and not in the IndexedDB case record: a case exported by an
 * Indonesian coordinator and reopened by an English one should read in the
 * reader's language, not the author's. localStorage also reads synchronously,
 * so the first paint is already in the right language instead of flashing
 * English.
 */

import { useSyncExternalStore } from 'react';
import { en, type TextKey } from './en';
import { id } from './id';
import { DATA_ID } from './data';
import { HELP_EN, type HelpEntry, type HelpId } from './help.en';
import { HELP_ID } from './help.id';
import { LANGUAGES, type Lang, type Params } from './types';

export { LANGUAGES };
export * from './enums';
export type { Lang, TextKey, HelpEntry, HelpId, Params };

export interface Translator {
  /** Look up a UI string, substituting any {placeholders}. */
  (key: TextKey, params?: Params): string;
  lang: Lang;
  /** The help entry behind a "?" button. */
  help: (id: HelpId) => HelpEntry;
  /**
   * A label that originates in the engine's reference tables, keyed by its
   * English original. Falls back to the English when untranslated, so a gap
   * shows the source manual's own wording rather than nothing.
   */
  data: (english: string) => string;
}

const STORAGE_KEY = 'navsar.lang';
/** The pre-rename key. Read once so a returning user keeps their language. */
const LEGACY_STORAGE_KEY = 'sarplan.lang';

function interpolate(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in params ? String(params[name]) : whole,
  );
}

/**
 * `as const satisfies` is what makes HelpId a closed union, so a typo in a
 * help="..." prop is a compile error. The cost is that HELP_EN's value type is
 * the union of the literal objects, and an entry without a `formula` has no
 * `formula` property to read. Widening here restores the optional fields
 * without giving up the checked ids.
 */
const helpEn = (key: HelpId): HelpEntry => HELP_EN[key];

const TRANSLATORS: Record<Lang, Translator> = {
  en: build('en'),
  id: build('id'),
};

function build(lang: Lang): Translator {
  const dict: Record<TextKey, string> = lang === 'id' ? id : en;
  const t = ((key: TextKey, params?: Params) =>
    interpolate(dict[key] ?? en[key] ?? key, params)) as Translator;
  t.lang = lang;
  t.help = lang === 'id' ? (key) => HELP_ID[key] : helpEn;
  t.data = lang === 'id' ? (english) => DATA_ID[english] ?? english : (english) => english;
  return t;
}

export const translator = (lang: Lang): Translator => TRANSLATORS[lang];

// --- the store -------------------------------------------------------------

function read(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (stored === 'en' || stored === 'id') {
      localStorage.setItem(STORAGE_KEY, stored);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return stored;
    }
  } catch {
    // Private browsing or blocked storage: fall through to the default.
  }
  // No stored choice: follow the browser, since an Indonesian crew's devices
  // are configured in Indonesian.
  return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('id')
    ? 'id'
    : 'en';
}

let current: Lang = read();
const listeners = new Set<() => void>();

export function setLang(next: Lang): void {
  if (next === current) return;
  current = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // The choice still applies for this session even if it cannot be stored.
  }
  document.documentElement.lang = next;
  for (const listener of listeners) listener();
}

export function getLang(): Lang {
  return current;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The current language, re-rendering the component when it changes. */
export function useLang(): Lang {
  return useSyncExternalStore(subscribe, getLang, getLang);
}

/** The translator for the current language. */
export function useT(): Translator {
  return translator(useLang());
}

// The document language is what a screen reader uses to pick a voice, and it
// has to be right from the first paint, not only after the first toggle.
if (typeof document !== 'undefined') document.documentElement.lang = current;

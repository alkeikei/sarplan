/**
 * EN / ID switch in the header.
 *
 * A two-item segmented control rather than a dropdown: with only two
 * languages it shows the alternative without being opened, which matters for
 * someone who has landed in a language they cannot read and needs to find the
 * way out of it. Each option is labelled in its own language for the same
 * reason - "Bahasa Indonesia", never "Indonesian".
 */

import { LANGUAGES, setLang, useLang, useT } from '../../app/i18n';

export function LanguageToggle() {
  const lang = useLang();
  const t = useT();

  return (
    <div
      className="flex shrink-0 items-center gap-0.5 rounded-md border border-white/15 bg-white/10 p-0.5"
      role="group"
      aria-label={t('app.language')}
    >
      {LANGUAGES.map((option) => (
        <button
          key={option.code}
          type="button"
          lang={option.code}
          title={option.label}
          aria-pressed={lang === option.code}
          onClick={() => setLang(option.code)}
          className={`rounded px-1.5 py-1 text-[11px] font-semibold transition ${
            lang === option.code
              ? 'bg-accent text-ocean-900'
              : 'text-ocean-100 hover:bg-white/15 hover:text-white'
          }`}
        >
          {option.short}
        </button>
      ))}
    </div>
  );
}

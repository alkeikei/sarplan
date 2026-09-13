/**
 * Who built this, and where to find them.
 *
 * Sits in the app footer beside the planning-aid note: present on every screen
 * but quiet, so it never competes with the operational text next to it. The
 * marks are inline SVG rather than an icon font or a CDN sprite, because the
 * app is meant to run with no network beyond the two data fetches.
 */

import {
  AUTHOR_INSTAGRAM as INSTAGRAM,
  AUTHOR_LINKEDIN as LINKEDIN,
  AUTHOR_NAME as AUTHOR,
} from '../../app/author';
import { useT } from '../../app/i18n';

const linkClass =
  'inline-grid h-5 w-5 place-items-center rounded text-ocean-100/75 transition ' +
  'hover:text-white focus:text-white focus:ring-2 focus:ring-accent/50 focus:outline-none';

function InstagramMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="4.3" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.6" cy="6.4" r="1.4" fill="currentColor" />
    </svg>
  );
}

function LinkedInMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      <path
        fill="currentColor"
        d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"
      />
    </svg>
  );
}

export function Attribution() {
  const t = useT();
  return (
    <span className="flex shrink-0 items-center gap-2 text-[12px] text-ocean-100/70">
      <span className="whitespace-nowrap">
        {t('app.developedBy')}{' '}
        <span className="font-semibold text-white/95">{AUTHOR}</span>
      </span>
      <a
        href={INSTAGRAM}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        title={`Instagram — ${AUTHOR}`}
        aria-label={`Instagram, ${AUTHOR}`}
      >
        <InstagramMark />
      </a>
      <a
        href={LINKEDIN}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        title={`LinkedIn — ${AUTHOR}`}
        aria-label={`LinkedIn, ${AUTHOR}`}
      >
        <LinkedInMark />
      </a>
    </span>
  );
}

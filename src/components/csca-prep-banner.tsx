'use client';

import { useState, useEffect } from 'react';
import { X, BookOpen, ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { track } from '@/lib/analytics';

/**
 * CscaPrepBanner — site-wide top promo bar for the free CSCA
 * preparation site (cscaprep.academy). Rendered in flow above
 * the <Header /> inside ClientLayout, so it appears on every
 * public page (home, university details, programs, the CSCA
 * guide cluster, ...) and scrolls away naturally while the
 * header stays sticky. The /admin, /partner and /student
 * portals never see it (ClientLayout's pathname gate).
 *
 * Behaviour:
 *   - Server-rendered visible so the markup ships in the HTML.
 *   - Close (X) hides the bar for the rest of the browser
 *     session (sessionStorage, one global key — this is a
 *     campaign banner, not a per-entity widget). Re-appears on
 *     a fresh session.
 *   - CTA links out with UTMs so cscaprep.academy's own
 *     analytics can attribute the traffic; fires
 *     `csca_banner_click` on the link and `csca_banner_dismiss`
 *     on the X.
 *
 * Styling: deep crimson band, white text, sharp corners
 * (rounded-none per DESIGN.md), uppercase tracking-wider CTA
 * text. Inner container mirrors the header's max-w-7xl so the
 * two align when stacked.
 */
const CSCA_PREP_URL =
  'https://cscaprep.academy?utm_source=sica&utm_medium=site_banner&utm_campaign=csca_prep';
const DISMISS_KEY = 'sica_csca_banner_dismissed';

export function CscaPrepBanner() {
  const { t, locale } = useI18n();
  const [dismissed, setDismissed] = useState(false);

  // SSR-safe: the dismissal flag is read once on mount, so a
  // user who closed the banner earlier this session doesn't
  // see it flash back in.
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(DISMISS_KEY) === '1') {
        setDismissed(true);
      }
    } catch {
      // sessionStorage unavailable (private mode, etc.) —
      // just show the banner; user can still close it for
      // the current page view.
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    track('csca_banner_dismiss', { location: 'top_banner', locale });
    try {
      window.sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // Same sessionStorage fallback as above.
    }
  };

  if (dismissed) return null;

  return (
    <div
      role="region"
      aria-label={t('cscaBanner.ariaLabel')}
      data-testid="csca-prep-banner"
      className="bg-[#9B1B30] text-white"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 sm:py-2.5 lg:px-8">
        {/* Icon + copy. Sub-line is desktop-only — the bar stays
            one tight line on mobile. */}
        <BookOpen className="h-4 w-4 shrink-0 text-white" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold leading-tight text-white">
            {t('cscaBanner.label')}
            <span className="ml-2 hidden text-xs font-normal text-white/80 md:inline">
              {t('cscaBanner.description')}
            </span>
          </p>
        </div>

        {/* CTA — links out to the free CSCA prep site. Always
            visible, compact on mobile. */}
        <a
          href={CSCA_PREP_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            track('csca_banner_click', { location: 'top_banner', locale });
          }}
          className="flex shrink-0 items-center gap-1 border border-white/60 bg-white/10 px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white hover:text-[#9B1B30] sm:px-4"
        >
          <span className="hidden sm:inline">{t('cscaBanner.cta')}</span>
          <span className="sm:hidden">CSCA</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>

        {/* Close X — hides for the rest of the session. */}
        <button
          onClick={handleDismiss}
          aria-label={t('cscaBanner.dismissLabel')}
          className="flex h-7 w-7 shrink-0 items-center justify-center text-white/70 transition-colors hover:bg-white/10 hover:text-white rounded-none"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

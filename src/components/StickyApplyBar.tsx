'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, MessageCircle, ArrowRight, BookOpen } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { track } from '@/lib/analytics';

/**
 * StickyApplyBar — fixed-bottom "Apply to this university"
 * bar that appears once the user has scrolled past the
 * hero on long pages. Lifts conversion on browse pages
 * where the primary CTA is otherwise lost above the fold
 * once the user scrolls.
 *
 * Behaviour:
 *   - Hidden on mount; appears once scrollY > SCROLL_THRESHOLD
 *     (50% of viewport height, min 400px).
 *   - Slide animation via `translate-y-full` <-> `translate-y-0`
 *     so the entrance feels intentional, not janky.
 *   - Close (X) button hides the bar for the rest of the
 *     session for this specific university (sessionStorage,
 *     keyed by slug so a different universidad on a different
 *     tab still shows its own bar). Re-appears on a fresh
 *     tab / hard refresh.
 *   - On mobile: full-width bar. On desktop: max-w-3xl
 *     container, elevated with a shadow so it sits "above"
 *     the page content.
 *
 * Props: `universityName` and `universitySlug` are passed
 * in by the page so the bar can label itself ("Apply to
 * Tsinghua University") and route the WhatsApp + Apply
 * buttons with the right context.
 */
const WHATSAPP_PHONE = '8617325764171';
const SCROLL_THRESHOLD_DIVISOR = 2; // appear at 50% viewport
const SCROLL_THRESHOLD_MIN = 400;    // ...or 400px, whichever is greater

interface StickyApplyBarProps {
  universityName: string;
  universitySlug: string;
}

export function StickyApplyBar({ universityName, universitySlug }: StickyApplyBarProps) {
  const { t, locale } = useI18n();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // SSR-safe: the dismissal flag is read once on mount. The
  // scroll listener runs only on the client (typeof window
  // check is implicit — the useEffect body never runs on
  // the server).
  useEffect(() => {
    const storageKey = `sica_sticky_apply_dismissed_${universitySlug}`;
    try {
      if (window.sessionStorage.getItem(storageKey) === '1') {
        setDismissed(true);
      }
    } catch {
      // sessionStorage unavailable (private mode, etc.) —
      // just show the bar; user can still close it for the
      // current page view.
    }
  }, [universitySlug]);

  // Scroll listener. Passive: true so the scroll handler
  // doesn't block the main thread. We threshold on a
  // viewport-fraction OR a minimum pixel count so the bar
  // doesn't appear on a tall-screen user with a 1080p
  // viewport after 1px of scroll, but also doesn't take
  // forever to appear on a short-screen mobile user. Hidden
  // when dismissed (state or sessionStorage).
  useEffect(() => {
    if (dismissed) return;
    const onScroll = () => {
      const threshold = Math.max(
        window.innerHeight / SCROLL_THRESHOLD_DIVISOR,
        SCROLL_THRESHOLD_MIN,
      );
      setVisible(window.scrollY > threshold);
    };
    // Run once on mount so the bar is in the right state if
    // the user reloads mid-page (browser preserves scrollY).
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
    try {
      window.sessionStorage.setItem(
        `sica_sticky_apply_dismissed_${universitySlug}`,
        '1',
      );
    } catch {
      // Same sessionStorage fallback as above.
    }
  };

  const whatsappContext = `Hi SICA, I'd like to apply to ${universityName}. Can you help me?`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(whatsappContext)}`;
  // Apply — the deep-commit CTA. Routes to /assessment (the
  // structured 4-step intake) with ?interest=<slug> so the
  // assessment form's thank-you redirect can still surface the
  // "you were looking at this" personalized card. ?interestName
  // is the human-readable university name (Phase 1 fix) so the
  // thank-you page can show "Tsinghua University" instead of
  // the raw "tsinghua-university" slug. The softer /contact path
  // lives in the right-rail "Or talk to a counselor" link on
  // the university detail page.
  const applyUrl = `/assessment?interest=${encodeURIComponent(universitySlug)}&interestName=${encodeURIComponent(universityName)}`;

  // If the user already dismissed, render nothing. The slide
  // animation is driven by the `visible` class — when false,
  // translate-y-full + opacity-0 + pointer-events-none keep
  // it visually hidden but in the DOM for the transition.
  if (dismissed) return null;

  return (
    <div
      role="region"
      aria-label={t('stickyApply.ariaLabel')}
      data-testid="sticky-apply-bar"
      className={`
        fixed inset-x-0 bottom-0 z-40
        transition-transform duration-300 ease-out
        ${visible ? 'translate-y-0' : 'translate-y-full pointer-events-none'}
      `}
    >
      <div className="mx-auto max-w-3xl px-3 sm:px-4 pb-3 sm:pb-4">
        <div className="bg-[#1B2A4A] text-white shadow-2xl border-t-4 border-[#9B1B30] flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3">
          {/* Close X — left side so the right side stays
              dedicated to the action buttons. Smaller
              affordance on mobile (h-7), more clickable on
              desktop (h-9). aria-label is set so screen
              readers get a clear "dismiss" cue. */}
          <button
            onClick={handleDismiss}
            aria-label={t('stickyApply.dismissLabel')}
            className="flex-shrink-0 h-7 w-7 sm:h-9 sm:w-9 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors rounded-none"
            type="button"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          {/* University name — hidden on very small screens
              (the bar is tight), shown on sm+. Truncate so a
              long school name doesn't push the buttons off
              the right edge. */}
          <div className="flex-1 min-w-0 hidden sm:block">
            <p className="text-[10px] uppercase tracking-wider text-white/60 leading-none mb-1">
              {t('stickyApply.applyingTo')}
            </p>
            <p className="text-sm font-semibold text-white truncate leading-none">
              {universityName}
            </p>
          </div>

          {/* WhatsApp — secondary action. Pre-fills a
              context-aware message so the counselor knows
              which school the lead is asking about. */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              track('whatsapp_click', {
                location: 'sticky_bar',
                locale,
                slug: universitySlug,
              });
            }}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 sm:px-4 h-9 sm:h-10 bg-[#25D366] hover:bg-[#1DAB56] text-white text-xs sm:text-sm font-semibold transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">{t('stickyApply.whatsapp')}</span>
          </a>

          {/* Phase 2: DIY escape hatch. The bar previously had
              2 actions (WhatsApp + Apply), both hard-selling the
              full-service product. A Whop-shopper on a university
              page had no in-bar path to "do it myself". Now there's
              a 3rd action — a text-link "DIY →" — that routes to
              /resources?university=<slug> so the Whop community
              landing gets the context. The visual is intentionally
              low-affordance (text link, no background) so the
              primary CTA stays the crimson Apply. Same dismiss
              logic as the rest of the bar. */}
          <Link
            href={`/resources?university=${encodeURIComponent(universitySlug)}`}
            onClick={() => {
              track('apply_click', {
                location: 'sticky_bar_diy',
                locale,
                slug: universitySlug,
              });
            }}
            className="flex-shrink-0 hidden sm:flex items-center gap-1 px-2 h-9 sm:h-10 text-white/80 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <BookOpen className="h-3.5 w-3.5" />
            {t('product.selfServe.ctaLabel')}
          </Link>

          {/* Apply — primary action. Routes to /assessment
              (the deep-commit 4-step intake) with
              ?interest=<slug> so the thank-you page can
              surface the "you were looking at this" card.
              The /contact path lives in the right-rail
              "Or talk to a counselor" link instead. */}
          <Link
            href={applyUrl}
            onClick={() => {
              track('apply_click', {
                location: 'sticky_bar',
                locale,
                slug: universitySlug,
              });
            }}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 sm:px-5 h-9 sm:h-10 bg-[#9B1B30] hover:bg-[#7A1526] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors"
          >
            {t('stickyApply.apply')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

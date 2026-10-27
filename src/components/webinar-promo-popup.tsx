'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { X, Megaphone, Calendar, Bell, Clock } from 'lucide-react';
import { track } from '@/lib/analytics';
import { useI18n } from '@/lib/i18n';
import {
  PUBLIC_WEBINAR_ENABLED,
  WEBINAR_CONFIG,
  formatWebinarDate,
  isWebinarSessionUpcoming,
} from '@/lib/webinar-config';

/**
 * sessionStorage key for "the visitor closed the webinar promo".
 * Exported so the WhatsApp-group popup can tell whether the promo
 * still owns the screen on the current page.
 */
export const WEBINAR_PROMO_DISMISS_KEY = 'sica_webinar_promo_dismissed';

/** Short delay so the page settles, then the card slides in. */
const REVEAL_DELAY_MS = 1200;

/**
 * Visitor-facing promo popup for the current webinar session.
 *
 * Shows when `PUBLIC_WEBINAR_ENABLED` and the path is public:
 *   - Active branch when `sessionDateIso` is still in the future
 *   - Teaser branch when the date has passed (or is invalid)
 *   - Denylist path filter (portals / webinar landing / thank-you / api)
 *   - sessionStorage dismiss for the rest of the tab session
 *
 * Anchored below the header (top) on every breakpoint so it stays
 * visible above sticky apply bars / chat / WhatsApp floats.
 */
export function WebinarPromoPopup() {
  const { t, locale } = useI18n();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [revealed, setRevealed] = useState(false);
  // Capture once — never Date.now() in render (Phase 161 lint).
  const [nowMs] = useState(() => Date.now());
  const firedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      setDismissed(
        window.sessionStorage.getItem(WEBINAR_PROMO_DISMISS_KEY) === '1',
      );
    } catch {
      // sessionStorage unavailable — show the popup.
    }
    setMounted(true);
  }, []);

  const hasActiveSession = isWebinarSessionUpcoming(
    WEBINAR_CONFIG.sessionDateIso,
    nowMs,
  );
  const canShow =
    PUBLIC_WEBINAR_ENABLED && mounted && !dismissed && isOnPublicPath(pathname);

  useEffect(() => {
    if (!canShow) {
      setRevealed(false);
      return;
    }
    const timer = window.setTimeout(() => setRevealed(true), REVEAL_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [canShow]);

  useEffect(() => {
    if (!canShow || !revealed) return;
    if (firedRef.current) return;
    firedRef.current = true;
    if (hasActiveSession) {
      track('webinar_popup_view', { locale, path: pathname ?? '' });
    } else {
      track('webinar_popup_view_teaser', { locale, path: pathname ?? '' });
    }
  }, [canShow, revealed, hasActiveSession, pathname, locale]);

  if (!canShow) return null;

  const dismiss = (source: 'close_button' | 'cta_click') => {
    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(WEBINAR_PROMO_DISMISS_KEY, '1');
      }
    } catch {
      /* best effort */
    }
    setDismissed(true);
    track('webinar_popup_dismiss', { source, locale, path: pathname ?? '' });
  };

  const handleCta = () => {
    if (hasActiveSession) {
      track('webinar_popup_click', { locale, path: pathname ?? '' });
    } else {
      track('webinar_popup_click_register', { locale, path: pathname ?? '' });
    }
    dismiss('cta_click');
  };

  const dateLabel = formatWebinarDate(WEBINAR_CONFIG.sessionDateIso);
  const timeLabel = WEBINAR_CONFIG.sessionTimeDisplay;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={t('webinar.popupAriaLabel')}
      className={`fixed z-50 w-[calc(100vw-2rem)] max-w-md bg-white border-2 border-[#D4A853] shadow-[0_12px_40px_rgba(27,42,74,0.18)] p-4 sm:p-5 flex items-start gap-3 left-1/2 -translate-x-1/2 top-20 sm:top-24 transition-all duration-500 ease-out ${
        revealed
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-3 pointer-events-none'
      }`}
    >
      <div className="flex-shrink-0 h-10 w-10 bg-[#9B1B30] text-white flex items-center justify-center">
        <Megaphone className="h-5 w-5" aria-hidden />
      </div>
      <div className="flex-1 min-w-0">
        {hasActiveSession ? (
          <>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9B1B30]">
              {t('webinar.popupEyebrow')}
            </p>
            <h3 className="text-base font-bold text-[#1B2A4A] leading-tight mt-1">
              {t('webinar.popupTitle')}
            </h3>
            {(dateLabel || timeLabel) && (
              <div className="mt-2 inline-flex flex-wrap items-center gap-x-2 gap-y-1 bg-[#FAF6E8] border border-[#D4A853]/50 px-2.5 py-1 text-[11px] font-semibold text-[#1B2A4A]">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-[#9B1B30]" aria-hidden />
                  {dateLabel}
                </span>
                {timeLabel && (
                  <>
                    <span className="text-[#D4A853]">·</span>
                    <span className="inline-flex items-center gap-1 font-normal text-[#4B5563]">
                      <Clock className="h-3 w-3 text-[#9B1B30]" aria-hidden />
                      {timeLabel}
                    </span>
                  </>
                )}
              </div>
            )}
            <p className="text-xs text-[#4B5563] mt-2 leading-relaxed">
              {t('webinar.popupBody')}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Link
                href="/webinar-2027-intake-csc#signup"
                onClick={handleCta}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#9B1B30] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#7A1526] transition-colors"
              >
                <Calendar className="h-3.5 w-3.5" aria-hidden />
                {t('webinar.popupCta')}
              </Link>
              <button
                type="button"
                onClick={() => dismiss('close_button')}
                className="text-xs text-[#4B5563] hover:text-[#1B2A4A] font-medium px-2 py-2"
              >
                {t('webinar.popupDismiss')}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9B1B30]">
              {t('webinar.popupTeaserEyebrow')}
            </p>
            <h3 className="text-base font-bold text-[#1B2A4A] leading-tight mt-1">
              {t('webinar.popupTeaserTitle')}
            </h3>
            <p className="text-xs text-[#4B5563] mt-2 leading-relaxed">
              {t('webinar.popupTeaserBody')}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Link
                href="/webinar-2027-intake-csc#signup"
                onClick={handleCta}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#9B1B30] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#7A1526] transition-colors"
              >
                <Bell className="h-3.5 w-3.5" aria-hidden />
                {t('webinar.popupTeaserCta')}
              </Link>
              <button
                type="button"
                onClick={() => dismiss('close_button')}
                className="text-xs text-[#4B5563] hover:text-[#1B2A4A] font-medium px-2 py-2"
              >
                {t('webinar.popupDismiss')}
              </button>
            </div>
          </>
        )}
      </div>
      <button
        type="button"
        aria-label={t('webinar.popupDismiss')}
        onClick={() => dismiss('close_button')}
        className="flex-shrink-0 text-gray-400 hover:text-[#1B2A4A] -mt-1 -mr-1 p-1.5"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * Denylist path filter — true when the popup may render.
 * Portals are also gated by ClientLayout; webinar landing +
 * thank-you are excluded so we don't distract on conversion.
 *
 * The conversion pages (counselling, contact, apply, assessment,
 * get-started) are excluded too: their whole job is the signup /
 * booking, and a promo card on top of the hero or the submit
 * button costs more than the click it wins.
 */
export function isOnPublicPath(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname.startsWith('/admin')) return false;
  if (pathname.startsWith('/partner')) return false;
  if (pathname.startsWith('/student')) return false;
  if (pathname.startsWith('/webinar-2027-intake-csc')) return false;
  if (pathname.startsWith('/thank-you')) return false;
  if (pathname.startsWith('/counselling')) return false;
  if (pathname.startsWith('/contact')) return false;
  if (pathname.startsWith('/apply')) return false;
  if (pathname.startsWith('/assessment')) return false;
  if (pathname.startsWith('/get-started')) return false;
  if (pathname.startsWith('/api/')) return false;
  return true;
}

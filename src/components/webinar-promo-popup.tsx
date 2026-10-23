'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { X, Megaphone, Calendar, Bell } from 'lucide-react';
import { track } from '@/lib/analytics';
import { useI18n } from '@/lib/i18n';
import { PUBLIC_WEBINAR_ENABLED, WEBINAR_CONFIG, isWebinarSessionUpcoming } from '@/lib/webinar-config';

/**
 * sessionStorage key for "the visitor closed the webinar promo".
 * Exported so the WhatsApp-group popup can tell whether the promo
 * still owns the screen on the current page.
 */
export const WEBINAR_PROMO_DISMISS_KEY = 'sica_webinar_promo_dismissed';

/**
 * Visitor-facing promo popup for the current webinar session.
 *
 * Phase 142 + 144 originally probed `/api/webinar-sessions/active`.
 * Phase 165 deleted that API + this component when the webinar
 * surface went static. Restored against `WEBINAR_CONFIG`:
 *   - Active branch when `sessionDateIso` is still in the future
 *   - Teaser branch when the date has passed (or is invalid)
 *   - Denylist path filter (portals / webinar landing / thank-you / api)
 *   - sessionStorage dismiss for the rest of the tab session
 *
 * Positioning: bottom-center on `sm+`. On mobile, sits just below
 * the header (`top-20`) so it does not collide with the
 * WhatsAppGroupPopup (`bottom-4 right-4`, nearly full-width on
 * `/` + `/universities*`).
 */
export function WebinarPromoPopup() {
  const { t, locale } = useI18n();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
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

  useEffect(() => {
    if (!PUBLIC_WEBINAR_ENABLED || !mounted || dismissed) return;
    if (!isOnPublicPath(pathname)) return;
    if (firedRef.current) return;
    firedRef.current = true;
    if (hasActiveSession) {
      track('webinar_popup_view', { locale, path: pathname ?? '' });
    } else {
      track('webinar_popup_view_teaser', { locale, path: pathname ?? '' });
    }
  }, [mounted, dismissed, hasActiveSession, pathname, locale]);

  if (!PUBLIC_WEBINAR_ENABLED || !mounted || dismissed) return null;
  if (!isOnPublicPath(pathname)) return null;

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

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={t('webinar.popupAriaLabel')}
      className="fixed z-40 w-[calc(100vw-2rem)] max-w-md bg-white border-2 border-[#D4A853] shadow-lg p-4 sm:p-5 flex items-start gap-3 left-1/2 -translate-x-1/2 top-20 sm:top-auto sm:bottom-6"
    >
      <div className="flex-shrink-0 h-10 w-10 bg-[#D4A853] text-white flex items-center justify-center">
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
            <p className="text-xs text-[#4B5563] mt-1 line-clamp-3">
              {t('webinar.popupBody')}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Link
                href="/webinar-2027-intake-csc#signup"
                onClick={handleCta}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#9B1B30] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#7A1526] transition-colors"
              >
                <Calendar className="h-3 w-3" aria-hidden />
                {t('webinar.popupCta')}
              </Link>
              <button
                type="button"
                onClick={() => dismiss('close_button')}
                className="text-xs text-[#4B5563] hover:text-[#1B2A4A] font-medium"
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
            <p className="text-xs text-[#4B5563] mt-1 line-clamp-3">
              {t('webinar.popupTeaserBody')}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Link
                href="/webinar-2027-intake-csc"
                onClick={handleCta}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#9B1B30] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#7A1526] transition-colors"
              >
                <Bell className="h-3 w-3" aria-hidden />
                {t('webinar.popupTeaserCta')}
              </Link>
              <button
                type="button"
                onClick={() => dismiss('close_button')}
                className="text-xs text-[#4B5563] hover:text-[#1B2A4A] font-medium"
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
        className="flex-shrink-0 text-gray-400 hover:text-[#1B2A4A] -mt-2 -mr-2 p-1"
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

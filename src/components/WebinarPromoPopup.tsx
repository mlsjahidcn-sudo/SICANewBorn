'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { X, Megaphone, Calendar, Bell } from 'lucide-react';
import { track } from '@/lib/analytics';
import { useI18n } from '@/lib/i18n';

const DISMISS_KEY = 'sica_webinar_promo_dismissed';

/**
 * Phase 142 + 144: visitor-facing promo popup for the active
 * webinar session (Phase 142) + a no-active-session fallback
 * teaser (Phase 144).
 *
 * Phase 144 rewrote the trigger + path filter so the popup is
 * actually discoverable:
 *   - Drops the 3s/scroll trigger — renders immediately after
 *     the active-session probe resolves (typically <500ms).
 *   - Expands path filter from `/` + `/universities[/*]` to a
 *     denylist — every public page is allowed except the 3
 *     portal paths + `/webinar-2027-intake-csc[/*]` itself
 *     (don't distract on the conversion page) + `/thank-you`
 *     (don't distract right after submit) + `/api/*`.
 *   - Adds a fallback rendering branch — when the active-
 *     session probe returns no row (or errors silently), the
 *     popup renders with a generic teaser copy + a "Notify me"
 *     CTA pointing at the webinar signup page instead of
 *     staying silent. The signup page already has its own
 *     "Date coming soon" empty-state copy for that audience.
 *
 * Dismissal storage key (`sica_webinar_promo_dismissed`) is
 * sessionStorage, matching the existing pattern from
 * `whatsapp-group-popup.tsx:36`. Visitor closes the popup once
 * for the session; refreshing shows it again.
 */
export function WebinarPromoPopup() {
  const { t, locale } = useI18n();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState<boolean | null>(null);
  // Phase 144: useRef guard so the one-time view event fires
  // exactly once even if the effect re-runs (e.g. on dismissed
  // re-render when user clicks the X button).
  const firedRef = useRef(false);

  // SSR-safe dismissal read — runs once on mount, before paint,
  // so a returning visitor who already dismissed never sees a
  // flash of the popup.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setDismissed(window.sessionStorage.getItem(DISMISS_KEY) === '1');
    setMounted(true);
  }, []);

  // Probe the active-session API once on mount. Silent fail
  // open (sets hasActiveSession(false) on error so the popup
  // falls into the teaser branch instead of staying invisible).
  useEffect(() => {
    if (!mounted || dismissed) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/webinar-sessions/active', { cache: 'no-store' });
        if (!res.ok) {
          if (!cancelled) setHasActiveSession(false);
          return;
        }
        const json = (await res.json()) as { session?: unknown };
        if (!cancelled) setHasActiveSession(json.session != null);
      } catch {
        if (!cancelled) setHasActiveSession(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mounted, dismissed]);

  // Fire the right "view" event for whichever branch renders.
  // Must run unconditionally (before the early returns below)
  // to satisfy React's rules-of-hooks. We use a `useRef` to
  // ensure it fires exactly once per page visit, not on every
  // re-render (e.g. when the user dismisses).
  useEffect(() => {
    if (!mounted || dismissed || hasActiveSession === null) return;
    if (!isOnPublicPath(pathname)) return;
    if (firedRef.current) return;
    firedRef.current = true;
    if (hasActiveSession) {
      track('webinar_popup_view', { locale, path: pathname ?? '' });
    } else {
      track('webinar_popup_view_teaser', { locale, path: pathname ?? '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, dismissed, hasActiveSession, pathname, locale]);

  if (!mounted || dismissed || hasActiveSession === null) return null;
  if (!isOnPublicPath(pathname)) return null;

  const isActiveSession = hasActiveSession === true;

  const dismiss = (source: 'close_button' | 'cta_click') => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(DISMISS_KEY, '1');
    }
    setDismissed(true);
    track('webinar_popup_dismiss', { source, locale, path: pathname ?? '' });
  };

  const handleCta = () => {
    if (isActiveSession) {
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
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92vw] max-w-md bg-white border-2 border-[#D4A853] shadow-lg p-5 flex items-start gap-3"
    >
      <div className="flex-shrink-0 h-10 w-10 bg-[#D4A853] text-white flex items-center justify-center">
        <Megaphone className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        {isActiveSession ? (
          // Active-session branch — real webinar copy.
          <>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9B1B30]">
              {t('webinar.popupEyebrow')}
            </p>
            <h3 className="text-base font-bold text-[#1B2A4A] leading-tight mt-1">
              {t('webinar.popupTitle')}
            </h3>
            <p className="text-xs text-[#4B5563] mt-1 line-clamp-3">{t('webinar.popupBody')}</p>
            <div className="flex items-center gap-2 mt-3">
              <Link
                href="/webinar-2027-intake-csc#signup"
                onClick={handleCta}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#9B1B30] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#7A1526] transition-colors"
              >
                <Calendar className="h-3 w-3" />
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
          // No-active-session fallback — teaser copy.
          <>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9B1B30]">
              {t('webinar.popupTeaserEyebrow')}
            </p>
            <h3 className="text-base font-bold text-[#1B2A4A] leading-tight mt-1">
              {t('webinar.popupTeaserTitle')}
            </h3>
            <p className="text-xs text-[#4B5563] mt-1 line-clamp-3">{t('webinar.popupTeaserBody')}</p>
            <div className="flex items-center gap-2 mt-3">
              <Link
                href="/webinar-2027-intake-csc"
                onClick={handleCta}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#9B1B30] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#7A1526] transition-colors"
              >
                <Bell className="h-3 w-3" />
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
 * Denylist path filter — returns true when the visitor is on a
 * page where the popup is allowed to render.
 *
 * Phase 144: denylist instead of allowlist. The only pages we
 * hide on are the 3 portals (admin/partner/student — the
 * ClientLayout portal gate already filters these but defense-
 * in-depth), the webinar landing page itself (don't distract on
 * the conversion page), the thank-you page (don't distract
 * right after the user just submitted), and /api/* routes
 * (these shouldn't render client components anyway but no
 * harm in being explicit).
 */
export function isOnPublicPath(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname.startsWith('/admin')) return false;
  if (pathname.startsWith('/partner')) return false;
  if (pathname.startsWith('/student')) return false;
  if (pathname.startsWith('/webinar-2027-intake-csc')) return false;
  if (pathname.startsWith('/thank-you')) return false;
  if (pathname.startsWith('/api/')) return false;
  return true;
}
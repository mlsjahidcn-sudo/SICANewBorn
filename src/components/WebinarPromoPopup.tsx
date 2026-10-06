'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { X, Megaphone, Calendar } from 'lucide-react';
import { track } from '@/lib/analytics';
import { useI18n } from '@/lib/i18n';

const DISMISS_KEY = 'sica_webinar_promo_dismissed';
const TRIGGER_DELAY_MS = 3000;
const SCROLL_THRESHOLD = 0.5;

const TARGET_PATHS = ['/', '/universities'];

/**
 * Phase 142: visitor-facing promo popup for the active webinar
 * session. Mirrors the Phase 129+ WhatsAppGroupPopup shape
 * (3s OR scroll >50% trigger, sessionStorage dismiss key,
 * GA event, path filter, hidden on portal pages via ClientLayout).
 *
 * Conditional render: only appears when /api/webinar-sessions/active
 * returns a session. If no active session, the popup is a
 * no-op so visitors don't see a teaser for nothing.
 */
export function WebinarPromoPopup() {
  const { t, locale } = useI18n();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState<boolean | null>(null);
  const [triggered, setTriggered] = useState(false);

  // SSR-safe dismissal read — runs once on mount, before paint,
  // so a returning visitor who already dismissed never sees a
  // flash of the popup.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setDismissed(window.sessionStorage.getItem(DISMISS_KEY) === '1');
    setMounted(true);
  }, []);

  // Probe the active-session API once on mount. If no session,
  // the popup stays hidden even if the trigger fires.
  useEffect(() => {
    if (!mounted || dismissed) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/webinar-sessions/active', { cache: 'no-store' });
        if (!res.ok) return;
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

  // Trigger: 3s after mount OR scroll >50%, whichever first.
  useEffect(() => {
    if (!mounted || dismissed || hasActiveSession === false) return;
    const arm = () => {
      if (triggered) return;
      setTriggered(true);
      track('webinar_popup_view', { locale, path: pathname ?? '' });
    };
    const timer = window.setTimeout(arm, TRIGGER_DELAY_MS);
    const onScroll = () => {
      const scrollPct =
        (window.scrollY + window.innerHeight) /
        document.documentElement.scrollHeight;
      if (scrollPct >= SCROLL_THRESHOLD) arm();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [mounted, dismissed, hasActiveSession, triggered, locale, pathname]);

  if (!mounted || dismissed || hasActiveSession !== true) return null;
  if (!isOnTargetPath(pathname)) return null;

  const dismiss = (source: 'close_button' | 'cta_click') => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(DISMISS_KEY, '1');
    }
    setDismissed(true);
    track('webinar_popup_dismiss', { source, locale, path: pathname ?? '' });
  };

  const handleCta = () => {
    track('webinar_popup_click', { locale, path: pathname ?? '' });
    // Caller navigates via the Link; mark dismissed so we don't
    // double-fire on the destination.
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
 * Path filter — returns true when the visitor is on a page
 * where the popup is allowed to render. Mirrors the WhatsApp
 * popup's path logic: home + university browsing.
 */
export function isOnTargetPath(pathname: string | null): boolean {
  if (!pathname) return false;
  // Admin/partner/student portals are filtered at the
  // ClientLayout mount layer (the popup component never mounts
  // there). This in-component check is a defense-in-depth guard
  // for any edge case.
  if (pathname.startsWith('/admin') || pathname.startsWith('/partner') || pathname.startsWith('/student')) {
    return false;
  }
  if (pathname === '/webinar-2027-intake-csc' || pathname.startsWith('/webinar-2027-intake-csc/')) {
    return false;
  }
  return TARGET_PATHS.includes(pathname) || pathname.startsWith('/universities/');
}
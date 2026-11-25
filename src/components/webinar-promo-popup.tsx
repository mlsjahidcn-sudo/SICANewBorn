'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { X, Megaphone, Calendar, Bell, Clock } from 'lucide-react';
import { track } from '@/lib/analytics';
import { useI18n } from '@/lib/i18n';
import {
  PUBLIC_WEBINAR_ENABLED,
  PUBLIC_WEBINAR_POPUP_ENABLED,
  WEBINAR_CONFIG,
  formatWebinarDate,
  isWebinarSessionUpcoming,
} from '@/lib/webinar-config';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

/**
 * sessionStorage key for "the visitor closed the webinar promo".
 * Exported so the WhatsApp-group popup can tell whether the promo
 * still owns the screen on the current page.
 */
export const WEBINAR_PROMO_DISMISS_KEY = 'sica_webinar_promo_dismissed';

/**
 * Visitor-facing promo MODAL for the current webinar session.
 *
 * Shows when both public webinar flags are enabled and the path is public:
 *   - Active branch when `sessionDateIso` is still in the future
 *   - Teaser branch when the date has passed (or is invalid)
 *   - Denylist path filter (portals / webinar landing / thank-you / api)
 *   - sessionStorage dismiss for the rest of the tab session
 *
 * It owns the sitewide promo slot while a session is upcoming: the China
 * Admission Kit exit-intent popup stands down for the same period, so a
 * visitor never gets two modals for the same moment.
 *
 * Trigger mirrors the Kit promo: exit-intent on a pointer device,
 * scroll-depth + timer on touch. The visitor has to have engaged with
 * the page before it can fire, and it stays out of the way while they
 * are typing in a form or reading another dialog.
 */
export function WebinarPromoPopup() {
  const { t, locale } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Capture once — never Date.now() in render (Phase 161 lint).
  const [nowMs] = useState(() => Date.now());
  const firedRef = useRef(false);

  const hasActiveSession = isWebinarSessionUpcoming(
    WEBINAR_CONFIG.sessionDateIso,
    nowMs,
  );
  const eligible =
    PUBLIC_WEBINAR_ENABLED &&
    PUBLIC_WEBINAR_POPUP_ENABLED &&
    isOnPublicPath(pathname) &&
    !alreadyDismissed();

  /**
   * True while the visitor is typing in a form or another dialog is open.
   * Checked once at trigger time rather than continuously: a live
   * subscription would unmount the modal the instant it opened, because
   * Radix renders `role="dialog" data-state="open"` — which is exactly
   * what the check looks for.
   */
  const visitorIsBusy = (): boolean => {
    const active = document.activeElement;
    const enteringForm = active instanceof HTMLElement && Boolean(active.closest('form'));
    const openDialog = document.querySelector('[role="dialog"][data-state="open"], [role="listbox"]');
    return enteringForm || Boolean(openDialog);
  };

  const fireOpen = () => {
    if (firedRef.current || !eligible) return;
    if (visitorIsBusy()) return;
    firedRef.current = true;
    setOpen(true);
    track(
      hasActiveSession ? 'webinar_popup_view' : 'webinar_popup_view_teaser',
      { locale, path: pathname ?? '' },
    );
  };

  // Exit-intent on a pointer device.
  useEffect(() => {
    if (!eligible) return;
    const handler = (e: MouseEvent) => {
      if (e.clientY <= 0) fireOpen();
    };
    document.addEventListener('mouseleave', handler);
    return () => document.removeEventListener('mouseleave', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eligible]);

  // Touch devices have no mouse-leave: fire once they have read most of
  // the page AND had time to settle.
  useEffect(() => {
    if (!eligible) return;
    if (!window.matchMedia('(pointer: coarse)').matches) return;

    let scrollTriggered = false;
    let timerTriggered = false;
    const tryFire = () => {
      if (scrollTriggered && timerTriggered) fireOpen();
    };
    const onScroll = () => {
      const scrolled =
        window.scrollY /
        Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (scrolled > 0.6) {
        scrollTriggered = true;
        tryFire();
      }
    };
    const onTimer = () => {
      timerTriggered = true;
      tryFire();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    const timer = window.setTimeout(onTimer, 25_000);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eligible]);

  if (!eligible) return null;

  const dismiss = (source: 'close_button' | 'cta_click') => {
    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(WEBINAR_PROMO_DISMISS_KEY, '1');
      }
    } catch {
      /* best effort */
    }
    setOpen(false);
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
    <Dialog open={open} onOpenChange={(next) => { if (!next) dismiss('close_button'); }}>
      <DialogContent
        showCloseButton={false}
        aria-label={t('webinar.popupAriaLabel')}
        className="max-w-md rounded-none border-2 border-[#D4A853] p-0 shadow-[0_12px_40px_rgba(27,42,74,0.18)]"
      >
        <div className="flex items-start gap-3 p-4 sm:p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#9B1B30] text-white">
            <Megaphone className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="sr-only">{t('webinar.popupTitle')}</DialogTitle>
            <DialogDescription className="sr-only">{t('webinar.popupBody')}</DialogDescription>
            {hasActiveSession ? (
              <>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9B1B30]">
                  {t('webinar.popupEyebrow')}
                </p>
                <h3 className="mt-1 text-base font-bold leading-tight text-[#1B2A4A]">
                  {t('webinar.popupTitle')}
                </h3>
                {(dateLabel || timeLabel) && (
                  <div className="mt-2 inline-flex flex-wrap items-center gap-x-2 gap-y-1 border border-[#D4A853]/50 bg-[#FAF6E8] px-2.5 py-1 text-[11px] font-semibold text-[#1B2A4A]">
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
                <p className="mt-2 text-xs leading-relaxed text-[#4B5563]">
                  {t('webinar.popupBody')}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Link
                    href="/webinar-2027-intake-csc#signup"
                    onClick={handleCta}
                    className="inline-flex items-center gap-1.5 bg-[#9B1B30] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#7A1526]"
                  >
                    <Calendar className="h-3.5 w-3.5" aria-hidden />
                    {t('webinar.popupCta')}
                  </Link>
                  <button
                    type="button"
                    onClick={() => dismiss('close_button')}
                    className="px-2 py-2 text-xs font-medium text-[#4B5563] transition-colors hover:text-[#1B2A4A]"
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
                <h3 className="mt-1 text-base font-bold leading-tight text-[#1B2A4A]">
                  {t('webinar.popupTeaserTitle')}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#4B5563]">
                  {t('webinar.popupTeaserBody')}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Link
                    href="/webinar-2027-intake-csc#signup"
                    onClick={handleCta}
                    className="inline-flex items-center gap-1.5 bg-[#9B1B30] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#7A1526]"
                  >
                    <Bell className="h-3.5 w-3.5" aria-hidden />
                    {t('webinar.popupTeaserCta')}
                  </Link>
                  <button
                    type="button"
                    onClick={() => dismiss('close_button')}
                    className="px-2 py-2 text-xs font-medium text-[#4B5563] transition-colors hover:text-[#1B2A4A]"
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
            className="-mr-1 -mt-1 shrink-0 p-1.5 text-gray-400 transition-colors hover:text-[#1B2A4A]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** True when the visitor already closed the promo in this tab session. */
function alreadyDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(WEBINAR_PROMO_DISMISS_KEY) === '1';
  } catch {
    // sessionStorage unavailable — show the popup.
    return false;
  }
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

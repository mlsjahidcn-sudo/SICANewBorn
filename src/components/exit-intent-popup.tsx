'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, Sparkles, CalendarClock, MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { WHATSAPP_PHONE } from '@/lib/contact';
import { track } from '@/lib/analytics';

/**
 * ExitIntentPopup — last-chance CTA for a free 10-minute 1-on-1
 * consultation before visitors leave high-traffic pages
 * (/, /universities, /programs, /scholarships + detail pages).
 *
 * Triggers:
 *   - DESKTOP: mouseleave through the top of the viewport
 *   - MOBILE: scrolled past 60% AND on-page ≥25 seconds
 *   - Once per session (sessionStorage); skipped if a chat lead
 *     was already submitted (sica_chat_v1_lead panel=submitted)
 *
 * Primary CTA → /counselling?from=exit-intent (booking wizard).
 * Secondary → WhatsApp with the same consultation message as
 * ConsultationCta. No email form — conversion goal is booking,
 * not chat-lead capture.
 */

const TRIGGER_PATHS = ['/', '/universities', '/programs', '/scholarships'];
const STORAGE_KEY = 'sica_exit_popup_shown';
const LEAD_KEY = 'sica_chat_v1_lead'; // shared with ChatWindow lead form

function shouldShowOnPath(pathname: string): boolean {
  if (!pathname) return false;
  if (TRIGGER_PATHS.includes(pathname)) return true;
  if (pathname.startsWith('/universities/') && pathname !== '/universities') return true;
  if (pathname.startsWith('/programs/') && pathname !== '/programs') return true;
  return false;
}

function alreadySubmittedLead(): boolean {
  try {
    const leadRaw = localStorage.getItem(LEAD_KEY);
    if (!leadRaw) return false;
    const parsed = JSON.parse(leadRaw) as { panel?: string };
    return parsed?.panel === 'submitted';
  } catch {
    return false;
  }
}

function alreadyShownThisSession(): boolean {
  try {
    return Boolean(sessionStorage.getItem(STORAGE_KEY));
  } catch {
    return false;
  }
}

function markShown(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // ignore
  }
}

export function ExitIntentPopup() {
  const pathname = usePathname();
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [eligible, setEligible] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggeredRef = useRef(false);

  // Path + lead + session eligibility (client-only storage checks).
  useEffect(() => {
    if (!shouldShowOnPath(pathname)) {
      setEligible(false);
      return;
    }
    if (alreadySubmittedLead() || alreadyShownThisSession()) {
      setEligible(false);
      return;
    }
    setEligible(true);
  }, [pathname]);

  const fireOpen = () => {
    if (triggeredRef.current || !eligible) return;
    triggeredRef.current = true;
    markShown();
    setOpen(true);
  };

  // Desktop: mouseleave through the top of the viewport.
  useEffect(() => {
    if (!eligible) return;
    const handler = (e: MouseEvent) => {
      if (e.clientY <= 0) fireOpen();
    };
    document.addEventListener('mouseleave', handler);
    return () => document.removeEventListener('mouseleave', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eligible]);

  // Mobile: scroll depth + dwell time.
  useEffect(() => {
    if (!eligible) return;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (!isTouch) return;

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
    const t = window.setTimeout(onTimer, 25_000);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eligible]);

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!shouldShowOnPath(pathname) || !open) return null;

  const isZh = locale === 'zh';
  const counsellingHref = '/counselling?from=exit-intent';
  const whatsappHref = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
    isZh
      ? '你好 SICA，我想预约一次免费的 10 分钟一对一咨询，了解赴华留学。'
      : "Hi SICA, I'd like to book a free 10-minute consultation about studying in China.",
  )}`;

  const onPrimaryClick = () => {
    track('apply_click', {
      location: 'consultation_exit_intent',
      slug: 'exit-intent',
      locale,
    });
  };
  const onWhatsappClick = () => {
    track('whatsapp_click', { location: 'consultation_exit_intent', locale });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-popup-title"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className="absolute inset-0 bg-[#1B2A4A]/70 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        className="relative w-full max-w-md bg-white border-2 border-[#1B2A4A] shadow-2xl"
        style={{ borderRadius: 0, animation: 'sica-popup-in 200ms ease-out' }}
      >
        <button
          type="button"
          onClick={close}
          aria-label={isZh ? '关闭' : 'Close'}
          className="absolute top-2 right-2 p-2 text-[#4B5563] hover:text-[#1B2A4A] hover:bg-gray-100 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="bg-[#9B1B30] text-white px-6 py-5 flex items-start gap-3">
          <Sparkles className="h-6 w-6 text-[#D4A853] shrink-0 mt-0.5" />
          <div>
            <h2
              id="exit-popup-title"
              className="text-xl font-bold leading-tight"
            >
              {isZh ? '等一下 — 走之前看看这个' : 'Wait — before you go'}
            </h2>
            <p className="mt-1 text-sm text-white/85 leading-snug">
              {isZh
                ? '预约一次免费的 10 分钟一对一咨询，SICA 顾问帮你匹配大学、项目与奖学金。'
                : 'Book a free 10-minute 1-on-1 consultation with a SICA counselor — university fit, programs, and scholarships.'}
            </p>
          </div>
        </div>

        <div className="px-6 py-5 space-y-3">
          <Link
            href={counsellingHref}
            onClick={onPrimaryClick}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#9B1B30] hover:bg-[#7A1526] text-white text-sm font-bold py-2.5 transition-colors"
          >
            <CalendarClock className="h-4 w-4" />
            {isZh ? '预约免费咨询' : 'Book a free consultation'}
          </Link>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onWhatsappClick}
            className="w-full inline-flex items-center justify-center gap-2 border-2 border-[#1B2A4A] text-[#1B2A4A] hover:bg-[#1B2A4A]/5 text-sm font-semibold py-2.5 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            {isZh ? 'WhatsApp 咨询' : 'Chat on WhatsApp'}
          </a>

          <button
            type="button"
            onClick={close}
            className="w-full text-[11px] text-[#4B5563] hover:text-[#1B2A4A] py-1"
          >
            {isZh ? '不，谢谢，继续浏览' : "No thanks, I'll keep browsing"}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes sica-popup-in {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

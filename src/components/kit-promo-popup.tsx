'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, BookOpen } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { track } from '@/lib/analytics';

/**
 * KitPromoPopup — exit-intent / delayed promo for the China Admission Kit.
 * Buy-focused: single CTA to /china-admission-kit (no counselling path).
 */

const STORAGE_KEY = 'sica_kit_promo_shown';

const SKIP_EXACT = new Set([
  '/china-admission-kit',
  '/counselling',
  '/assessment',
  '/thank-you',
  '/contact',
  '/get-started',
]);

function shouldShowOnPath(pathname: string): boolean {
  if (!pathname) return false;
  if (SKIP_EXACT.has(pathname)) return false;
  if (pathname.startsWith('/admin') || pathname.startsWith('/partner') || pathname.startsWith('/student')) {
    return false;
  }
  if (pathname === '/') return true;
  if (pathname.startsWith('/universities')) return true;
  if (pathname.startsWith('/programs')) return true;
  if (pathname.startsWith('/scholarships')) return true;
  if (pathname.startsWith('/guides')) return true;
  if (
    pathname.startsWith('/csca') ||
    pathname.startsWith('/how-to') ||
    pathname.startsWith('/best-') ||
    pathname.startsWith('/study-in-china') ||
    pathname.startsWith('/mbbs') ||
    pathname.startsWith('/chinese-government') ||
    pathname.startsWith('/csc-') ||
    pathname.startsWith('/china-university')
  ) {
    return true;
  }
  return false;
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

export function KitPromoPopup() {
  const pathname = usePathname();
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [eligible, setEligible] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (!shouldShowOnPath(pathname)) {
      setEligible(false);
      return;
    }
    if (alreadyShownThisSession()) {
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

  useEffect(() => {
    if (!eligible) return;
    const handler = (e: MouseEvent) => {
      if (e.clientY <= 0) fireOpen();
    };
    document.addEventListener('mouseleave', handler);
    return () => document.removeEventListener('mouseleave', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eligible]);

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
    const timer = window.setTimeout(onTimer, 25_000);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(timer);
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

  const kitHref = `/china-admission-kit?from=kit-promo`;

  const onPrimaryClick = () => {
    track('apply_click', {
      location: 'kit_promo',
      slug: 'china-admission-kit',
      locale,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="kit-promo-title"
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
        className="relative w-full max-w-md border-2 border-[#1B2A4A] bg-white shadow-2xl"
        style={{ borderRadius: 0, animation: 'sica-kit-promo-in 200ms ease-out' }}
      >
        <button
          type="button"
          onClick={close}
          aria-label={t('common.close')}
          className="absolute right-2 top-2 z-10 p-2 text-[#4B5563] transition-colors hover:bg-gray-100 hover:text-[#1B2A4A]"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-3 bg-[#9B1B30] px-6 py-5 text-white">
          <BookOpen className="mt-0.5 h-6 w-6 shrink-0 text-[#D4A853]" />
          <div>
            <h2 id="kit-promo-title" className="text-xl font-bold leading-tight">
              {t('kit.promoTitle')}
            </h2>
            <p className="mt-1 text-sm leading-snug text-white/85">
              {t('kit.promoBody')}
            </p>
          </div>
        </div>

        <div className="space-y-3 px-6 py-5">
          <Link
            href={kitHref}
            onClick={onPrimaryClick}
            className="inline-flex w-full items-center justify-center gap-2 bg-[#9B1B30] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#7A1526]"
          >
            <BookOpen className="h-4 w-4" />
            {t('kit.promoPrimary')}
          </Link>

          <button
            type="button"
            onClick={close}
            className="w-full py-1 text-[11px] text-[#4B5563] hover:text-[#1B2A4A]"
          >
            {t('kit.promoDismiss')}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes sica-kit-promo-in {
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

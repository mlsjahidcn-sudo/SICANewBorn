'use client';

import { useState, useEffect } from 'react';
import { X, MessageCircle, GraduationCap, Newspaper, Calendar, FileText, ArrowRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { track } from '@/lib/analytics';

/**
 * WhatsAppGroupPopup — site-wide join-our-WhatsApp-group popup.
 *
 * Visible on / and /universities only. Triggered 3s after page
 * mount OR when the user has scrolled >50% (whichever lands
 * first). One dismiss per browser session (sessionStorage).
 *
 * SSR-safe: the dismissal flag is checked on first render so the
 * server-rendered HTML reflects the user's previous choice and the
 * popup doesn't flash back in for users who already dismissed.
 *
 * CTA is a WhatsApp group invite link — currently hardcoded (per
 * the 2026-10-01 scope decision). UTMs are appended so SICA's own
 * analytics can attribute the click source.
 *
 * Lives in ClientLayout alongside the existing CSCA prep banner.
 * Path filter happens inside the component (usePathname) so the
 * portal-side isAdmin/isPartner/isStudent guard in ClientLayout
 * keeps the popup out of the auth portals automatically; this
 * filter narrows it further to "home + universities only".
 */
const WHATSAPP_GROUP_URL =
  'https://chat.whatsapp.com/HCgeJ6Di9D20kpyiMUHfRO?s=cl&p=i&mlu=4' +
  '&utm_source=sica&utm_medium=popup&utm_campaign=whatsapp_group';

const DISMISS_KEY = 'sica_whatsapp_popup_dismissed';
const TRIGGER_DELAY_MS = 3000;
const SCROLL_THRESHOLD = 0.5;

export function isOnTargetPath(pathname: string | null): boolean {
  if (!pathname) return false;
  // Home (exact match) + /universities + any /universities/[slug]
  if (pathname === '/') return true;
  if (pathname === '/universities') return true;
  if (pathname.startsWith('/universities/')) return true;
  return false;
}

export function WhatsAppGroupPopup() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false); // SSR-safe mount flag

  // Mount check + dismissal read. Read once on first render so the
  // server-rendered HTML reflects the user's prior choice and the
  // popup doesn't flash back in for users who already dismissed.
  useEffect(() => {
    setMounted(true);
    try {
      if (window.sessionStorage.getItem(DISMISS_KEY) === '1') {
        setVisible(false);
        return;
      }
    } catch {
      // sessionStorage unavailable — proceed to show.
    }
    if (!isOnTargetPath(pathname)) return;

    // Two parallel triggers: 3s delay OR scroll >50% of viewport
    // (whichever lands first). The setVisible callback is shared so
    // the second trigger is a no-op.
    let triggered = false;
    const fire = () => {
      if (triggered) return;
      triggered = true;
      setVisible(true);
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timer);
    };
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop || 0;
      const viewport = window.innerHeight || doc.clientHeight || 1;
      const fullHeight = doc.scrollHeight || viewport;
      if (scrollTop / Math.max(fullHeight - viewport, 1) >= SCROLL_THRESHOLD) {
        fire();
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    const timer = window.setTimeout(fire, TRIGGER_DELAY_MS);
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timer);
    };
  }, [pathname]);

  // Hide on path change away from /universities → e.g. admin link
  // in the popup body would navigate the user out, we hide.
  useEffect(() => {
    if (mounted && !isOnTargetPath(pathname)) setVisible(false);
  }, [pathname, mounted]);

  if (!mounted || !visible) return null;

  const dismiss = (source: 'close_button' | 'cta_click') => {
    try {
      window.sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* sessionStorage unavailable — best effort */
    }
    setVisible(false);
    track('whatsapp_popup_dismiss', { source, locale: 'en', path: pathname ?? '' });
  };

  const onCtaClick = () => {
    track('whatsapp_popup_click', { locale: 'en', path: pathname ?? '' });
    window.open(WHATSAPP_GROUP_URL, '_blank', 'noopener,noreferrer');
    dismiss('cta_click');
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="whatsapp-popup-title"
      className="fixed bottom-4 right-4 z-50 max-w-[420px] w-[calc(100vw-2rem)] sm:w-[420px] bg-white border-2 border-[#9B1B30] shadow-2xl overflow-hidden"
      style={{ animation: 'whatsapp-popup-in 280ms ease-out' }}
    >
      {/* Top hero — navy + cherry-blossom gradient with brand wordmark */}
      <div className="relative bg-gradient-to-br from-[#1B2A4A] via-[#1B2A4A] to-[#3a1a30] text-white px-5 pt-4 pb-5">
        {/* Wordmark */}
        <div className="text-[10px] font-bold tracking-[0.18em] uppercase">
          <span className="text-white/95">Study in</span>{' '}
          <span className="text-[#F4A6B0]">China</span>{' '}
          <span className="text-white/95">Academy</span>
          <div className="mt-1 h-[2px] w-10 bg-[#9B1B30]" />
        </div>

        {/* Headline */}
        <h2
          id="whatsapp-popup-title"
          className="mt-3 text-2xl sm:text-3xl font-extrabold leading-[1.1] tracking-tight"
        >
          Your Journey to{' '}
          <span className="text-[#F4A6B0]">China</span>{' '}
          <span className="block sm:inline">Starts Here</span>
        </h2>

        <p className="mt-2 text-sm text-white/85 leading-relaxed">
          Join our WhatsApp group for scholarship opportunities,
          university updates, application deadlines, and step-by-step
          guidance.
        </p>

        {/* Close button — top right */}
        <button
          type="button"
          onClick={() => dismiss('close_button')}
          aria-label="Dismiss"
          className="absolute top-2 right-2 p-1 text-white/70 hover:text-white hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Feature pills — 2x2 grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-5 py-4 bg-white">
        <FeaturePill icon={GraduationCap} label="Scholarship Updates" />
        <FeaturePill icon={Newspaper} label="University News" />
        <FeaturePill icon={Calendar} label="Deadline Alerts" />
        <FeaturePill icon={FileText} label="Application Guidance" />
      </div>

      {/* CTA strip — deep navy footer with the WhatsApp button */}
      <div className="relative bg-gradient-to-r from-[#1B2A4A] to-[#0f1a30] text-white px-5 pt-4 pb-5">
        <button
          type="button"
          onClick={onCtaClick}
          className="group flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#1ebe57] active:bg-[#1aa84c] text-white font-bold text-base sm:text-lg py-3 px-5 shadow-md transition-colors"
        >
          <MessageCircle className="h-6 w-6 fill-current" />
          <span>Join Our WhatsApp Group</span>
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </button>
        <p className="mt-3 text-center text-[11px] tracking-[0.18em] uppercase text-white/60">
          studyinchina.academy
        </p>
      </div>
    </div>
  );
}

function FeaturePill({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-[#1B2A4A]">
      <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-[#F4A6B0]/15">
        <Icon className="h-4 w-4 text-[#9B1B30]" />
      </div>
      <span className="text-sm font-semibold leading-tight">{label}</span>
    </div>
  );
}
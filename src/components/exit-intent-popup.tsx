'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { apiFetch } from '@/lib/api-client';

/**
 * ExitIntentPopup — capture visitors before they leave the
 * most-trafficked landing pages (/, /universities, /programs,
 * /scholarships). Triggers differently per device:
 *
 *   - DESKTOP: mouseleave on document. When the cursor moves up
 *     and out of the viewport (the classic "about to close
 *     the tab" gesture), the popup appears.
 *   - MOBILE: no mouseleave, so we trigger when the visitor
 *     has scrolled past 60% AND has been on the page for at
 *     least 25 seconds. This catches the "scrolled through the
 *     page, about to bounce" intent without false-firing.
 *   - On both devices: only fires once per session (sessionStorage
 *     key), only on the configured paths, and only if the
 *     visitor hasn't already submitted a lead (the assessment
 *     form sets sica_lead_submitted on success).
 *
 * Copy: short, direct, low-friction. 2 fields (email + WhatsApp)
 * are enough to start a conversation; name is collected at
 * the assessment step. The form posts to the chat_leads table
 * (same path the in-chat lead form uses, so the admin sees
 * one unified leads list regardless of capture surface).
 *
 * Pre-fill: if the visitor has the chat lead panel half-filled
 * (sica_chat_v1_lead in localStorage), we import those values
 * so they don't have to retype.
 */

const TRIGGER_PATHS = ['/', '/universities', '/programs', '/scholarships'];
const STORAGE_KEY = 'sica_exit_popup_shown';
const LEAD_KEY = 'sica_chat_v1_lead'; // shared with ChatWindow lead form

function shouldShowOnPath(pathname: string): boolean {
  if (!pathname) return false;
  if (TRIGGER_PATHS.includes(pathname)) return true;
  // /universities/[slug] and /programs/[slug] also qualify —
  // a visitor deep on a detail page is a high-intent reader.
  if (pathname.startsWith('/universities/') && pathname !== '/universities') return true;
  if (pathname.startsWith('/programs/') && pathname !== '/programs') return true;
  return false;
}

export function ExitIntentPopup() {
  const pathname = usePathname();
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggeredRef = useRef(false);

  // Decide whether this page is eligible + import any pre-fill.
  useEffect(() => {
    if (!shouldShowOnPath(pathname)) return;
    // Don't show if visitor already submitted any lead (chat or
    // exit-popup or contact form). The 'sica_chat_v1_lead'
    // key's panel='submitted' marker is the single source of
    // truth for "we already got their info".
    try {
      const leadRaw = localStorage.getItem(LEAD_KEY);
      if (leadRaw) {
        const parsed = JSON.parse(leadRaw);
        if (parsed && parsed.panel === 'submitted') return;
      }
    } catch {
      // ignore
    }
    // Don't show if already shown this session.
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // ignore
    }
    // Don't show if a lead form is already open elsewhere — the
    // user is mid-conversion; double-popup is annoying.
    // (Hard to detect cleanly, so we just rely on the lead key.)
    // Pre-fill from chat lead form if it has any data
    try {
      const leadRaw = localStorage.getItem(LEAD_KEY);
      if (leadRaw) {
        const parsed = JSON.parse(leadRaw);
        if (parsed?.data?.email) setEmail(parsed.data.email);
        if (parsed?.data?.whatsapp) setWhatsapp(parsed.data.whatsapp);
      }
    } catch {
      // ignore
    }
  }, [pathname]);

  // Desktop: mouseleave on document. Only fire when the cursor
  // leaves through the top of the viewport (closing the tab is
  // usually an upward motion).
  useEffect(() => {
    if (!shouldShowOnPath(pathname)) return;
    const handler = (e: MouseEvent) => {
      if (triggeredRef.current) return;
      // Only trigger when leaving through the top (clientY < 0)
      // or via the close-tab gesture. A mouseleave to the
      // side (e.g., moving toward the dev tools dock) shouldn't
      // fire.
      if (e.clientY <= 0) {
        triggeredRef.current = true;
        try {
          sessionStorage.setItem(STORAGE_KEY, '1');
        } catch {
          // ignore
        }
        setOpen(true);
      }
    };
    document.addEventListener('mouseleave', handler);
    return () => document.removeEventListener('mouseleave', handler);
  }, [pathname]);

  // Mobile fallback: trigger on scroll-depth + dwell time.
  // mousedown isn't useful on touch, so we use a heuristic
  // that catches "scrolled a lot, been here a while".
  useEffect(() => {
    if (!shouldShowOnPath(pathname)) return;
    // Only on touch / narrow viewports
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (!isTouch) return;

    let scrollTriggered = false;
    let timerTriggered = false;

    const tryFire = () => {
      if (triggeredRef.current) return;
      if (scrollTriggered && timerTriggered) {
        triggeredRef.current = true;
        try {
          sessionStorage.setItem(STORAGE_KEY, '1');
        } catch {
          // ignore
        }
        setOpen(true);
      }
    };

    const onScroll = () => {
      const scrolled = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
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
  }, [pathname]);

  const close = () => {
    setOpen(false);
    setError('');
  };

  // ESC closes
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError(locale === 'zh' ? '请输入邮箱' : 'Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(locale === 'zh' ? '邮箱格式不正确' : 'Invalid email');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch('/api/leads/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          whatsapp: whatsapp.trim() || null,
          sourcePage: window.location.pathname,
        }),
      });
      if (!res.ok) {
        const t = await res.json().catch(() => ({}));
        throw new Error(t.error || 'Save failed');
      }
      setDone(true);
      // Mark the chat lead panel as submitted too so it doesn't
      // ask the visitor to share again on the next chat open.
      try {
        localStorage.setItem(
          LEAD_KEY,
          JSON.stringify({ panel: 'submitted', data: { email, whatsapp } }),
        );
      } catch {
        // ignore
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!shouldShowOnPath(pathname) || !open) return null;

  const isZh = locale === 'zh';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-popup-title"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={(e) => {
        // Backdrop click closes (but not clicks inside the card)
        if (e.target === e.currentTarget) close();
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1B2A4A]/70 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Card */}
      <div
        ref={dialogRef}
        className="relative w-full max-w-md bg-white border-2 border-[#1B2A4A] shadow-2xl"
        style={{ borderRadius: 0, animation: 'sica-popup-in 200ms ease-out' }}
      >
        {/* Close (X) */}
        <button
          type="button"
          onClick={close}
          aria-label={isZh ? '关闭' : 'Close'}
          className="absolute top-2 right-2 p-2 text-[#4B5563] hover:text-[#1B2A4A] hover:bg-gray-100 transition-colors z-10"
        >
          <X size={20} />
        </button>

        {done ? (
          <div className="px-6 py-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
            <h2
              id="exit-popup-title"
              className="mt-4 text-xl font-bold text-[#1B2A4A]"
            >
              {isZh ? '已收到！' : "You're in."}
            </h2>
            <p className="mt-2 text-sm text-[#4B5563] leading-relaxed">
              {isZh
                ? 'SICA 顾问会在 24 小时内通过 WhatsApp 或邮箱联系您。'
                : 'A SICA counselor will reach out via WhatsApp or email within 24 hours.'}
            </p>
            <button
              type="button"
              onClick={close}
              className="mt-6 inline-flex items-center justify-center bg-[#9B1B30] hover:bg-[#7A1526] text-white text-sm font-semibold px-5 py-2 transition-colors"
            >
              {isZh ? '继续浏览' : 'Continue browsing'}
            </button>
          </div>
        ) : (
          <>
            {/* Hero strip — crimson with gold sparkle */}
            <div className="bg-[#9B1B30] text-white px-6 py-5 flex items-start gap-3">
              <Sparkles className="h-6 w-6 text-[#D4A853] shrink-0 mt-0.5" />
              <div>
                <h2
                  id="exit-popup-title"
                  className="text-xl font-bold leading-tight"
                >
                  {isZh ? '等一下 — 走之前看看这个' : "Wait — before you go"}
                </h2>
                <p className="mt-1 text-sm text-white/85 leading-snug">
                  {isZh
                    ? '免费获取 SICA 顾问的 1 对 1 评估，匹配适合你的中国大学 + 奖学金。'
                    : 'Get a free 1-on-1 assessment from a SICA counselor — we\'ll match you with the right Chinese university + scholarships.'}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="px-6 py-5 space-y-3">
              {error && (
                <div className="text-[12px] text-red-700 bg-red-50 border border-red-200 px-3 py-2">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#1B2A4A] mb-1">
                  {isZh ? '邮箱' : 'Email'}{' '}
                  <span className="text-[#9B1B30]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isZh ? '你的邮箱' : 'you@example.com'}
                  className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1B2A4A] mb-1">
                  {isZh ? 'WhatsApp（可选，更快回复）' : 'WhatsApp (optional, faster reply)'}
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+86 173 2576 4171"
                  className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#9B1B30] hover:bg-[#7A1526] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-2.5 transition-colors flex items-center justify-center gap-1.5"
              >
                {submitting
                  ? isZh
                    ? '提交中…'
                    : 'Saving…'
                  : isZh
                    ? '免费获取我的评估'
                    : 'Get My Free Assessment'}
              </button>

              <p className="text-[11px] text-[#4B5563] text-center leading-snug">
                {isZh
                  ? '无垃圾邮件。您可以随时取消订阅。'
                  : 'No spam. Unsubscribe anytime.'}
              </p>

              <button
                type="button"
                onClick={close}
                className="w-full text-[11px] text-[#4B5563] hover:text-[#1B2A4A] py-1"
              >
                {isZh ? '不，谢谢，继续浏览' : "No thanks, I'll keep browsing"}
              </button>
            </form>
          </>
        )}
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

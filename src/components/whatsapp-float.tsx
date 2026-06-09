'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { track } from '@/lib/analytics';

/**
 * WhatsAppFloat — the single most important conversion surface on
 * the SICA public site. One tap to chat with the SICA team on
 * WhatsApp. Visible on every public page, mobile-first sizing.
 *
 * Design notes:
 *  - Brand-aligned WhatsApp green (#25D366) circle, no rounded
 *    corners (SICA convention uses square corners but the
 *    WhatsApp brand identity demands a circle — exception is OK
 *    here because the whole CTA is a single 56-64px icon button,
 *    not a card or panel).
 *  - Larger touch target on mobile (h-16 w-16 = 64px) for thumb
 *    reach. Tighter on desktop (h-14 w-14 = 56px) to leave room for
 *    the chatbot bubble on the right.
 *  - "Ping" pulse on first appearance within the session (2
 *    cycles, ~2s) so the eye notices it without being annoying.
 *  - Tooltip on hover (desktop only — hidden on touch devices
 *    via the @media (hover: hover) variant).
 *  - Close button: persists dismissal to localStorage. Reappears
 *    after 7 days (or after a hard refresh that doesn't see the
 *    key — so a returning visitor isn't permanently nagged).
 *  - Pre-filled message in the wa.me URL means the visitor
 *    hits "send" without typing anything — already in the SICA
 *    conversation context.
 *  - z-50 (same as Chatbot) but positioned at left-4, so it
 *    doesn't visually fight the chat bubble at right-4.
 */
const PHONE = '8617325764171';
const HIDE_KEY = 'sica_whatsapp_dismissed_at';
const HIDE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function buildWaUrl(locale: 'en' | 'zh'): string {
  const text =
    locale === 'zh'
      ? '你好，我想了解去中国留学的详情，可以帮我吗？'
      : "Hi SICA, I'm interested in studying in China. Can you help me?";
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`;
}

export function WhatsAppFloat() {
  const { locale } = useI18n();
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Pulse on first mount within the session. The animation is
  // CSS-only so it doesn't keep firing on every re-render.
  const [shouldPulse, setShouldPulse] = useState(false);

  // Hide if the visitor dismissed us within the last 7 days.
  useEffect(() => {
    try {
      const ts = localStorage.getItem(HIDE_KEY);
      if (ts) {
        const elapsed = Date.now() - Number(ts);
        if (!Number.isNaN(elapsed) && elapsed < HIDE_DURATION_MS) {
          setDismissed(true);
        }
      }
    } catch {
      // localStorage not available — fail open (show the button)
    }
    setMounted(true);
    // Defer one frame so the pulse animation actually plays.
    const id = window.setTimeout(() => setShouldPulse(true), 250);
    return () => window.clearTimeout(id);
  }, []);

  if (!mounted || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(HIDE_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  };

  return (
    <div
      className="fixed bottom-4 left-4 z-50 sm:bottom-6 sm:left-6"
      // Don't render into the a11y tree as a dialog (it's a
      // link, not a modal). The button itself is the link.
    >
      {/* Tooltip — desktop hover only */}
      <div
        className="hidden sm:flex absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#1B2A4A] text-white text-xs font-semibold px-3 py-1.5 whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ borderRadius: 0 }}
      >
        {locale === 'zh' ? '在 WhatsApp 上咨询 SICA' : 'Chat with SICA on WhatsApp'}
        {/* Tiny arrow pointing left to the button */}
        <span
          className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0"
          style={{
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderRight: '6px solid #1B2A4A',
          }}
        />
      </div>

      <a
        href={buildWaUrl(locale)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          track('whatsapp_click', { location: 'float_button', locale });
        }}
        aria-label={locale === 'zh' ? '在 WhatsApp 上咨询 SICA' : 'Chat with SICA on WhatsApp'}
        // The `group` class enables the hover tooltip on the child
        // above. The pulse class is a CSS keyframe that runs for
        // ~2s on first mount.
        className={`group relative flex items-center justify-center bg-[#25D366] hover:bg-[#1DBA59] text-white shadow-lg hover:shadow-2xl transition-all duration-200 hover:scale-105 h-16 w-16 sm:h-14 sm:w-14 ${
          shouldPulse ? 'sica-wa-pulse' : ''
        }`}
        style={{ borderRadius: '50%' }}
      >
        {/* WhatsApp glyph (inline SVG, brand-true) */}
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-8 w-8 sm:h-7 sm:w-7 fill-white"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c.016 1.987.547 3.948 1.55 5.68L.057 24l6.51-1.708a11.882 11.882 0 0 0 5.483 1.378h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
        </svg>

        {/* Close (dismiss) — small X badge in the top-right corner.
            On mobile this is tappable as its own button (48px hit
            target). On desktop it's smaller. Hidden by default —
            only appears on hover or when the pulse is running, so
            the button looks clean by default. */}
        {shouldPulse && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              dismiss();
            }}
            aria-label={locale === 'zh' ? '关闭' : 'Dismiss'}
            className="absolute -top-1 -right-1 h-6 w-6 sm:h-5 sm:w-5 bg-white text-[#4B5563] hover:text-[#9B1B30] border border-gray-200 flex items-center justify-center transition-colors shadow"
            style={{ borderRadius: '50%' }}
          >
            <X size={12} />
          </button>
        )}
      </a>

      {/* Pulse keyframe — 2 cycles of expanding + fading ring */}
      <style jsx>{`
        @keyframes sica-wa-pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.6);
          }
          70% {
            box-shadow: 0 0 0 18px rgba(37, 211, 102, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(37, 211, 102, 0);
          }
        }
        .sica-wa-pulse {
          animation: sica-wa-pulse 1.2s ease-out 2;
        }
      `}</style>
    </div>
  );
}

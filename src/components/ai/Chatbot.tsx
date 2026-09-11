'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { ChatWindow } from './ChatWindow';
import { track } from '@/lib/analytics';
import { useI18n } from '@/lib/i18n';

const NUDGE_DELAY_MS = 30_000; // 30s of idle dwell on the page
const NUDGE_HIDE_KEY = 'sica_chat_nudge_dismissed_at';
const NUDGE_HIDE_DURATION_MS = 24 * 60 * 60 * 1000; // 24h
const SWIPE_CLOSE_THRESHOLD_PX = 80; // mobile swipe-down distance

// Only auto-nudge on pages where the visitor is actually
// looking at content they might have questions about. Skip on
// /contact, /assessment (already in funnel), and obviously
// skip on /admin, /partner, /student (Chatbot isn't mounted
// there at all, so this is belt-and-suspenders).
function shouldNudgeOnPath(pathname: string): boolean {
  if (!pathname) return false;
  if (pathname === '/' || pathname === '') return true;
  if (pathname === '/universities' || pathname === '/programs' || pathname === '/scholarships') return true;
  if (pathname.startsWith('/universities/')) return true;
  if (pathname.startsWith('/programs/')) return true;
  if (pathname.startsWith('/scholarships/')) return true;
  if (pathname.startsWith('/majors')) return true;
  return false;
}

export function Chatbot() {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [nudgeOpen, setNudgeOpen] = useState(false);
  const pathname = usePathname();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const readLocale = (): 'en' | 'zh' => {
    if (typeof document === 'undefined') return 'en';
    return document.documentElement.lang === 'zh' ? 'zh' : 'en';
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setNudgeOpen(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    track('chatbot_opened', { locale: readLocale() });
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
    track('chatbot_closed', { locale: readLocale() });
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleRestore = () => {
    setIsMinimized(false);
  };

  const dismissNudge = () => {
    setNudgeOpen(false);
    try {
      localStorage.setItem(NUDGE_HIDE_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  };

  // Phase 81: mobile swipe-down-to-close + desktop Escape key.
  // Swipe handler tracks the touchstart Y position; if the touchend
  // position is >80px below it, we close the chat. Only active when
  // the chat is open + the screen is <768px (mobile breakpoint).
  useEffect(() => {
    if (!isOpen) return;
    if (typeof window === 'undefined') return;
    if (window.innerWidth >= 768) return;

    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const endY = e.changedTouches[0]?.clientY ?? 0;
      const delta = endY - touchStartY;
      if (delta > SWIPE_CLOSE_THRESHOLD_PX) {
        track('chatbot_swipe_close', { locale: readLocale() });
        handleClose();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (isOpen) {
      setNudgeOpen(false);
      return;
    }
    if (!shouldNudgeOnPath(pathname)) {
      setNudgeOpen(false);
      return;
    }
    try {
      const ts = localStorage.getItem(NUDGE_HIDE_KEY);
      if (ts) {
        const elapsed = Date.now() - Number(ts);
        if (!Number.isNaN(elapsed) && elapsed < NUDGE_HIDE_DURATION_MS) {
          setNudgeOpen(false);
          return;
        }
      }
    } catch {
      // fail open
    }
    timerRef.current = setTimeout(() => {
      setNudgeOpen(true);
      timerRef.current = null;
    }, NUDGE_DELAY_MS);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [pathname, isOpen]);

  if (!isOpen) {
    return (
      <>
        {nudgeOpen && (
          <div
            role="dialog"
            aria-label={t('chat.nudgeTitle')}
            className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 w-72 max-w-[calc(100vw-2rem)] bg-white border-2 border-[#9B1B30] shadow-2xl"
            style={{ borderRadius: 0, animation: 'sica-nudge-in 200ms ease-out' }}
          >
            <div className="flex items-start gap-2 p-3">
              <Sparkles className="h-5 w-5 text-[#D4A853] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1B2A4A] leading-snug">
                  {t('chat.nudgeTitle')}
                </p>
                <p className="text-xs text-[#4B5563] leading-snug mt-0.5">
                  {t('chat.nudgeSubtitle')}
                </p>
              </div>
              <button
                type="button"
                onClick={dismissNudge}
                aria-label="Dismiss"
                className="text-[#4B5563] hover:text-[#1B2A4A] transition-colors p-0.5 shrink-0"
              >
                <X size={16} />
              </button>
            </div>
            <button
              type="button"
              onClick={handleOpen}
              className="w-full bg-[#9B1B30] hover:bg-[#7A1526] text-white text-sm font-bold py-2 transition-colors flex items-center justify-center gap-1.5"
            >
              <MessageSquare size={14} />
              {t('chat.nudgeCta')}
            </button>
          </div>
        )}

        {/* Phase 81: rounded-none per AGENTS.md brand spec. */}
        <button
          onClick={handleOpen}
          className={`fixed bottom-4 right-4 z-50 w-12 h-12 sm:w-14 sm:h-14 bg-[#9B1B30] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center ${
            nudgeOpen ? 'animate-pulse' : ''
          }`}
          aria-label={t('chat.header')}
          title={t('chat.header')}
        >
          <MessageSquare size={24} className="sm:hidden" />
          <MessageSquare size={28} className="hidden sm:block" />
        </button>

        <style jsx>{`
          @keyframes sica-nudge-in {
            from {
              opacity: 0;
              transform: translateY(8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </>
    );
  }

  if (isMinimized) {
    return (
      // Phase 81: rounded-none brand compliance.
      <button
        onClick={handleRestore}
        className="fixed bottom-4 right-4 z-50 px-3 py-2 sm:px-4 sm:py-3 bg-[#9B1B30] text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 text-sm"
      >
        <MessageSquare size={18} className="sm:hidden" />
        <MessageSquare size={20} className="hidden sm:block" />
        <span className="font-medium">{t('chat.minimizedLabel')}</span>
        <div className="flex-1" />
        <X size={18} onClick={(e) => { e.stopPropagation(); handleClose(); }} className="hover:text-red-200" />
      </button>
    );
  }

  return (
    <ChatWindow
      isOpen={isOpen}
      onClose={handleClose}
      onMinimize={handleMinimize}
    />
  );
}
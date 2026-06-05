'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { MessageCircle, X, Mail, Clock } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

/**
 * StickyContact — floating "Chat with us" widget that surfaces on every
 * public page. Click to expand a popover with WeChat, WhatsApp, and
 * email contact options. Hidden on /admin, /partner, /student portals
 * (see src/components/client-layout.tsx).
 *
 * Design notes:
 *  - Brand-aligned: deep crimson square button (no rounded corners),
 *    matching the existing palette.
 *  - Accessible: aria-expanded on the trigger, role="dialog" on the
 *    popover, keyboard-dismissible (Escape closes).
 *  - Outside-click closes the popover.
 *  - QR codes are 2048x2048 jpegs; we render at 144px for the popover
 *    and provide a click-to-enlarge hint.
 */
export function StickyContact() {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [zoomedQr, setZoomedQr] = useState<'wechat' | 'whatsapp' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setZoomedQr(null);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <>
      <div
        ref={containerRef}
        // Sits on the bottom-LEFT, ABOVE the WhatsApp direct-link
        // button (which lives at bottom-4). The WhatsApp button is
        // the primary "tap to chat" action; this widget is the
        // secondary "more contact options" entry point (WeChat QR
        // for Chinese users, email, hours). Popover opens upward
        // and never collides with the WhatsApp button below.
        className="fixed bottom-24 left-4 z-40 sm:bottom-24 sm:left-6"
      >
        {/* Popover — on desktop: anchored to the button, opens above.
            On mobile: becomes a full-width bottom sheet for thumb
            reach. */}
        {open && (
          <div
            role="dialog"
            aria-label={t('stickyContact.title')}
            className="fixed inset-x-0 bottom-0 sm:absolute sm:inset-auto sm:bottom-16 sm:left-0 w-full sm:w-80 sm:max-w-[calc(100vw-2.5rem)] bg-white border-t-2 sm:border-t-0 sm:border-2 border-[#1B2A4A] shadow-2xl"
            style={{ animation: 'sica-popover-in 160ms ease-out' }}
          >
            {/* Header */}
            <div className="bg-[#1B2A4A] text-white px-4 py-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  {t('stickyContact.title')}
                </h3>
                <p className="text-xs text-gray-300 mt-0.5">
                  {t('stickyContact.subtitle')}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="text-gray-300 hover:text-white transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Channels */}
            <div className="p-4 space-y-3">
              {/* WeChat */}
              <button
                type="button"
                onClick={() => setZoomedQr('wechat')}
                className="w-full flex items-center gap-3 p-3 border border-gray-200 hover:border-[#1B2A4A] hover:bg-gray-50 transition-colors text-left"
              >
                <div className="shrink-0 w-12 h-12 bg-[#07C160] flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    fill="white"
                    className="w-7 h-7"
                    aria-hidden="true"
                  >
                    <path d="M8.5 8C5.46 8 3 10.46 3 13.5c0 1.69.94 3.18 2.41 4.13l-.6 1.84 2.13-1.07c.49.07.99.1 1.5.1.18 0 .36 0 .54-.02-.11-.4-.18-.81-.18-1.23 0-2.66 2.46-4.81 5.5-4.81.18 0 .35 0 .52.02C14.4 10.13 11.74 8 8.5 8zM6 12.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5.5 1c-2.49 0-4.5 1.79-4.5 4 0 1.32.78 2.49 1.99 3.22l-.5 1.5 1.74-.87c.4.06.81.09 1.27.09 2.49 0 4.5-1.79 4.5-4s-2.01-3.94-4.5-3.94zm-2 2.5c-.41 0-.75-.34-.75-.75s.34-.75.75-.75.75.34.75.75-.34.75-.75.75zm4 0c-.41 0-.75-.34-.75-.75s.34-.75.75-.75.75.34.75.75-.34.75-.75.75z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#1B2A4A]">
                    {t('contact.wechat')}
                  </div>
                  <div className="text-xs text-[#4B5563] truncate">
                    {t('contact.wechatDesc')}
                  </div>
                </div>
                <div className="text-xs text-[#9B1B30] font-medium shrink-0">
                  {locale === 'zh' ? '点击' : 'Scan'} →
                </div>
              </button>

              {/* WhatsApp */}
              <button
                type="button"
                onClick={() => setZoomedQr('whatsapp')}
                className="w-full flex items-center gap-3 p-3 border border-gray-200 hover:border-[#1B2A4A] hover:bg-gray-50 transition-colors text-left"
              >
                <div className="shrink-0 w-12 h-12 bg-[#25D366] flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    fill="white"
                    className="w-7 h-7"
                    aria-hidden="true"
                  >
                    <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.297-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.18 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345m-5.446 7.443h-.016c-1.77 0-3.524-.48-5.055-1.38l-.36-.214-3.75.975 1.005-3.645-.239-.375a9.869 9.869 0 0 1-1.516-5.26c0-5.445 4.455-9.885 9.942-9.885 2.654 0 5.145 1.035 7.021 2.91 1.875 1.859 2.909 4.35 2.909 6.99-.004 5.444-4.46 9.885-9.935 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a12.062 12.062 0 0 0 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.495-8.411" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#1B2A4A]">
                    {t('contact.whatsapp')}
                  </div>
                  <div className="text-xs text-[#4B5563] truncate">
                    {t('contact.whatsappDesc')}
                  </div>
                </div>
                <div className="text-xs text-[#9B1B30] font-medium shrink-0">
                  {locale === 'zh' ? '点击' : 'Scan'} →
                </div>
              </button>

              {/* Email */}
              <a
                href="mailto:mlsjahid@qq.com"
                className="w-full flex items-center gap-3 p-3 border border-gray-200 hover:border-[#1B2A4A] hover:bg-gray-50 transition-colors"
              >
                <div className="shrink-0 w-12 h-12 bg-[#1B2A4A] flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#1B2A4A]">
                    {t('contact.emailLabel')}
                  </div>
                  <div className="text-xs text-[#4B5563] truncate">
                    mlsjahid@qq.com
                  </div>
                </div>
                <div className="text-xs text-[#9B1B30] font-medium shrink-0">
                  {locale === 'zh' ? '发送' : 'Mail'} →
                </div>
              </a>

              {/* Hours */}
              <div className="flex items-start gap-2 px-3 py-2 bg-gray-50 border border-gray-200 text-xs text-[#4B5563]">
                <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#1B2A4A]" />
                <div className="leading-relaxed">
                  <div className="font-medium text-[#1B2A4A]">
                    {t('contact.hoursTitle')}
                  </div>
                  <div>{t('contact.hoursWeekday')} {t('contact.hoursWeekdayTime')}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trigger button */}
        <button
          type="button"
          aria-label={t('stickyContact.buttonLabel')}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          // Deep navy (#1B2A4A) instead of crimson so it's visually
          // distinct from the AI Chatbot (crimson, bottom-right).
          // Two floating crimson squares on opposite corners would
          // confuse users; navy vs crimson signals "different tools".
          className={`relative h-14 w-14 sm:h-16 sm:w-16 bg-[#1B2A4A] hover:bg-[#0F1B33] text-white shadow-lg hover:shadow-xl transition-all duration-150 flex items-center justify-center group ${
            open ? 'scale-95' : 'hover:scale-105'
          }`}
        >
          {open ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}
          {/* Notification dot (subtle pulse) — gold for the navy
              background, hides once user has opened the widget. */}
          <span
            className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#D4A853] rounded-none ring-2 ring-white"
            style={{
              animation: open ? 'none' : 'sica-pulse 1.8s ease-in-out infinite',
            }}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Zoomed QR overlay */}
      {zoomedQr && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={zoomedQr === 'wechat' ? t('contact.wechat') : t('contact.whatsapp')}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={() => setZoomedQr(null)}
        >
          <div
            className="bg-white border-2 border-[#1B2A4A] max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#1B2A4A]">
                {zoomedQr === 'wechat' ? t('contact.wechat') : t('contact.whatsapp')}
              </h3>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setZoomedQr(null)}
                className="text-[#4B5563] hover:text-[#1B2A4A] transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>
            <div className="relative aspect-square w-full bg-white">
              <Image
                src={zoomedQr === 'wechat' ? '/wechat-qr.jpeg' : '/whatsapp-qr.jpeg'}
                alt={`${zoomedQr === 'wechat' ? 'WeChat' : 'WhatsApp'} QR code`}
                fill
                sizes="(max-width: 384px) 100vw, 384px"
                className="object-contain"
                priority
              />
            </div>
            <p className="mt-4 text-sm text-[#4B5563] text-center">
              {zoomedQr === 'wechat' ? t('contact.wechatDesc') : t('contact.whatsappDesc')}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

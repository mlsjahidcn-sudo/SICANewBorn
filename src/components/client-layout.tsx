'use client';

import { I18nProvider } from '@/lib/i18n';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/lib/i18n-translations';

/**
 * Phase 67: dynamic-import the 4 floating/overlay widgets so they
 * don't ship in the initial JS bundle. They only mount after the
 * user scrolls (or clicks, or mouse-leaves) — never on first paint.
 *
 * - Chatbot: 50KB+ tree (ChatWindow + ChatCards + Message) + Lucide
 *   icons + Radix Slot. Only renders when user clicks the bubble.
 * - WhatsAppFloat: tiny but still ships eagerly today.
 * - StickyContact: small floating button with a modal that loads
 *   QR code images on open.
 * - ExitIntentPopup: only mounts when the user moves the mouse
 *   toward the browser chrome (about to leave).
 *
 * `ssr: false` because they're all interactive-only and rendering
 * them server-side would just produce a non-functional placeholder.
 * `loading: () => null` so they don't take any layout space while
 * the chunks load.
 */
const Chatbot = dynamic(() => import('@/components/ai/Chatbot').then((m) => m.Chatbot), {
  ssr: false,
  loading: () => null,
});
const WhatsAppFloat = dynamic(() => import('@/components/whatsapp-float').then((m) => m.WhatsAppFloat), {
  ssr: false,
  loading: () => null,
});
const StickyContact = dynamic(() => import('@/components/sticky-contact').then((m) => m.StickyContact), {
  ssr: false,
  loading: () => null,
});
const ExitIntentPopup = dynamic(() => import('@/components/exit-intent-popup').then((m) => m.ExitIntentPopup), {
  ssr: false,
  loading: () => null,
});

export function ClientLayout({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const isPartner = pathname.startsWith('/partner');
  const isStudent = pathname.startsWith('/student');

  if (isAdmin || isPartner || isStudent) {
    return <>{children}</>;
  }

  return (
    <I18nProvider initialLocale={initialLocale}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Chatbot />
        <WhatsAppFloat />
        <StickyContact />
        <ExitIntentPopup />
      </div>
    </I18nProvider>
  );
}

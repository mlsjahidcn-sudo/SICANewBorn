'use client';

import { useEffect, useState } from 'react';
import { PublicPromotions } from '@/components/public-promotions';
import { I18nProvider } from '@/lib/i18n';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CscaPrepBanner } from '@/components/csca-prep-banner';
import { WhatsAppGroupPopup } from '@/components/whatsapp-group-popup';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/lib/i18n-translations';
import type { CatalogCounts } from '@/lib/data-fetcher';
import { PUBLIC_WEBINAR_ENABLED, PUBLIC_WEBINAR_POPUP_ENABLED } from '@/lib/webinar-config';

/**
 * Phase 67: dynamic-import the floating/overlay widgets so they
 * don't ship in the initial JS bundle. They only mount after the
 * user scrolls (or clicks, or mouse-leaves) — never on first paint.
 *
 * - Chatbot: 50KB+ tree (ChatWindow + ChatCards + Message) + Lucide
 *   icons + Radix Slot. Only renders when user clicks the bubble.
 * - WhatsAppFloat: tiny but still ships eagerly today.
 * - StickyContact: small floating button with a modal that loads
 *   QR code images on open.
 * - KitPromoPopup: exit-intent / delayed promo for /china-admission-kit
 *   (replaces ExitIntentPopup counselling overlay). Also mounts on
 *   quiet university/program detail pages.
 * - WebinarPromoPopup: static-config invitation card (restored
 *   after Phase 165 removed it with the dynamic sessions API).
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
const StickyContact = dynamic(() => import('@/components/sticky-contact').then((m) => m.StickyContact), {
  ssr: false,
  loading: () => null,
});
const WhatsAppFloat = dynamic(() => import('@/components/whatsapp-float').then((m) => m.WhatsAppFloat), {
  ssr: false,
  loading: () => null,
});
const KitPromoPopup = dynamic(() => import('@/components/kit-promo-popup').then((m) => m.KitPromoPopup), {
  ssr: false,
  loading: () => null,
});
const WebinarPromoPopup = dynamic(
  () => import('@/components/webinar-promo-popup').then((m) => m.WebinarPromoPopup),
  { ssr: false, loading: () => null },
);

export function ClientLayout({
  children,
  initialLocale,
  catalogCounts,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
  /** Live catalogue row counts (universities / programs / scholarships),
   *  read once in the server root layout. The footer is a client
   *  component, so it can't query the DB itself. */
  catalogCounts: CatalogCounts;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasBrowsed, setHasBrowsed] = useState(false);
  useEffect(() => {
    const onScroll = (): void => { if (window.scrollY >= 160) setHasBrowsed(true); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const isDetail = /^\/(universities|programs)\/[^/]+$/.test(pathname) && !pathname.endsWith('/compare');
  const isHandoff = ['/counselling', '/assessment', '/apply', '/contact', '/webinar-2027-intake-csc'].includes(pathname);
  const quiet = isDetail || isHandoff;
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');
  const isPartner = pathname === '/partner' || pathname.startsWith('/partner/');
  const isStudent = pathname === '/student' || pathname.startsWith('/student/');

  if (isAdmin || isPartner || isStudent) {
    return <>{children}</>;
  }

  return (
    <I18nProvider initialLocale={initialLocale}>
      <div className={`flex min-h-screen flex-col ${isDetail ? 'pb-24 lg:pb-0' : ''}`}>
        <CscaPrepBanner />
        <Header onMobileMenuChange={setMobileMenuOpen} />
        <main className="flex-1">{children}</main>
        <Footer counts={catalogCounts} />
        {/* Promotions yield to navigation, form entry and open dialogs:
            PublicPromotions only mounts them once the visitor has engaged
            with the page, and hides them again while they are typing in a
            form or reading a dialog. The Kit promo replaces the old
            exit-intent counselling overlay and mounts on quiet detail
            pages too. */}
        {!isHandoff && <PublicPromotions paused={mobileMenuOpen}>
          <KitPromoPopup />
          {!quiet && <WhatsAppGroupPopup />}
        </PublicPromotions>}
        {/* The webinar modal owns the promo slot while a session is upcoming,
            so it sits OUTSIDE PublicPromotions: Radix renders
            role="dialog" data-state="open", which PublicPromotions reads as
            "a dialog is open" — inside it, the modal would unmount the
            instant it opened. It brings its own path denylist and its own
            form/dialog interference check. */}
        {PUBLIC_WEBINAR_ENABLED && PUBLIC_WEBINAR_POPUP_ENABLED && <WebinarPromoPopup />}
        {!quiet && <div className={mobileMenuOpen || !hasBrowsed ? 'hidden' : undefined}>
          <Chatbot autoNudge={false} />
          <StickyContact />
          <WhatsAppFloat />
        </div>}
      </div>
    </I18nProvider>
  );
}

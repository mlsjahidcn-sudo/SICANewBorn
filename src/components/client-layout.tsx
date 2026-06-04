'use client';

import { I18nProvider } from '@/lib/i18n';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Chatbot } from '@/components/ai/Chatbot';
import { StickyContact } from '@/components/sticky-contact';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/lib/i18n-translations';

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
        <StickyContact />
      </div>
    </I18nProvider>
  );
}

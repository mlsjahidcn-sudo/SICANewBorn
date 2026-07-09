import type { Metadata } from 'next';
import Script from 'next/script';
import { GoogleAnalytics } from '@next/third-parties/google';
import { cookies } from 'next/headers';
import { Inspector } from 'react-dev-inspector';
import './globals.css';
import { ClientLayout } from '@/components/client-layout';
import { inter } from '@/app/fonts';
import { getOrganizationSchema, getWebsiteSchema, getEditorialTeamSchema } from '@/lib/structured-data';
import type { Locale } from '@/lib/i18n-translations';

import { SITE_URL } from '@/lib/site-url';
export const metadata: Metadata = {
  title: {
    default: 'SICA | Study in China - Your Gateway to Top Chinese Universities',
    template: '%s | SICA',
  },
  description:
    'SICA helps international students discover top Chinese universities, programs, and scholarship opportunities. Professional education consulting from application to arrival.',
  keywords: [
    'study in china',
    'SICA',
    'Chinese universities',
    'international students',
    'scholarships',
    'education consulting',
    'study abroad',
    'Tsinghua',
    'Peking University',
    'CSC scholarship',
  ],
  authors: [{ name: 'SICA' }],
  creator: 'SICA',
  publisher: 'SICA',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || SITE_URL),
  alternates: {
    canonical: '/',
    // hreflang: SICA uses cookie-based i18n (single URL serves both en
    // and zh based on the sica-locale cookie). We declare both language
    // variants pointing at the same URL so Google indexes the page for
    // both English and Chinese users. x-default signals the fallback
    // for any other locale. Per-page canonicals (in each route's own
    // metadata) override the root for deeper pages.
    languages: {
      'en': '/',
      'zh': '/',
      'x-default': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'SICA',
    title: 'SICA | Study in China - Your Gateway to Top Chinese Universities',
    description:
      'Professional study-in-China consultancy. Top universities, scholarships, and end-to-end support for international students.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SICA | Study in China',
    description: 'Top Chinese universities, scholarships, and end-to-end support for international students.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

async function readLocaleCookie(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get('sica-locale')?.value;
  return value === 'zh' ? 'zh' : 'en';
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';
  const initialLocale = await readLocaleCookie();

  // JSON-LD for SEO (Organization + WebSite + Editorial Team). Service
  // schema is added on relevant pages (e.g. home) so it can be
  // locale-aware. The Editorial Team entity is the author for all
  // Article JSON-LD on guide pages, giving Google and LLMs a
  // consistent author to attribute to.
  const organizationJsonLd = JSON.stringify(getOrganizationSchema());
  const websiteJsonLd = JSON.stringify(getWebsiteSchema());
  const editorialTeamJsonLd = JSON.stringify(getEditorialTeamSchema());

  return (
    <html lang={initialLocale} className={inter.variable}>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        {isDev && <Inspector />}
        {/* Global JSON-LD structured data for SEO */}
        <Script
          id="ld-organization"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: organizationJsonLd }}
        />
        <Script
          id="ld-website"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: websiteJsonLd }}
        />
        <Script
          id="ld-editorial-team"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: editorialTeamJsonLd }}
        />
        <ClientLayout initialLocale={initialLocale}>{children}</ClientLayout>
        {/* Google Analytics 4 — env-gated. Set
            NEXT_PUBLIC_GA_MEASUREMENT_ID (G-XXXXXXXXXX) in your env
            to go live. The component is from @next/third-parties/google
            (Vercel's official wrapper) — it auto-tracks SPA page
            views on App Router route changes, so we don't need
            to wire usePathname + useSearchParams listeners by
            hand. Custom events (apply_click, assessment_submit,
            whatsapp_click, etc.) fire from src/lib/analytics.ts. */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}

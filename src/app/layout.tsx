import type { Metadata } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import { cookies } from 'next/headers';
import { DevInspector } from '@/components/dev-inspector';
import './globals.css';
import { ClientLayout } from '@/components/client-layout';
import { inter } from '@/app/fonts';
import { getOrganizationSchema, getWebsiteSchema, getEditorialTeamSchema } from '@/lib/structured-data';
import type { Locale } from '@/lib/i18n-translations';

import { SITE_URL } from '@/lib/site-url';

const baseMetadata: Metadata = {
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
  // SITE_URL is already trailing-slash-normalised; the raw env var is
  // not, and mixing the two is how a double slash got into robots.txt.
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'SICA',
    title: 'SICA | Study in China - Your Gateway to Top Chinese Universities',
    description:
      'Professional study-in-China consultancy. Top universities, scholarships, and end-to-end support for international students.',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'SICA — Study in China',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SICA | Study in China',
    description: 'Top Chinese universities, scholarships, and end-to-end support for international students.',
    images: ['/og-default.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await readLocaleCookie();
  return {
    ...baseMetadata,
    // Note: alternates / hreflang are set per-page so the canonical URL
    // always matches the rendered route. The root page sets its own in
    // src/app/page.tsx. The helper in src/lib/alternates.ts uses a
    // `?lang=` query parameter for the language variants; the middleware
    // in src/middleware.ts turns that query parameter into the
    // `sica-locale` cookie so the alternate URLs render the right language.
    openGraph: {
      ...baseMetadata.openGraph,
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
    },
  };
}

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
        {isDev && <DevInspector />}
        {/* Global JSON-LD structured data for SEO.
          //
          // These were `<Script strategy="beforeInteractive">`. That
          // ships the JSON-LD inside the RSC flight payload
          // (`self.__next_s.push([0,{"type":"application/ld+json",...}])`)
          // rather than as a literal <script type="application/ld+json">
          // element in the server HTML. Verified on the live site
          // 2026-10-17: the homepage had ZERO Organization/WebSite
          // script tags and the entity node existed only in the flight
          // payload, so it was referenced by @id but never defined.
          //
          // Anything that does not execute JavaScript therefore never
          // saw the Organization node — that is most AI crawlers
          // (ChatGPT-User, Perplexity, ClaudeBot), every social
          // scraper, and many SEO tools. The Organization entity is the
          // single most important node for answer engines: it is what
          // lets one resolve "SICA" to a logo, a contact point, an
          // address, a parent company and a body of knowledge.
          //
          // A plain inline <script> renders into the HTML directly.
          // The page-level JSON-LD on guide and catalog pages already
          // works this way and is confirmed present as real script
          // tags. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: organizationJsonLd }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: websiteJsonLd }}
        />
        <script
          type="application/ld+json"
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

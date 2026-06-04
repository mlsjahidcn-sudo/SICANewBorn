import type { Metadata } from 'next';
import Script from 'next/script';
import { cookies } from 'next/headers';
import { Inspector } from 'react-dev-inspector';
import './globals.css';
import { ClientLayout } from '@/components/client-layout';
import { inter } from '@/app/fonts';
import { getOrganizationSchema, getWebsiteSchema, getEditorialTeamSchema } from '@/lib/structured-data';
import type { Locale } from '@/lib/i18n-translations';

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://sica.com.cn'),
  alternates: {
    canonical: '/',
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
      </body>
    </html>
  );
}

import { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { bankingGuide } from '@/lib/guides/banking';
import { GuidePage } from '@/components/guides/guide-page';

import { SITE_URL } from '@/lib/site-url';
export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = bankingGuide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `${SITE_URL}/guides/banking` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/guides/banking`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.title,
      description: guide.description,
    },
  };
}

export default async function BankingGuidePage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = bankingGuide[locale];
  return <GuidePage guide={guide} pathSegment="banking" />;
}

import { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { visaGuide } from '@/lib/guides/visa';
import { GuidePage } from '@/components/guides/guide-page';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sica.com.cn';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = visaGuide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `${SITE_URL}/guides/visa` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/guides/visa`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.title,
      description: guide.description,
    },
  };
}

export default async function VisaGuidePage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = visaGuide[locale];
  return <GuidePage guide={guide} pathSegment="visa" />;
}

import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { chinaMobileInternetGuide } from '@/lib/guides/china-mobile-internet-for-international-students';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = chinaMobileInternetGuide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: buildLanguageAlternates('/china-mobile-internet-for-international-students'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/china-mobile-internet-for-international-students`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function ChinaMobileInternetPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = chinaMobileInternetGuide[locale];
  return <GuidePage guide={guide} pathSegment="china-mobile-internet-for-international-students" urlPath="/china-mobile-internet-for-international-students" />;
}

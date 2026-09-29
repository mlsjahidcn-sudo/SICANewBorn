import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { ustcGuide } from '@/lib/guides/university-of-science-and-technology-of-china';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = ustcGuide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: buildLanguageAlternates('/university-of-science-and-technology-of-china'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/university-of-science-and-technology-of-china`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function UniversityOfScienceAndTechnologyOfChinaPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = ustcGuide[locale];
  return <GuidePage guide={guide} pathSegment="university-of-science-and-technology-of-china" urlPath="/university-of-science-and-technology-of-china" />;
}

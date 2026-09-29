import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { pekingUniversityVsFudanGuide } from '@/lib/guides/peking-university-vs-fudan';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = pekingUniversityVsFudanGuide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: buildLanguageAlternates('/peking-university-vs-fudan'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/peking-university-vs-fudan`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function PekingUniversityVsFudanPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = pekingUniversityVsFudanGuide[locale];
  return (
    <GuidePage guide={guide} pathSegment="peking-university-vs-fudan" urlPath="/peking-university-vs-fudan" />
  );
}

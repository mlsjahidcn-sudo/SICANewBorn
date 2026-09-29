import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { bestUniversitiesInNortheastChinaGuide } from '@/lib/guides/best-universities-in-northeast-china';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = bestUniversitiesInNortheastChinaGuide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: buildLanguageAlternates('/best-universities-in-northeast-china'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/best-universities-in-northeast-china`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function BestUniversitiesInNortheastChinaPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = bestUniversitiesInNortheastChinaGuide[locale];
  return (
    <GuidePage
      guide={guide}
      pathSegment="best-universities-in-northeast-china"
      urlPath="/best-universities-in-northeast-china"
    />
  );
}

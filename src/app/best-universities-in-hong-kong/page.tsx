import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { bestUniversitiesInHongKongGuide } from '@/lib/guides/best-universities-in-hong-kong';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = bestUniversitiesInHongKongGuide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: buildLanguageAlternates('/best-universities-in-hong-kong'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/best-universities-in-hong-kong`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function BestUniversitiesInHongKongPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = bestUniversitiesInHongKongGuide[locale];
  return (
    <GuidePage
      guide={guide}
      pathSegment="best-universities-in-hong-kong"
      urlPath="/best-universities-in-hong-kong"
    />
  );
}

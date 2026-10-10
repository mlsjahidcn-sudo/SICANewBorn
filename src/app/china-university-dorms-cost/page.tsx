import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { chinaDormsCostGuide } from '@/lib/guides/china-university-dorms-cost';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = chinaDormsCostGuide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: buildLanguageAlternates('/china-university-dorms-cost'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/china-university-dorms-cost`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function ChinaDormsCostPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = chinaDormsCostGuide[locale];
  return <GuidePage guide={guide} pathSegment="china-university-dorms-cost" urlPath="/china-university-dorms-cost" />;
}

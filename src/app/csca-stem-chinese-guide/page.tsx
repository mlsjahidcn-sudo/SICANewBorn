import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { cscaStemChineseGuide } from '@/lib/guides/csca-stem-chinese-guide';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = cscaStemChineseGuide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: buildLanguageAlternates('/csca-stem-chinese-guide'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/csca-stem-chinese-guide`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function CscaStemChineseGuidePage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = cscaStemChineseGuide[locale];
  return <GuidePage guide={guide} pathSegment="csca-stem-chinese-guide" urlPath="/csca-stem-chinese-guide" />;
}

import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { cscaHumanitiesChineseGuide } from '@/lib/guides/csca-humanities-chinese-guide';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = cscaHumanitiesChineseGuide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: buildLanguageAlternates('/csca-humanities-chinese-guide'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/csca-humanities-chinese-guide`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function CscaHumanitiesChineseGuidePage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = cscaHumanitiesChineseGuide[locale];
  return <GuidePage guide={guide} pathSegment="csca-humanities-chinese-guide" urlPath="/csca-humanities-chinese-guide" />;
}

import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { cscaMathGuide } from '@/lib/guides/csca-mathematics-guide';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = cscaMathGuide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: buildLanguageAlternates('/csca-mathematics-guide'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/csca-mathematics-guide`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function CscaMathematicsGuidePage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = cscaMathGuide[locale];
  return <GuidePage guide={guide} pathSegment="csca-mathematics-guide" urlPath="/csca-mathematics-guide" />;
}

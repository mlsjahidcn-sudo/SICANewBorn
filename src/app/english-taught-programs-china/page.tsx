import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { englishTaughtProgramsGuide } from '@/lib/guides/english-taught-programs-china';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = englishTaughtProgramsGuide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: buildLanguageAlternates('/english-taught-programs-china'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/english-taught-programs-china`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function EnglishTaughtProgramsPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = englishTaughtProgramsGuide[locale];
  return <GuidePage guide={guide} pathSegment="english-taught-programs-china" urlPath="/english-taught-programs-china" />;
}

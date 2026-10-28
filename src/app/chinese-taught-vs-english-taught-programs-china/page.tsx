import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { chineseVsEnglishTaughtGuide } from '@/lib/guides/chinese-taught-vs-english-taught-programs-china';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = chineseVsEnglishTaughtGuide[locale];
  return {
    title: { absolute: guide.seoTitle ?? guide.title },
    description: guide.seoDescription ?? guide.description,
    alternates: await buildLanguageAlternates('/chinese-taught-vs-english-taught-programs-china'),
    openGraph: {
      title: guide.seoTitle ?? guide.title,
      description: guide.seoDescription ?? guide.description,
      url: `${SITE_URL}/chinese-taught-vs-english-taught-programs-china`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.seoTitle ?? guide.title,
      description: guide.seoDescription ?? guide.description,
    },
  };
}

export default async function ChineseVsEnglishTaughtPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = chineseVsEnglishTaughtGuide[locale];
  return (
    <GuidePage
      guide={guide}
      pathSegment="chinese-taught-vs-english-taught-programs-china"
      urlPath="/chinese-taught-vs-english-taught-programs-china"
      howToTitle="How to choose Chinese-taught vs English-taught programs in China"
    />
  );
}

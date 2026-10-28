import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { ageLimitToStudyInChinaGuide } from '@/lib/guides/age-limit-to-study-in-china';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = ageLimitToStudyInChinaGuide[locale];
  return {
    title: { absolute: guide.seoTitle ?? guide.title },
    description: guide.seoDescription ?? guide.description,
    alternates: await buildLanguageAlternates('/age-limit-to-study-in-china'),
    openGraph: {
      title: guide.seoTitle ?? guide.title,
      description: guide.seoDescription ?? guide.description,
      url: `${SITE_URL}/age-limit-to-study-in-china`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.seoTitle ?? guide.title,
      description: guide.seoDescription ?? guide.description,
    },
  };
}

export default async function AgeLimitToStudyInChinaPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = ageLimitToStudyInChinaGuide[locale];
  return (
    <GuidePage
      guide={guide}
      pathSegment="age-limit-to-study-in-china"
      urlPath="/age-limit-to-study-in-china"
      howToTitle="How to check age limits and explain a study gap for China"
    />
  );
}

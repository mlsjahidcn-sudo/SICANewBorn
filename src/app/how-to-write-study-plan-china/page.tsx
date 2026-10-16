import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { howToWriteStudyPlanGuide } from '@/lib/guides/how-to-write-study-plan-china';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = howToWriteStudyPlanGuide[locale];
  return {
    title: { absolute: guide.title },
    description: guide.description,
    alternates: await buildLanguageAlternates('/how-to-write-study-plan-china'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/how-to-write-study-plan-china`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  }
}

export default async function HowToWriteStudyPlanChinaPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = howToWriteStudyPlanGuide[locale];
  return (
    <GuidePage
      guide={guide}
      pathSegment="how-to-write-study-plan-china"
      urlPath="/how-to-write-study-plan-china"
      howToTitle="How to write a study plan for a Chinese university, step by step"
    />
  );
}

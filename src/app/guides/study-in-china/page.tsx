import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { t, type Locale } from '@/lib/i18n-translations';
import { studyInChinaGuide } from '@/lib/guides/study-in-china';
import { GuidePage } from '@/components/guides/guide-page';

import { SITE_URL } from '@/lib/site-url';
export const dynamic = 'force-static';

/**
 * /guides/study-in-china — the long-form pillar guide. RSC with
 * static generation. The GuidePage component handles all
 * rendering including the JSON-LD FAQ + HowTo schemas.
 */
export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = studyInChinaGuide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `${SITE_URL}/guides/study-in-china` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/guides/study-in-china`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.title,
      description: guide.description,
    },
  };
}

export default async function StudyInChinaGuidePage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = studyInChinaGuide[locale];
  return <GuidePage guide={guide} pathSegment="study-in-china" />;
}

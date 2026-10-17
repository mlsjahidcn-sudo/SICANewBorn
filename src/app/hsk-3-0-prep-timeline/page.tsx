import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { hsk3PrepTimelineGuide } from '@/lib/guides/hsk-3-0-prep-timeline';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = hsk3PrepTimelineGuide[locale];
  return {
    title: guide.seoTitle ?? guide.title,
    description: guide.seoDescription ?? guide.description,
    alternates: await buildLanguageAlternates('/hsk-3-0-prep-timeline'),
    openGraph: {
      title: guide.seoTitle ?? guide.title,
      description: guide.seoDescription ?? guide.description,
      url: `${SITE_URL}/hsk-3-0-prep-timeline`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.seoTitle ?? guide.title, description: guide.seoDescription ?? guide.description },
  };
}

export default async function Hsk3PrepTimelinePage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = hsk3PrepTimelineGuide[locale];
  return <GuidePage guide={guide} pathSegment="hsk-3-0-prep-timeline" urlPath="/hsk-3-0-prep-timeline" />;
}

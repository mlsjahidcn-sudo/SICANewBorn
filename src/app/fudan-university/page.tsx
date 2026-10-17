import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { fudanUniversityGuide } from '@/lib/guides/fudan-university';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = fudanUniversityGuide[locale];
  return {
    title: guide.seoTitle ?? guide.title,
    description: guide.seoDescription ?? guide.description,
    alternates: await buildLanguageAlternates('/fudan-university'),
    openGraph: {
      title: guide.seoTitle ?? guide.title,
      description: guide.seoDescription ?? guide.description,
      url: `${SITE_URL}/fudan-university`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.seoTitle ?? guide.title, description: guide.seoDescription ?? guide.description },
  };
}

export default async function FudanUniversityPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = fudanUniversityGuide[locale];
  return <GuidePage guide={guide} pathSegment="fudan-university" urlPath="/fudan-university" />;
}

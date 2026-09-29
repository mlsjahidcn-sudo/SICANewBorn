import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { sunYatSenUniversityGuide } from '@/lib/guides/sun-yat-sen-university';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = sunYatSenUniversityGuide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: buildLanguageAlternates('/sun-yat-sen-university'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/sun-yat-sen-university`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function SunYatSenUniversityPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = sunYatSenUniversityGuide[locale];
  return <GuidePage guide={guide} pathSegment="sun-yat-sen-university" urlPath="/sun-yat-sen-university" />;
}

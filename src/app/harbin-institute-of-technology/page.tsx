import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { harbinInstituteOfTechnologyGuide } from '@/lib/guides/harbin-institute-of-technology';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = harbinInstituteOfTechnologyGuide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: buildLanguageAlternates('/harbin-institute-of-technology'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/harbin-institute-of-technology`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function HarbinInstituteOfTechnologyPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = harbinInstituteOfTechnologyGuide[locale];
  return <GuidePage guide={guide} pathSegment="harbin-institute-of-technology" urlPath="/harbin-institute-of-technology" />;
}

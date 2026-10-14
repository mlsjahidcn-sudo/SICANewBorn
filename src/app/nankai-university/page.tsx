import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { nankaiUniversityGuide } from '@/lib/guides/nankai-university';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = nankaiUniversityGuide[locale];
  return {
    title: { absolute: guide.title },
    description: guide.description,
    alternates: buildLanguageAlternates('/nankai-university'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/nankai-university`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  }
}

export default async function NankaiUniversityPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = nankaiUniversityGuide[locale];
  return (
    <GuidePage
      guide={guide}
      pathSegment="nankai-university"
      urlPath="/nankai-university"
      howToTitle="How to apply to Nankai University, step by step"
    />
  );
}

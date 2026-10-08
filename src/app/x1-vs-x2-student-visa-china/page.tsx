import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { x1x2VisaGuide } from '@/lib/guides/x1-vs-x2-student-visa-china';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = x1x2VisaGuide[locale];
  return {
    title: { absolute: guide.title },
    description: guide.description,
    alternates: buildLanguageAlternates('/x1-vs-x2-student-visa-china'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/x1-vs-x2-student-visa-china`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function X1X2Page() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = x1x2VisaGuide[locale];
  return (
    <GuidePage
      guide={guide}
      pathSegment="x1-vs-x2-student-visa-china"
      urlPath="/x1-vs-x2-student-visa-china"
      howToTitle="How to apply for the right student visa for China"
    />
  );
}
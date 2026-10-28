import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { chinaStudentVisaBangladeshGuide } from '@/lib/guides/china-student-visa-bangladesh';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = chinaStudentVisaBangladeshGuide[locale];
  return {
    title: { absolute: guide.seoTitle ?? guide.title },
    description: guide.seoDescription ?? guide.description,
    alternates: await buildLanguageAlternates('/china-student-visa-bangladesh'),
    openGraph: {
      title: guide.seoTitle ?? guide.title,
      description: guide.seoDescription ?? guide.description,
      url: `${SITE_URL}/china-student-visa-bangladesh`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.seoTitle ?? guide.title,
      description: guide.seoDescription ?? guide.description,
    },
  };
}

export default async function ChinaStudentVisaBangladeshPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = chinaStudentVisaBangladeshGuide[locale];
  return (
    <GuidePage
      guide={guide}
      pathSegment="china-student-visa-bangladesh"
      urlPath="/china-student-visa-bangladesh"
      howToTitle="How to apply for a China X1 student visa from Bangladesh"
    />
  );
}

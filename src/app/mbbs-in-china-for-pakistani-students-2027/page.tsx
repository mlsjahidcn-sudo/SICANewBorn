import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { mbbsPakistaniStudents2027Guide } from '@/lib/guides/mbbs-in-china-for-pakistani-students-2027';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = mbbsPakistaniStudents2027Guide[locale];
  return {
    title: { absolute: guide.seoTitle ?? guide.title },
    description: guide.seoDescription ?? guide.description,
    alternates: await buildLanguageAlternates('/mbbs-in-china-for-pakistani-students-2027'),
    openGraph: {
      title: guide.seoTitle ?? guide.title,
      description: guide.seoDescription ?? guide.description,
      url: `${SITE_URL}/mbbs-in-china-for-pakistani-students-2027`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.seoTitle ?? guide.title,
      description: guide.seoDescription ?? guide.description,
    },
  };
}

export default async function MbbsPakistaniStudents2027Page() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = mbbsPakistaniStudents2027Guide[locale];
  return (
    <GuidePage
      guide={guide}
      pathSegment="mbbs-in-china-for-pakistani-students-2027"
      urlPath="/mbbs-in-china-for-pakistani-students-2027"
      howToTitle="How to choose a China MBBS that stays licence-eligible at home"
    />
  );
}

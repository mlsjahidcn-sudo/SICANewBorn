import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { cscScholarshipResult2027Guide } from '@/lib/guides/csc-scholarship-result-2027';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = cscScholarshipResult2027Guide[locale];
  return {
    title: { absolute: guide.seoTitle ?? guide.title },
    description: guide.seoDescription ?? guide.description,
    alternates: await buildLanguageAlternates('/csc-scholarship-result-2027'),
    openGraph: {
      title: guide.seoTitle ?? guide.title,
      description: guide.seoDescription ?? guide.description,
      url: `${SITE_URL}/csc-scholarship-result-2027`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.seoTitle ?? guide.title,
      description: guide.seoDescription ?? guide.description,
    },
  };
}

export default async function CscScholarshipResult2027Page() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = cscScholarshipResult2027Guide[locale];
  return (
    <GuidePage
      guide={guide}
      pathSegment="csc-scholarship-result-2027"
      urlPath="/csc-scholarship-result-2027"
      howToTitle="How to check CSC scholarship results for 2027"
    />
  );
}

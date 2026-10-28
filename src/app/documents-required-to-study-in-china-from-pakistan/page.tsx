import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { documentsRequiredPakistanGuide } from '@/lib/guides/documents-required-to-study-in-china-from-pakistan';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = documentsRequiredPakistanGuide[locale];
  return {
    title: { absolute: guide.seoTitle ?? guide.title },
    description: guide.seoDescription ?? guide.description,
    alternates: await buildLanguageAlternates('/documents-required-to-study-in-china-from-pakistan'),
    openGraph: {
      title: guide.seoTitle ?? guide.title,
      description: guide.seoDescription ?? guide.description,
      url: `${SITE_URL}/documents-required-to-study-in-china-from-pakistan`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.seoTitle ?? guide.title,
      description: guide.seoDescription ?? guide.description,
    },
  };
}

export default async function DocumentsRequiredPakistanPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = documentsRequiredPakistanGuide[locale];
  return (
    <GuidePage
      guide={guide}
      pathSegment="documents-required-to-study-in-china-from-pakistan"
      urlPath="/documents-required-to-study-in-china-from-pakistan"
      howToTitle="How to prepare attested documents to study in China from Pakistan"
    />
  );
}

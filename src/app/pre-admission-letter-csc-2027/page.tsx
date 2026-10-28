import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { preAdmissionLetterCsc2027Guide } from '@/lib/guides/pre-admission-letter-csc-2027';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = preAdmissionLetterCsc2027Guide[locale];
  return {
    title: { absolute: guide.seoTitle ?? guide.title },
    description: guide.seoDescription ?? guide.description,
    alternates: await buildLanguageAlternates('/pre-admission-letter-csc-2027'),
    openGraph: {
      title: guide.seoTitle ?? guide.title,
      description: guide.seoDescription ?? guide.description,
      url: `${SITE_URL}/pre-admission-letter-csc-2027`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.seoTitle ?? guide.title,
      description: guide.seoDescription ?? guide.description,
    },
  };
}

export default async function PreAdmissionLetterCsc2027Page() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = preAdmissionLetterCsc2027Guide[locale];
  return (
    <GuidePage
      guide={guide}
      pathSegment="pre-admission-letter-csc-2027"
      urlPath="/pre-admission-letter-csc-2027"
      howToTitle="How to get a pre-admission letter for CSC 2027"
    />
  );
}

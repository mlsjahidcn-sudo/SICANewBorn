import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { noIeltsGuide } from '@/lib/guides/study-in-china-without-ielts';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = noIeltsGuide[locale];
  return {
    title: { absolute: guide.title },
    description: guide.description,
    alternates: buildLanguageAlternates('/study-in-china-without-ielts'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/study-in-china-without-ielts`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function NoIeltsPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = noIeltsGuide[locale];
  return (
    <GuidePage
      guide={guide}
      pathSegment="study-in-china-without-ielts"
      urlPath="/study-in-china-without-ielts"
      howToTitle="How to apply without IELTS, step by step"
    />
  );
}
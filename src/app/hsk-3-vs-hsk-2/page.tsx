import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { hsk3VsHsk2Guide } from '@/lib/guides/hsk-3-vs-hsk-2';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = hsk3VsHsk2Guide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: buildLanguageAlternates('/hsk-3-vs-hsk-2'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/hsk-3-vs-hsk-2`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function Hsk3VsHsk2Page() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = hsk3VsHsk2Guide[locale];
  return <GuidePage guide={guide} pathSegment="hsk-3-vs-hsk-2" urlPath="/hsk-3-vs-hsk-2" />;
}

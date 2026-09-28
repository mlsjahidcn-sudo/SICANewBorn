import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { openChineseBankAccountGuide } from '@/lib/guides/open-chinese-bank-account';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = openChineseBankAccountGuide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: buildLanguageAlternates('/open-chinese-bank-account'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/open-chinese-bank-account`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function OpenChineseBankAccountPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = openChineseBankAccountGuide[locale];
  return <GuidePage guide={guide} pathSegment="open-chinese-bank-account" urlPath="/open-chinese-bank-account" />;
}

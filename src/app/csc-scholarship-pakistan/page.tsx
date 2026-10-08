import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { cscPakistanGuide } from '@/lib/guides/csc-scholarship-pakistan';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = cscPakistanGuide[locale];
  return {
    title: { absolute: guide.title },
    description: guide.description,
    alternates: buildLanguageAlternates('/csc-scholarship-pakistan'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/csc-scholarship-pakistan`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function CscPakistanPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = cscPakistanGuide[locale];
  return (
    <GuidePage
      guide={guide}
      pathSegment="csc-scholarship-pakistan"
      urlPath="/csc-scholarship-pakistan"
      howToTitle="How to apply from Pakistan, step by step"
    />
  );
}

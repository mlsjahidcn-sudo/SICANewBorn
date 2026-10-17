import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { cscaFeePakistanNigeriaBangladeshGuide } from '@/lib/guides/csca-fee-pakistan-nigeria-bangladesh';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = cscaFeePakistanNigeriaBangladeshGuide[locale];
  return {
    title: { absolute: guide.seoTitle ?? guide.title },
    description: guide.seoDescription ?? guide.description,
    alternates: await buildLanguageAlternates('/csca-fee-pakistan-nigeria-bangladesh'),
    openGraph: {
      title: guide.seoTitle ?? guide.title,
      description: guide.seoDescription ?? guide.description,
      url: `${SITE_URL}/csca-fee-pakistan-nigeria-bangladesh`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.seoTitle ?? guide.title, description: guide.seoDescription ?? guide.description },
  }
}

export default async function CscaFeePakistanNigeriaBangladeshPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = cscaFeePakistanNigeriaBangladeshGuide[locale];
  return (
    <GuidePage
      guide={guide}
      pathSegment="csca-fee-pakistan-nigeria-bangladesh"
      urlPath="/csca-fee-pakistan-nigeria-bangladesh"
      howToTitle="How to pay the CSCA fee from Pakistan, Nigeria, or Bangladesh, step by step"
    />
  );
}

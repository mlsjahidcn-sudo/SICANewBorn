import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { cscBangladeshGuide } from '@/lib/guides/csc-scholarship-bangladesh';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = cscBangladeshGuide[locale];
  return {
    title: { absolute: guide.seoTitle ?? guide.title },
    description: guide.seoDescription ?? guide.description,
    alternates: await buildLanguageAlternates('/csc-scholarship-bangladesh'),
    openGraph: {
      title: guide.seoTitle ?? guide.title,
      description: guide.seoDescription ?? guide.description,
      url: `${SITE_URL}/csc-scholarship-bangladesh`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.seoTitle ?? guide.title, description: guide.seoDescription ?? guide.description },
  }
}

export default async function CscBangladeshPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = cscBangladeshGuide[locale];
  return (
    <GuidePage
      guide={guide}
      pathSegment="csc-scholarship-bangladesh"
      urlPath="/csc-scholarship-bangladesh"
      howToTitle="How to apply from Bangladesh, step by step"
    />
  );
}

import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { cscNigeriaGuide } from '@/lib/guides/csc-scholarship-nigeria';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = cscNigeriaGuide[locale];
  return {
    title: { absolute: guide.title },
    description: guide.description,
    alternates: buildLanguageAlternates('/csc-scholarship-nigeria'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/csc-scholarship-nigeria`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function CscNigeriaPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = cscNigeriaGuide[locale];
  return (
    <GuidePage
      guide={guide}
      pathSegment="csc-scholarship-nigeria"
      urlPath="/csc-scholarship-nigeria"
      howToTitle="How to apply from Nigeria, step by step"
    />
  );
}
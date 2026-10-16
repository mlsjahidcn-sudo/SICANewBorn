import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { shenyangPharmaceuticalGuide } from '@/lib/guides/shenyang-pharmaceutical-university';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = shenyangPharmaceuticalGuide[locale];
  return {
    title: { absolute: guide.title },
    description: guide.description,
    alternates: await buildLanguageAlternates('/shenyang-pharmaceutical-university'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/shenyang-pharmaceutical-university`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  }
}

export default async function ShenyangPharmaceuticalUniversityPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = shenyangPharmaceuticalGuide[locale];
  return (
    <GuidePage
      guide={guide}
      pathSegment="shenyang-pharmaceutical-university"
      urlPath="/shenyang-pharmaceutical-university"
      howToTitle="How to apply to Shenyang Pharmaceutical University, step by step"
    />
  );
}

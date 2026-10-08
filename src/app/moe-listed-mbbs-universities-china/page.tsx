import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { moeMbbsGuide } from '@/lib/guides/moe-listed-mbbs-universities-china';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = moeMbbsGuide[locale];
  return {
    title: { absolute: guide.title },
    description: guide.description,
    alternates: buildLanguageAlternates('/moe-listed-mbbs-universities-china'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/moe-listed-mbbs-universities-china`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function MoeMbbsPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = moeMbbsGuide[locale];
  return (
    <GuidePage
      guide={guide}
      pathSegment="moe-listed-mbbs-universities-china"
      urlPath="/moe-listed-mbbs-universities-china"
      howToTitle="How to verify a university is on the current MOE list"
    />
  );
}
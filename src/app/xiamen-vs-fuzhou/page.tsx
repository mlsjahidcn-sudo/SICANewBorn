import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { xiamenVsFuzhouGuide } from '@/lib/guides/xiamen-vs-fuzhou';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = xiamenVsFuzhouGuide[locale];
  return {
    title: { absolute: guide.title },
    description: guide.description,
    alternates: buildLanguageAlternates('/xiamen-vs-fuzhou'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/xiamen-vs-fuzhou`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  }
}

export default async function XiamenVsFuzhouPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = xiamenVsFuzhouGuide[locale];
  return (
    <GuidePage
      guide={guide}
      pathSegment="xiamen-vs-fuzhou"
      urlPath="/xiamen-vs-fuzhou"
      howToTitle="How to choose between Xiamen and Fuzhou, step by step"
    />
  );
}

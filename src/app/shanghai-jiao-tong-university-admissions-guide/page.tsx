import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { shanghaiJiaoTongUniversityAdmissionsGuide } from '@/lib/guides/shanghai-jiao-tong-university-admissions-guide';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = shanghaiJiaoTongUniversityAdmissionsGuide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: buildLanguageAlternates('/shanghai-jiao-tong-university-admissions-guide'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/shanghai-jiao-tong-university-admissions-guide`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function ShanghaiJiaoTongUniversityAdmissionsGuidePage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = shanghaiJiaoTongUniversityAdmissionsGuide[locale];
  return <GuidePage guide={guide} pathSegment="shanghai-jiao-tong-university-admissions-guide" urlPath="/shanghai-jiao-tong-university-admissions-guide" />;
}

import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { chinaVisaJw202Guide } from '@/lib/guides/china-student-visa-jw202-residence-permit';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = chinaVisaJw202Guide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: buildLanguageAlternates('/china-student-visa-jw202-residence-permit'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/china-student-visa-jw202-residence-permit`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function ChinaVisaJw202Page() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = chinaVisaJw202Guide[locale];
  return <GuidePage guide={guide} pathSegment="china-student-visa-jw202-residence-permit" urlPath="/china-student-visa-jw202-residence-permit" />;
}

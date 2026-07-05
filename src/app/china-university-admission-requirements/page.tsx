import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { admissionRequirementsGuide } from '@/lib/guides/china-university-admission-requirements';
import { GuidePage } from '@/components/guides/guide-page';
import { SITE_URL } from '@/lib/site-url';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = admissionRequirementsGuide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `${SITE_URL}/china-university-admission-requirements` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/china-university-admission-requirements`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function AdmissionRequirementsPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';

  // This page is 100% static content — no live DB data is needed
  // beyond what the guide data file already contains. Future
  // enhancement: pull real program-specific requirements from
  // programs[].requirements + programs[].requirementsCn and
  // surface them in a per-degree comparison table.
  return <GuidePage guide={admissionRequirementsGuide[locale]} pathSegment="china-university-admission-requirements" urlPath="/china-university-admission-requirements" />;
}
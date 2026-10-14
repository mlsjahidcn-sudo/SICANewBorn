import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { medicalCheckPhysicalExaminationGuide } from '@/lib/guides/medical-check-physical-examination-form';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = medicalCheckPhysicalExaminationGuide[locale];
  return {
    title: { absolute: guide.title },
    description: guide.description,
    alternates: buildLanguageAlternates('/medical-check-physical-examination-form'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/medical-check-physical-examination-form`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  }
}

export default async function MedicalCheckPhysicalExaminationFormPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = medicalCheckPhysicalExaminationGuide[locale];
  return (
    <GuidePage
      guide={guide}
      pathSegment="medical-check-physical-examination-form"
      urlPath="/medical-check-physical-examination-form"
      howToTitle="How to complete the China student visa medical check, step by step"
    />
  );
}

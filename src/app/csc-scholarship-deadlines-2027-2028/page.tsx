import type { Metadata } from 'next';
import { getServerLocale } from '@/lib/server-t';
import { GuidePage } from '@/components/guides/guide-page';
import { cscDeadlineGuide, CSC_DEADLINES_PATH } from '@/lib/guides/csc-deadlines-2027-2028';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export async function generateMetadata(): Promise<Metadata> {
  const guide = cscDeadlineGuide[await getServerLocale()];
  return {
    title: { absolute: guide.seoTitle ?? guide.title },
    description: guide.description,
    alternates: await buildLanguageAlternates(CSC_DEADLINES_PATH),
    openGraph: { title: guide.seoTitle ?? guide.title, description: guide.description, type: 'article', url: `${SITE_URL}${CSC_DEADLINES_PATH}`, modifiedTime: guide.updatedAt },
    twitter: { card: 'summary_large_image', title: guide.seoTitle ?? guide.title, description: guide.description },
  };
}

export default async function CscDeadlinePage(): Promise<React.JSX.Element> {
  const locale = await getServerLocale();
  return <GuidePage guide={cscDeadlineGuide[locale]} pathSegment="csc-scholarship-deadlines-2027-2028" urlPath={CSC_DEADLINES_PATH} howToTitle={locale === 'zh' ? '怎样按时申请 CSC 2027/2028' : 'How to apply for CSC 2027/2028 before your deadline'} />;
}

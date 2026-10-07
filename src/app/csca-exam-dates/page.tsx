import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { cscaDatesGuide } from '@/lib/guides/csca-exam-dates';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-static';

/**
 * Phase 146 (Task 6): Event JSON-LD for the 3 confirmed CSCA sittings.
 * Organizer is the China Scholarship Council; url points at the official
 * csca.cn portal. eventAttendanceMode is Mixed because the exam runs
 * mainly online at home with offline centres being added in some
 * countries. NOTE: rich results for third-party events are NOT
 * guaranteed — Google decides whether to surface them; the markup is
 * still useful for LLM/GEO extraction.
 */
const confirmedSittings = [
  { name: 'CSCA Exam — November 2026 sitting', start: '2026-11-14', end: '2026-11-15' },
  { name: 'CSCA Exam — December 2026 sitting', start: '2026-12-19', end: '2026-12-20' },
  { name: 'CSCA Exam — January 2027 sitting', start: '2027-01-23', end: '2027-01-24' },
];

const eventSchemas = confirmedSittings.map((sitting) => ({
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: sitting.name,
  startDate: sitting.start,
  endDate: sitting.end,
  eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  organizer: {
    '@type': 'Organization',
    name: 'China Scholarship Council',
    url: 'https://www.csca.cn',
  },
  url: 'https://www.csca.cn',
  location: {
    '@type': 'VirtualLocation',
    url: 'https://www.csca.cn',
    name: 'Online at home with a live proctor (offline centres in some countries)',
  },
  description:
    'Sitting of the CSCA (China Scholastic Competency Assessment), organized by the China Scholarship Council. Mainly online at home with a live proctor.',
}));

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = cscaDatesGuide[locale];
  return {
    title: { absolute: guide.title },
    description: guide.description,
    alternates: buildLanguageAlternates('/csca-exam-dates'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/csca-exam-dates`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function CscaDatesPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = cscaDatesGuide[locale];
  return (
    <>
      {eventSchemas.map((schema) => (
        <script
          key={schema.name}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <GuidePage
        guide={guide}
        pathSegment="csca-exam-dates"
        urlPath="/csca-exam-dates"
        howToTitle="Plan your CSCA sitting, step by step"
      />
    </>
  );
}

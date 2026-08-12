import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { getAllUniversities } from '@/lib/data-fetcher';
import { cheapestUniversitiesGuide } from '@/lib/guides/cheapest-universities';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const revalidate = 60;

/**
 * /cheapest-universities-china — listicle page in the SICA Guide
 * visual system. Static copy lives in
 * src/lib/guides/cheapest-universities.ts; the live university list
 * is fetched from Supabase and injected into the table block at
 * render time, sorted ASC by undergraduate tuition.
 */
export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = cheapestUniversitiesGuide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: buildLanguageAlternates('/cheapest-universities-china'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/cheapest-universities-china`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

// Parse tuition out of the `tuitionUndergrad` strings for sorting.
// DB stores values like "¥30,000/year", "RMB 25,000/year", etc.
// We grab the first integer — sorting by "lowest known tuition" is
// good enough for a listicle; the table itself shows the full
// string so users see the exact rate.
function parseTuition(s: string | undefined): number {
  if (!s) return Infinity;
  const m = s.match(/(\d[\d,]*)/);
  if (!m) return Infinity;
  return parseInt(m[1].replace(/,/g, ''), 10);
}

export default async function CheapestUniversitiesPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';

  const universities = await getAllUniversities();

  const sorted = universities
    .filter((u) => u.tuitionUndergrad || u.tuitionGraduate)
    .sort((a, b) => parseTuition(a.tuitionUndergrad) - parseTuition(b.tuitionGraduate));

  const baseGuide = cheapestUniversitiesGuide[locale];
  const isZh = locale === 'zh';

  const tableRows: string[][] = sorted.map((u) => [
    isZh && u.nameCn ? u.nameCn : u.name,
    isZh && u.cityCn ? u.cityCn : u.city,
    u.tuitionUndergrad || '—',
    u.tuitionGraduate || '—',
    u.ranking > 0 ? `#${u.ranking}` : '—',
    isZh && u.typeCn ? u.typeCn : u.type,
  ]);

  const liveGuide = {
    ...baseGuide,
    stats: baseGuide.stats.map((s) =>
      s.label.toLowerCase().includes('live') || s.label === '实时'
        ? { value: String(sorted.length), label: isZh ? '大学数' : 'Universities ranked' }
        : s,
    ),
    sections: baseGuide.sections.map((section) => {
      if (section.id !== 'cheapest-universities-table') return section;
      return {
        ...section,
        blocks: section.blocks.map((block) => {
          if (block.type !== 'table') return block;
          return { ...block, rows: tableRows };
        }),
      };
    }),
  };

  return <GuidePage guide={liveGuide} pathSegment="cheapest-universities-china" urlPath="/cheapest-universities-china" />;
}
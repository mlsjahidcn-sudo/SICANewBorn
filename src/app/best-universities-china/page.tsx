import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { getAllUniversities } from '@/lib/data-fetcher';
import { bestUniversitiesGuide } from '@/lib/guides/best-universities';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const revalidate = 60;

/**
 * /best-universities-china — listicle page in the SICA Guide visual
 * system. Static copy lives in src/lib/guides/best-universities.ts;
 * the live university list is fetched from Supabase and injected
 * into the table block at render time, sorted ASC by domestic
 * ranking (QS World as tiebreaker).
 */
export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = bestUniversitiesGuide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: buildLanguageAlternates('/best-universities-china'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/best-universities-china`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function BestUniversitiesPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';

  const universities = await getAllUniversities();

  // Sort by domestic ranking ASC; rows with ranking=0 sink to the
  // bottom; QS World as tiebreaker.
  const sorted = [...universities]
    .filter((u) => u.ranking > 0 || u.qsWorldRanking > 0)
    .sort((a, b) => {
      const ra = a.ranking > 0 ? a.ranking : Infinity;
      const rb = b.ranking > 0 ? b.ranking : Infinity;
      if (ra !== rb) return ra - rb;
      return (a.qsWorldRanking || Infinity) - (b.qsWorldRanking || Infinity);
    });

  const baseGuide = bestUniversitiesGuide[locale];
  const isZh = locale === 'zh';

  const tableRows: string[][] = sorted.map((u) => [
    isZh && u.nameCn ? u.nameCn : u.name,
    isZh && u.cityCn ? u.cityCn : u.city,
    u.ranking > 0 ? `#${u.ranking}` : '—',
    u.qsWorldRanking > 0 ? `#${u.qsWorldRanking}` : '—',
    u.intlStudents || '—',
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
      if (section.id !== 'best-universities-table') return section;
      return {
        ...section,
        blocks: section.blocks.map((block) => {
          if (block.type !== 'table') return block;
          return { ...block, rows: tableRows };
        }),
      };
    }),
  };

  return <GuidePage guide={liveGuide} pathSegment="best-universities-china" urlPath="/best-universities-china" />;
}
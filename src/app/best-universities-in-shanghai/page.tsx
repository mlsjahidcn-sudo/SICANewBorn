import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { getAllUniversities } from '@/lib/data-fetcher';
import { bestShanghaiUniversitiesGuide } from '@/lib/guides/best-universities-in-shanghai';
import { GuidePage } from '@/components/guides/guide-page';
import { SITE_URL } from '@/lib/site-url';

export const revalidate = 60;

/**
 * /best-universities-in-shanghai — city listicle. Page wrapper
 * filters the live university list to city=Shanghai (case-
 * insensitive) and sorts by lowest domestic ranking. Injects
 * into the `shanghai-universities-table` block at render time.
 */
export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = bestShanghaiUniversitiesGuide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `${SITE_URL}/best-universities-in-shanghai` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/best-universities-in-shanghai`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function BestShanghaiUniversitiesPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';

  const universities = await getAllUniversities();

  // Shanghai filter: city matches 'Shanghai' case-insensitive.
  // Sorted by lowest (= best) ranking, with unranked at the bottom.
  const shanghaiUniversities = universities
    .filter((u) => /shanghai/i.test(u.city || ''))
    .sort((a, b) => {
      if ((a.ranking || 0) === 0 && (b.ranking || 0) === 0) {
        return a.name.localeCompare(b.name);
      }
      if ((a.ranking || 0) === 0) return 1;
      if ((b.ranking || 0) === 0) return -1;
      return a.ranking - b.ranking;
    });

  const baseGuide = bestShanghaiUniversitiesGuide[locale];
  const isZh = locale === 'zh';

  const tableRows: string[][] = shanghaiUniversities.map((u, i) => [
    `#${i + 1}`,
    isZh && u.nameCn ? u.nameCn : u.name,
    isZh && u.typeCn ? u.typeCn : (u.type || '—'),
    u.established > 0 ? String(u.established) : '—',
    u.students || '—',
    u.intlStudents || '—',
  ]);

  const liveGuide = {
    ...baseGuide,
    stats: baseGuide.stats.map((s) =>
      s.label.toLowerCase().includes('live') || s.label === '实时'
        ? { value: String(shanghaiUniversities.length), label: isZh ? '上海大学数' : 'Shanghai universities' }
        : s,
    ),
    sections: baseGuide.sections.map((section) => {
      if (section.id !== 'shanghai-universities-table') return section;
      return {
        ...section,
        blocks: section.blocks.map((block) => {
          if (block.type !== 'table') return block;
          const rows = tableRows.length > 0 ? tableRows : [
            [
              isZh ? '（暂无上海大学）' : '(no Shanghai universities in catalog yet)',
              '—', '—', '—', '—', '—',
            ],
          ];
          return { ...block, rows };
        }),
      };
    }),
  };

  return (
    <GuidePage
      guide={liveGuide}
      pathSegment="best-universities-in-shanghai"
      urlPath="/best-universities-in-shanghai"
    />
  );
}

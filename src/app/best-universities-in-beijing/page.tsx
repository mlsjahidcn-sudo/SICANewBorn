import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { getAllUniversities } from '@/lib/data-fetcher';
import { bestBeijingUniversitiesGuide } from '@/lib/guides/best-universities-in-beijing';
import { GuidePage } from '@/components/guides/guide-page';
import { SITE_URL } from '@/lib/site-url';

export const revalidate = 60;

/**
 * /best-universities-in-beijing — city listicle. Page wrapper
 * filters the live university list to city=Beijing (case-
 * insensitive) and sorts by lowest domestic ranking. Injects
 * into the `beijing-universities-table` block at render time.
 */
export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = bestBeijingUniversitiesGuide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `${SITE_URL}/best-universities-in-beijing` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/best-universities-in-beijing`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function BestBeijingUniversitiesPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';

  const universities = await getAllUniversities();

  // Beijing filter: city matches 'Beijing' case-insensitive.
  // Sorted by lowest (= best) ranking, with unranked at the bottom.
  const beijingUniversities = universities
    .filter((u) => /beijing/i.test(u.city || ''))
    .sort((a, b) => {
      if ((a.ranking || 0) === 0 && (b.ranking || 0) === 0) {
        return a.name.localeCompare(b.name);
      }
      if ((a.ranking || 0) === 0) return 1;
      if ((b.ranking || 0) === 0) return -1;
      return a.ranking - b.ranking;
    });

  const baseGuide = bestBeijingUniversitiesGuide[locale];
  const isZh = locale === 'zh';

  const tableRows: string[][] = beijingUniversities.map((u, i) => [
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
        ? { value: String(beijingUniversities.length), label: isZh ? '北京大学数' : 'Beijing universities' }
        : s,
    ),
    sections: baseGuide.sections.map((section) => {
      if (section.id !== 'beijing-universities-table') return section;
      return {
        ...section,
        blocks: section.blocks.map((block) => {
          if (block.type !== 'table') return block;
          const rows = tableRows.length > 0 ? tableRows : [
            [
              isZh ? '（暂无北京高校）' : '(no Beijing universities in catalog yet)',
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
      pathSegment="best-universities-in-beijing"
      urlPath="/best-universities-in-beijing"
    />
  );
}

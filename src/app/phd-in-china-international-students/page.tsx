import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { getAllPrograms, getAllUniversities } from '@/lib/data-fetcher';
import { phdInChinaGuide } from '@/lib/guides/phd-in-china';
import { GuidePage } from '@/components/guides/guide-page';
import { SITE_URL } from '@/lib/site-url';

export const revalidate = 60;

/**
 * /phd-in-china-international-students — PhD-specific listicle
 * targeting "phd in china", "fully funded phd china", and
 * supervisor-matching searches. Page wrapper filters programs
 * to degree=PhD from the live SICA catalog and injects them
 * into the `phd-programs-table` block at render time, sorted by
 * parent university ranking.
 */
export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = phdInChinaGuide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `${SITE_URL}/phd-in-china-international-students` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/phd-in-china-international-students`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function PhdInChinaPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';

  const [programs, universities] = await Promise.all([
    getAllPrograms(),
    getAllUniversities(),
  ]);

  // PhD filter: degree=PhD only. Sorted by parent university
  // ranking, lowest (= best) first.
  const phdPrograms = programs
    .filter((p) => p.degree === 'PhD')
    .map((p) => ({
      ...p,
      uni: universities.find((u) => u.slug === p.universitySlug),
    }))
    .sort((a, b) => {
      const ra = a.uni?.ranking ?? Infinity;
      const rb = b.uni?.ranking ?? Infinity;
      if (ra !== rb) return ra - rb;
      return a.name.localeCompare(b.name);
    });

  const baseGuide = phdInChinaGuide[locale];
  const isZh = locale === 'zh';

  const tableRows: string[][] = phdPrograms.map((p) => [
    isZh ? p.nameCn : p.name,
    p.uni ? (isZh && p.uni.nameCn ? p.uni.nameCn : p.uni.name) : '—',
    isZh ? p.disciplineCn : p.discipline,
    isZh ? p.durationCn : p.duration,
    p.tuition,
    p.language,
  ]);

  const liveGuide = {
    ...baseGuide,
    stats: baseGuide.stats.map((s) =>
      s.label.toLowerCase().includes('live') || s.label === '实时'
        ? { value: String(phdPrograms.length), label: isZh ? '目录博士项目数' : 'PhD programs in catalog' }
        : s,
    ),
    sections: baseGuide.sections.map((section) => {
      if (section.id !== 'phd-programs-table') return section;
      return {
        ...section,
        blocks: section.blocks.map((block) => {
          if (block.type !== 'table') return block;
          return { ...block, rows: tableRows };
        }),
      };
    }),
  };

  return (
    <GuidePage
      guide={liveGuide}
      pathSegment="phd-in-china-international-students"
      urlPath="/phd-in-china-international-students"
    />
  );
}

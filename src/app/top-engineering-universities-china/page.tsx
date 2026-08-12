import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { getAllPrograms, getAllUniversities } from '@/lib/data-fetcher';
import { topEngineeringGuide } from '@/lib/guides/top-engineering-universities';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = topEngineeringGuide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: buildLanguageAlternates('/top-engineering-universities-china'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/top-engineering-universities-china`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function TopEngineeringPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';

  const [programs, universities] = await Promise.all([
    getAllPrograms(),
    getAllUniversities(),
  ]);

  // Engineering filter: discipline contains "Engineering" OR
  // is "Computer Science". Captures CS, EE, ME, Civil, Biomedical,
  // Chemical, Materials, Aerospace, Architecture sub-disciplines.
  const engineeringPrograms = programs
    .filter(
      (p) =>
        /engineering|computer science/i.test(p.discipline) ||
        /engineering|computer|software|artificial intelligence/i.test(p.name),
    )
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

  const baseGuide = topEngineeringGuide[locale];
  const isZh = locale === 'zh';

  const tableRows: string[][] = engineeringPrograms.map((p) => [
    isZh ? p.nameCn : p.name,
    p.uni ? (isZh && p.uni.nameCn ? p.uni.nameCn : p.uni.name) : '—',
    isZh ? p.disciplineCn : p.discipline,
    p.degree,
    isZh ? p.durationCn : p.duration,
    p.language,
  ]);

  const liveGuide = {
    ...baseGuide,
    stats: baseGuide.stats.map((s) =>
      s.label.toLowerCase().includes('live') || s.label === '实时'
        ? { value: String(engineeringPrograms.length), label: isZh ? '目录项目数' : 'Programs in catalog' }
        : s,
    ),
    sections: baseGuide.sections.map((section) => {
      if (section.id !== 'engineering-programs-table') return section;
      return {
        ...section,
        blocks: section.blocks.map((block) => {
          if (block.type !== 'table') return block;
          return { ...block, rows: tableRows };
        }),
      };
    }),
  };

  return <GuidePage guide={liveGuide} pathSegment="top-engineering-universities-china" urlPath="/top-engineering-universities-china" />;
}
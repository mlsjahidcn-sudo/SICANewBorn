import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { getAllPrograms, getAllUniversities } from '@/lib/data-fetcher';
import { bestMbaGuide } from '@/lib/guides/best-mba-programs';
import { GuidePage } from '@/components/guides/guide-page';
import { SITE_URL } from '@/lib/site-url';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = bestMbaGuide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `${SITE_URL}/best-mba-programs-china` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/best-mba-programs-china`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function BestMbaPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';

  const [programs, universities] = await Promise.all([
    getAllPrograms(),
    getAllUniversities(),
  ]);

  // MBA filter: discipline = Business AND degree = Master AND
  // name contains "MBA" or "Master of Business Administration".
  // We also surface BBA (Bachelor in Business Admin) as related
  // undergraduate context but the table headers label them
  // accurately by degree.
  const mbaPrograms = programs
    .filter(
      (p) =>
        p.discipline === 'Business' &&
        (p.degree === 'Master' || /mba|master of business/i.test(p.name)),
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

  const baseGuide = bestMbaGuide[locale];
  const isZh = locale === 'zh';

  const tableRows: string[][] = mbaPrograms.map((p) => [
    isZh ? p.nameCn : p.name,
    p.uni ? (isZh && p.uni.nameCn ? p.uni.nameCn : p.uni.name) : '—',
    p.degree,
    isZh ? p.durationCn : p.duration,
    p.tuition,
    p.language,
  ]);

  const liveGuide = {
    ...baseGuide,
    stats: baseGuide.stats.map((s) =>
      s.label.toLowerCase().includes('live') || s.label === '实时'
        ? { value: String(mbaPrograms.length), label: isZh ? '目录项目数' : 'MBA programs in catalog' }
        : s,
    ),
    sections: baseGuide.sections.map((section) => {
      if (section.id !== 'mba-programs-table') return section;
      return {
        ...section,
        blocks: section.blocks.map((block) => {
          if (block.type !== 'table') return block;
          return { ...block, rows: tableRows };
        }),
      };
    }),
  };

  return <GuidePage guide={liveGuide} pathSegment="best-mba-programs-china" urlPath="/best-mba-programs-china" />;
}
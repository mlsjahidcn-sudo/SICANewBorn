import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { getAllPrograms, getAllUniversities } from '@/lib/data-fetcher';
import { chinaVsRussiaMbbsGuide } from '@/lib/guides/study-in-china-vs-russia-for-mbbs';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const revalidate = 60;

/**
 * /study-in-china-vs-russia-for-mbbs — comparison listicle. Page
 * wrapper filters the live program catalog to MBBS / Clinical
 * Medicine programs at Chinese universities (the China side of
 * the comparison), sorted by parent university ranking. Injects
 * into the `mbbs-china-programs` block at render time.
 */
export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = chinaVsRussiaMbbsGuide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: buildLanguageAlternates('/study-in-china-vs-russia-for-mbbs'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/study-in-china-vs-russia-for-mbbs`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function ChinaVsRussiaMbbsPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';

  const [programs, universities] = await Promise.all([
    getAllPrograms(),
    getAllUniversities(),
  ]);

  // MBBS / Clinical Medicine filter: discipline=Medicine OR name
  // contains "MBBS" / "Clinical Medicine" / "Medicine" (covers
  // 临床医学 / Bachelor in Medicine / Bachelor of Surgery). Sorted
  // by parent university ranking.
  const mbbsPrograms = programs
    .filter((p) => {
      if (p.discipline === 'Medicine') return true;
      return /\b(mbbs|clinical medicine|medicine and surgery|bachelor of medicine)\b/i.test(p.name);
    })
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

  const baseGuide = chinaVsRussiaMbbsGuide[locale];
  const isZh = locale === 'zh';

  const tableRows: string[][] = mbbsPrograms.map((p) => [
    isZh ? p.nameCn : p.name,
    p.uni ? (isZh && p.uni.nameCn ? p.uni.nameCn : p.uni.name) : '—',
    p.uni ? (isZh && p.uni.cityCn ? p.uni.cityCn : p.uni.city) : '—',
    isZh ? p.durationCn : p.duration,
    p.tuition,
    p.language,
  ]);

  const liveGuide = {
    ...baseGuide,
    sections: baseGuide.sections.map((section) => {
      if (section.id !== 'mbbs-china-programs') return section;
      return {
        ...section,
        blocks: section.blocks.map((block) => {
          if (block.type !== 'table') return block;
          const rows = tableRows.length > 0 ? tableRows : [
            [
              isZh ? '（SICA 目录暂无 MBBS 项目）' : '(no MBBS programs in SICA catalog yet)',
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
      pathSegment="study-in-china-vs-russia-for-mbbs"
      urlPath="/study-in-china-vs-russia-for-mbbs"
    />
  );
}

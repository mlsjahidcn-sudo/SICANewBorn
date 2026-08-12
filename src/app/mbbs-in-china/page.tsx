import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { getAllPrograms, getAllUniversities } from '@/lib/data-fetcher';
import { mbbsGuide } from '@/lib/guides/mbbs';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const revalidate = 60;

/**
 * /mbbs-in-china — listicle page in the SICA Guide visual system.
 *
 * Static copy lives in src/lib/guides/mbbs.ts; the live MBBS program
 * list is fetched from Supabase and injected into the table block
 * at render time. The page revalidates every 60s so newly-added
 * MOE-listed programs show up automatically.
 */
export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = mbbsGuide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: buildLanguageAlternates('/mbbs-in-china'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/mbbs-in-china`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function MbbsInChinaPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';

  const [programs, universities] = await Promise.all([
    getAllPrograms(),
    getAllUniversities(),
  ]);

  // MBBS filter — discipline = Medicine AND program name contains
  // the canonical MBBS marker. Excludes plain Chinese-medium
  // "Clinical Medicine" tracks (those live on /programs).
  const mbbsPrograms = programs
    .filter(
      (p) =>
        p.discipline === 'Medicine' &&
        /(mbbs|clinical medicine)/i.test(p.name) &&
        !/(chinese medium|chinese-taught|中文)/i.test(p.name),
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

  const baseGuide = mbbsGuide[locale];
  const isZh = locale === 'zh';

  // Build the live table rows. Format each row as a string[]
  // matching the GuideBlock `table` schema (columns declared in
  // mbbs.ts, rows injected here).
  const tableRows: string[][] = mbbsPrograms.map((p) => [
    isZh ? p.nameCn : p.name,
    p.uni ? (isZh && p.uni.nameCn ? p.uni.nameCn : p.uni.name) : '—',
    isZh ? p.durationCn : p.duration,
    p.tuition,
    p.language,
  ]);

  // Inject live data into the guide:
  // - Replace the placeholder rows in the `mbbs-programs-table` block
  // - Replace the LIVE placeholder in stats[] with the actual count
  const liveGuide = {
    ...baseGuide,
    stats: baseGuide.stats.map((s) =>
      s.label.toLowerCase().includes('live') || s.label === '实时'
        ? { value: String(mbbsPrograms.length), label: isZh ? '目录项目数' : 'Programs in catalog' }
        : s,
    ),
    sections: baseGuide.sections.map((section) => {
      if (section.id !== 'mbbs-programs-table') return section;
      return {
        ...section,
        blocks: section.blocks.map((block) => {
          if (block.type !== 'table') return block;
          return { ...block, rows: tableRows };
        }),
      };
    }),
  };

  return <GuidePage guide={liveGuide} pathSegment="mbbs-in-china" urlPath="/mbbs-in-china" />;
}
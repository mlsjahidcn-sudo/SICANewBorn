import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { getAllUniversities } from '@/lib/data-fetcher';
import { chinaApplicationDeadlinesGuide } from '@/lib/guides/china-university-application-deadlines';
import { GuidePage } from '@/components/guides/guide-page';
import { SITE_URL } from '@/lib/site-url';

export const revalidate = 60;

/**
 * /china-university-application-deadlines — process guide on
 * application timing + intake cycles. Page wrapper computes the
 * active intake periods by extracting unique non-empty `intake`
 * strings from the live university catalog, then injects them
 * into the `intakes-table` block at render time.
 */
export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = chinaApplicationDeadlinesGuide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `${SITE_URL}/china-university-application-deadlines` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/china-university-application-deadlines`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function ChinaApplicationDeadlinesPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';

  const universities = await getAllUniversities();

  // Derive active intake periods from the live university catalog.
  // Each university has free-text `intake` / `intakeCn` strings
  // ("September", "Fall", "March", "Spring", etc.). We tokenize by
  // common separator, dedupe (case-insensitive), and surface the
  // unique intake periods in alphabetical order with locale-
  // appropriate translation.
  const seen = new Set<string>();
  const intakes: Array<{ key: string; en: string; zh: string }> = [];
  for (const u of universities) {
    const en = (u.intake || '').trim();
    const zh = (u.intakeCn || '').trim();
    if (!en) continue;
    const key = en.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    intakes.push({ key, en, zh });
  }
  intakes.sort((a, b) => a.en.localeCompare(b.en));

  const baseGuide = chinaApplicationDeadlinesGuide[locale];
  const isZh = locale === 'zh';

  const tableRows: string[][] = intakes.length > 0
    ? intakes.map((p) => [
        p.en,
        p.en,
        (isZh ? '活跃' : 'Active'),
        (isZh ? '每年' : 'Annual'),
      ])
    : [
        [
          isZh ? '9 月（秋季）' : 'September (Fall)',
          isZh ? '每年' : 'Yearly',
          (isZh ? '活跃' : 'Active'),
          (isZh ? '主入学' : 'Primary intake'),
        ],
        [
          isZh ? '3 月（春季）' : 'March (Spring)',
          isZh ? '每年' : 'Yearly',
          (isZh ? '活跃' : 'Active'),
          (isZh ? '次入学' : 'Secondary intake'),
        ],
      ];

  const liveGuide = {
    ...baseGuide,
    sections: baseGuide.sections.map((section) => {
      if (section.id !== 'intakes-table') return section;
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
      pathSegment="china-university-application-deadlines"
      urlPath="/china-university-application-deadlines"
    />
  );
}

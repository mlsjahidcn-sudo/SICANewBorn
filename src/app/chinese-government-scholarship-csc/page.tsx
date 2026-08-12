import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { getAllScholarships } from '@/lib/data-fetcher';
import { cscScholarshipGuide } from '@/lib/guides/chinese-government-scholarship-csc';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const revalidate = 60;

/**
 * /chinese-government-scholarship-csc — process guide dedicated
 * to the CSC scholarship program. Page wrapper pulls the live
 * scholarship list and filters to entries whose name matches the
 * CSC umbrella (Government, Bilateral, China-Africa Friendship,
 * etc.) — injects them into the `cscholarships-table` block at
 * render time.
 */
export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = cscScholarshipGuide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: buildLanguageAlternates('/chinese-government-scholarship-csc'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/chinese-government-scholarship-csc`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

export default async function CscScholarshipPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';

  const scholarships = await getAllScholarships();

  // CSC / government-scholarship filter: name contains the
  // canonical CSC sub-program keywords. Loose match — surface any
  // scholarship that the user might consider under the CSC umbrella.
  const cscLike = scholarships.filter((s) => {
    const name = `${s.name} ${s.nameCn}`.toLowerCase();
    return /government|csc|bilateral|chinese government|china|africa|asean|mofcom|confucius|scholarship/i.test(name);
  });

  const baseGuide = cscScholarshipGuide[locale];
  const isZh = locale === 'zh';

  const tableRows: string[][] = cscLike.map((s) => [
    isZh && s.nameCn ? s.nameCn : s.name,
    s.type,
    s.coverage.join(', ') || (isZh ? '见详情' : 'see description'),
    s.eligibleRegions || (isZh ? '不限' : 'worldwide'),
    s.deadline || (isZh ? '春季 4 月 / 秋季 10 月' : 'Apr (Spring) / Oct (Fall)'),
  ]);

  const liveGuide = {
    ...baseGuide,
    sections: baseGuide.sections.map((section) => {
      if (section.id !== 'cscholarships-table') return section;
      return {
        ...section,
        blocks: section.blocks.map((block) => {
          if (block.type !== 'table') return block;
          // Fallback to "no matching scholarships yet" if list is empty
          // so the table doesn't render the placeholder row.
          const rows = tableRows.length > 0 ? tableRows : [
            [
              isZh ? '（目录中暂无匹配的政府奖学金）' : '(no CSC-tagged scholarships in catalog yet)',
              '—', '—', '—', '—',
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
      pathSegment="chinese-government-scholarship-csc"
      urlPath="/chinese-government-scholarship-csc"
    />
  );
}

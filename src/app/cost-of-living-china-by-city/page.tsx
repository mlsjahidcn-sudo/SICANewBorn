import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { getAllUniversities } from '@/lib/data-fetcher';
import { costOfLivingByCityGuide } from '@/lib/guides/cost-of-living-by-city';
import { GuidePage } from '@/components/guides/guide-page';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = costOfLivingByCityGuide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: buildLanguageAlternates('/cost-of-living-china-by-city'),
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/cost-of-living-china-by-city`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

const CITY_LIVING: Record<string, number> = {
  'Beijing': 4500,
  'Shanghai': 4500,
  'Shenzhen': 4200,
  'Guangzhou': 3800,
  'Hangzhou': 3500,
  'Nanjing': 3200,
  'Wuhan': 2700,
  "Xi'an": 2700,
  'Chengdu': 2800,
  'Tianjin': 2900,
  'Changsha': 2500,
  'Harbin': 2200,
  'Kunming': 2400,
  'Suzhou': 3800,
  'Xiamen': 3500,
  'Qingdao': 3200,
  'Dalian': 3000,
  'Lishui': 2200,
  'Nantong': 2400,
  'Zhengzhou': 2600,
};

const USD_RATE = 7.25; // approximate for 2026 budgeting

export default async function CostOfLivingByCityPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';

  const universities = await getAllUniversities();

  type CityAgg = { city: string; count: number; avgTuition: number; livingPerMonth: number; totalUsd: number };
  const byCity = new Map<string, { count: number; tuitions: number[] }>();
  for (const u of universities) {
    if (!u.city) continue;
    const entry = byCity.get(u.city) ?? { count: 0, tuitions: [] };
    entry.count += 1;
    if (u.tuitionUndergrad) {
      const m = u.tuitionUndergrad.match(/(\d[\d,]*)/);
      if (m) entry.tuitions.push(parseInt(m[1].replace(/,/g, ''), 10));
    }
    byCity.set(u.city, entry);
  }

  const ranked: CityAgg[] = Array.from(byCity.entries())
    .map(([city, agg]) => {
      const avgTuition =
        agg.tuitions.length > 0
          ? Math.round(agg.tuitions.reduce((a, b) => a + b, 0) / agg.tuitions.length)
          : 0;
      const living = CITY_LIVING[city] ?? 3000;
      const totalYear = (avgTuition || 0) + living * 12;
      return {
        city,
        count: agg.count,
        avgTuition,
        livingPerMonth: living,
        totalUsd: Math.round(totalYear / USD_RATE),
      };
    })
    .sort((a, b) => a.totalUsd - b.totalUsd);

  const baseGuide = costOfLivingByCityGuide[locale];
  const isZh = locale === 'zh';

  const tableRows: string[][] = ranked.map((c, i) => [
    String(i + 1),
    c.city,
    String(c.count),
    c.avgTuition > 0 ? `¥${c.avgTuition.toLocaleString()}` : '—',
    `¥${(c.livingPerMonth * 12).toLocaleString()}/yr`,
    `$${c.totalUsd.toLocaleString()}`,
  ]);

  const liveGuide = {
    ...baseGuide,
    sections: baseGuide.sections.map((section) => {
      if (section.id !== 'cost-by-city-table') return section;
      return {
        ...section,
        blocks: section.blocks.map((block) => {
          if (block.type !== 'table') return block;
          return { ...block, rows: tableRows };
        }),
      };
    }),
  };

  return <GuidePage guide={liveGuide} pathSegment="cost-of-living-china-by-city" urlPath="/cost-of-living-china-by-city" />;
}
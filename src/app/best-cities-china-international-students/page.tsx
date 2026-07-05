import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import type { Locale } from '@/lib/i18n-translations';
import { getAllUniversities } from '@/lib/data-fetcher';
import { bestCitiesGuide } from '@/lib/guides/best-cities-china';
import { GuidePage } from '@/components/guides/guide-page';
import { SITE_URL } from '@/lib/site-url';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const guide = bestCitiesGuide[locale];
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `${SITE_URL}/best-cities-china-international-students` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/best-cities-china-international-students`,
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description },
  };
}

// Rough monthly living cost per city (¥/month, dorm + food + transport + phone + entertainment).
// Based on public 2024-2025 student survey data. Used for the live
// table only — the static sections have their own city tables.
const CITY_LIVING: Record<string, { living: number; tier: string; community: string }> = {
  'Beijing': { living: 4500, tier: 'Tier 1', community: 'Very large' },
  'Shanghai': { living: 4500, tier: 'Tier 1', community: 'Very large' },
  'Shenzhen': { living: 4200, tier: 'Tier 1', community: 'Large' },
  'Guangzhou': { living: 3800, tier: 'Tier 1', community: 'Large' },
  'Hangzhou': { living: 3500, tier: 'Tier 2', community: 'Growing' },
  'Nanjing': { living: 3200, tier: 'Tier 2', community: 'Medium' },
  'Wuhan': { living: 2700, tier: 'Tier 2', community: 'Large' },
  "Xi'an": { living: 2700, tier: 'Tier 2', community: 'Medium' },
  'Chengdu': { living: 2800, tier: 'Tier 2', community: 'Growing' },
  'Tianjin': { living: 2900, tier: 'Tier 2', community: 'Medium' },
  'Changsha': { living: 2500, tier: 'Tier 2', community: 'Medium' },
  'Harbin': { living: 2200, tier: 'Tier 3', community: 'Small' },
  'Kunming': { living: 2400, tier: 'Tier 3', community: 'Small' },
  'Suzhou': { living: 3800, tier: 'Tier 2', community: 'Medium' },
  'Xiamen': { living: 3500, tier: 'Tier 2', community: 'Medium' },
  'Qingdao': { living: 3200, tier: 'Tier 2', community: 'Small' },
  'Dalian': { living: 3000, tier: 'Tier 2', community: 'Small' },
};

export default async function BestCitiesPage() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';

  const universities = await getAllUniversities();

  // Aggregate universities by city. Sort by # of universities
  // DESC, then by average ranking ASC (best city has most top schools).
  type CityAgg = {
    city: string;
    count: number;
    avgRank: number;
    avgTuition: number;
    livingPerMonth: number;
    tier: string;
    community: string;
  };

  const byCity = new Map<string, { count: number; ranks: number[]; tuitions: number[] }>();
  for (const u of universities) {
    if (!u.city) continue;
    const city = u.city;
    const entry = byCity.get(city) ?? { count: 0, ranks: [], tuitions: [] };
    entry.count += 1;
    if (u.ranking > 0) entry.ranks.push(u.ranking);
    if (u.tuitionUndergrad) {
      const m = u.tuitionUndergrad.match(/(\d[\d,]*)/);
      if (m) entry.tuitions.push(parseInt(m[1].replace(/,/g, ''), 10));
    }
    byCity.set(city, entry);
  }

  const ranked: CityAgg[] = Array.from(byCity.entries())
    .map(([city, agg]) => {
      const ranks = agg.ranks.sort((a, b) => a - b);
      const tuitions = agg.tuitions;
      const cityInfo = CITY_LIVING[city] ?? { living: 3000, tier: 'Tier 3', community: 'Small' };
      return {
        city,
        count: agg.count,
        avgRank: ranks.length > 0 ? ranks[Math.floor(ranks.length / 2)] : 999,
        avgTuition:
          tuitions.length > 0
            ? Math.round(tuitions.reduce((a, b) => a + b, 0) / tuitions.length)
            : 0,
        livingPerMonth: cityInfo.living,
        tier: cityInfo.tier,
        community: cityInfo.community,
      };
    })
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.avgRank - b.avgRank;
    });

  const baseGuide = bestCitiesGuide[locale];
  const isZh = locale === 'zh';

  const tableRows: string[][] = ranked.map((c, i) => [
    String(i + 1),
    c.city,
    c.tier,
    String(c.count),
    c.avgTuition > 0 ? `¥${c.avgTuition.toLocaleString()}` : '—',
    `¥${(c.livingPerMonth * 12).toLocaleString()}/yr`,
    c.community,
  ]);

  const liveGuide = {
    ...baseGuide,
    stats: baseGuide.stats.map((s) =>
      s.label.toLowerCase().includes('live') || s.label === '实时'
        ? { value: String(universities.length), label: isZh ? '大学数' : 'Universities ranked' }
        : s,
    ),
    sections: baseGuide.sections.map((section) => {
      if (section.id !== 'best-cities-table') return section;
      return {
        ...section,
        blocks: section.blocks.map((block) => {
          if (block.type !== 'table') return block;
          return { ...block, rows: tableRows };
        }),
      };
    }),
  };

  return <GuidePage guide={liveGuide} pathSegment="best-cities-china-international-students" urlPath="/best-cities-china-international-students" />;
}
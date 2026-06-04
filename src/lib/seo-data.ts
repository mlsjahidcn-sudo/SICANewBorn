/**
 * SEO data — derived indexes for programmatic SEO pages.
 *
 * Pattern: keep the canonical data in src/lib/data.ts (universidades,
 * programs, scholarships). This module is a *derivation layer* that
 * builds the cross-product indexes (city → universidades,
 * country → scholarships) without duplicating the source of truth.
 *
 * Every export here is computed at module-load time from the data
 * tables. Re-run the build and the indexes update automatically.
 *
 * Why this matters: the public site is for students coming TO China,
 * not for comparing China with other destinations. Every page built
 * on top of this module emphasizes "study in China" / "scholarships
 * to study in China" — never "study abroad from China" or any framing
 * that could be misread as China being the origin.
 */
import { universities, scholarships, type University, type Scholarship } from './data';

// ---------------------------------------------------------------------------
// Cities
// ---------------------------------------------------------------------------

export interface CityInfo {
  /** URL-safe slug, used in /study-in-china/[slug] */
  slug: string;
  /** English city name, e.g. "Beijing" */
  name: string;
  /** Chinese city name, e.g. "北京" */
  nameCn: string;
  /** Number of universidades in the SICA database for this city */
  universityCount: number;
  /** Number of programas available across all universidades in this city */
  programCount: number;
  /** One-line city tagline for the hub page (English) */
  tagline: string;
  /** One-line city tagline for the hub page (Chinese) */
  taglineCn: string;
}

/**
 * Per-city curated taglines. These are written for the SEO hub page
 * and should help the page rank for "[city] study in China" type
 * queries. The Chinese version is a parallel natural-language line.
 */
const CITY_TAGLINES: Record<string, { en: string; zh: string }> = {
  beijing: {
    en: 'China\'s political and cultural capital — home to Tsinghua and Peking University, the country\'s two most prestigious institutions.',
    zh: '中国的政治与文化中心——清华、北大所在地，代表中国高等教育最高水平。',
  },
  shanghai: {
    en: 'China\'s financial hub and largest city — Fudan and Shanghai Jiao Tong lead the country in business, engineering, and international programs.',
    zh: '中国金融中心与最大城市——复旦、上海交大在商科、工程及国际项目方面全国领先。',
  },
  guangzhou: {
    en: 'South China\'s gateway to the world — Sun Yat-sen University anchors a thriving research and business scene.',
    zh: '中国南方的国际门户——中山大学是华南地区科研与商业的核心。',
  },
  hangzhou: {
    en: 'Zhejiang University\'s home — a tech and entrepreneurship powerhouse with one of the most beautiful campuses in the country.',
    zh: '浙江大学所在地——科技创新与创业重镇，拥有中国最美的校园之一。',
  },
  nanjing: {
    en: 'A historic capital with a top-tier research university — Nanjing University is consistently ranked among China\'s best.',
    zh: '六朝古都，学术重镇——南京大学长期位列中国顶尖大学之列。',
  },
  wuhan: {
    en: 'Central China\'s academic hub — Wuhan University is famed for its cherry blossoms and internationally recognized research.',
    zh: '中国中部的学术中心——武汉大学以樱花与国际化研究闻名。',
  },
};

/**
 * Build the list of cities that have at least one universidade in
 * the data. Slugified lowercase city name; sorted alphabetically by
 * English name for stable URL ordering.
 */
export const cities: CityInfo[] = (() => {
  const byCity = new Map<string, { name: string; nameCn: string; unis: University[] }>();

  for (const u of universities) {
    const key = u.city.toLowerCase();
    const existing = byCity.get(key);
    if (existing) {
      existing.unis.push(u);
    } else {
      byCity.set(key, { name: u.city, nameCn: u.cityCn, unis: [u] });
    }
  }

  const list: CityInfo[] = [];
  for (const [slug, info] of byCity) {
    // Count programas via the universitySlug link. Importing programs
    // would create a circular dep risk; we approximate program count
    // by counting non-empty popularPrograms arrays on each universidade.
    const programCount = info.unis.reduce(
      (acc, u) => acc + (u.popularPrograms?.length || 0),
      0,
    );
    const tagline = CITY_TAGLINES[slug]?.en ?? `Study in ${info.name}.`;
    const taglineCn = CITY_TAGLINES[slug]?.zh ?? `在${info.nameCn}留学。`;
    list.push({
      slug,
      name: info.name,
      nameCn: info.nameCn,
      universityCount: info.unis.length,
      programCount,
      tagline,
      taglineCn,
    });
  }

  return list.sort((a, b) => a.name.localeCompare(b.name));
})();

/** Look up a city by slug. Returns null if not found. */
export function getCityBySlug(slug: string): CityInfo | null {
  return cities.find((c) => c.slug === slug.toLowerCase()) ?? null;
}

/** Get universities for a given city slug. */
export function getUniversitiesByCity(citySlug: string): University[] {
  return universities.filter((u: University) => u.city.toLowerCase() === citySlug.toLowerCase());
}

// ---------------------------------------------------------------------------
// Scholarships-for-country
// ---------------------------------------------------------------------------

/**
 * Curated list of source countries (countries students COME FROM)
 * for the `/scholarships-for/[country]` pages. The destination is
 * always China — this list is about who we target, not where they
 * can go.
 *
 * Each country has a slug, English name, Chinese name, and a list of
 * "region tags" that match the free-text eligibleRegions on each
 * scholarship. The matching logic is in `getScholarshipsForCountry`.
 */
export interface CountryInfo {
  slug: string;
  name: string;
  nameCn: string;
  /** ISO 3166-1 alpha-2, for hreflang + structured data */
  iso2: string;
  /** Continent/region for the hub page grouping */
  region: 'Asia' | 'Africa' | 'Europe' | 'Americas' | 'Middle East' | 'Oceania';
  /** Free-text region tags used to match against scholarship eligibleRegions */
  matchTerms: string[];
}

export const COUNTRIES: CountryInfo[] = [
  // South Asia
  { slug: 'pakistan', name: 'Pakistan', nameCn: '巴基斯坦', iso2: 'PK', region: 'Asia', matchTerms: ['pakistan', 'south asia'] },
  { slug: 'india', name: 'India', nameCn: '印度', iso2: 'IN', region: 'Asia', matchTerms: ['india', 'south asia'] },
  { slug: 'bangladesh', name: 'Bangladesh', nameCn: '孟加拉国', iso2: 'BD', region: 'Asia', matchTerms: ['bangladesh', 'south asia'] },
  { slug: 'nepal', name: 'Nepal', nameCn: '尼泊尔', iso2: 'NP', region: 'Asia', matchTerms: ['nepal', 'south asia'] },
  { slug: 'sri-lanka', name: 'Sri Lanka', nameCn: '斯里兰卡', iso2: 'LK', region: 'Asia', matchTerms: ['sri lanka', 'south asia'] },

  // Southeast Asia
  { slug: 'indonesia', name: 'Indonesia', nameCn: '印度尼西亚', iso2: 'ID', region: 'Asia', matchTerms: ['indonesia', 'asean'] },
  { slug: 'vietnam', name: 'Vietnam', nameCn: '越南', iso2: 'VN', region: 'Asia', matchTerms: ['vietnam', 'asean'] },
  { slug: 'thailand', name: 'Thailand', nameCn: '泰国', iso2: 'TH', region: 'Asia', matchTerms: ['thailand', 'asean'] },
  { slug: 'malaysia', name: 'Malaysia', nameCn: '马来西亚', iso2: 'MY', region: 'Asia', matchTerms: ['malaysia', 'asean'] },
  { slug: 'philippines', name: 'Philippines', nameCn: '菲律宾', iso2: 'PH', region: 'Asia', matchTerms: ['philippines', 'asean'] },

  // Africa
  { slug: 'nigeria', name: 'Nigeria', nameCn: '尼日利亚', iso2: 'NG', region: 'Africa', matchTerms: ['nigeria', 'west africa', 'developing'] },
  { slug: 'ghana', name: 'Ghana', nameCn: '加纳', iso2: 'GH', region: 'Africa', matchTerms: ['ghana', 'west africa', 'developing'] },
  { slug: 'kenya', name: 'Kenya', nameCn: '肯尼亚', iso2: 'KE', region: 'Africa', matchTerms: ['kenya', 'east africa', 'developing'] },
  { slug: 'tanzania', name: 'Tanzania', nameCn: '坦桑尼亚', iso2: 'TZ', region: 'Africa', matchTerms: ['tanzania', 'east africa', 'developing'] },
  { slug: 'ethiopia', name: 'Ethiopia', nameCn: '埃塞俄比亚', iso2: 'ET', region: 'Africa', matchTerms: ['ethiopia', 'east africa', 'developing'] },
  { slug: 'egypt', name: 'Egypt', nameCn: '埃及', iso2: 'EG', region: 'Africa', matchTerms: ['egypt', 'north africa', 'developing'] },

  // Middle East
  { slug: 'saudi-arabia', name: 'Saudi Arabia', nameCn: '沙特阿拉伯', iso2: 'SA', region: 'Middle East', matchTerms: ['saudi arabia', 'middle east'] },
  { slug: 'uae', name: 'United Arab Emirates', nameCn: '阿联酋', iso2: 'AE', region: 'Middle East', matchTerms: ['uae', 'emirates', 'middle east'] },
  { slug: 'iran', name: 'Iran', nameCn: '伊朗', iso2: 'IR', region: 'Middle East', matchTerms: ['iran', 'middle east'] },
  { slug: 'turkey', name: 'Türkiye', nameCn: '土耳其', iso2: 'TR', region: 'Middle East', matchTerms: ['turkey', 'türkiye'] },

  // CIS / Central Asia
  { slug: 'russia', name: 'Russia', nameCn: '俄罗斯', iso2: 'RU', region: 'Europe', matchTerms: ['russia'] },
  { slug: 'kazakhstan', name: 'Kazakhstan', nameCn: '哈萨克斯坦', iso2: 'KZ', region: 'Asia', matchTerms: ['kazakhstan', 'central asia'] },
  { slug: 'uzbekistan', name: 'Uzbekistan', nameCn: '乌兹别克斯坦', iso2: 'UZ', region: 'Asia', matchTerms: ['uzbekistan', 'central asia'] },
  { slug: 'mongolia', name: 'Mongolia', nameCn: '蒙古', iso2: 'MN', region: 'Asia', matchTerms: ['mongolia'] },

  // Europe
  { slug: 'germany', name: 'Germany', nameCn: '德国', iso2: 'DE', region: 'Europe', matchTerms: ['germany', 'european union', 'europe'] },
  { slug: 'france', name: 'France', nameCn: '法国', iso2: 'FR', region: 'Europe', matchTerms: ['france', 'european union', 'europe'] },
  { slug: 'italy', name: 'Italy', nameCn: '意大利', iso2: 'IT', region: 'Europe', matchTerms: ['italy', 'european union', 'europe'] },
  { slug: 'spain', name: 'Spain', nameCn: '西班牙', iso2: 'ES', region: 'Europe', matchTerms: ['spain', 'european union', 'europe'] },
  { slug: 'uk', name: 'United Kingdom', nameCn: '英国', iso2: 'GB', region: 'Europe', matchTerms: ['united kingdom', 'uk', 'britain', 'europe'] },

  // Americas
  { slug: 'usa', name: 'United States', nameCn: '美国', iso2: 'US', region: 'Americas', matchTerms: ['united states', 'usa', 'america'] },
  { slug: 'canada', name: 'Canada', nameCn: '加拿大', iso2: 'CA', region: 'Americas', matchTerms: ['canada', 'america'] },
  { slug: 'brazil', name: 'Brazil', nameCn: '巴西', iso2: 'BR', region: 'Americas', matchTerms: ['brazil', 'latin america'] },
  { slug: 'mexico', name: 'Mexico', nameCn: '墨西哥', iso2: 'MX', region: 'Americas', matchTerms: ['mexico', 'latin america'] },

  // Oceania
  { slug: 'australia', name: 'Australia', nameCn: '澳大利亚', iso2: 'AU', region: 'Oceania', matchTerms: ['australia'] },
  { slug: 'new-zealand', name: 'New Zealand', nameCn: '新西兰', iso2: 'NZ', region: 'Oceania', matchTerms: ['new zealand'] },
];

/** Look up a country by slug. */
export function getCountryBySlug(slug: string): CountryInfo | null {
  return COUNTRIES.find((c) => c.slug === slug.toLowerCase()) ?? null;
}

/**
 * Get the list of scholarships available to students from a given
 * country. The matching is heuristic: a scholarship is included if
 * (a) it's open to "all countries" / "all countries with diplomatic
 * relations" / "all countries with Confucius Institutes", OR
 * (b) the scholarship's eligibleRegions text matches any of the
 * country's matchTerms.
 *
 * Returns the matching scholarships sorted by deadline proximity
 * (when deadline is a date string we can parse) so the most
 * actionable opportunities appear first.
 */
export function getScholarshipsForCountry(countrySlug: string): Scholarship[] {
  const country = getCountryBySlug(countrySlug);
  if (!country) return [];

  const allOpen = (text: string) =>
    /all countries|all nations|all applicants/i.test(text) ||
    /diplomatic relations/i.test(text) ||
    /confucius institute/i.test(text);

  return scholarships
    .filter((s) => {
      if (allOpen(s.eligibleRegions)) return true;
      const lower = s.eligibleRegions.toLowerCase();
      return country.matchTerms.some((term) => lower.includes(term));
    })
    .sort((a, b) => {
      const aDays = parseDeadlineDays(a.deadline);
      const bDays = parseDeadlineDays(b.deadline);
      return aDays - bDays;
    });
}

/** Parse a deadline string like "March 31, 2026" or "April 15". Returns
 * days from today; non-parseable strings sort to the end. */
function parseDeadlineDays(deadline: string): number {
  if (!deadline) return Number.POSITIVE_INFINITY;
  const now = new Date();
  // Try "Month DD, YYYY"
  const m = deadline.match(/([A-Za-z]+)\s+(\d{1,2})(?:,\s*(\d{4}))?/);
  if (!m) return Number.POSITIVE_INFINITY;
  const year = m[3] ? parseInt(m[3], 10) : now.getFullYear();
  const monthStr = m[1].toLowerCase();
  const months: Record<string, number> = {
    january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2,
    april: 3, apr: 3, may: 4, june: 5, jun: 5, july: 6, jul: 6,
    august: 7, aug: 7, september: 8, sep: 8, sept: 8, october: 9, oct: 9,
    november: 10, nov: 10, december: 11, dec: 11,
  };
  const month = months[monthStr];
  if (month === undefined) return Number.POSITIVE_INFINITY;
  const day = parseInt(m[2], 10);
  const d = new Date(year, month, day);
  const diff = (d.getTime() - now.getTime()) / 86_400_000;
  return Math.round(diff);
}

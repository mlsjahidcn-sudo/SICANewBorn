import type { University } from '@/lib/data';

export type CityUniversity = Pick<University,
  'slug' | 'name' | 'nameCn' | 'city' | 'cityCn' | 'ranking' | 'type' | 'typeCn' |
  'established' | 'description' | 'descriptionCn' | 'logo' | 'image' |
  'tuitionUndergrad' | 'tuitionGraduate'>;

export interface CityProgram {
  slug: string;
  universitySlug: string;
  language: string;
  isPublished?: boolean;
  archivedAt?: string | null;
}

export interface CityInfo {
  slug: string;
  name: string;
  nameCn: string;
  universityCount: number;
  programCount: number | null;
  englishProgramCount: number | null;
  universities: CityUniversity[];
}

/** Preserve existing simple slugs and normalize spaces, punctuation and Xi'an aliases. */
export function citySlug(value: string): string {
  return value.trim().toLowerCase().replace(/[’'`]/g, '').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
}

export function buildCityIndex(universities: CityUniversity[], programs: CityProgram[] | null): CityInfo[] {
  const grouped = new Map<string, CityUniversity[]>();
  const seen = new Set<string>();
  for (const university of universities) {
    const slug = citySlug(university.city);
    if (!slug || !university.slug || seen.has(university.slug)) continue;
    seen.add(university.slug);
    grouped.set(slug, [...(grouped.get(slug) ?? []), university]);
  }
  const counts = new Map<string, { total: number; english: number }>();
  const seenPrograms = new Set<string>();
  for (const program of programs ?? []) {
    if (!program.slug || seenPrograms.has(program.slug) || program.isPublished === false || program.archivedAt) continue;
    seenPrograms.add(program.slug);
    const count = counts.get(program.universitySlug) ?? { total: 0, english: 0 };
    count.total += 1;
    // Bilingual and unspecified languages are deliberately not counted as English-taught.
    if (program.language.trim().toLowerCase() === 'english') count.english += 1;
    counts.set(program.universitySlug, count);
  }
  return [...grouped].map(([slug, items]): CityInfo => {
    const ranked = [...items].sort((a, b) => (a.ranking > 0 ? a.ranking : Infinity) - (b.ranking > 0 ? b.ranking : Infinity) || a.name.localeCompare(b.name));
    return {
      slug, name: ranked[0].city.trim(), nameCn: ranked.find((u) => u.cityCn.trim())?.cityCn.trim() ?? '',
      universityCount: ranked.length,
      programCount: programs === null ? null : ranked.reduce((sum, u) => sum + (counts.get(u.slug)?.total ?? 0), 0),
      englishProgramCount: programs === null ? null : ranked.reduce((sum, u) => sum + (counts.get(u.slug)?.english ?? 0), 0),
      universities: ranked,
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
}

export type CitySort = 'name' | 'universities' | 'programs';
export function findCities(cities: CityInfo[], query: string, sort: string): CityInfo[] {
  const term = query.trim().toLowerCase();
  return cities.filter((c) => `${c.name} ${c.nameCn} ${c.slug} ${c.universities.map((u) => `${u.name} ${u.nameCn}`).join(' ')}`.toLowerCase().includes(term))
    .sort((a, b) => (sort === 'universities' ? b.universityCount - a.universityCount : sort === 'programs' ? (b.programCount ?? -1) - (a.programCount ?? -1) : 0) || a.name.localeCompare(b.name));
}

export function findCityUniversities(city: CityInfo, query: string, sort: string): CityUniversity[] {
  const term = query.trim().toLowerCase();
  return city.universities.filter((u) => `${u.name} ${u.nameCn}`.toLowerCase().includes(term))
    .sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : (a.ranking > 0 ? a.ranking : Infinity) - (b.ranking > 0 ? b.ranking : Infinity) || a.name.localeCompare(b.name));
}

export const CITY_PAGE_SIZE = 12;
export function cityPageNumber(value: string | undefined, total: number): number {
  const requested = value && /^\d+$/.test(value) ? Number(value) : 1;
  return Math.max(1, Math.min(Number.isSafeInteger(requested) ? requested : 1, Math.ceil(total / CITY_PAGE_SIZE) || 1));
}

export function cityPageHref(path: string, query: string, sort: string, page = 1, lang?: string): string {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (sort) params.set('sort', sort);
  if (page > 1) params.set('page', String(page));
  if (lang === 'en' || lang === 'zh') params.set('lang', lang);
  return `${path}${params.size ? `?${params}` : ''}`;
}

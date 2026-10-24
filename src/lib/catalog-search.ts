/** Public catalog contracts. Safe to import in client components (no DB or seed data). */
export type CatalogKind = 'programs' | 'universities';
export type CatalogFilterKey = 'degree' | 'language' | 'city' | 'university' | 'discipline' | 'scholarship' | 'intake' | 'year' | 'tuition' | 'duration' | 'tag' | 'type' | 'rating' | 'tuition_min' | 'tuition_max' | 'duration_min' | 'duration_max';
export type CatalogFilters = Partial<Record<CatalogFilterKey, string>>;
export interface CatalogQuery {
  kind: CatalogKind;
  q: string;
  filters: CatalogFilters;
  sort: string;
  page: number;
  limit: number;
}
export interface CatalogFacet {
  value: string;
  label: string;
  labelCn?: string;
  count: number;
}
export interface CatalogRow {
  slug: string;
  name: string;
  nameCn: string;
  universitySlug?: string;
  universityName?: string;
  universityNameCn?: string;
  logo?: string;
  city: string;
  cityCn: string;
  degree?: string;
  language?: string;
  duration?: string;
  durationCn?: string;
  tuition?: string;
  intake?: string;
  intakeCn?: string;
  scholarshipAvailable?: boolean | null;
  ranking?: number | null;
  qsWorldRanking?: number | null;
  matchingProgramCount?: number;
  matchReason?: 'title' | 'subject' | 'university' | 'location';
}
export interface CatalogSearchResult {
  kind: CatalogKind;
  rows: CatalogRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets: Partial<Record<CatalogFilterKey, CatalogFacet[]>>;
  suggestions: string[];
}
export interface CatalogSuggestion {
  kind: CatalogKind;
  label: string;
  sublabel: string;
  href: string;
}

export const CATALOG_PAGE_SIZE = 24;
export const CATALOG_QUERY_MAX = 200;
const filterKeys: CatalogFilterKey[] = ['degree', 'language', 'city', 'university', 'discipline', 'scholarship', 'intake', 'year', 'tuition', 'duration', 'tag', 'type', 'rating', 'tuition_min', 'tuition_max', 'duration_min', 'duration_max'];
const programKeys = new Set<CatalogFilterKey>(['degree', 'language', 'city', 'university', 'discipline', 'scholarship', 'intake', 'year', 'tuition', 'duration', 'tuition_min', 'tuition_max', 'duration_min', 'duration_max']);
const universityKeys = new Set<CatalogFilterKey>(['city', 'discipline', 'tag', 'type', 'rating']);
const urlKeys: Partial<Record<CatalogFilterKey, string>> = { language: 'lang', university: 'uni', discipline: 'disc' };

export function normalizeCatalogText(value: string): string {
  return value.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
}

/** Each group is OR; groups are AND. Multiword aliases stay together. */
const aliases: Record<string, readonly string[]> = {
  cs: ['computer science', '计算机'], ai: ['artificial intelligence', '人工智能'],
  bachelor: ['bachelor', 'bsc', 'beng', 'ba', '本科'], bachelors: ['bachelor', 'bsc', 'beng', 'ba', '本科'],
  bsc: ['bsc', 'bachelor', '本科'], beng: ['beng', 'bachelor', '本科'],
  master: ['master', 'msc', 'meng', '硕士'], masters: ['master', 'msc', 'meng', '硕士'], msc: ['msc', 'master', '硕士'],
  phd: ['phd', 'doctoral', 'doctorate', '博士'], doctoral: ['phd', 'doctoral', 'doctorate', '博士'],
  english: ['english', '英语', '英文'], 英语: ['english', '英语', '英文'], 英文: ['english', '英语', '英文'],
  chinese: ['chinese', '中文', '汉语'], 中文: ['chinese', '中文', '汉语'], 汉语: ['chinese', '中文', '汉语'],
  bilingual: ['bilingual', '双语'], 双语: ['bilingual', '双语'],
  本科: ['bachelor', 'bsc', '本科'], 硕士: ['master', 'msc', '硕士'], 博士: ['phd', 'doctoral', '博士'],
  计算机: ['computer science', '计算机'], 人工智能: ['artificial intelligence', '人工智能'],
};
const stopWords = new Set(['in', 'at', 'for', 'the', 'of', 'and', 'to', 'taught', 'study', 'studying']);

export function catalogQueryTerms(query: string): string[][] {
  const tokens = normalizeCatalogText(query.slice(0, CATALOG_QUERY_MAX)).split(' ').filter(Boolean);
  return [...new Set(tokens)].filter((token) => !stopWords.has(token)).map((token) => [...(aliases[token] ?? [token])]);
}

export function catalogMatches(terms: readonly (readonly string[])[], text: string): boolean {
  const normalized = normalizeCatalogText(text);
  return terms.every((alternatives) => alternatives.some((word) => normalized.includes(word)));
}

export function parseCatalogQuery(kind: CatalogKind, sp: URLSearchParams): CatalogQuery {
  const q = (sp.get('q') ?? sp.get('search') ?? '').trim().slice(0, CATALOG_QUERY_MAX);
  const allowed = kind === 'programs' ? programKeys : universityKeys;
  const filters: CatalogFilters = {};
  for (const key of filterKeys) {
    if (!allowed.has(key)) continue;
    const short = kind === 'programs' ? urlKeys[key] : undefined;
    const raw = (sp.get(key) ?? (short ? sp.get(short) : null) ?? (key === 'discipline' ? sp.get('disc') : null))?.trim().slice(0, 200);
    if (!raw || raw === 'all' || (key === 'rating' && raw === '0')) continue;
    // hreflang uses ?lang=zh/en. Only the teaching-language values belong in filters.
    if (key === 'language' && !sp.has('language') && (raw === 'en' || raw === 'zh')) continue;
    if (key === 'scholarship' && raw !== '1' && raw !== 'true') continue;
    if (['year', 'rating', 'tuition_min', 'tuition_max', 'duration_min', 'duration_max'].includes(key) && !(key === 'year' && raw === '__none__') && (!Number.isFinite(Number(raw)) || Number(raw) < 0)) continue;
    if (key === 'tuition' && !['0-20000', '20000-40000', '40000-'].includes(raw)) continue;
    if (key === 'duration' && !['0-1', '1-2', '2-3', '3-'].includes(raw)) continue;
    filters[key] = key === 'scholarship' ? '1' : raw;
  }
  const sorts = kind === 'programs' ? ['default', 'relevance', 'name', 'tuition', 'intake', 'featured_rank'] : ['ranking', 'qsWorld', 'rating', 'name', 'relevance'];
  const rawSort = sp.get('sort');
  const sort = rawSort && sorts.includes(rawSort) ? rawSort : q ? 'relevance' : kind === 'programs' ? 'default' : 'ranking';
  const positiveInt = (raw: string | null, fallback: number, max: number): number => /^\d+$/.test(raw ?? '') ? Math.min(max, Math.max(1, Number(raw))) : fallback;
  return { kind, q, filters, sort, page: positiveInt(sp.get('page'), 1, 100000), limit: positiveInt(sp.get('limit'), CATALOG_PAGE_SIZE, 500) };
}

export function catalogQueryString(query: CatalogQuery): string {
  const sp = new URLSearchParams();
  if (query.q) sp.set('q', query.q);
  for (const key of filterKeys) {
    const value = query.filters[key];
    if (value) sp.set(query.kind === 'programs' ? urlKeys[key] ?? key : key, value);
  }
  const defaultSort = query.q ? 'relevance' : query.kind === 'programs' ? 'default' : 'ranking';
  if (query.sort !== defaultSort) sp.set('sort', query.sort);
  if (query.page > 1) sp.set('page', String(query.page));
  if (query.limit !== CATALOG_PAGE_SIZE) sp.set('limit', String(query.limit));
  return sp.toString();
}

export function catalogHref(query: CatalogQuery): string {
  const qs = catalogQueryString(query);
  return `/${query.kind}${qs ? `?${qs}` : ''}`;
}

export function catalogTabHref(query: CatalogQuery, kind: CatalogKind): string {
  return catalogHref({ ...query, kind, filters: query.filters.city ? { city: query.filters.city } : {}, sort: query.q ? 'relevance' : kind === 'programs' ? 'default' : 'ranking', page: 1, limit: CATALOG_PAGE_SIZE });
}

/** Return links carry a query string only; never accept an arbitrary destination. */
export function safeCatalogReturnQuery(value: string): string {
  return value.length <= 3000 && !/[\r\n]/.test(value) ? value : '';
}

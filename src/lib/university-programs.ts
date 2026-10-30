import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { PROGRAM_LIST_COLUMNS } from '@/lib/catalog-list-columns';
import { isSupabaseServerConfigured, supabaseServer } from '@/lib/supabase-server';
import { programs as staticPrograms } from '@/lib/data';
import { CACHE_TAGS } from '@/lib/cache';
import { isCatalogSearchEnabled, searchPublicCatalog } from '@/lib/catalog-search-server';
import { queryPrograms } from '@/lib/program-query';
import type { CatalogRow, CatalogFacet } from '@/lib/catalog-search';

export interface UniversityProgramPage {
  error?: boolean;
  rows: CatalogRow[];
  total: number;
  page: number;
  totalPages: number;
  degreeOptions: CatalogFacet[];
  languageOptions: CatalogFacet[];
  search: string;
  degree: string;
  language: string;
}

interface ProgramIndexRow {
  degree: string | null;
  language: string | null;
  scholarship_available: boolean | null;
}

// Counts and filter options need four small columns from this university,
// not a catalog-wide search with every program facet. Share the read per request.
const getUniversityProgramIndex = cache(unstable_cache(async (slug: string): Promise<ProgramIndexRow[]> => {
  if (!isSupabaseServerConfigured()) {
    return staticPrograms.filter(p => p.universitySlug === slug).map(p => ({
      degree: p.degree, language: p.language, scholarship_available: p.scholarshipAvailable ?? null,
    }));
  }
  const rows: ProgramIndexRow[] = [];
  for (;;) {
    const { data, count, error } = await supabaseServer.from('programs')
      .select('slug, degree, language, scholarship_available', { count: 'exact' })
      .eq('university_slug', slug).eq('is_published', true).is('archived_at', null)
      .order('slug').range(rows.length, rows.length + 499);
    if (error || count === null) throw new Error('Unable to load program counts');
    if (!data?.length && rows.length < count) throw new Error('Incomplete university program index');
    rows.push(...(data ?? []));
    // Use the exact count so a Data API page cap below 500 cannot hide programs.
    if (rows.length >= count) return rows;
  }
}, ['university-public-program-index'], { tags: [CACHE_TAGS.programs], revalidate: 300 }));

export const getUniversityProgramSummary = cache(async (slug: string): Promise<{ total: number; scholarships: number }> => {
  const rows = await getUniversityProgramIndex(slug);
  return { total: rows.length, scholarships: rows.filter(row => row.scholarship_available === true).length };
});

function indexValue(row: ProgramIndexRow, key: 'degree' | 'language'): string {
  return row[key] || (key === 'language' ? 'To be confirmed' : '__none__');
}

function programOptions(rows: ProgramIndexRow[], key: 'degree' | 'language', other: 'degree' | 'language', filter: string): CatalogFacet[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    if (filter && indexValue(row, other) !== filter) continue;
    const value = indexValue(row, key);
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts].map(([value, count]) => ({ value, label: value, count })).sort((a, b) => a.label.localeCompare(b.label));
}

function toUniversityProgram(row: Record<string, unknown>): CatalogRow {
  const text = (key: string): string => typeof row[key] === 'string' ? row[key] : '';
  return {
    slug: text('slug'), name: text('name'), nameCn: text('name_cn'), universitySlug: text('university_slug'),
    degree: text('degree'), language: text('language'), duration: text('duration'), durationCn: text('duration_cn'),
    tuition: text('tuition'), intake: text('intake'), intakeCn: text('intake_cn'),
    scholarshipAvailable: typeof row.scholarship_available === 'boolean' ? row.scholarship_available : null,
    city: '', cityCn: '', logo: '',
  };
}

const getScopedProgramPage = cache(unstable_cache(async (slug: string, degree: string, language: string, page: number): Promise<Pick<UniversityProgramPage, 'rows' | 'total' | 'totalPages'>> => {
  let query = supabaseServer.from('programs').select(PROGRAM_LIST_COLUMNS, { count: 'exact' })
    .eq('university_slug', slug).eq('is_published', true).is('archived_at', null);
  if (degree === '__none__') query = query.or('degree.is.null,degree.eq.');
  else if (degree) query = query.eq('degree', degree);
  if (language === 'To be confirmed') query = query.or('language.is.null,language.eq.,language.eq.To be confirmed');
  else if (language) query = query.eq('language', language);
  const { data, count, error } = await query.order('name').order('slug').range((page - 1) * 12, page * 12 - 1);
  if (error || count === null) throw new Error('Unable to load university programs');
  return { rows: ((data ?? []) as unknown as Record<string, unknown>[]).map(toUniversityProgram), total: count, totalPages: Math.ceil(count / 12) };
}, ['university-public-program-page'], { tags: [CACHE_TAGS.programs], revalidate: 300 }));

export async function getUniversityProgramPage(slug: string, sp: Record<string, string | string[] | undefined>, locale: 'en' | 'zh'): Promise<UniversityProgramPage> {
  const value = (key: string): string => typeof sp[key] === 'string' ? sp[key].trim().slice(0, 200) : '';
  const search = value('programQ');
  const degree = value('programDegree');
  const language = value('programLanguage');
  const requested = Number.parseInt(value('programPage'), 10);
  const page = Number.isFinite(requested) && requested > 0 ? Math.min(requested, 10000) : 1;
  const limit = 12;
  try {
  if (!search && isSupabaseServerConfigured()) {
    const [index, initial] = await Promise.all([
      getUniversityProgramIndex(slug), getScopedProgramPage(slug, degree, language, page),
    ]);
    const actualPage = page > Math.max(1, initial.totalPages) ? 1 : page;
    const result = actualPage === page ? initial : await getScopedProgramPage(slug, degree, language, actualPage);
    return {
      rows: result.rows,
      total: result.total, page: actualPage, totalPages: result.totalPages,
      degreeOptions: programOptions(index, 'degree', 'language', language),
      languageOptions: programOptions(index, 'language', 'degree', degree), search, degree, language,
    };
  }
  if (await isCatalogSearchEnabled()) {
    const query = { kind: 'programs' as const, q: search, filters: { university: slug, ...(degree ? { degree } : {}), ...(language ? { language } : {}) }, sort: search ? 'relevance' : 'name', page, limit };
    const initial = await searchPublicCatalog(query, locale);
    const result = page > Math.max(1, initial.totalPages) ? await searchPublicCatalog({ ...query, page: 1 }, locale) : initial;
    return { rows: result.rows, total: result.total, page: result.page, totalPages: result.totalPages, degreeOptions: result.facets.degree ?? [], languageOptions: result.facets.language ?? [], search, degree, language };
  }
  const initial = await queryPrograms({ university: slug, search, degree, language, page, limit, sort: 'name' });
  const result = page > Math.max(1, initial.totalPages) ? await queryPrograms({ university: slug, search, degree, language, page: 1, limit, sort: 'name' }) : initial;
  return {
    rows: result.programs.map((p) => ({ slug: p.slug, name: p.name, nameCn: p.nameCn, universitySlug: slug, degree: p.degree, language: p.language, duration: p.duration, durationCn: p.durationCn, tuition: p.tuition, intake: p.intake, intakeCn: p.intakeCn, scholarshipAvailable: p.scholarshipAvailable, city: '', cityCn: '', logo: '' })),
    total: result.total, page: page > Math.max(1, initial.totalPages) ? 1 : page, totalPages: result.totalPages, degreeOptions: [], languageOptions: [], search, degree, language,
  };
  } catch {
    return { error: true, rows: [], total: 0, page, totalPages: 0, degreeOptions: [], languageOptions: [], search, degree, language };
  }
}

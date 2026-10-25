import { unstable_cache } from 'next/cache';
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

export const getUniversityProgramSummary = unstable_cache(async (slug: string): Promise<{ total: number; scholarships: number }> => {
  if (!isSupabaseServerConfigured()) {
    const programs = staticPrograms.filter((p) => p.universitySlug === slug);
    return { total: programs.length, scholarships: programs.filter((p) => p.scholarshipAvailable === true).length };
  }
  const base = (): ReturnType<typeof supabaseServer.from> => supabaseServer.from('programs');
  const [all, scholarships] = await Promise.all([
    base().select('slug', { count: 'exact', head: true }).eq('university_slug', slug).eq('is_published', true).is('archived_at', null),
    base().select('slug', { count: 'exact', head: true }).eq('university_slug', slug).eq('is_published', true).is('archived_at', null).eq('scholarship_available', true),
  ]);
  if (all.error || scholarships.error) throw new Error('Unable to load program counts');
  return { total: all.count ?? 0, scholarships: scholarships.count ?? 0 };
}, ['university-public-program-summary'], { tags: [CACHE_TAGS.programs], revalidate: 300 });

export async function getUniversityProgramPage(slug: string, sp: Record<string, string | string[] | undefined>, locale: 'en' | 'zh'): Promise<UniversityProgramPage> {
  const value = (key: string): string => typeof sp[key] === 'string' ? sp[key].trim().slice(0, 200) : '';
  const search = value('programQ');
  const degree = value('programDegree');
  const language = value('programLanguage');
  const requested = Number.parseInt(value('programPage'), 10);
  const page = Number.isFinite(requested) && requested > 0 ? Math.min(requested, 10000) : 1;
  const limit = 12;
  try {
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

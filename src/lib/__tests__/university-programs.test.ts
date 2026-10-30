import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ from: vi.fn(), enabled: vi.fn(), search: vi.fn(), legacy: vi.fn(), configured: vi.fn(), cache: new Map<string, unknown>() }));
vi.mock('next/cache', () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown, keys: string[]) => (...args: unknown[]) => {
    const key = JSON.stringify([keys, args]);
    if (!mocks.cache.has(key)) mocks.cache.set(key, fn(...args));
    return mocks.cache.get(key);
  },
}));
vi.mock('@/lib/supabase-server', () => ({ supabaseServer: { from: mocks.from }, isSupabaseServerConfigured: mocks.configured }));
vi.mock('@/lib/catalog-search-server', () => ({ isCatalogSearchEnabled: mocks.enabled, searchPublicCatalog: mocks.search }));
vi.mock('@/lib/program-query', () => ({ queryPrograms: mocks.legacy }));
import { getUniversityProgramPage, getUniversityProgramSummary } from '@/lib/university-programs';

type Row = Record<string, string | boolean | null>;
const program = (slug: string, degree = 'Bachelor', language: string | null = 'English'): Row => ({
  slug, name: slug, name_cn: `中文 ${slug}`, university_slug: 'example', degree, language,
  is_published: true, archived_at: null, scholarship_available: true,
});

/** Executes filters and simulates a Data API cap smaller than the requested page. */
function database(rows: Row[], options: { cap?: number; error?: boolean } = {}): { filters: Array<[string, unknown]>; columns: string }[] {
  const queries: { filters: Array<[string, unknown]>; columns: string }[] = [];
  mocks.from.mockImplementation((table: string) => {
    expect(table).toBe('programs');
    let matching = [...rows]; let start = 0; let end = Infinity;
    const record = { filters: [] as Array<[string, unknown]>, columns: '' };
    queries.push(record);
    const query = {
      select(columns: string) { record.columns = columns; return query; },
      eq(key: string, value: unknown) { record.filters.push([key, value]); matching = matching.filter(row => row[key] === value); return query; },
      is(key: string, value: unknown) { record.filters.push([key, value]); matching = matching.filter(row => row[key] === value); return query; },
      or(filter: string) {
        const tests = filter.split(',').map(term => term.split('.'));
        matching = matching.filter(row => tests.some(([key, op, ...value]) => op === 'is' ? row[key] === null : row[key] === value.join('.')));
        return query;
      },
      order() { matching.sort((a, b) => String(a.slug).localeCompare(String(b.slug))); return query; },
      range(from: number, to: number) { start = from; end = Math.min(to, from + (options.cap ?? 500) - 1); return query; },
      then(resolve: (value: unknown) => unknown) {
        return Promise.resolve(resolve({ data: matching.slice(start, end + 1), count: matching.length, error: options.error ? { message: 'Database unavailable' } : null }));
      },
    };
    return query;
  });
  return queries;
}

beforeEach(() => {
  vi.clearAllMocks(); mocks.cache.clear();
  mocks.configured.mockReturnValue(true); mocks.enabled.mockResolvedValue(true);
});

describe('university-scoped program loading', () => {
  const rows = [
    program('a'), program('b', 'Master'), program('c', 'Master', 'Chinese'),
    { ...program('draft'), is_published: false },
    { ...program('archived'), archived_at: '2026-01-01' },
    { ...program('other-university'), university_slug: 'other' },
  ];
  it('avoids the global catalog RPC, excludes non-public rows and reuses the count index', async () => {
    const queries = database(rows);
    const result = await getUniversityProgramPage('example', {}, 'en');
    expect(result).toMatchObject({ total: 3, page: 1, totalPages: 1 });
    expect(result.rows.map(row => row.slug)).toEqual(['a', 'b', 'c']);
    expect(await getUniversityProgramSummary('example')).toEqual({ total: 3, scholarships: 3 });
    expect(queries).toHaveLength(2);
    for (const query of queries) {
      expect(query.filters).toEqual(expect.arrayContaining([['university_slug', 'example'], ['is_published', true], ['archived_at', null]]));
      expect(query.columns).not.toBe('*');
    }
    expect(mocks.enabled).not.toHaveBeenCalled(); expect(mocks.search).not.toHaveBeenCalled();
  });
  it('keeps degree/language facets disjunctive and applies both row filters', async () => {
    database(rows);
    const result = await getUniversityProgramPage('example', { programDegree: 'Master', programLanguage: 'English' }, 'en');
    expect(result.rows.map(row => row.slug)).toEqual(['b']);
    expect(result.degreeOptions).toEqual([{ value: 'Bachelor', label: 'Bachelor', count: 1 }, { value: 'Master', label: 'Master', count: 1 }]);
    expect(result.languageOptions).toEqual([{ value: 'Chinese', label: 'Chinese', count: 1 }, { value: 'English', label: 'English', count: 1 }]);
  });
  it('includes null and blank teaching language under To be confirmed', async () => {
    database([program('a', 'Master', null), program('b', 'Master', ''), program('c', 'Master', 'To be confirmed'), program('d')]);
    const result = await getUniversityProgramPage('example', { programLanguage: 'To be confirmed' }, 'zh');
    expect(result.total).toBe(3);
    expect(result.languageOptions.find(option => option.value === 'To be confirmed')?.count).toBe(3);
  });
  it('does not stop counting at the Data API row cap', async () => {
    database(Array.from({ length: 53 }, (_, i) => program(`p-${i}`)), { cap: 20 });
    expect(await getUniversityProgramSummary('example')).toEqual({ total: 53, scholarships: 53 });
    expect(mocks.from).toHaveBeenCalledTimes(3);
  });
  it('preserves pagination totals and resets out-of-range pages', async () => {
    database(Array.from({ length: 25 }, (_, i) => program(`p-${String(i).padStart(2, '0')}`)));
    const last = await getUniversityProgramPage('example', { programPage: '3' }, 'en');
    expect(last).toMatchObject({ total: 25, page: 3, totalPages: 3 }); expect(last.rows).toHaveLength(1);
    const reset = await getUniversityProgramPage('example', { programPage: '99' }, 'en');
    expect(reset.page).toBe(1); expect(reset.rows).toHaveLength(12);
  });
  it('keeps full-text search on the existing matcher with the university filter', async () => {
    mocks.search.mockResolvedValue({ rows: [], total: 0, page: 1, totalPages: 0, facets: {} });
    await getUniversityProgramPage('example', { programQ: 'CS' }, 'zh');
    expect(mocks.search).toHaveBeenCalledWith(expect.objectContaining({ q: 'CS', filters: { university: 'example' } }), 'zh');
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it('surfaces failures as retryable results rather than empty successful listings', async () => {
    database(rows, { error: true });
    expect(await getUniversityProgramPage('example', {}, 'en')).toMatchObject({ error: true });
    await expect(getUniversityProgramSummary('example')).rejects.toThrow('Unable to load program counts');
  });
  it('retains the static/unconfigured fallback', async () => {
    mocks.configured.mockReturnValue(false); mocks.enabled.mockResolvedValue(false);
    mocks.legacy.mockResolvedValue({ programs: [], total: 0, totalPages: 0 });
    expect(await getUniversityProgramPage('example', {}, 'en')).toMatchObject({ total: 0, rows: [] });
    expect(await getUniversityProgramSummary('example')).toEqual({ total: 0, scholarships: 0 });
    expect(mocks.from).not.toHaveBeenCalled();
  });
});

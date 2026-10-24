import { beforeEach, describe, expect, it, vi } from 'vitest';
import { parseCatalogQuery } from '@/lib/catalog-search';

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock('@/lib/supabase-server', () => ({ isSupabaseServerConfigured: () => true, supabaseServer: { rpc } }));
import { isCatalogSearchEnabled, searchPublicCatalog, invalidateCatalogSearchCache, getCatalogSuggestions } from '@/lib/catalog-search-server';

const row = { slug: 'computer-science', name: 'Computer Science', name_cn: '计算机科学', university_slug: 'tsinghua', university_name: 'Tsinghua University', city: 'Beijing', language: 'English', degree: 'Bachelor', match_reason: 'subject' };
const response = { data: { version: 2, total: 1200, rows: [row], facets: {} }, error: null };
beforeEach(() => { invalidateCatalogSearchCache(); rpc.mockReset(); rpc.mockResolvedValue(response); });

describe('public catalog server', () => {
  it('keeps the legacy finder when the release flag is off', async () => {
    vi.stubEnv('CATALOG_SEARCH_V2', 'false');
    expect(await isCatalogSearchEnabled()).toBe(false);
    expect(rpc).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });
  it('sends token groups and exact pagination to the database, preserving totals over 1000', async () => {
    const query = parseCatalogQuery('programs', new URLSearchParams('q=CS+Beijing&page=43'));
    const result = await searchPublicCatalog(query);
    expect(rpc).toHaveBeenCalledWith('catalog_search_v2', expect.objectContaining({ terms: [['computer science', '计算机'], ['beijing']], page_number: 43, page_size: 24 }));
    expect(result.total).toBe(1200); expect(result.totalPages).toBe(50);
    expect(result.rows[0].universityName).toBe('Tsinghua University');
    expect(result.programs?.[0].slug).toBe(row.slug);
  });
  it('caches repeated searches and invalidates after a catalog write', async () => {
    const query = parseCatalogQuery('programs', new URLSearchParams('q=CS'));
    await searchPublicCatalog(query); await searchPublicCatalog(query);
    expect(rpc).toHaveBeenCalledTimes(1);
    invalidateCatalogSearchCache(); await searchPublicCatalog(query);
    expect(rpc).toHaveBeenCalledTimes(2);
  });
  it('does not cache a request that began before an invalidation', async () => {
    let resolve: (value: typeof response) => void = () => {};
    rpc.mockImplementationOnce(() => new Promise((done) => { resolve = done; }));
    const query = parseCatalogQuery('programs', new URLSearchParams('q=CS'));
    const old = searchPublicCatalog(query);
    invalidateCatalogSearchCache(); resolve(response); await old;
    await searchPublicCatalog(query);
    expect(rpc).toHaveBeenCalledTimes(2);
  });
  it('requests explicit spelling choices only for an empty full search', async () => {
    rpc.mockResolvedValueOnce({ data: { version: 2, total: 0, rows: [], facets: {} }, error: null });
    rpc.mockResolvedValueOnce({ data: ['Computer Science'], error: null });
    const result = await searchPublicCatalog(parseCatalogQuery('programs', new URLSearchParams('q=compuer+science')));
    expect(result.suggestions).toEqual(['Computer Science']);
    expect(rpc).toHaveBeenLastCalledWith('catalog_spellings_v2', expect.objectContaining({ query: 'compuer science' }));
  });
  it('surfaces database errors instead of returning unrelated seed programs', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'offline' } });
    await expect(searchPublicCatalog(parseCatalogQuery('programs', new URLSearchParams('q=CS')))).rejects.toThrow('temporarily unavailable');
  });
  it('uses the shared matcher for grouped, bounded suggestions', async () => {
    const suggestions = await getCatalogSuggestions('CS', 'en');
    expect(suggestions).toHaveLength(2);
    expect(suggestions[0]).toMatchObject({ kind: 'programs', label: 'Computer Science' });
    expect(suggestions[0].href).toContain('uni=tsinghua');
    expect(suggestions[1].href).toBe('/universities/computer-science');
    expect(rpc).toHaveBeenCalledWith('catalog_search_v2', expect.objectContaining({ include_facets: false, page_size: 4 }));
  });
});

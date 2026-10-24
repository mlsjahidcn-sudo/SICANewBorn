import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ enabled: vi.fn(), search: vi.fn(), admin: vi.fn() }));
vi.mock('@/lib/catalog-search-server', () => ({ isCatalogSearchEnabled: mocks.enabled, searchPublicCatalog: mocks.search, invalidateCatalogSearchCache: vi.fn() }));
vi.mock('@/lib/supabase-auth', () => ({ requireAdmin: mocks.admin }));
vi.mock('@/lib/supabase-server', () => ({ isSupabaseServerConfigured: () => false, supabaseServer: null }));
vi.mock('@/lib/server-t', () => ({ getServerLocale: async () => 'en' }));
vi.mock('@/lib/ai/live-data-context', () => ({ invalidateLiveCatalogCache: vi.fn() }));
import { GET as programs } from '../programs/route';
import { GET as universities } from '../universities/route';
beforeEach(() => {
  vi.clearAllMocks(); mocks.enabled.mockResolvedValue(true);
  mocks.search.mockResolvedValue({ rows: [], programs: [], total: 0, page: 1, limit: 24, totalPages: 0, facets: {}, suggestions: [] });
  mocks.admin.mockResolvedValue({ ok: false, error: 'Unauthorized', status: 401 });
});
describe('public catalog adapters', () => {
  it.each(['featured', 'include_archived', 'only_archived'])('requires admin authentication for %s', async (flag) => {
    const response = await programs(new Request(`https://sica.test/api/programs?${flag}=true`));
    expect(response.status).toBe(401); expect(mocks.search).not.toHaveBeenCalled();
  });
  it('passes the same aliases and filters to the shared query layer as server rendering', async () => {
    const response = await programs(new Request('https://sica.test/api/programs?search=CS+Beijing&language=English&degree=Master&locale=zh'));
    expect(response.status).toBe(200);
    expect(mocks.search).toHaveBeenCalledWith(expect.objectContaining({ q: 'CS Beijing', filters: { language: 'English', degree: 'Master' }, sort: 'relevance' }), 'zh');
  });
  it('preserves the university API default and accepts the finder page size', async () => {
    await universities(new Request('https://sica.test/api/universities?q=Chengdu'));
    expect(mocks.search).toHaveBeenLastCalledWith(expect.objectContaining({ kind: 'universities', limit: 8 }), 'en');
    await universities(new Request('https://sica.test/api/universities?q=Chengdu&limit=24'));
    expect(mocks.search).toHaveBeenLastCalledWith(expect.objectContaining({ limit: 24 }), 'en');
  });
  it('returns a retryable error instead of unrelated fallback rows on a search failure', async () => {
    mocks.search.mockRejectedValue(new Error('offline'));
    expect((await programs(new Request('https://sica.test/api/programs?q=CS'))).status).toBe(503);
    expect((await universities(new Request('https://sica.test/api/universities?q=CS'))).status).toBe(503);
  });
});

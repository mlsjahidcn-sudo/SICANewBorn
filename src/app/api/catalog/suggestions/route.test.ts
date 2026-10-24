import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ enabled: vi.fn(), suggestions: vi.fn(), rate: vi.fn() }));
vi.mock('@/lib/catalog-search-server', () => ({ isCatalogSearchEnabled: mocks.enabled, getCatalogSuggestions: mocks.suggestions }));
vi.mock('@/lib/rate-limit', () => ({ checkRateLimit: mocks.rate, extractClientIp: () => 'test' }));
import { GET } from './route';
beforeEach(() => { mocks.enabled.mockResolvedValue(true); mocks.suggestions.mockReset().mockResolvedValue([]); mocks.rate.mockReturnValue({ ok: true }); });
describe('public suggestions API', () => {
  it('does not query for one-character drafts', async () => {
    expect(await (await GET(new Request('https://sica.test/api/catalog/suggestions?q=c'))).json()).toEqual({ suggestions: [] });
    expect(mocks.suggestions).not.toHaveBeenCalled();
  });
  it('keeps rollback safe when the release flag or migration is unavailable', async () => {
    mocks.enabled.mockResolvedValue(false);
    expect((await GET(new Request('https://sica.test/api/catalog/suggestions?q=CS'))).status).toBe(200);
    expect(mocks.suggestions).not.toHaveBeenCalled();
  });
  it('returns a retryable status for failures and rate limiting', async () => {
    mocks.suggestions.mockRejectedValue(new Error('offline'));
    expect((await GET(new Request('https://sica.test/api/catalog/suggestions?q=CS'))).status).toBe(503);
    mocks.rate.mockReturnValue({ ok: false, retryAfterSec: 20 });
    const response = await GET(new Request('https://sica.test/api/catalog/suggestions?q=CS'));
    expect(response.status).toBe(429); expect(response.headers.get('Retry-After')).toBe('20');
  });
});

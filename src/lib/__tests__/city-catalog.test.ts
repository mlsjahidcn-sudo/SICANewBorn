import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
const db = vi.hoisted(() => ({ configured: true, tables: {} as Record<string, Record<string, unknown>[]>, fail: new Set<string>(), filters: [] as unknown[][], ranges: [] as unknown[][] }));
vi.mock('@/lib/supabase-server', () => ({
  isSupabaseServerConfigured: () => db.configured,
  supabaseServer: { from(table: string) {
    const chain = {
      select: () => chain,
      eq: (key: string, value: unknown) => { db.filters.push([table, key, value]); return chain; },
      is: (key: string, value: unknown) => { db.filters.push([table, key, value]); return chain; },
      order: () => chain,
      abortSignal: () => chain,
      range: (start: number, end: number) => {
        db.ranges.push([table, start, end]);
        if (db.fail.has(table) || db.fail.has(`${table}:${start}`)) return { abortSignal: async () => ({ data: null, error: { message: 'offline' } }) };
        return { abortSignal: async () => ({ data: (db.tables[table] ?? []).slice(start, end + 1), error: null }) };
      },
    };
    return chain;
  } },
}));
beforeEach(() => {
  vi.resetModules(); vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-28T00:00:00Z'));
  db.configured = true; db.fail.clear(); db.filters = []; db.ranges = [];
  db.tables = { universities: [{ slug: 'live', name: 'Live University', city: 'New City' }], programs: [{ slug: 'one', university_slug: 'live', language: 'English' }] };
});
afterEach(() => vi.useRealTimers());
describe('city catalog loading', () => {
  it('uses live-only universities and status-filtered program rows with no seed merge', async () => {
    const { loadCityCatalog } = await import('@/lib/city-catalog');
    const result = await loadCityCatalog();
    expect(result.source).toBe('live');
    expect(result.cities.map((city) => city.slug)).toEqual(['new-city']);
    expect(result.cities[0]).toMatchObject({ programCount: 1, englishProgramCount: 1 });
    expect(db.filters).toContainEqual(['programs', 'is_published', true]);
    expect(db.filters).toContainEqual(['programs', 'archived_at', null]);
  });
  it('loads rows beyond the PostgREST 1000-row cap', async () => {
    db.tables.programs = Array.from({ length: 1007 }, (_, i) => ({ slug: `p-${i}`, university_slug: 'live', language: 'English' }));
    const { loadCityCatalog } = await import('@/lib/city-catalog');
    expect((await loadCityCatalog()).cities[0].programCount).toBe(1007);
    expect(db.ranges).toContainEqual(['programs', 1000, 1999]);
  });
  it('does not present a failed second page as a complete count', async () => {
    db.tables.programs = Array.from({ length: 1000 }, (_, i) => ({ slug: `p-${i}`, university_slug: 'live', language: 'English' }));
    db.fail.add('programs:1000');
    const { loadCityCatalog } = await import('@/lib/city-catalog');
    const result = await loadCityCatalog();
    expect(result.programsAvailable).toBe(false);
    expect(result.cities[0].programCount).toBeNull();
  });
  it('respects a genuinely empty live catalog', async () => {
    db.tables = { universities: [], programs: [] };
    const { loadCityCatalog } = await import('@/lib/city-catalog');
    expect(await loadCityCatalog()).toMatchObject({ source: 'live', cities: [] });
  });
  it('retains a last complete snapshot when universities fail to refresh', async () => {
    const { loadCityCatalog } = await import('@/lib/city-catalog');
    await loadCityCatalog();
    vi.setSystemTime(new Date('2026-10-28T00:02:00Z'));
    db.fail.add('universities');
    const result = await loadCityCatalog();
    expect(result.source).toBe('stale');
    expect(result.cities[0]).toMatchObject({ slug: 'new-city', programCount: 1 });
  });
  it('labels the reference dataset when no live snapshot exists', async () => {
    db.fail.add('universities');
    const { loadCityCatalog } = await import('@/lib/city-catalog');
    const result = await loadCityCatalog();
    expect(result.source).toBe('fallback');
    expect(result.cities.some((city) => city.slug === 'beijing')).toBe(true);
    expect(result.cities.some((city) => city.slug === 'new-city')).toBe(false);
  });
});

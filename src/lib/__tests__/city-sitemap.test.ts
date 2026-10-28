import { describe, expect, it, vi } from 'vitest';
const rows = vi.hoisted(() => ({
  universities: [{ slug: 'new-school', city: 'New City' }, { slug: 'second-school', city: 'New City' }, { slug: 'xian-school', city: 'Xi’an' }],
  programs: [{ slug: 'english-program', discipline: 'Engineering' }, { slug: 'chinese-program', discipline: 'Medicine' }],
}));
vi.mock('@/lib/supabase-server', () => {
  const client = { from(table: string) {
    const data = table === 'universities' ? rows.universities : table === 'programs' ? rows.programs : [];
    const chain = { select: () => chain, eq: () => chain, order: () => chain, range: async (start: number, end: number) => ({ data: data.slice(start, end + 1), error: null }), limit: async () => ({ data: [], error: null }) };
    return chain;
  } };
  return { getSupabaseServer: () => client, supabaseServer: client, isSupabaseServerConfigured: () => true };
});
import { loadSitemapParts } from '@/lib/sitemap-entries';
describe('city sitemap coverage', () => {
  it('includes every live catalog city once with canonical slugs and leaves program URLs in their own sitemap', async () => {
    const { pages, programs } = await loadSitemapParts();
    const cities = pages.filter((entry) => entry.url.includes('/study-in-china/'));
    expect(cities.map((entry) => entry.url.split('/').at(-1)).sort()).toEqual(['new-city', 'xian']);
    expect(cities.every((entry) => !entry.lastModified)).toBe(true);
    expect(programs.map((entry) => entry.url.split('/').at(-1))).toEqual(['english-program', 'chinese-program']);
    expect(pages.some((entry) => /\/programs\/(english|chinese)-program$/.test(entry.url))).toBe(false);
  });
  it('does not invent seed city URLs when the live university catalog is empty', async () => {
    const original = rows.universities;
    try {
      rows.universities = [];
      const { pages } = await loadSitemapParts();
      expect(pages.filter((entry) => entry.url.includes('/study-in-china/'))).toEqual([]);
    } finally {
      rows.universities = original;
    }
  });

});

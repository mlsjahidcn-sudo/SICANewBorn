import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { fetchProgramRows } from '../program-rows';

function mockClient(count: number, failAt?: number) {
  const records = Array.from({ length: count }, (_, i) => ({ slug: `program-${i}` }));
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn(async (from: number, to: number) => from === failAt
      ? { data: null, error: { message: 'Connection failed' } }
      : { data: records.slice(from, to + 1), error: null }),
  };
  const client = { from: vi.fn(() => query) } as unknown as SupabaseClient;
  return { client, query };
}

describe('catalogue beyond the database response cap', () => {
  it('loads programs beyond the first 1,000 rows without duplicates', async () => {
    const { client, query } = mockClient(1081);
    const result = await fetchProgramRows(client);
    expect(result.data).toHaveLength(1081);
    expect(new Set(result.data?.map((row) => row.slug)).size).toBe(1081);
    expect(query.range.mock.calls).toEqual([[0, 499], [500, 999], [1000, 1499]]);
  });

  it('respects requested university and preview limits', async () => {
    const { client, query } = mockClient(1081);
    const result = await fetchProgramRows(client, { limit: 50, universitySlug: 'example' });
    expect(result.data).toHaveLength(50);
    expect(query.eq).toHaveBeenCalledWith('university_slug', 'example');
    expect(query.range).toHaveBeenCalledOnce();
    expect(query.eq).toHaveBeenCalledWith('is_published', true);
    expect(query.is).toHaveBeenCalledWith('archived_at', null);
  });

  it('reports a later page failure instead of silently returning an incomplete catalogue', async () => {
    const { client } = mockClient(1081, 500);
    const result = await fetchProgramRows(client);
    expect(result.data).toBeNull();
    expect(result.error?.message).toBe('Connection failed');
  });
});

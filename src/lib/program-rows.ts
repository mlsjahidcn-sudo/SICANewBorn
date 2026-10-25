import type { SupabaseClient } from '@supabase/supabase-js';

/** Fetch in bounded pages so PostgREST's row cap cannot truncate the catalogue. */
export async function fetchProgramRows(
  client: SupabaseClient,
  { limit = Infinity, universitySlug }: { limit?: number; universitySlug?: string } = {},
) {
  const rows: Record<string, unknown>[] = [];
  const pageSize = 500;
  while (rows.length < limit) {
    const size = Math.min(pageSize, limit - rows.length);
    let query = client.from('programs').select('*').eq('is_published', true).is('archived_at', null);
    if (universitySlug) query = query.eq('university_slug', universitySlug);
    const { data, error } = await query
      .order('name', { ascending: true })
      .order('slug', { ascending: true })
      .range(rows.length, rows.length + size - 1);
    if (error) return { data: null, error };
    rows.push(...(data ?? []));
    if (!data || data.length < size) break;
  }
  return { data: rows, error: null };
}

/**
 * Public, published-only list of admission notices. Shared by
 * `GET /api/admission-notices` (client "load more" + filters) and the
 * `/success-stories` server page, which renders the first page into the
 * HTML so visitors and crawlers see notices instead of "Loading…".
 */
import { getSupabaseServer } from '@/lib/supabase-server';
import { mapAdmissionNoticeFromDb } from './mapper';
import { getAdmissionNoticePublicUrl } from './storage';
import type { AdmissionDegree, AdmissionNotice } from './types';

export type PublicAdmissionNotice = AdmissionNotice & { publicImageUrl: string | null };

export interface PublicAdmissionNoticePage {
  notices: PublicAdmissionNotice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type PublicNoticeListResult =
  | { ok: true; data: PublicAdmissionNoticePage }
  | { ok: false; status: number; error: string };

export async function listPublishedAdmissionNotices({
  country = null,
  degree = null,
  page = 1,
  limit = 20,
}: {
  country?: string | null;
  degree?: AdmissionDegree | null;
  page?: number;
  limit?: number;
}): Promise<PublicNoticeListResult> {
  const supabase = getSupabaseServer();
  if (!supabase) return { ok: false, status: 503, error: 'Supabase is not configured' };

  const from = (page - 1) * limit;
  let query = supabase
    .from('admission_notices')
    .select('*', { count: 'exact' })
    .eq('is_published', true)
    .order('display_order', { ascending: false })
    .order('created_at', { ascending: false });
  if (country) query = query.eq('country', country);
  if (degree) query = query.eq('degree', degree);

  const { data, error, count } = await query.range(from, from + limit - 1);
  if (error) {
    console.error('[admission-notices] supabase error:', error);
    return { ok: false, status: 500, error: error.message };
  }

  const notices = (data || []).map((row) => {
    const mapped = mapAdmissionNoticeFromDb(row as never);
    return { ...mapped, publicImageUrl: getAdmissionNoticePublicUrl(mapped.imagePath) };
  });
  const total = count || notices.length;
  return {
    ok: true,
    data: { notices, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

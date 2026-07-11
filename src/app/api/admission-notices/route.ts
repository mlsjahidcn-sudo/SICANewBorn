/**
 * /api/admission-notices (public)
 *
 * Phase 51: Success Stories list. Public read of published
 * admission notices. Used by the /success-stories page.
 *
 *   GET /api/admission-notices
 *     ?country=Bangladesh          (filter)
 *     ?degree=Master               (filter)
 *     ?page=1&limit=20             (pagination)
 *
 *   Response: { notices, total, page, limit, totalPages }
 *
 * Auth: NONE (public endpoint). RLS scopes the SELECT to
 * is_published = TRUE, so unpublished rows are never returned
 * even if the URL is guessed.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { mapAdmissionNoticeFromDb } from '@/lib/admission-notices/mapper';
import { getAdmissionNoticePublicUrl } from '@/lib/admission-notices/storage';
import { parseAdmissionDegree } from '@/lib/admission-notices/types';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const country = url.searchParams.get('country')?.trim() || null;
  const degreeRaw = url.searchParams.get('degree')?.trim() || null;
  const degree = degreeRaw ? parseAdmissionDegree(degreeRaw) : null;
  // Reject unknown degree early with a clean 400.
  if (degreeRaw && !degree) {
    return NextResponse.json(
      { error: `Invalid degree. Allowed: Bachelor, Master, PhD, Language, Pre-University` },
      { status: 400 },
    );
  }
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase is not configured' },
      { status: 503 },
    );
  }

  try {
    let query = supabase
      .from('admission_notices')
      .select('*', { count: 'exact' })
      .eq('is_published', true)
      .order('display_order', { ascending: false })
      .order('created_at', { ascending: false });
    if (country) query = query.eq('country', country);
    if (degree) query = query.eq('degree', degree);
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) {
      console.error('[admission-notices GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Hydrate the public image URL for each row.
    const notices = (data || []).map((row) => {
      const mapped = mapAdmissionNoticeFromDb(row as never);
      return {
        ...mapped,
        publicImageUrl: getAdmissionNoticePublicUrl(mapped.imagePath),
      };
    });

    const total = count || notices.length;
    return NextResponse.json({
      notices,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admission-notices GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import {
  isCounsellingBookingStatus,
  mapCounsellingBookingFromDb,
  type CounsellingBooking,
} from '@/lib/counselling-mapper';
import { beijingTodayStr, beijingWallToUtc } from '@/lib/counselling-slots';

export const dynamic = 'force-dynamic';

type Scope = 'upcoming' | 'past' | 'all';

function parseScope(value: string | null): Scope {
  if (value === 'past' || value === 'all') return value;
  return 'upcoming';
}

/**
 * Admin management list for counselling bookings (Phase 114).
 *
 * GET /api/admin/counselling?status=&search=&scope=&page=&limit=
 *   scope=upcoming (default) → slot_start >= start of Beijing today, asc
 *   scope=past              → slot_start <  start of Beijing today, desc
 *   scope=all               → newest created first
 *
 * Also returns headline stats for the page's stat cards.
 */
export async function GET(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status')?.trim();
    const search = searchParams.get('search')?.trim();
    const scope = parseScope(searchParams.get('scope'));
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    if (status && status !== 'all' && !isCounsellingBookingStatus(status)) {
      return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 });
    }

    const service = buildServiceClient();

    // Start of Beijing today as an absolute instant — the boundary
    // between "still needs attention" and "already happened".
    const todayIso =
      beijingWallToUtc(beijingTodayStr(new Date()), 0)?.toISOString() ??
      new Date().toISOString();

    let query = service.from('counselling_bookings').select('*', { count: 'exact' });
    if (scope === 'upcoming') {
      query = query.gte('slot_start', todayIso).order('slot_start', { ascending: true });
    } else if (scope === 'past') {
      query = query.lt('slot_start', todayIso).order('slot_start', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    if (status && status !== 'all') query = query.eq('status', status);
    if (search) {
      const safe = search.replace(/[%_]/g, '\\$&');
      query = query.or(`name.ilike.%${safe}%,email.ilike.%${safe}%,reference.ilike.%${safe}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      console.error('[admin/counselling GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Stat cards: four cheap head counts. confirmedUpcoming is the
    // number an advisor actually acts on ("who do I call next").
    const [pending, confirmedUpcoming, completed, total] = await Promise.all([
      service.from('counselling_bookings').select('id', { count: 'exact', head: true }).eq('status', 'Pending'),
      service
        .from('counselling_bookings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'Confirmed')
        .gte('slot_start', new Date().toISOString()),
      service.from('counselling_bookings').select('id', { count: 'exact', head: true }).eq('status', 'Completed'),
      service.from('counselling_bookings').select('id', { count: 'exact', head: true }),
    ]);

    const bookings = ((data ?? []) as Record<string, unknown>[]).map(mapCounsellingBookingFromDb);

    return NextResponse.json({
      bookings: bookings as CounsellingBooking[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil((count || 0) / limit)),
      stats: {
        pending: pending.count ?? 0,
        confirmedUpcoming: confirmedUpcoming.count ?? 0,
        completed: completed.count ?? 0,
        total: total.count ?? 0,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

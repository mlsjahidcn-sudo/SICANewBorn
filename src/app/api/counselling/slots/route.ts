import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseServerConfigured, getSupabaseServer } from '@/lib/supabase-server';
import {
  formatBeijingLabel,
  isWorkingBeijingDate,
  isSlotWithinLeadWindow,
  listBookableDates,
  listCandidateSlotsForDate,
} from '@/lib/counselling-slots';

export const dynamic = 'force-dynamic';

/**
 * Public slot availability for the free 10-minute counselling
 * sessions (Phase 114).
 *
 *   GET /api/counselling/slots              → bookable dates (next ≤14d, Mon–Sat)
 *   GET /api/counselling/slots?date=YYYY-MM-DD → that day's grid with availability
 *
 * Availability = candidate grid (src/lib/counselling-slots.ts) minus
 * live (Pending/Confirmed) bookings. Cancelled/Completed/No-show rows
 * don't hold a slot — the DB's partial unique index agrees.
 *
 * Availability changes by the minute, so the response is no-store.
 */
export async function GET(request: NextRequest) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date')?.trim();
  const now = new Date();

  if (!date) {
    return NextResponse.json(
      {
        dates: listBookableDates(now),
        timezone: 'Asia/Shanghai',
        utcOffset: '+08:00',
        sessionMinutes: 10,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }

  if (!isWorkingBeijingDate(date)) {
    // Malformed dates and closed days (Sunday, or beyond the 14-day
    // horizon) both mean "nothing bookable here" — the wizard treats
    // them identically, so a single empty-grid shape covers both.
    return NextResponse.json(
      { date, slots: [], timezone: 'Asia/Shanghai', utcOffset: '+08:00' },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const candidates = listCandidateSlotsForDate(date).filter((slot) =>
    isSlotWithinLeadWindow(now, slot),
  );

  if (candidates.length === 0) {
    return NextResponse.json(
      { date, slots: [], timezone: 'Asia/Shanghai', utcOffset: '+08:00' },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const candidateIsos = candidates.map((s) => s.toISOString());

  // Live bookings already holding a candidate slot today.
  const { data: taken, error } = await supabase
    .from('counselling_bookings')
    .select('slot_start')
    .in('slot_start', candidateIsos)
    .in('status', ['Pending', 'Confirmed']);

  if (error) {
    console.error('[GET /api/counselling/slots] supabase error:', error);
    return NextResponse.json({ error: 'Failed to load availability' }, { status: 500 });
  }

  const takenSet = new Set((taken ?? []).map((row) => new Date(row.slot_start as string).getTime()));

  const slots = candidates.map((slot) => ({
    start: slot.toISOString(),
    label: formatBeijingLabel(slot),
    available: !takenSet.has(slot.getTime()),
  }));

  return NextResponse.json(
    { date, slots, timezone: 'Asia/Shanghai', utcOffset: '+08:00' },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

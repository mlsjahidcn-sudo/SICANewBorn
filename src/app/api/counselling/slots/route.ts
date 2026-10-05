import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseServerConfigured, getSupabaseServer } from '@/lib/supabase-server';
import {
  formatBeijingLabel,
  isWorkingBeijingDate,
  isSlotWithinLeadWindow,
  listBookableDates,
  listCandidateSlotsForDate,
} from '@/lib/counselling-slots';
import { fetchOccupiedSlotInstants } from '@/lib/counselling/occupancy';

export const dynamic = 'force-dynamic';

/**
 * Public slot availability for the free 10-minute counselling
 * sessions (Phase 114).
 *
 *   GET /api/counselling/slots              → bookable dates (next ≤14d, Mon–Sat)
 *   GET /api/counselling/slots?date=YYYY-MM-DD → that day's grid with availability
 *
 * Availability = candidate grid (src/lib/counselling-slots.ts) minus
 * occupied instants: live (Pending/Confirmed) bookings PLUS unexpired
 * admin proposals (Phase 137). Cancelled/Completed/No-show rows and
 * expired/declined proposals don't hold a slot — the DB's partial
 * unique index agrees for the booking half.
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

  // Phase 137: occupancy = live bookings (Pending/Confirmed on
  // slot_start) PLUS unexpired admin proposals (Phase 125) on
  // proposed_slot_start — a slot on hold for another student must not
  // look free. Shared definition in lib/counselling/occupancy.
  const takenSet = await fetchOccupiedSlotInstants(supabase, candidateIsos);

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

import { NextResponse } from 'next/server';
import { getActiveSessionCapacity } from '@/lib/webinar-sessions';

export const dynamic = 'force-dynamic';

/**
 * Phase 142: public live capacity endpoint for the active
 * session. Returns `{maxAttendees, seatHolders,
 * seatsRemaining, isFull, acceptsSignups}`. Polled by the
 * CapacityPill client island every 30s.
 *
 * Auth: none — capacity is intentionally public so the page
 * can render an honest "X of Y seats remaining" pill without
 * needing the user to be signed in.
 */
export async function GET() {
  const capacity = await getActiveSessionCapacity();
  return NextResponse.json(capacity);
}
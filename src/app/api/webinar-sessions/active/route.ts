import { NextResponse } from 'next/server';
import { getUpcomingSessionWithTopics } from '@/lib/webinar-sessions';

export const dynamic = 'force-dynamic';

/**
 * Phase 164: public read endpoint for the next-upcoming webinar
 * session + its topics. Auto-rollover — the "active" concept is
 * derived (earliest future-dated, non-cancelled session_date).
 * RLS gates on `status <> 'Cancelled'` so anon can read any
 * non-cancelled row; the helper returns the earliest future one.
 *
 * Path kept as `/api/webinar-sessions/active` for backward compat
 * with the public popup + sitemap — no consumer changes needed.
 *
 * Returns `{ session: null, topics: [] }` when nothing is
 * upcoming — the public page renders the "register your interest"
 * empty-state copy in that branch.
 */
export async function GET() {
  const bundle = await getUpcomingSessionWithTopics();
  if (!bundle) {
    return NextResponse.json({ session: null, topics: [] });
  }
  return NextResponse.json(bundle);
}

import { NextResponse } from 'next/server';
import { getActiveSessionWithTopics } from '@/lib/webinar-sessions';

export const dynamic = 'force-dynamic';

/**
 * Phase 140: public read endpoint for the active webinar session
 * + its topics. RLS-gated (anon + is_active=true), so the
 * admin manages visibility via the same `is_active` flag.
 *
 * Returns `{ session: null, topics: [] }` when nothing is
 * active — the public page renders the "Date coming soon"
 * empty-state copy in that branch.
 */
export async function GET() {
  const bundle = await getActiveSessionWithTopics();
  if (!bundle) {
    return NextResponse.json({ session: null, topics: [] });
  }
  return NextResponse.json(bundle);
}

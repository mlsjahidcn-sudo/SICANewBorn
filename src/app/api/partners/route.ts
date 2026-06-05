import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember } from '@/lib/supabase-auth';

/**
 * Partners listing is restricted. Regular partners can only read their own
 * partner record; cross-partner listings are an admin-only operation that
 * should go through a future /api/admin/partners endpoint.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireTeamMember(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    return NextResponse.json([auth.partner]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch partner' }, { status: 500 });
  }
}

/**
 * Partner self-registration is not exposed through this endpoint.
 * An admin must create partner accounts via the admin portal (which will
 * provision the auth.users row + a partners row in one operation).
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Partner self-registration is not enabled. Contact an admin.' },
    { status: 405 },
  );
}

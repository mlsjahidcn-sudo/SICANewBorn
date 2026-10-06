import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

/**
 * Phase 142: admin DELETE on a single waitlist row.
 *
 * Used when staff drain the leads by emailing them and want to
 * remove the row (or remove duplicates).
 */
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(_request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id: entryId } = await context.params;

  const { error } = await auth.supabase
    .from('webinar_waitlist')
    .delete()
    .eq('id', entryId);

  if (error) {
    console.error('[DELETE /api/admin/webinar-waitlist/[id]] failed:', error);
    return NextResponse.json({ error: 'Failed to delete waitlist entry' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

/**
 * Phase 122c: POST /api/partner/students/bulk
 *
 * Bulk archive / restore for the partner students list — parity with
 * the partner applications bulk route (Phase 1.4). Archive/restore is
 * the soft-delete semantic the surface already uses everywhere:
 * `archived_at` + `archived_by_user_id` (Phase 50b / Phase B), no
 * hard delete — a partner can't destroy rows from the list.
 *
 * Body:
 *   {
 *     ids: string[],                  // partner_students.id (UUIDs)
 *     action: 'archive' | 'restore'
 *   }
 *
 * Scope: member-role partners can only bulk-act on rows they created
 * (same rule as the single-row PATCH/DELETE); owners act on the whole
 * org's rows. RLS is the backstop — an UPDATE the caller can't see
 * affects 0 rows and surfaces as a per-row failure.
 *
 * Response: { updated: number, failed: Array<{ id, error }> }
 */
const MAX_BULK_ROWS = 200;
const ALLOWED_ACTIONS = ['archive', 'restore'] as const;
type BulkAction = (typeof ALLOWED_ACTIONS)[number];

export async function POST(request: NextRequest) {
  const auth = await requireTeamMember(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = (await request.json()) as {
      ids?: unknown;
      action?: unknown;
    };

    const ids = Array.isArray(body.ids) ? body.ids : [];
    if (ids.length === 0) {
      return NextResponse.json({ error: 'ids must be a non-empty array' }, { status: 400 });
    }
    if (ids.length > MAX_BULK_ROWS) {
      return NextResponse.json(
        { error: `Bulk actions are limited to ${MAX_BULK_ROWS} rows per call` },
        { status: 400 },
      );
    }
    if (typeof body.action !== 'string' || !(ALLOWED_ACTIONS as readonly string[]).includes(body.action)) {
      return NextResponse.json(
        { error: `action must be one of: ${ALLOWED_ACTIONS.join(', ')}` },
        { status: 400 },
      );
    }
    const action = body.action as BulkAction;

    const validIds = ids.filter((id): id is string => typeof id === 'string' && id.length > 0);
    const failed: Array<{ id: string; error: string }> = ids
      .filter((id) => typeof id !== 'string' || id.length === 0)
      .map((id) => ({ id: String(id), error: 'invalid id' }));

    const updates =
      action === 'archive'
        ? { archived_at: new Date().toISOString(), archived_by_user_id: auth.user.id }
        : { archived_at: null, archived_by_user_id: null };

    let updated = 0;
    for (const id of validIds) {
      let q = auth.supabase.from('partner_students').update(updates).eq('id', id);
      // Phase 3 scoping, mirroring the [id] routes: members only touch
      // their own rows.
      if (auth.role === 'member') {
        q = q.eq('created_by_user_id', auth.user.id);
      }
      const { data, error } = await q.select('id').maybeSingle();
      if (error) {
        console.error(`[partner/students/bulk] ${action} failed for ${id}:`, error);
        failed.push({ id, error: error.message });
        continue;
      }
      if (!data) {
        // RLS filtered the row out — doesn't exist, belongs to another
        // partner, or (member) wasn't created by this caller.
        failed.push({ id, error: 'Student not found' });
        continue;
      }
      updated += 1;
    }

    return NextResponse.json({ updated, failed });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/students/bulk] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

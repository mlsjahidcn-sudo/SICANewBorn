/**
 * Phase 1.4: POST /api/partner/applications/bulk
 *
 * Bulk actions for the partner Applications list. Per S27, the
 * status / decision fields are admin-only — the partner can
 * only bulk-update priority or delete. Note actions (free-text
 * append) are admin-only too (admin writes the audit-trail
 * timeline entry, not the partner).
 *
 * Body:
 *   {
 *     ids: string[],                              // row ids (UUIDs)
 *     action: 'priority' | 'delete',
 *     value?: string                              // for 'priority'
 *   }
 *
 *   priority value: 'Low' | 'Normal' | 'High' | 'Urgent'
 *   delete          value is ignored
 *
 * Response: { updated: number, failed: Array<{id, error}> }
 *
 * Scope: the partner can only bulk-update rows they have
 * access to (auth.supabase RLS handles this for priority;
 * for delete we explicitly filter to created_by_user_id ===
 * auth.user.id for member-role, or partner_id === for owner).
 * Members can't bulk-delete owner-created rows; owners can.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { mapPartnerApplicationToDb } from '@/lib/partner-application-mapper';

export const dynamic = 'force-dynamic';

const ALLOWED_PRIORITIES = ['Low', 'Normal', 'High', 'Urgent'] as const;
const ALLOWED_ACTIONS = ['priority', 'delete'] as const;
type BulkAction = (typeof ALLOWED_ACTIONS)[number];

export async function POST(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireTeamMember(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const ids: unknown = body.ids;
    const action: unknown = body.action;
    const value: unknown = body.value;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'ids must be a non-empty array' }, { status: 400 });
    }
    if (ids.length > 200) {
      return NextResponse.json(
        { error: 'Bulk actions are limited to 200 rows per call' },
        { status: 400 },
      );
    }
    if (typeof action !== 'string' || !(ALLOWED_ACTIONS as readonly string[]).includes(action)) {
      return NextResponse.json(
        { error: `action must be one of: ${ALLOWED_ACTIONS.join(', ')}` },
        { status: 400 },
      );
    }
    if (action === 'priority' && (typeof value !== 'string' || !value)) {
      return NextResponse.json({ error: 'value (priority) is required' }, { status: 400 });
    }
    if (action === 'priority' && !(ALLOWED_PRIORITIES as readonly string[]).includes(value as string)) {
      return NextResponse.json(
        { error: `priority must be one of: ${ALLOWED_PRIORITIES.join(', ')}` },
        { status: 400 },
      );
    }

    let updated = 0;
    const failed: Array<{ id: string; error: string }> = [];

    for (const id of ids) {
      if (typeof id !== 'string' || !id) {
        failed.push({ id: String(id), error: 'invalid id' });
        continue;
      }
      try {
        if (action === 'priority') {
          // Use the auth-bound client so RLS enforces ownership.
          // We need to first read the existing row to merge with
          // mapPartnerApplicationToDb (preserves the row's other
          // fields), then write back. Simpler: just update the
          // priority column directly via a targeted PATCH.
          const { error } = await auth.supabase
            .from('partner_applications')
            .update({ priority: value, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('partner_id', auth.partnerId);
          if (error) {
            failed.push({ id, error: error.message });
          } else {
            updated++;
          }
        } else if (action === 'delete') {
          // Delete: members can only delete rows they created
          // (RLS would also enforce this for owner, but we double-
          // check via a manual filter on created_by_user_id for
          // member-role to be safe). The auth-bound client
          // already filters by partner_id via RLS; the additional
          // .eq() is a belt-and-suspenders against RLS changes.
          let query = auth.supabase.from('partner_applications').delete().eq('id', id);
          if (auth.role === 'member') {
            query = query.eq('created_by_user_id', auth.user.id);
          }
          const { error } = await query;
          if (error) {
            failed.push({ id, error: error.message });
          } else {
            updated++;
          }
        }
      } catch (err) {
        failed.push({ id, error: err instanceof Error ? err.message : 'unknown' });
      }
    }

    return NextResponse.json({ updated, failed });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/applications/bulk] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

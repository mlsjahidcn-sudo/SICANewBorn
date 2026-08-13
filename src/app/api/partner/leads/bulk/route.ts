/**
 * Phase J: POST /api/partner/leads/bulk
 *
 * Bulk actions for the partner Lead Sharing list.
 *
 * Body:
 *   {
 *     ids: string[],                              // row ids (UUIDs)
 *     action: 'status' | 'delete',
 *     value?: string                              // for 'status'
 *   }
 *
 *   status value: 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost'
 *   delete          value is ignored
 *
 * Response: { updated: number, failed: Array<{id, error}> }
 *
 * Scope: the partner can only bulk-update rows they have access to.
 * RLS + explicit created_by_user_id filters enforce member scoping.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember, getServerEnv } from '@/lib/supabase-auth';
import { parsePartnerLeadStatus } from '@/lib/partner-lead-mapper';

export const dynamic = 'force-dynamic';

const ALLOWED_ACTIONS = ['status', 'delete'] as const;
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

    const statusValue = action === 'status' ? parsePartnerLeadStatus(value) : null;
    if (action === 'status' && !statusValue) {
      return NextResponse.json(
        { error: "value (status) must be 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost'" },
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
        if (action === 'status') {
          let query = auth.supabase
            .from('partner_leads')
            .update({ status: statusValue, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('partner_id', auth.partnerId);
          if (auth.role === 'member') {
            query = query.eq('created_by_user_id', auth.user.id);
          }
          const { error } = await query;
          if (error) {
            failed.push({ id, error: error.message });
          } else {
            updated++;
          }
        } else if (action === 'delete') {
          let query = auth.supabase
            .from('partner_leads')
            .delete({ count: 'exact' })
            .eq('id', id)
            .eq('partner_id', auth.partnerId);
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
    console.error('[partner/leads/bulk] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

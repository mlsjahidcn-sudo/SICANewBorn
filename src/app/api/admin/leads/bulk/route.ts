/**
 * Admin: bulk operations on leads.
 *
 * POST /api/admin/leads/bulk
 * Body: {
 *   type: 'contact' | 'chat' | 'assessment',
 *   ids: string[],
 *   action: 'assign' | 'unassign' | 'set_status' | 'mark_contacted',
 *   value?: string  // for 'assign' → user_id; for 'set_status' → status
 * }
 *
 * Each action writes a lead_history row per lead (so the timeline
 * shows the bulk change). assign / unassign + set_status update the
 * parent row; mark_contacted triggers bump_contact_attempts via the
 * existing trigger.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

type LeadType = 'contact' | 'chat' | 'assessment';

const STATUS_WHITELIST: Record<LeadType, string[]> = {
  contact: ['New', 'In Progress', 'Resolved', 'Spam'],
  chat: ['New', 'Contacted', 'Qualified', 'Unqualified'],
  assessment: ['Pending', 'Reviewed', 'Contacted', 'Accepted', 'Rejected'],
};

function tableFor(t: LeadType): string {
  switch (t) {
    case 'contact':
      return 'contact_submissions';
    case 'chat':
      return 'chat_leads';
    case 'assessment':
      return 'student_assessments';
  }
}

function isLeadType(s: string): s is LeadType {
  return s === 'contact' || s === 'chat' || s === 'assessment';
}

interface BulkRequest {
  type: string;
  ids: string[];
  action: string;
  value?: string | null;
  note?: string | null;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  let body: BulkRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!isLeadType(body.type)) {
    return NextResponse.json({ error: 'type must be contact | chat | assessment' }, { status: 400 });
  }
  if (!Array.isArray(body.ids) || body.ids.length === 0) {
    return NextResponse.json({ error: 'ids must be a non-empty array' }, { status: 400 });
  }
  if (body.ids.length > 500) {
    return NextResponse.json({ error: 'max 500 ids per request' }, { status: 400 });
  }
  if (!['assign', 'unassign', 'set_status', 'mark_contacted'].includes(body.action)) {
    return NextResponse.json(
      { error: 'action must be assign | unassign | set_status | mark_contacted' },
      { status: 400 },
    );
  }

  const type: LeadType = body.type;
  const table = tableFor(type);
  const action = body.action;

  // Validate status (if applicable) before we touch anything
  if (action === 'set_status') {
    if (typeof body.value !== 'string' || !STATUS_WHITELIST[type].includes(body.value)) {
      return NextResponse.json(
        { error: `value must be one of: ${STATUS_WHITELIST[type].join(', ')}` },
        { status: 400 },
      );
    }
  }

  // Update parent rows first
  if (action === 'assign') {
    if (typeof body.value !== 'string' || !body.value) {
      return NextResponse.json({ error: 'value (user_id) required for assign' }, { status: 400 });
    }
    const { error } = await supabase
      .from(table)
      .update({ assigned_to: body.value, updated_at: new Date().toISOString() })
      .in('id', body.ids);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else if (action === 'unassign') {
    const { error } = await supabase
      .from(table)
      .update({ assigned_to: null, updated_at: new Date().toISOString() })
      .in('id', body.ids);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else if (action === 'set_status') {
    const updates: Record<string, unknown> = {
      status: body.value,
      updated_at: new Date().toISOString(),
    };
    // Special case: contact_submissions.Resolved sets resolved_at
    if (type === 'contact' && body.value === 'Resolved') {
      updates.resolved_at = new Date().toISOString();
    }
    const { error } = await supabase.from(table).update(updates).in('id', body.ids);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  // mark_contacted: nothing to update on the parent row (trigger handles
  // contact_attempts + last_contacted_at from the lead_history insert below)

  // Insert lead_history rows
  const historyRows = body.ids.map((id) => {
    const base = {
      lead_type: type,
      lead_id: id,
      admin_id: auth.user.id,
    };
    if (action === 'assign') {
      return { ...base, action: 'assigned', from_value: null, to_value: body.value || null, note: 'bulk' };
    }
    if (action === 'unassign') {
      return { ...base, action: 'unassigned', from_value: null, to_value: null, note: 'bulk' };
    }
    if (action === 'set_status') {
      return { ...base, action: 'status_changed', from_value: null, to_value: body.value || null, note: 'bulk' };
    }
    return {
      ...base,
      action: 'contacted',
      from_value: null,
      to_value: null,
      note: body.note || 'bulk',
    };
  });

  const { error: histErr } = await supabase.from('lead_history').insert(historyRows);
  if (histErr) {
    return NextResponse.json(
      { error: `Update applied but history insert failed: ${histErr.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    updated: body.ids.length,
    action,
  });
}

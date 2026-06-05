/**
 * Admin: update a lead row + log to lead_history.
 *
 * Phase 2.1 lead workflow upgrade — every change an admin makes is
 * recorded in `lead_history` so the detail page can show a full
 * timeline. We also bump `contact_attempts` via a database trigger
 * (action='contacted'), and update `last_contacted_at` accordingly.
 *
 * Path: /api/admin/leads/[id]?type=contact|chat|assessment
 * Body:
 *   {
 *     status?: string,             // per-type value
 *     notes?: string,
 *     assigned_to?: string|null,   // null = unassign
 *     action?: 'contacted',        // records a contact attempt
 *     action_note?: string         // free-form context (e.g. 'whatsapp')
 *   }
 *
 * Response: { lead, history }
 *   - lead is the updated row
 *   - history is the full lead_history for this lead (newest first)
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

/**
 * GET: read a single lead + its full history.
 * Path: /api/admin/leads/[id]?type=contact|chat|assessment
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const typeParam = (new URL(request.url).searchParams.get('type') || '').toLowerCase();
  if (!isLeadType(typeParam)) {
    return NextResponse.json(
      { error: 'type query param required: contact | chat | assessment' },
      { status: 400 },
    );
  }
  const type: LeadType = typeParam;
  const table = tableFor(type);

  const { data: lead, error: leadErr } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();
  if (leadErr || !lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  const { data: history, error: histErr } = await supabase
    .from('lead_history')
    .select('*')
    .eq('lead_id', id)
    .eq('lead_type', type)
    .order('created_at', { ascending: false })
    .limit(100);
  if (histErr) {
    return NextResponse.json({ error: histErr.message }, { status: 500 });
  }

  return NextResponse.json({ lead, history: history || [] });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const typeParam = (new URL(request.url).searchParams.get('type') || '').toLowerCase();
  if (!isLeadType(typeParam)) {
    return NextResponse.json(
      { error: 'type query param required: contact | chat | assessment' },
      { status: 400 },
    );
  }
  const type: LeadType = typeParam;
  const table = tableFor(type);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Fetch the current row first so we can diff for history
  const { data: current, error: curErr } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();
  if (curErr || !current) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  // Build the update payload
  const updates: Record<string, unknown> = {};
  const historyRows: Array<{
    action: string;
    from_value: string | null;
    to_value: string | null;
    note: string | null;
  }> = [];

  if (typeof body.status === 'string') {
    const allowed = STATUS_WHITELIST[type];
    if (!allowed.includes(body.status)) {
      return NextResponse.json(
        { error: `status must be one of: ${allowed.join(', ')}` },
        { status: 400 },
      );
    }
    const prev = (current as { status?: string }).status || null;
    if (prev !== body.status) {
      updates.status = body.status;
      historyRows.push({
        action: 'status_changed',
        from_value: prev,
        to_value: body.status,
        note: null,
      });
    }
  }

  if (typeof body.notes === 'string') {
    const prev = (current as { notes?: string | null }).notes ?? null;
    if (prev !== body.notes) {
      updates.notes = body.notes;
      // We don't store the full old notes text (could be long). Just signal it changed.
      historyRows.push({
        action: 'notes_updated',
        from_value: prev ? 'previous' : null,
        to_value: 'updated',
        note: null,
      });
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'assigned_to')) {
    const next = typeof body.assigned_to === 'string' && body.assigned_to ? body.assigned_to : null;
    const prev = (current as { assigned_to?: string | null }).assigned_to ?? null;
    if (prev !== next) {
      updates.assigned_to = next;
      historyRows.push({
        action: next ? 'assigned' : 'unassigned',
        from_value: prev,
        to_value: next,
        note: null,
      });
    }
  }

  if (body.action === 'contacted') {
    const note =
      typeof body.action_note === 'string' && body.action_note.trim()
        ? body.action_note.trim()
        : null;
    historyRows.push({
      action: 'contacted',
      from_value: null,
      to_value: null,
      note,
    });
    // Trigger `bump_contact_attempts` will increment the counter and
    // set last_contacted_at on the parent table. We don't write to
    // the parent row here (the trigger handles it).
  }

  if (historyRows.length === 0 && Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No changes to apply' }, { status: 400 });
  }

  // Apply the update to the parent row (skip if only 'contacted' history).
  if (Object.keys(updates).length > 0) {
    updates.updated_at = new Date().toISOString();

    // For contact_submissions, set resolved_at on Resolved
    if (type === 'contact' && (updates as { status?: string }).status === 'Resolved') {
      (updates as { resolved_at?: string }).resolved_at = new Date().toISOString();
    }

    const { error: updErr } = await supabase.from(table).update(updates).eq('id', id);
    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }
  }

  // Insert history rows
  if (historyRows.length > 0) {
    const rows = historyRows.map((h) => ({
      lead_type: type,
      lead_id: id,
      admin_id: auth.user.id,
      action: h.action,
      from_value: h.from_value,
      to_value: h.to_value,
      note: h.note,
    }));
    const { error: histErr } = await supabase.from('lead_history').insert(rows);
    if (histErr) {
      return NextResponse.json(
        { error: `Update applied but history insert failed: ${histErr.message}` },
        { status: 500 },
      );
    }
  }

  // Read the fresh row + history
  const { data: fresh, error: readErr } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();
  if (readErr) {
    return NextResponse.json({ error: readErr.message }, { status: 500 });
  }

  const { data: history } = await supabase
    .from('lead_history')
    .select('*')
    .eq('lead_id', id)
    .eq('lead_type', type)
    .order('created_at', { ascending: false })
    .limit(50);

  return NextResponse.json({ lead: fresh, history: history || [] });
}

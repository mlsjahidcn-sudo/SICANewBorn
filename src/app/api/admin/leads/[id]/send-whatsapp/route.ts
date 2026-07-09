/**
 * Admin: send a WhatsApp template message to a lead via WABPO.
 *
 * POST /api/admin/leads/[id]/send-whatsapp?type=contact|chat|assessment
 * body: {
 *   templateId: string,                   // WABPO template id (from GET /api/admin/wabpo/templates)
 *   variables?: Record<string, string>,   // template variable map; defaults auto-filled below
 *   recipientNumber?: string,             // override the lead's phone (default = lead.phone)
 * }
 * → {
 *   ok: true,
 *   batchId, totalQueued, status,
 *   details: [{ number, messageId, status, idempotencyMatch }],
 *   firedVariables: Record<string, string>  // what we actually sent (for log/debug)
 * }
 *
 * Side effects:
 *   - leads.<lead_table>.last_contacted_at = now()
 *   - leads.<lead_table>.contact_attempts += 1
 *   - lead_history row: action='contacted', note=`whatsapp | msgId=…`
 *
 * Unlike the email send route, we don't write to a separate wabpo_log
 * table (Phase 45b will add one when webhooks fire delivery-state events).
 * The lead_history row carries the wabpo messageId for later joining.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';
import {
  normalizePhone,
  sendTemplateMessage,
  WabpoApiError,
  WabpoNotConfiguredError,
} from '@/lib/wabpo';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type LeadType = 'contact' | 'chat' | 'assessment';

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

function pickString(row: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === 'string' && v.trim()) return v;
  }
  return null;
}

export async function POST(
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

  let body: {
    templateId?: string;
    variables?: Record<string, string>;
    recipientNumber?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.templateId) {
    return NextResponse.json(
      { error: 'templateId required — pick a WABPO-approved template' },
      { status: 400 },
    );
  }

  // Load the lead to derive defaults
  const { data: lead, error: leadErr } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (leadErr) {
    return NextResponse.json({ error: leadErr.message }, { status: 500 });
  }
  if (!lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }
  const leadRow = lead as Record<string, unknown>;

  // Resolve phone — admin can override (handy when typing a corrected number)
  const recipientRaw =
    body.recipientNumber ||
    pickString(leadRow, ['phone']) ||
    pickString(leadRow, ['whatsapp']) ||
    '';
  const recipient = normalizePhone(recipientRaw);
  if (recipient.length < 7) {
    return NextResponse.json(
      { error: 'No phone on file for this lead — add one first or pass recipientNumber' },
      { status: 400 },
    );
  }

  // Build the variable map. Auto-fill the common ones from the lead row,
  // let the admin override via body.variables. Variable keys here match the
  // WABPO template's `{{key}}` placeholders (per docs).
  const firstName =
    pickString(leadRow, ['name'])?.split(' ')[0] ||
    pickString(leadRow, ['first_name']) ||
    'there';
  const fullName =
    pickString(leadRow, ['name']) ||
    [pickString(leadRow, ['first_name']), pickString(leadRow, ['last_name'])]
      .filter(Boolean)
      .join(' ') ||
    '';
  const variables: Record<string, string> = {
    first_name: firstName,
    last_name: pickString(leadRow, ['last_name']) || '',
    full_name: fullName,
    name: fullName || firstName,
    country: pickString(leadRow, ['country']) || '',
    intended_major:
      pickString(leadRow, ['intended_major']) ||
      pickString(leadRow, ['interested_program']) ||
      pickString(leadRow, ['program']) ||
      '',
    message: pickString(leadRow, ['message']) || pickString(leadRow, ['subject']) || '',
    ...(body.variables || {}),
  };

  // Fire the send. WABPO_NOT_CONFIGURED = 503 with a clear message;
  // WabpoApiError = 502 with the provider's error message exposed.
  let result;
  try {
    result = await sendTemplateMessage({
      templateId: body.templateId,
      recipientNumber: recipient,
      variables,
      externalReference: `lead:${type}:${id}`,
      idempotencyKey: `sica-${type}-${id}-${Date.now()}`,
    });
  } catch (err) {
    if (err instanceof WabpoNotConfiguredError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    if (err instanceof WabpoApiError) {
      return NextResponse.json(
        { error: `WABPO ${err.status} ${err.code}: ${err.message}` },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'send failed' },
      { status: 500 },
    );
  }

  // The send succeeded at the WABPO layer. Pick the messageId for our log.
  const firstDetail = result.details?.[0];
  const messageId = firstDetail?.messageId ?? null;

  // Side effects — best-effort. Don't fail the send if these write errors
  // happen; the admin already saw success and the WABPO message is out.
  await Promise.all([
    supabase
      .from(table)
      .update({
        last_contacted_at: new Date().toISOString(),
        contact_attempts: (leadRow.contact_attempts as number | null | undefined) ?? 0 + 1,
      })
      .eq('id', id),
    supabase.from('lead_history').insert({
      lead_type: type,
      lead_id: id,
      admin_id: auth.user.id,
      action: 'contacted', // existing CHECK — note column carries the channel
      from_value: null,
      to_value: null,
      note: messageId
        ? `whatsapp | template=${body.templateId} | msgId=${messageId}`
        : `whatsapp | template=${body.templateId} (no msgId returned)`,
    }),
  ]);

  return NextResponse.json({
    ok: true,
    batchId: result.batchId,
    totalQueued: result.totalQueued,
    status: result.status,
    details: result.details,
    firedVariables: variables,
    messageId,
    recipient,
  });
}

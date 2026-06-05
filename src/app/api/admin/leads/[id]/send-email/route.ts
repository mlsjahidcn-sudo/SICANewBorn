/**
 * Admin: send a one-off email to a lead.
 *
 * POST /api/admin/leads/[id]/send-email?type=contact|chat|assessment
 * body: {
 *   template_id?: string,    // render this template
 *   subject?: string,        // OR override the template's subject
 *   body_html?: string,
 *   body_text?: string,
 *   variables?: { ... },     // context for the template
 *   to_email?: string,       // override the recipient (default = lead's email)
 *   to_name?: string,
 *   send_test?: boolean      // if true, send to admin instead of lead
 * }
 *
 * Either pick a template (template_id) or write a custom one-off
 * (subject + body_html + body_text). Either way, the result is
 * rendered with the renderer, sent via Resend, and logged to
 * email_log.
 *
 * Response: { log, rendered }
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';
import { renderTemplate } from '@/lib/email/renderer';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

type LeadType = 'contact' | 'chat' | 'assessment';

const FROM = 'SICA <noreply@sica.com.cn>';

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
    template_id?: string;
    subject?: string;
    body_html?: string;
    body_text?: string;
    variables?: Record<string, string>;
    to_email?: string;
    to_name?: string;
    send_test?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Load the lead row so we have defaults
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

  // Resolve subject + bodies
  let subject = body.subject || '';
  let bodyHtml = body.body_html || '';
  let bodyText = body.body_text || '';
  let allowed: string[] | undefined;
  let templateSlug: string | null = null;
  let templateId: string | null = null;

  if (body.template_id) {
    const { data: tpl, error: tplErr } = await supabase
      .from('email_templates')
      .select('id, slug, subject, body_html, body_text, variables, is_active')
      .eq('id', body.template_id)
      .maybeSingle();
    if (tplErr) {
      return NextResponse.json({ error: tplErr.message }, { status: 500 });
    }
    if (!tpl) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    if (!tpl.is_active) {
      return NextResponse.json({ error: 'Template is inactive' }, { status: 400 });
    }
    templateId = tpl.id;
    templateSlug = tpl.slug;
    subject = body.subject || tpl.subject;
    bodyHtml = body.body_html || tpl.body_html;
    bodyText = body.body_text || tpl.body_text;
    allowed = Array.isArray(tpl.variables) ? (tpl.variables as string[]) : undefined;
  }

  if (!subject || !bodyHtml) {
    return NextResponse.json(
      { error: 'Provide template_id OR subject+body_html' },
      { status: 400 },
    );
  }

  // Build context. Start with the lead's known fields as defaults.
  const leadRow = lead as Record<string, unknown>;
  let toEmail: string | null = body.to_email || pickString(leadRow, ['email']);
  let toName: string | null =
    body.to_name ||
    pickString(leadRow, ['name']) ||
    [pickString(leadRow, ['first_name']), pickString(leadRow, ['last_name'])]
      .filter(Boolean)
      .join(' ') ||
    null;

  // Send-test path: redirect to admin email (or dry-run placeholder
  // when ADMIN_EMAIL isn't set in dev)
  if (body.send_test) {
    toEmail = process.env.ADMIN_EMAIL || (process.env.RESEND_API_KEY ? null : 'test@dry-run.local');
    toName = 'SICA Admin (test)';
    if (!toEmail) {
      return NextResponse.json(
        { error: 'ADMIN_EMAIL env not set — cannot send test' },
        { status: 503 },
      );
    }
  }

  if (!toEmail) {
    return NextResponse.json(
      { error: 'No recipient — lead has no email and no to_email provided' },
      { status: 400 },
    );
  }

  // Default context from the lead row
  const ctx: Record<string, string> = {
    firstName: (toName || '').split(' ')[0] || 'there',
    country: pickString(leadRow, ['country']) || '',
    intendedMajor:
      pickString(leadRow, ['intended_major']) ||
      pickString(leadRow, ['interested_program']) ||
      '',
    sourceKind: type,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://sica.com.cn',
    ...(body.variables || {}),
  };

  // Render
  let rendered;
  try {
    rendered = renderTemplate({
      subject,
      bodyHtml,
      bodyText,
      context: ctx,
      allowedVariables: allowed,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'render failed' },
      { status: 400 },
    );
  }

  // Dry-run fallback: when RESEND_API_KEY isn't set, log the email
  // anyway so the admin can verify the template + variables in
  // the email_log table. Returns 503 so the UI can show "not sent"
  // distinctly.
  if (!process.env.RESEND_API_KEY) {
    const { data: log, error: logErr } = await supabase
      .from('email_log')
      .insert({
        lead_type: type,
        lead_id: id,
        template_id: templateId,
        template_slug: templateSlug,
        to_email: toEmail,
        to_name: toName,
        subject: rendered.subject,
        body_html: rendered.html,
        body_text: rendered.text,
        resend_message_id: null,
        status: 'failed',
        error: 'RESEND_API_KEY not set — dry-run only',
        sent_by: auth.user.id,
        sent_at: null,
      })
      .select('*')
      .single();
    if (logErr) {
      return NextResponse.json({ error: logErr.message }, { status: 500 });
    }
    return NextResponse.json(
      {
        log,
        rendered: { subject: rendered.subject },
        dryRun: true,
      },
      { status: 503 },
    );
  }

  // Send via Resend
  const resend = new Resend(process.env.RESEND_API_KEY);
  const now = new Date().toISOString();
  const result = await resend.emails.send({
    from: FROM,
    to: toEmail,
    replyTo: process.env.ADMIN_EMAIL,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });

  const resendOk = !result.error;
  const resendId = result.data?.id ?? null;

  // Log to email_log
  const { data: log, error: logErr } = await supabase
    .from('email_log')
    .insert({
      lead_type: type,
      lead_id: id,
      template_id: templateId,
      template_slug: templateSlug,
      to_email: toEmail,
      to_name: toName,
      subject: rendered.subject,
      body_html: rendered.html,
      body_text: rendered.text,
      resend_message_id: resendId,
      status: resendOk ? 'sent' : 'failed',
      error: result.error?.message ?? null,
      sent_by: auth.user.id,
      sent_at: resendOk ? now : null,
    })
    .select('*')
    .single();

  if (logErr) {
    return NextResponse.json(
      { error: `Email sent but log write failed: ${logErr.message}` },
      { status: 500 },
    );
  }

  // Also write a lead_history row so the timeline shows the send
  await supabase.from('lead_history').insert({
    lead_type: type,
    lead_id: id,
    admin_id: auth.user.id,
    action: 'notes_updated', // closest existing action
    from_value: null,
    to_value: null,
    note: body.send_test
      ? `Sent test email: ${rendered.subject}`
      : `Sent email: ${rendered.subject}`,
  });

  return NextResponse.json({ log, rendered: { subject: rendered.subject } });
}

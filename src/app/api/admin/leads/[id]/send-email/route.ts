/**
 * Admin: send a one-off email to a lead.
 *
 * POST /api/admin/leads/[id]/send-email?type=contact|chat|assessment
 * body: {
 *   template_id?: string,    // render this template
 *   subject?: string,        // OR override the template's subject
 *   body_text?: string,      // (custom one-off — required when no template_id)
 *   variables?: { ... },     // context for the template
 *   to_email?: string,       // override the recipient (default = lead's email)
 *   to_name?: string,
 *   send_test?: boolean      // if true, send to admin instead of lead
 * }
 *
 * Either pick a template (template_id) or write a custom one-off
 * (subject + body_text). Either way, the result is rendered with
 * the central email module (Phase 84), sent via Resend, and
 * logged to email_log.
 *
 * Phase 84: text-only — body_html removed from this route.
 * Templated sends go through `sendTemplatedEmail`; custom one-offs
 * through `sendTextEmail`. Both end up in email_log with status +
 * resend_message_id.
 *
 * Response: { log, rendered: { subject } }
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';
import {
  formatWithSignature,
  loadTemplate,
  renderTextTemplate,
  sendTemplatedEmail,
  sendTextEmail,
  type EmailLocale,
} from '@/lib/email/index';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

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
    template_id?: string;
    subject?: string;
    body_text?: string;
    variables?: Record<string, string>;
    to_email?: string;
    to_name?: string;
    send_test?: boolean;
    locale?: string;
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

  const leadRow = lead as Record<string, unknown>;

  // Resolve template (slug + active check)
  let templateSlug: string | null = null;
  let templateId: string | null = null;
  if (body.template_id) {
    const { data: tplMeta, error: tplErr } = await supabase
      .from('email_templates')
      .select('id, slug, is_active')
      .eq('id', body.template_id)
      .maybeSingle();
    if (tplErr) {
      return NextResponse.json({ error: tplErr.message }, { status: 500 });
    }
    if (!tplMeta) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    if (!tplMeta.is_active) {
      return NextResponse.json({ error: 'Template is inactive' }, { status: 400 });
    }
    templateId = tplMeta.id;
    templateSlug = tplMeta.slug;
  }

  // Resolve recipient + send-test path
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
  const variables: Record<string, string> = {
    firstName: (toName || '').split(' ')[0] || 'there',
    country: pickString(leadRow, ['country']) || '',
    intendedMajor:
      pickString(leadRow, ['intended_major']) ||
      pickString(leadRow, ['interested_program']) ||
      '',
    sourceKind: type,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || SITE_URL,
    ...(body.variables || {}),
  };

  const locale: EmailLocale = body.locale === 'zh' ? 'zh' : 'en';

  // Render subject + body_text up front. The templated branch uses
  // loadTemplate + renderTextTemplate; the custom branch uses the
  // caller's literal subject + body_text. Either way, we end up
  // with a final (subject, bodyText) pair that we run through
  // formatWithSignature.
  let finalSubject: string;
  let finalBodyText: string;
  if (templateSlug) {
    const tpl = await loadTemplate(templateSlug, locale, supabase);
    if (!tpl) {
      return NextResponse.json(
        { error: 'Template not found or inactive' },
        { status: 404 },
      );
    }
    finalSubject = body.subject || tpl.subject;
    finalBodyText = renderTextTemplate(tpl.body_text, variables);
  } else {
    if (!body.subject || !body.body_text) {
      return NextResponse.json(
        { error: 'Provide template_id OR subject+body_text' },
        { status: 400 },
      );
    }
    finalSubject = body.subject;
    finalBodyText = renderTextTemplate(body.body_text, variables);
  }

  const rendered = formatWithSignature({
    subject: finalSubject,
    bodyText: finalBodyText,
  });

  // Rate-limit-fallback dry-run path: when RESEND_API_KEY isn't set,
  // log the email anyway so the admin can verify the template +
  // variables in the email_log table. Returns 503 so the UI can show
  // "not sent" distinctly.
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
    await supabase.from('lead_history').insert({
      lead_type: type,
      lead_id: id,
      admin_id: auth.user.id,
      action: 'notes_updated',
      from_value: null,
      to_value: null,
      note: body.send_test
        ? `Sent test email (dry-run): ${rendered.subject}`
        : `Sent email (dry-run): ${rendered.subject}`,
    });
    return NextResponse.json(
      {
        log,
        rendered: { subject: rendered.subject },
        dryRun: true,
      },
      { status: 503 },
    );
  }

  // Actual send. Templated path uses sendTemplatedEmail (it re-loads
  // and re-renders internally with our variables); custom one-off
  // path uses sendTextEmail directly with the pre-rendered output.
  let sendOk = false;
  let sendError: string | null = null;
  let resendId: string | null = null;
  const replyTo = process.env.ADMIN_EMAIL || undefined;
  if (templateSlug) {
    sendOk = await sendTemplatedEmail({
      to: toEmail,
      slug: templateSlug,
      locale,
      variables,
      supabase,
      ...(replyTo ? { replyTo } : {}),
    });
  } else {
    const result = await sendTextEmail({
      to: toEmail,
      subject: rendered.subject,
      text: rendered.text,
      ...(replyTo ? { replyTo } : {}),
    });
    sendOk = result.ok;
    resendId = result.id ?? null;
    sendError = result.error ?? null;
  }

  const now = new Date().toISOString();

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
      body_text: rendered.text,
      resend_message_id: resendId,
      status: sendOk ? 'sent' : 'failed',
      error: sendError,
      sent_by: auth.user.id,
      sent_at: sendOk ? now : null,
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

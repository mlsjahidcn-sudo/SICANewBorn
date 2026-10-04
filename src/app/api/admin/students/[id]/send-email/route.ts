/**
 * Admin: send a one-off email to a student (student_profiles row).
 *
 * POST /api/admin/students/[id]/send-email
 * body: {
 *   subject: string,     // required
 *   body_text: string,   // required (plain text; rendered vars below)
 *   to_email?: string,   // override recipient (default = student's email)
 *   send_test?: boolean  // if true, send to admin instead of student
 * }
 *
 * Phase 136 — the send half of the admin "Send email" dialog. The
 * compose half is /api/admin/ai/compose-email (AI draft with site
 * links); this route takes the (admin-edited) subject + body and
 * sends via Resend, logging to email_log with lead_type='student'
 * (CHECK extended in database/2026-10-04_email_log_student_type.sql).
 *
 * Modeled on /api/admin/leads/[id]/send-email but leaner: no
 * template branch — the dialog is theme → AI draft → edit → send.
 * {{firstName}} / {{country}} / {{targetDegree}} / {{targetField}}
 * placeholders in body_text are rendered from the student row.
 *
 * Dry-run path: when the Resend key isn't configured the email is
 * logged with status='failed' + a clear error and the route returns
 * 503, so the UI can show "not sent" distinctly (same as leads).
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';
import { formatWithSignature, renderTextTemplate, sendTextEmail } from '@/lib/email/index';

export const dynamic = 'force-dynamic';

interface StudentProfileRow {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  nationality?: string | null;
  target_degree?: string | null;
  target_field?: string | null;
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

  // student_profiles.id is the auth.users id (FK) — validate as a uuid
  // so a malformed path can't reach PostgREST with junk.
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Invalid student id.' }, { status: 400 });
  }

  let body: { subject?: unknown; body_text?: unknown; to_email?: unknown; send_test?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  const bodyText = typeof body.body_text === 'string' ? body.body_text.trim() : '';
  if (!subject || !bodyText) {
    return NextResponse.json(
      { error: 'subject and body_text are required.' },
      { status: 400 },
    );
  }
  if (subject.length > 500 || bodyText.length > 20_000) {
    return NextResponse.json({ error: 'Email content too long.' }, { status: 400 });
  }

  const { data: student, error: studentErr } = await supabase
    .from('student_profiles')
    .select('first_name, last_name, email, nationality, target_degree, target_field')
    .eq('id', id)
    .maybeSingle();
  if (studentErr) {
    return NextResponse.json({ error: studentErr.message }, { status: 500 });
  }
  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }
  const row = student as StudentProfileRow;

  let toEmail: string | null =
    (typeof body.to_email === 'string' && body.to_email.trim()) || row.email || null;
  let toName: string =
    [row.first_name, row.last_name].filter((p) => typeof p === 'string' && p.trim()).join(' ').trim();

  // Send-test path: redirect to the admin's own inbox.
  if (body.send_test === true) {
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
      { error: 'No recipient — student has no email and no to_email provided' },
      { status: 400 },
    );
  }

  const variables: Record<string, string> = {
    firstName: row.first_name?.trim() || toName.split(' ')[0] || 'there',
    country: row.nationality?.trim() || '',
    targetDegree: row.target_degree?.trim() || '',
    targetField: row.target_field?.trim() || '',
  };

  const rendered = formatWithSignature({
    subject,
    bodyText: renderTextTemplate(bodyText, variables),
  });

  // Dry-run when Resend isn't configured (dev boxes) — log only.
  if (!process.env.RESEND_API_KEY) {
    const { data: log, error: logErr } = await supabase
      .from('email_log')
      .insert({
        lead_type: 'student',
        lead_id: id,
        template_slug: null,
        to_email: toEmail,
        to_name: toName || null,
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
    return NextResponse.json(
      { log, rendered: { subject: rendered.subject }, dryRun: true },
      { status: 503 },
    );
  }

  const replyTo = process.env.ADMIN_EMAIL || undefined;
  const result = await sendTextEmail({
    to: toEmail,
    subject: rendered.subject,
    text: rendered.text,
    ...(replyTo ? { replyTo } : {}),
  });

  const now = new Date().toISOString();
  const { data: log, error: logErr } = await supabase
    .from('email_log')
    .insert({
      lead_type: 'student',
      lead_id: id,
      template_slug: null,
      to_email: toEmail,
      to_name: toName || null,
      subject: rendered.subject,
      body_text: rendered.text,
      resend_message_id: result.id ?? null,
      status: result.ok ? 'sent' : 'failed',
      error: result.error ?? null,
      sent_by: auth.user.id,
      sent_at: result.ok ? now : null,
    })
    .select('*')
    .single();

  if (logErr) {
    return NextResponse.json(
      { error: `Email sent but log write failed: ${logErr.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ log, rendered: { subject: rendered.subject } });
}

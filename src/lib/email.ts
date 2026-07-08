/**
 * Email service using Resend.
 * Sends admin notifications when a new lead or assessment is submitted.
 *
 * Environment variables required:
 *   RESEND_API_KEY  - Resend API key (get from https://resend.com)
 *   ADMIN_EMAIL     - Admin email address to receive notifications
 *
 * If RESEND_API_KEY is not set, emails are skipped (no error thrown).
 *
 * notifyApplicantOnStatusChange() is the only function in this module
 * that emails the APPLICANT (not the admin). It looks up the
 * email_templates row by status (e.g. status='Accepted' →
 * slug='status.accepted'), renders with the renderer, and sends.
 * Templates are editable from the admin UI.
 */

import { Resend } from 'resend';
import { getSupabaseServer } from '@/lib/supabase-server';
import { renderTemplate } from '@/lib/email/renderer';
import { SITE_URL } from '@/lib/site-url';

function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL);
}

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = 'SICA <noreply@sica.com.cn>';

/** Send admin notification when someone submits the contact form. */
export async function sendContactNotification(params: {
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  sourcePage: string | null;
  submittedAt: string;
}) {
  if (!isEmailConfigured()) return;

  const resend = getResend()!;
  const adminEmail = process.env.ADMIN_EMAIL!;

  await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `[SICA] New Contact: ${params.subject}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <table style="font-family:sans-serif;border-collapse:collapse;width:100%">
        <tr><td style="padding:6px 12px;font-weight:bold;background:#f5f5f5">Name</td><td style="padding:6px 12px">${params.name}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;background:#f5f5f5">Email</td><td style="padding:6px 12px"><a href="mailto:${params.email}">${params.email}</a></td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;background:#f5f5f5">Phone</td><td style="padding:6px 12px">${params.phone ?? '—'}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;background:#f5f5f5">Subject</td><td style="padding:6px 12px">${params.subject}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;background:#f5f5f5">Message</td><td style="padding:6px 12px">${params.message.replace(/\n/g, '<br>')}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;background:#f5f5f5">Source Page</td><td style="padding:6px 12px">${params.sourcePage ?? '—'}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;background:#f5f5f5">Submitted At</td><td style="padding:6px 12px">${params.submittedAt}</td></tr>
      </table>
      <p style="margin-top:16px;font-size:12px;color:#888">Log in to the <a href="http://localhost:5050/admin/leads">admin panel</a> to update the status.</p>
    `,
    text: [
      'New Contact Form Submission',
      `Name: ${params.name}`,
      `Email: ${params.email}`,
      `Phone: ${params.phone ?? '—'}`,
      `Subject: ${params.subject}`,
      `Message: ${params.message}`,
      `Source Page: ${params.sourcePage ?? '—'}`,
      `Submitted At: ${params.submittedAt}`,
      '',
      'Log in to the admin panel to update the status: http://localhost:5050/admin/leads',
    ].join('\n'),
  });
}

/** Send admin notification when someone submits the assessment form. */
export async function sendAssessmentNotification(params: {
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  country: string;
  currentEducation: string | null;
  intendedMajor: string | null;
  targetUniversities: string | null;
  hasTranscript: boolean;
  transcriptFileName: string | null;
  sourcePage: string | null;
  submittedAt: string;
}) {
  if (!isEmailConfigured()) return;

  const resend = getResend()!;
  const adminEmail = process.env.ADMIN_EMAIL!;

  await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `[SICA] New Assessment: ${params.firstName} ${params.lastName}`,
    html: `
      <h2>New Academic Assessment Submission</h2>
      <table style="font-family:sans-serif;border-collapse:collapse;width:100%">
        <tr><td style="padding:6px 12px;font-weight:bold;background:#f5f5f5">Name</td><td style="padding:6px 12px">${params.firstName} ${params.lastName}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;background:#f5f5f5">Email</td><td style="padding:6px 12px"><a href="mailto:${params.email}">${params.email}</a></td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;background:#f5f5f5">WhatsApp</td><td style="padding:6px 12px">${params.whatsapp}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;background:#f5f5f5">Country</td><td style="padding:6px 12px">${params.country}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;background:#f5f5f5">Current Education</td><td style="padding:6px 12px">${params.currentEducation ?? '—'}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;background:#f5f5f5">Intended Major</td><td style="padding:6px 12px">${params.intendedMajor ?? '—'}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;background:#f5f5f5">Target Universities</td><td style="padding:6px 12px">${params.targetUniversities ?? '—'}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;background:#f5f5f5">Has Transcript</td><td style="padding:6px 12px">${params.hasTranscript ? `Yes (${params.transcriptFileName ?? 'file attached'})` : 'No'}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;background:#f5f5f5">Source Page</td><td style="padding:6px 12px">${params.sourcePage ?? '—'}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;background:#f5f5f5">Submitted At</td><td style="padding:6px 12px">${params.submittedAt}</td></tr>
      </table>
      <p style="margin-top:16px;font-size:12px;color:#888">Log in to the <a href="http://localhost:5050/admin/assessments">admin panel</a> to review and respond.</p>
    `,
    text: [
      'New Academic Assessment Submission',
      `Name: ${params.firstName} ${params.lastName}`,
      `Email: ${params.email}`,
      `WhatsApp: ${params.whatsapp}`,
      `Country: ${params.country}`,
      `Current Education: ${params.currentEducation ?? '—'}`,
      `Intended Major: ${params.intendedMajor ?? '—'}`,
      `Target Universities: ${params.targetUniversities ?? '—'}`,
      `Has Transcript: ${params.hasTranscript ? `Yes (${params.transcriptFileName ?? 'file attached'})` : 'No'}`,
      `Source Page: ${params.sourcePage ?? '—'}`,
      `Submitted At: ${params.submittedAt}`,
      '',
      'Log in to the admin panel to review: http://localhost:5050/admin/assessments',
    ].join('\n'),
  });
}

/**
 * Welcome email — sent to a student when an admin creates their
 * account via "Add Offline Student". Includes the auto-generated
 * temporary password and instructions to reset on first login.
 *
 * Skipped (no error) if RESEND_API_KEY is not set, so the admin
 * flow still works in dev environments without email infra.
 */
export async function sendStudentWelcome(params: {
  firstName: string;
  lastName: string;
  email: string;
  temporaryPassword: string;
  createdByAdmin: string;
  createdAt: string;
}) {
  if (!process.env.RESEND_API_KEY) return;

  const resend = getResend()!;
  await resend.emails.send({
    from: FROM,
    to: params.email,
    subject: 'Welcome to SICA — your account is ready',
    html: `
      <h2 style="color:#1B2A4A;font-family:sans-serif">Welcome, ${params.firstName}!</h2>
      <p style="font-family:sans-serif">An SICA administrator (${params.createdByAdmin}) has created an account for you on the SICA platform.</p>
      <p style="font-family:sans-serif">You can now log in to track your application, upload documents, and message your advisor.</p>
      <h3 style="font-family:sans-serif;color:#9B1B30">Your login credentials</h3>
      <table style="font-family:sans-serif;border-collapse:collapse;width:100%;max-width:480px">
        <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold;width:40%">Email</td><td style="padding:8px"><a href="mailto:${params.email}">${params.email}</a></td></tr>
        <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Temporary password</td><td style="padding:8px;font-family:monospace;background:#fffbe6;border:1px solid #f0c000">${params.temporaryPassword}</td></tr>
      </table>
      <p style="font-family:sans-serif;margin-top:16px"><strong>Important:</strong> please log in and reset your password immediately. The temporary password expires in 7 days.</p>
      <p style="font-family:sans-serif;margin-top:16px"><a href="http://localhost:5050/student/login" style="background:#9B1B30;color:white;padding:10px 20px;text-decoration:none;border-radius:0">Log in to SICA</a></p>
      <p style="font-family:sans-serif;font-size:12px;color:#888;margin-top:24px">If you didn't expect this email, please contact your SICA advisor.</p>
    `,
    text: [
      `Welcome, ${params.firstName}!`,
      ``,
      `An SICA administrator (${params.createdByAdmin}) has created an account for you.`,
      ``,
      `Email: ${params.email}`,
      `Temporary password: ${params.temporaryPassword}`,
      ``,
      `Important: please log in and reset your password immediately.`,
      `Login URL: http://localhost:5050/student/login`,
      ``,
      `If you didn't expect this email, please contact your SICA advisor.`,
    ].join('\n'),
  });
}

/**
 * Suspension notice — sent to a student when their status is
 * changed to 'Suspended' by an admin. Includes the reason (if
 * provided) and the support contact for appeals.
 */
export async function sendStudentSuspended(params: {
  firstName: string;
  email: string;
  suspendedByAdmin: string;
  reason?: string;
  suspendedAt: string;
}) {
  if (!process.env.RESEND_API_KEY) return;

  const resend = getResend()!;
  await resend.emails.send({
    from: FROM,
    to: params.email,
    subject: 'SICA — your account has been suspended',
    html: `
      <h2 style="color:#9B1B30;font-family:sans-serif">Account suspended</h2>
      <p style="font-family:sans-serif">Hi ${params.firstName},</p>
      <p style="font-family:sans-serif">Your SICA account was suspended by ${params.suspendedByAdmin} on ${params.suspendedAt}.</p>
      ${params.reason ? `<p style="font-family:sans-serif"><strong>Reason:</strong> ${params.reason}</p>` : ''}
      <p style="font-family:sans-serif">While suspended, you won't be able to log in or make changes to your application. Your existing data is preserved.</p>
      <p style="font-family:sans-serif">If you believe this is a mistake or want to appeal, please reply to this email and our team will respond within 2 business days.</p>
      <p style="font-family:sans-serif;font-size:12px;color:#888;margin-top:24px">SICA &middot; Study in China Academy</p>
    `,
  text: [
    `Hi ${params.firstName},`,
    ``,
    `Your SICA account was suspended by ${params.suspendedByAdmin} on ${params.suspendedAt}.`,
    params.reason ? `Reason: ${params.reason}` : '',
    ``,
    `While suspended, you won't be able to log in or make changes to your application.`,
    `If you believe this is a mistake, please reply to this email.`,
  ].filter(Boolean).join('\n'),
  });
}

/**
 * Send an admin email when a new chat lead is captured from the
 * SICA AI assistant. Same shape as the contact / assessment
 * notifications, with the lead fields formatted as a table and a
 * link to the admin leads dashboard.
 */
export async function sendChatLeadNotification(params: {
  name: string | null;
  email: string;
  whatsapp: string | null;
  country: string | null;
  interested_degree: string | null;
  interested_program: string | null;
  interested_university: string | null;
  sourcePage: string | null;
  submittedAt: string;
}) {
  if (!isEmailConfigured()) return;

  const resend = getResend()!;
  const adminEmail = process.env.ADMIN_EMAIL!;

  const subject = params.interested_program
    ? `[SICA Chat] New lead interested in ${params.interested_program}`
    : `[SICA Chat] New lead from AI assistant`;

  await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject,
    html: `
      <h2>New Chat Lead</h2>
      <p style="font-family:sans-serif;color:#444;margin-bottom:16px">
        Captured from the SICA AI assistant chat. The visitor filled in
        the "Save my progress" form to get personalized follow-up.
      </p>
      <table style="font-family:sans-serif;border-collapse:collapse;width:100%">
        <tr><td style="padding:6px 12px;font-weight:bold;background:#f5f5f5">Name</td><td style="padding:6px 12px">${params.name ?? '—'}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;background:#f5f5f5">Email</td><td style="padding:6px 12px"><a href="mailto:${params.email}">${params.email}</a></td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;background:#f5f5f5">WhatsApp</td><td style="padding:6px 12px"><a href="https://wa.me/${(params.whatsapp ?? '').replace(/[^0-9+]/g, '')}">${params.whatsapp ?? '—'}</a></td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;background:#f5f5f5">Country</td><td style="padding:6px 12px">${params.country ?? '—'}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;background:#f5f5f5">Interested Degree</td><td style="padding:6px 12px">${params.interested_degree ?? '—'}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;background:#f5f5f5">Interested Program</td><td style="padding:6px 12px">${params.interested_program ?? '—'}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;background:#f5f5f5">Interested University</td><td style="padding:6px 12px">${params.interested_university ?? '—'}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;background:#f5f5f5">Source Page</td><td style="padding:6px 12px">${params.sourcePage ?? '—'}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;background:#f5f5f5">Submitted At</td><td style="padding:6px 12px">${params.submittedAt}</td></tr>
      </table>
      <p style="margin-top:16px;font-size:12px;color:#888">Log in to the <a href="${SITE_URL}/admin/leads">admin panel</a> to view the conversation context and follow up.</p>
    `,
    text: [
      `New Chat Lead captured from the SICA AI assistant.`,
      ``,
      `Name: ${params.name ?? '—'}`,
      `Email: ${params.email}`,
      `WhatsApp: ${params.whatsapp ?? '—'}`,
      `Country: ${params.country ?? '—'}`,
      `Interested Degree: ${params.interested_degree ?? '—'}`,
      `Interested Program: ${params.interested_program ?? '—'}`,
      `Interested University: ${params.interested_university ?? '—'}`,
      `Source Page: ${params.sourcePage ?? '—'}`,
      `Submitted At: ${params.submittedAt}`,
      ``,
      `Log in to the admin panel to view the conversation context.`,
    ].join('\n'),
  });
}

// ============================================================================
// Applicant + Partner status emails
// ============================================================================
//
// notifyApplicantOnStatusChange() reads the email_templates row by
// slug='status.<lowercase_status>' (e.g. 'status.accepted') and
// renders it with the context. Templates are editable from the
// admin UI. Slugs we look up:
//
//   status.submitted, status.under_review, status.documents_requested,
//   status.decision_made, status.accepted, status.rejected
//
// S29: notifyPartnerOnStatusChange() is the partner-side sibling.
// The partner's status taxonomy is slightly different (uses 'In Review'
// instead of 'Under Review' — see PARTNER_STATUS_TO_TEMPLATE_SLUG
// below), but the partner email templates share the same body shape.
// Each partner slug is `status.<state>.partner`, e.g.
// 'status.under_review.partner', 'status.accepted.partner'.
//
// We deliberately do NOT email on every status change — Drafts and
// Withdrawn are admin-internal and have no email template (well,
// Withdrawn DOES — see status.withdrawn / status.withdrawn.partner).
// ============================================================================

const STATUS_TO_TEMPLATE_SLUG: Record<string, string> = {
  Submitted: 'status.submitted',
  'Under Review': 'status.under_review',
  'Documents Requested': 'status.documents_requested',
  'Decision Made': 'status.decision_made',
  Accepted: 'status.accepted',
  Rejected: 'status.rejected',
  Withdrawn: 'status.withdrawn',
};

/**
 * S29: the partner_applications table uses a different status naming:
 * 'In Review' (not 'Under Review') and there's no 'Documents Requested'
 * or 'Decision Made' state. We normalize partner → student status
 * semantics by mapping the partner's names to the partner-targeted
 * email slugs (status.*.partner). When the partner app's status
 * is 'In Review', we fire the same notification the student would
 * have received for 'Under Review' (i.e. status.under_review.partner).
 */
const PARTNER_STATUS_TO_TEMPLATE_SLUG: Record<string, string> = {
  Submitted: 'status.submitted.partner',
  'In Review': 'status.under_review.partner',
  Accepted: 'status.accepted.partner',
  Rejected: 'status.rejected.partner',
  Withdrawn: 'status.withdrawn.partner',
};

export interface StatusEmailParams {
  toEmail: string;
  applicantName: string | null;
  universityName: string | null;
  programName: string | null;
  degree: string | null;
  intake: string | null;
  applicationNumber: string | null;
  newStatus: string;
  extraNote?: string | null;
}

/** @deprecated Use StatusEmailParams. Kept for caller compat. */
export type ApplicantEmailParams = StatusEmailParams;

/**
 * S29: shared rendering + send for status emails. Both the
 * applicant path (notifyApplicantOnStatusChange) and the partner
 * path (notifyPartnerOnStatusChange) call this with the right
 * slug. The slug determines which email_templates row to load
 * and (for the partner audience) the wrapping HTML tone.
 */
async function sendStatusEmail(
  toEmail: string,
  toName: string | null,
  slug: string,
  params: StatusEmailParams,
  opts: { audience: 'applicant' | 'partner' },
): Promise<boolean> {
  if (!isEmailConfigured()) return false;
  if (!toEmail) return false;

  const supabase = getSupabaseServer();
  if (!supabase) return false;

  // Look up the template. RLS would normally hide it from non-admins,
  // but service-role bypasses RLS — so the cron-like path here works.
  const { data: tpl, error: tplErr } = await supabase
    .from('email_templates')
    .select('id, subject, body_html, body_text, variables, is_active')
    .eq('slug', slug)
    .maybeSingle();
  if (tplErr) {
    console.error('[email] template lookup failed', slug, tplErr);
    return false;
  }
  if (!tpl) {
    console.warn('[email] no template for slug', slug, '— admin may have deleted it');
    return false;
  }
  if (!tpl.is_active) return false;

  const firstName = (toName || '').split(' ')[0] || 'there';
  const programLine = [params.programName, params.degree, params.intake]
    .filter(Boolean)
    .join(' · ');
  const universityName = params.universityName || 'your chosen university';

  // Build the facts table for $FACTS$ macro
  const facts: Array<{ key: string; value: string }> = [
    { key: 'Application', value: params.applicationNumber || '' },
    { key: 'University', value: universityName },
  ];
  if (programLine) facts.push({ key: 'Program', value: programLine });
  facts.push({ key: 'New status', value: params.newStatus });

  // Render
  const rendered = renderTemplate({
    subject: tpl.subject,
    bodyHtml: tpl.body_html,
    bodyText: tpl.body_text,
    context: {
      firstName,
      universityName,
      programName: params.programName,
      programLine,
      degree: params.degree,
      intake: params.intake,
      applicationNumber: params.applicationNumber,
      newStatus: params.newStatus,
      extraNote: params.extraNote,
      facts,
    },
    allowedVariables: Array.isArray(tpl.variables) ? (tpl.variables as string[]) : undefined,
  });

  const resend = getResend()!;
  await resend.emails.send({
    from: FROM,
    to: toEmail,
    replyTo: process.env.ADMIN_EMAIL,
    subject: rendered.subject,
    html: opts.audience === 'partner' ? wrapForPartner(rendered.html) : wrapForApplicant(rendered.html),
    text: rendered.text,
  });
  return true;
}

/**
 * Send a status-update email to the applicant. Looks up the
 * template by slug, renders it, sends via Resend.
 *
 * Skips silently when:
 *  - Resend is not configured
 *  - newStatus doesn't map to a template slug
 *  - toEmail is empty/null
 *  - template is_active = false
 *  - template row is missing (admin deleted it)
 *
 * Returns true on send, false on skip. Never throws — callers
 * shouldn't let email failure block a status update.
 */
export async function notifyApplicantOnStatusChange(
  params: StatusEmailParams,
): Promise<boolean> {
  const slug = STATUS_TO_TEMPLATE_SLUG[params.newStatus];
  if (!slug) return false;
  return sendStatusEmail(
    params.toEmail,
    params.applicantName,
    slug,
    params,
    { audience: 'applicant' },
  );
}

/**
 * S29: send a status-update email to the partner when admin changes
 * a partner_application's status. Same render + send as the applicant
 * path, but the partner-targeted email slugs have different copy
 * ("Your student's application...") and the wrapper footer says
 * "You're receiving this as a SICA partner agency" instead of "...as
 * a SICA applicant".
 *
 * The partner's status names are normalized via
 * PARTNER_STATUS_TO_TEMPLATE_SLUG so 'In Review' fires the same
 * notification family as the student's 'Under Review'.
 */
export async function notifyPartnerOnStatusChange(
  params: StatusEmailParams,
): Promise<boolean> {
  const slug = PARTNER_STATUS_TO_TEMPLATE_SLUG[params.newStatus];
  if (!slug) return false;
  return sendStatusEmail(
    params.toEmail,
    params.applicantName,
    slug,
    params,
    { audience: 'partner' },
  );
}

/**
 * Wraps the rendered inner body with the SICA applicant shell —
 * navy header band + footer. The template body supplies the
 * headline copy; this just gives the email consistent visual
 * structure across all 6 status templates.
 */
function wrapForApplicant(innerHtml: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAFAF8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1F2937">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;padding:24px 0"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #E5E7EB">
<tr><td style="background:#1B2A4A;padding:16px 20px;color:#fff;font-weight:800;font-size:18px;letter-spacing:0.05em">SICA</td></tr>
<tr><td style="padding:32px;font-size:15px;line-height:1.6;color:#374151">${innerHtml}</td></tr>
<tr><td style="padding:16px 32px;background:#FAFAF8;border-top:1px solid #E5E7EB;font-size:12px;color:#6B7280">
<p style="margin:0 0 4px 0">SICA · Guangzhou, China · <a href="mailto:support@sica.com.cn" style="color:#9B1B30;text-decoration:none">support@sica.com.cn</a></p>
<p style="margin:0">You're receiving this because you submitted an application through SICA. <a href="${SITE_URL}/student/settings" style="color:#6B7280">Manage email preferences</a></p>
</td></tr></table></td></tr></table>
</body></html>`;
}

/**
 * S29: same shell as wrapForApplicant, but the footer copy is
 * tailored for the partner audience — the user is a SICA partner
 * agency, not a SICA applicant. The link points to the partner
 * settings page (when the partner notifications inbox ships in
 * S30 the link can flip to /partner/notifications).
 */
function wrapForPartner(innerHtml: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAFAF8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1F2937">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;padding:24px 0"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #E5E7EB">
<tr><td style="background:#1B2A4A;padding:16px 20px;color:#fff;font-weight:800;font-size:18px;letter-spacing:0.05em">SICA · Partner</td></tr>
<tr><td style="padding:32px;font-size:15px;line-height:1.6;color:#374151">${innerHtml}</td></tr>
<tr><td style="padding:16px 32px;background:#FAFAF8;border-top:1px solid #E5E7EB;font-size:12px;color:#6B7280">
<p style="margin:0 0 4px 0">SICA · Guangzhou, China · <a href="mailto:support@sica.com.cn" style="color:#9B1B30;text-decoration:none">support@sica.com.cn</a></p>
<p style="margin:0">You're receiving this as a SICA partner agency, regarding a student application you submitted. <a href="${SITE_URL}/partner/settings" style="color:#6B7280">Manage email preferences</a></p>
</td></tr></table></td></tr></table>
</body></html>`;
}

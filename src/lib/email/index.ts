/**
 * Phase 84: centralized text-only email pipeline.
 *
 * All emails flow through this module:
 *   1. `lookupRecipientLocale()` resolves the language.
 *   2. `loadTemplate()` reads the active template row from DB.
 *   3. `renderTextTemplate()` renders the template body with {{var}}
 *      and {{{var}}} substitution.
 *   4. `formatWithSignature()` prepends [SICA] to the subject and
 *      appends the standard signature + unsubscribe footer.
 *   5. `sendTextEmail()` ships via Resend (no `html` field — text only).
 *
 * Hardcoded send paths in email.ts + the 2 partner invite routes
 * all delegate to this module. There is no other place in the
 * codebase that calls `resend.emails.send` directly.
 */

import { Resend } from 'resend';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseServer } from '@/lib/supabase-server';
import { SITE_URL } from '@/lib/site-url';

// Must match a domain verified on the Resend account (sica.com.cn is not;
// studyinchina.academy is — verified 2026-09-21, DKIM + primary SPF).
const FROM = 'SICA <noreply@studyinchina.academy>';
const REPLY_TO = process.env.ADMIN_EMAIL || 'info@studyinchina.academy';

const SIGNATURE = [
  '',
  '-- ',
  'SICA Study in China Academy',
  'https://studyinchina.academy',
  REPLY_TO,
].join('\n');

const UNSUBSCRIBE_BASE = `${SITE_URL}/api/email/unsubscribe`;

// ============================================================================
// Configuration
// ============================================================================

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL);
}

export function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

// ============================================================================
// Locale resolution
// ============================================================================

export type EmailLocale = 'en' | 'zh';

export async function lookupRecipientLocale(opts: {
  /** student_profiles row id (authoritative for student-affiliated recipients) */
  studentId?: string | null;
  /** sica-locale cookie value */
  cookieLocale?: string | null;
  /** Accept-Language header value */
  acceptLanguage?: string | null;
  /** Override (e.g. read from email_drips.recipient_locale) */
  persistedLocale?: string | null;
}): Promise<EmailLocale> {
  // 0. Persisted locale (set at schedule time for drips)
  if (opts.persistedLocale === 'zh') return 'zh';
  if (opts.persistedLocale === 'en') return 'en';

  // 1. student_profiles.locale (authoritative for student-affiliated recipients)
  if (opts.studentId) {
    const supabase = getSupabaseServer();
    if (supabase) {
      const { data } = await supabase
        .from('student_profiles')
        .select('locale')
        .eq('id', opts.studentId)
        .maybeSingle();
      if (data?.locale === 'zh') return 'zh';
      if (data?.locale === 'en') return 'en';
    }
  }

  // 2. sica-locale cookie (visitor's preferred site language)
  if (opts.cookieLocale?.startsWith('zh')) return 'zh';
  if (opts.cookieLocale === 'en') return 'en';

  // 3. Accept-Language header
  if (opts.acceptLanguage?.toLowerCase().startsWith('zh')) return 'zh';

  // 4. Fall back to en
  return 'en';
}

// ============================================================================
// Template loader
// ============================================================================

export interface EmailTemplate {
  id: string;
  slug: string;
  subject: string;
  body_text: string;
  variables: string[];
}

/**
 * Load a template by slug + locale. Returns null if the template is
 * missing or inactive. Picks `subject_zh`/`body_text_zh` when locale
 * is 'zh', falling back to en when the zh column is empty.
 */
export async function loadTemplate(
  slug: string,
  locale: EmailLocale,
  supabase?: SupabaseClient,
): Promise<EmailTemplate | null> {
  const client = supabase ?? getSupabaseServer();
  if (!client) return null;

  const { data, error } = await client
    .from('email_templates')
    .select('id, slug, subject, subject_zh, body_text, body_text_zh, variables, is_active')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('[email] loadTemplate failed', slug, error);
    return null;
  }
  if (!data) return null;

  const row = data as {
    id: string;
    slug: string;
    subject: string;
    subject_zh: string | null;
    body_text: string;
    body_text_zh: string | null;
    variables: unknown;
    is_active: boolean;
  };

  const zhAvailable = Boolean(row.subject_zh && row.body_text_zh);
  const useZh = locale === 'zh' && zhAvailable;

  return {
    id: row.id,
    slug: row.slug,
    subject: useZh ? (row.subject_zh as string) : row.subject,
    body_text: useZh ? (row.body_text_zh as string) : row.body_text,
    variables: Array.isArray(row.variables) ? (row.variables as string[]) : [],
  };
}

// ============================================================================
// Renderer
// ============================================================================

/**
 * Substitute {{var}} and {{{var}}} placeholders. Missing values
 * render as `[varName]` so QA can spot typos. No block directives,
 * no macros — text doesn't need them.
 */
export function renderTextTemplate(
  body: string,
  variables: Record<string, string | number | boolean | null | undefined>,
): string {
  return body.replace(/\{\{\{?([\w.]+)\}?\}\}/g, (_, key: string) => {
    const v = variables[key];
    if (v == null || v === '') return `[${key}]`;
    return String(v);
  });
}

// ============================================================================
// Format + signature
// ============================================================================

/**
 * Append the standard SICA signature + unsubscribe footer to the body
 * and prefix the subject with `[SICA]`. Empty `unsubscribeToken` is
 * allowed for admin notifications that don't have an unsubscribe link.
 */
export function formatWithSignature(args: {
  subject: string;
  bodyText: string;
  unsubscribeToken?: string | null;
}): { subject: string; text: string } {
  const lines: string[] = [args.bodyText.trimEnd()];
  lines.push(SIGNATURE);
  if (args.unsubscribeToken) {
    lines.push(
      `Update preferences or unsubscribe: ${UNSUBSCRIBE_BASE}?token=${encodeURIComponent(args.unsubscribeToken)}`,
    );
  }
  return {
    subject: `[SICA] ${args.subject}`,
    text: lines.join('\n\n'),
  };
}

// ============================================================================
// Send
// ============================================================================

export interface SendTextResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export async function sendTextEmail(args: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<SendTextResult> {
  const resend = getResend();
  if (!resend) return { ok: false, error: 'Resend not configured' };

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: args.to,
      subject: args.subject,
      text: args.text,
      replyTo: args.replyTo ?? REPLY_TO,
    });
    if (error || !data) return { ok: false, error: error?.message ?? 'unknown error' };
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'send threw' };
  }
}

// ============================================================================
// High-level: send a templated email
// ============================================================================

/**
 * Single entry point for "send a DB-stored template". Loads the
 * template, renders, appends signature, ships.
 *
 * Returns true on send, false on any failure. Never throws.
 */
export async function sendTemplatedEmail(args: {
  to: string;
  slug: string;
  locale: EmailLocale;
  variables: Record<string, string | number | boolean | null | undefined>;
  unsubscribeToken?: string | null;
  replyTo?: string;
  supabase?: SupabaseClient;
}): Promise<boolean> {
  const tpl = await loadTemplate(args.slug, args.locale, args.supabase);
  if (!tpl) {
    console.warn('[email] sendTemplatedEmail: no template', args.slug, args.locale);
    return false;
  }

  const rendered = formatWithSignature({
    subject: tpl.subject,
    bodyText: renderTextTemplate(tpl.body_text, args.variables),
    unsubscribeToken: args.unsubscribeToken,
  });

  const result = await sendTextEmail({
    to: args.to,
    subject: rendered.subject,
    text: rendered.text,
    replyTo: args.replyTo,
  });

  if (!result.ok) {
    console.error('[email] sendTemplatedEmail send failed', args.slug, args.to, result.error);
    return false;
  }
  return true;
}

// ============================================================================
// Send paths (delegating to sendTemplatedEmail)
// ============================================================================
//
// These functions used to live in src/lib/email.ts with inline HTML+text
// bodies. Phase 84 collapses them to DB templates + thin wrappers here so
// every email flow goes through one pipeline.

const ADMIN_LEADS_URL = `${SITE_URL}/admin/leads`;
const ADMIN_ASSESSMENTS_URL = `${SITE_URL}/admin/assessments`;
const STUDENT_LOGIN_URL = `${SITE_URL}/student/login`;

/**
 * Read the sica-locale cookie (server-side) + Accept-Language
 * header for the locale resolution chain. Used by the 5 hardcoded
 * senders below that don't have a studentId or persistedLocale.
 */
async function resolveLocaleFromRequest(): Promise<EmailLocale> {
  try {
    const { cookies, headers } = await import('next/headers');
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get('sica-locale')?.value ?? null;
    const headerStore = await headers();
    const acceptLanguage = headerStore.get('accept-language');
    return lookupRecipientLocale({ cookieLocale, acceptLanguage });
  } catch {
    return lookupRecipientLocale({});
  }
}

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
  const adminEmail = process.env.ADMIN_EMAIL!;
  const locale = await resolveLocaleFromRequest();
  await sendTemplatedEmail({
    to: adminEmail,
    slug: 'notification.contact',
    locale,
    variables: {
      name: params.name,
      email: params.email,
      phone: params.phone ?? '—',
      subject: params.subject,
      message: params.message,
      sourcePage: params.sourcePage ?? '—',
      submittedAt: params.submittedAt,
      adminLeadsUrl: ADMIN_LEADS_URL,
    },
  });
}

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
  const adminEmail = process.env.ADMIN_EMAIL!;
  const locale = await resolveLocaleFromRequest();
  await sendTemplatedEmail({
    to: adminEmail,
    slug: 'notification.assessment',
    locale,
    variables: {
      firstName: params.firstName,
      lastName: params.lastName,
      email: params.email,
      whatsapp: params.whatsapp,
      country: params.country,
      currentEducation: params.currentEducation ?? '—',
      intendedMajor: params.intendedMajor ?? '—',
      targetUniversities: params.targetUniversities ?? '—',
      hasTranscript: params.hasTranscript
        ? `Yes (${params.transcriptFileName ?? 'file attached'})`
        : 'No',
      sourcePage: params.sourcePage ?? '—',
      submittedAt: params.submittedAt,
      adminAssessmentsUrl: ADMIN_ASSESSMENTS_URL,
    },
  });
}

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
  const adminEmail = process.env.ADMIN_EMAIL!;
  const locale = await resolveLocaleFromRequest();
  await sendTemplatedEmail({
    to: adminEmail,
    slug: 'notification.chat_lead',
    locale,
    variables: {
      name: params.name ?? '—',
      email: params.email,
      whatsapp: params.whatsapp ?? '—',
      country: params.country ?? '—',
      interestedDegree: params.interested_degree ?? '—',
      interestedProgram: params.interested_program ?? '—',
      interestedUniversity: params.interested_university ?? '—',
      sourcePage: params.sourcePage ?? '—',
      submittedAt: params.submittedAt,
      adminLeadsUrl: ADMIN_LEADS_URL,
    },
  });
}

export async function sendStudentWelcome(params: {
  firstName: string;
  lastName: string;
  email: string;
  temporaryPassword: string;
  createdByAdmin: string;
  createdAt: string;
}): Promise<boolean> {
  if (!isEmailConfigured()) return false;
  return await sendTemplatedEmail({
    to: params.email,
    slug: 'notification.student_welcome',
    locale: 'en',
    variables: {
      firstName: params.firstName,
      lastName: params.lastName,
      email: params.email,
      temporaryPassword: params.temporaryPassword,
      createdByAdmin: params.createdByAdmin,
      studentLoginUrl: STUDENT_LOGIN_URL,
    },
  });
}

export async function sendStudentSuspended(params: {
  firstName: string;
  email: string;
  suspendedByAdmin: string;
  reason?: string;
  suspendedAt: string;
}) {
  if (!isEmailConfigured()) return;
  await sendTemplatedEmail({
    to: params.email,
    slug: 'notification.student_suspended',
    locale: 'en',
    variables: {
      firstName: params.firstName,
      suspendedByAdmin: params.suspendedByAdmin,
      reason: params.reason ?? '',
      suspendedAt: params.suspendedAt,
    },
  });
}

// ----- Status email templates (slug → body_text) -----

const STATUS_TO_TEMPLATE_SLUG: Record<string, string> = {
  Submitted: 'status.submitted',
  'Under Review': 'status.under_review',
  'Documents Requested': 'status.documents_requested',
  'Decision Made': 'status.decision_made',
  Accepted: 'status.accepted',
  Rejected: 'status.rejected',
  Withdrawn: 'status.withdrawn',
};

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
  locale?: EmailLocale;
}

/** @deprecated Use StatusEmailParams. Kept for caller compat. */
export type ApplicantEmailParams = StatusEmailParams;

async function sendStatusEmail(
  toEmail: string,
  _toName: string | null,
  slug: string,
  params: StatusEmailParams,
): Promise<boolean> {
  if (!isEmailConfigured()) return false;
  if (!toEmail) return false;

  const locale: EmailLocale = params.locale ?? (await resolveLocaleFromRequest());
  const firstName = (params.applicantName || '').split(' ')[0] || 'there';
  const programLine = [params.programName, params.degree, params.intake]
    .filter(Boolean)
    .join(' · ');
  const universityName = params.universityName || 'your chosen university';

  await sendTemplatedEmail({
    to: toEmail,
    slug,
    locale,
    variables: {
      firstName,
      universityName,
      programName: params.programName ?? '',
      programLine: programLine ?? '',
      degree: params.degree ?? '',
      intake: params.intake ?? '',
      applicationNumber: params.applicationNumber ?? '',
      newStatus: params.newStatus,
      extraNote: params.extraNote ?? '',
    },
  });
  return true;
}

export async function notifyApplicantOnStatusChange(
  params: StatusEmailParams,
): Promise<boolean> {
  const slug = STATUS_TO_TEMPLATE_SLUG[params.newStatus];
  if (!slug) return false;
  return sendStatusEmail(params.toEmail, params.applicantName, slug, params);
}

export async function notifyPartnerOnStatusChange(
  params: StatusEmailParams,
): Promise<boolean> {
  const slug = PARTNER_STATUS_TO_TEMPLATE_SLUG[params.newStatus];
  if (!slug) return false;
  return sendStatusEmail(params.toEmail, params.applicantName, slug, params);
}

// ============================================================================
// Phase 114: free counselling session booking emails
// ============================================================================

/**
 * Render an absolute slot instant as a Beijing wall-clock line, e.g.
 * "Sat, 19 Sep 2026, 09:30-09:40 (GMT+8)". Server Node has full ICU,
 * so the fixed timeZone is honored.
 */
function formatCounsellingSlotBeijing(slotStartIso: string): string {
  const start = new Date(slotStartIso);
  const day = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Shanghai',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(start);
  const hhmm = (d: Date) =>
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Shanghai',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
  const end = new Date(start.getTime() + 10 * 60 * 1000);
  return `${day}, ${hhmm(start)}-${hhmm(end)} Beijing time (GMT+8)`;
}

/**
 * Admin notification for a new /counselling booking. Fire-and-forget
 * from the API route — failures are logged, never thrown.
 */
export async function sendCounsellingAdminNotification(params: {
  reference: string;
  name: string;
  email: string;
  phone: string;
  country: string | null;
  educationLevel: string | null;
  topic: string | null;
  slotStartIso: string;
  locale: string;
}): Promise<boolean> {
  if (!isEmailConfigured()) return false;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return false;
  const formatted = formatCounsellingSlotBeijing(params.slotStartIso);
  const { subject, text } = formatWithSignature({
    subject: `New counselling booking ${params.reference} — ${formatted}`,
    bodyText: [
      'A new free 10-minute counselling session has been booked.',
      '',
      `Reference: ${params.reference}`,
      `Slot: ${formatted}`,
      `Name: ${params.name}`,
      `Email: ${params.email}`,
      `Phone: ${params.phone}`,
      `Country: ${params.country ?? '—'}`,
      `Education level: ${params.educationLevel ?? '—'}`,
      `Topic: ${params.topic ?? '—'}`,
      `Page locale: ${params.locale}`,
      '',
      `Manage it in the admin portal: ${SITE_URL}/admin/counselling`,
    ].join('\n'),
  });
  try {
    const result = await sendTextEmail({ to: adminEmail, subject, text });
    return result.ok;
  } catch (err) {
    console.error('[email] counselling admin notification failed:', err);
    return false;
  }
}

/**
 * Confirmation to the student after a successful /counselling booking.
 * Status stays Pending until an admin confirms; the email says the
 * advisor will send the meeting link.
 */
export async function sendCounsellingConfirmation(params: {
  toEmail: string;
  name: string;
  reference: string;
  slotStartIso: string;
  locale: string;
}): Promise<boolean> {
  if (!isEmailConfigured()) return false;
  const formatted = formatCounsellingSlotBeijing(params.slotStartIso);
  const bodyText =
    params.locale === 'zh'
      ? [
          `您好 ${params.name}，`,
          '',
          '您已成功预约 SICA 的免费 10 分钟在线咨询。',
          '',
          `预约编号：${params.reference}`,
          `咨询时间：${formatted}`,
          '',
          '招生顾问会通过邮件或 WhatsApp 与您确认，并把会议链接发给您。',
          '如需改期，直接回复本邮件即可。',
        ]
      : [
          `Hi ${params.name},`,
          '',
          'Your free 10-minute online counselling session with SICA is booked.',
          '',
          `Reference: ${params.reference}`,
          `Session time: ${formatted}`,
          '',
          'A SICA advisor will confirm shortly and send you the meeting link by email or WhatsApp.',
          'Need a different time? Just reply to this email.',
        ];
  const { subject, text } = formatWithSignature({
    subject:
      params.locale === 'zh'
        ? `咨询预约确认 ${params.reference}`
        : `Your counselling session is booked — ${params.reference}`,
    bodyText: bodyText.join('\n'),
  });
  try {
    const result = await sendTextEmail({ to: params.toEmail, subject, text });
    return result.ok;
  } catch (err) {
    console.error('[email] counselling confirmation failed:', err);
    return false;
  }
}
/**
 * Email service using Resend.
 * Sends admin notifications when a new lead or assessment is submitted.
 *
 * Environment variables required:
 *   RESEND_API_KEY  - Resend API key (get from https://resend.com)
 *   ADMIN_EMAIL     - Admin email address to receive notifications
 *
 * If RESEND_API_KEY is not set, emails are skipped (no error thrown).
 */

import { Resend } from 'resend';

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
      <p style="font-family:sans-serif;font-size:12px;color:#888;margin-top:24px">SICA &middot; Study in China Agency</p>
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
      <p style="margin-top:16px;font-size:12px;color:#888">Log in to the <a href="https://sica.com.cn/admin/leads">admin panel</a> to view the conversation context and follow up.</p>
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

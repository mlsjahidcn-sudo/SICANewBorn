/**
 * Application messages — server side (service-role client only).
 *
 * The `application_messages` table is deny-all under RLS; every route runs
 * its own permission check first and only then calls into this module.
 * Notifications and emails are best-effort: a failure there is logged and
 * never fails the message itself (same contract as the status emails).
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { lookupRecipientLocale, sendTemplatedEmail } from '@/lib/email';
import { hydrateUserEmails } from '@/lib/partner-user-lookup';
import { SITE_URL } from '@/lib/site-url';
import {
  isDeliverableEmail,
  mapApplicationMessage,
  messagePreview,
  portalRoleFor,
  shouldEmail,
  type ApplicationMessage,
  type MessageSenderRole,
  type MessageSurface,
  type RawApplicationMessage,
} from '@/lib/application-messages';

const MESSAGE_COLUMNS = 'id, sender_role, sender_name, body, read_at, created_at';

export interface MessageApplicationContext {
  surface: MessageSurface;
  id: string;
  applicationRef: string;
  university: string;
  studentName: string;
  /** student surface: the linked student account (null for lead-path rows). */
  studentId: string | null;
  studentFirstName: string;
  studentEmail: string | null;
  /** partner surface */
  partnerId: string | null;
  createdByUserId: string | null;
  companyName: string;
}

function applicationColumn(surface: MessageSurface): 'student_application_id' | 'partner_application_id' {
  return surface === 'student' ? 'student_application_id' : 'partner_application_id';
}

/** Load what the message routes and notifications need, or null if the application doesn't exist. */
export async function loadMessageApplicationContext(
  service: SupabaseClient,
  surface: MessageSurface,
  id: string,
): Promise<MessageApplicationContext | null> {
  if (surface === 'student') {
    const { data, error } = await service
      .from('student_applications')
      .select(
        'id, student_id, application_number, university_name, applicant_name, applicant_email, student:student_profiles!student_id (first_name, last_name, email)',
      )
      .eq('id', id)
      .maybeSingle();
    if (error || !data) return null;
    const row = data as {
      id: string;
      student_id: string | null;
      application_number: string | null;
      university_name: string | null;
      applicant_name: string | null;
      applicant_email: string | null;
      student: unknown;
    };
    const student = (Array.isArray(row.student) ? row.student[0] : row.student) as
      | { first_name?: string | null; last_name?: string | null; email?: string | null }
      | null
      | undefined;
    const fullName = [student?.first_name, student?.last_name].filter(Boolean).join(' ').trim();
    return {
      surface,
      id: row.id,
      applicationRef: row.application_number ?? '',
      university: row.university_name ?? '',
      studentName: fullName || row.applicant_name?.trim() || '',
      studentId: row.student_id,
      studentFirstName: student?.first_name?.trim() || fullName || '',
      studentEmail: student?.email ?? null,
      partnerId: null,
      createdByUserId: null,
      companyName: '',
    };
  }

  const { data, error } = await service
    .from('partner_applications')
    .select('id, partner_id, created_by_user_id, application_number, student_name, university, partner:partners!partner_id (company_name)')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as {
    id: string;
    partner_id: string;
    created_by_user_id: string | null;
    application_number: string | null;
    student_name: string | null;
    university: string | null;
    partner: unknown;
  };
  const partner = (Array.isArray(row.partner) ? row.partner[0] : row.partner) as
    | { company_name?: string | null }
    | null
    | undefined;
  return {
    surface,
    id: row.id,
    applicationRef: row.application_number ?? '',
    university: row.university ?? '',
    studentName: row.student_name?.trim() || '',
    studentId: null,
    studentFirstName: '',
    studentEmail: null,
    partnerId: row.partner_id,
    createdByUserId: row.created_by_user_id,
    companyName: partner?.company_name?.trim() || '',
  };
}

/**
 * Return the conversation, oldest first. When `markRead` is set, messages
 * from the other side are stamped as read by the viewer's side.
 */
export async function listApplicationMessages(
  service: SupabaseClient,
  ctx: MessageApplicationContext,
  viewerRole: MessageSenderRole,
  markRead: boolean,
): Promise<ApplicationMessage[]> {
  const column = applicationColumn(ctx.surface);
  const { data, error } = await service
    .from('application_messages')
    .select(MESSAGE_COLUMNS)
    .eq(column, ctx.id)
    .order('created_at', { ascending: true })
    .limit(500);
  if (error) throw new Error(error.message);
  const messages = ((data ?? []) as RawApplicationMessage[]).map(mapApplicationMessage);

  if (markRead) {
    const unreadIds = messages
      .filter((m) => m.senderRole !== viewerRole && !m.readAt)
      .map((m) => m.id);
    if (unreadIds.length > 0) {
      const now = new Date().toISOString();
      const { error: readErr } = await service
        .from('application_messages')
        .update({ read_at: now })
        .in('id', unreadIds)
        .is('read_at', null);
      if (readErr) {
        console.error('[application-messages] mark read failed:', readErr.message);
      } else {
        for (const m of messages) if (unreadIds.includes(m.id)) m.readAt = now;
      }
    }
  }
  return messages;
}

export async function countUnreadApplicationMessages(
  service: SupabaseClient,
  ctx: MessageApplicationContext,
  viewerRole: MessageSenderRole,
): Promise<number> {
  const { count, error } = await service
    .from('application_messages')
    .select('id', { count: 'exact', head: true })
    .eq(applicationColumn(ctx.surface), ctx.id)
    .neq('sender_role', viewerRole)
    .is('read_at', null);
  if (error) return 0;
  return count ?? 0;
}

export interface MessageSender {
  role: MessageSenderRole;
  userId: string;
  name: string;
}

/** Insert a message, then notify the other side (best-effort). */
export async function postApplicationMessage(
  service: SupabaseClient,
  ctx: MessageApplicationContext,
  sender: MessageSender,
  body: string,
): Promise<ApplicationMessage> {
  const { data, error } = await service
    .from('application_messages')
    .insert({
      [applicationColumn(ctx.surface)]: ctx.id,
      sender_role: sender.role,
      sender_user_id: sender.userId,
      sender_name: sender.name.slice(0, 200),
      body,
    })
    .select(MESSAGE_COLUMNS)
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Message insert failed');
  const message = mapApplicationMessage(data as RawApplicationMessage);

  try {
    await notifyRecipients(service, ctx, sender, message);
  } catch (err) {
    console.error('[application-messages] notify failed:', err);
  }
  return message;
}

// ─── notifications ──────────────────────────────────────────────────────────

/** Most recent time an email went out for a message from `senderSide` in this conversation. */
async function lastEmailedAt(
  service: SupabaseClient,
  ctx: MessageApplicationContext,
  senderSides: MessageSenderRole[],
  excludeId: string,
): Promise<string | null> {
  const { data } = await service
    .from('application_messages')
    .select('emailed_at')
    .eq(applicationColumn(ctx.surface), ctx.id)
    .in('sender_role', senderSides)
    .not('emailed_at', 'is', null)
    .neq('id', excludeId)
    .order('emailed_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as { emailed_at?: string | null } | null)?.emailed_at ?? null;
}

async function markEmailed(service: SupabaseClient, messageId: string): Promise<void> {
  await service
    .from('application_messages')
    .update({ emailed_at: new Date().toISOString() })
    .eq('id', messageId);
}

function adminThreadUrl(ctx: MessageApplicationContext): string {
  return ctx.surface === 'student'
    ? `${SITE_URL}/admin/applications/${ctx.id}?tab=messages`
    : `${SITE_URL}/admin/partner-applications/${ctx.id}#messages`;
}

async function notifyRecipients(
  service: SupabaseClient,
  ctx: MessageApplicationContext,
  sender: MessageSender,
  message: ApplicationMessage,
): Promise<void> {
  const preview = messagePreview(message.body);
  const shortPreview = messagePreview(message.body, 160);
  const throttleOpen = (last: string | null) => shouldEmail(last, Date.now());

  // Student or partner wrote → tell SICA (inbox badge + throttled email).
  if (sender.role !== 'admin') {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || '';
    if (!isDeliverableEmail(adminEmail)) return;
    const last = await lastEmailedAt(service, ctx, [portalRoleFor(ctx.surface)], message.id);
    if (!throttleOpen(last)) return;
    const ok = await sendTemplatedEmail({
      to: adminEmail,
      slug: 'message.to_admin',
      locale: 'en',
      variables: {
        senderName: sender.name || (ctx.surface === 'student' ? ctx.studentName : ctx.companyName),
        senderKind: ctx.surface === 'student' ? 'student' : 'partner',
        studentName: ctx.studentName || '—',
        applicationRef: ctx.applicationRef || ctx.id.slice(0, 8),
        university: ctx.university || '—',
        messagePreview: preview,
        threadUrl: adminThreadUrl(ctx),
      },
      supabase: service,
    });
    if (ok) await markEmailed(service, message.id);
    return;
  }

  // SICA wrote to a student.
  if (ctx.surface === 'student') {
    if (!ctx.studentId) return;
    const linkUrl = `/student/applications/${ctx.id}?tab=messages`;
    const { error: notifErr } = await service.from('student_notifications').insert({
      student_id: ctx.studentId,
      title: 'New message from SICA',
      message: shortPreview,
      type: 'message',
      link_url: linkUrl,
    });
    if (notifErr) console.error('[application-messages] student notification failed:', notifErr.message);

    if (!isDeliverableEmail(ctx.studentEmail)) return;
    const last = await lastEmailedAt(service, ctx, ['admin'], message.id);
    if (!throttleOpen(last)) return;
    const locale = await lookupRecipientLocale({ studentId: ctx.studentId });
    const ok = await sendTemplatedEmail({
      to: ctx.studentEmail,
      slug: 'message.to_student',
      locale,
      variables: {
        firstName: ctx.studentFirstName || 'there',
        applicationRef: ctx.applicationRef || '',
        university: ctx.university || 'your chosen university',
        messagePreview: preview,
        threadUrl: `${SITE_URL}${linkUrl}`,
      },
      supabase: service,
    });
    if (ok) await markEmailed(service, message.id);
    return;
  }

  // SICA wrote to a partner: the application's creator + the org's active owners.
  if (!ctx.partnerId) return;
  const recipients = new Set<string>();
  if (ctx.createdByUserId) recipients.add(ctx.createdByUserId);
  const { data: owners } = await service
    .from('partner_team_members')
    .select('user_id')
    .eq('partner_id', ctx.partnerId)
    .eq('role', 'owner')
    .eq('status', 'active');
  for (const o of (owners ?? []) as Array<{ user_id: string | null }>) {
    if (o.user_id) recipients.add(o.user_id);
  }
  const userIds = [...recipients];
  if (userIds.length === 0) return;

  const linkUrl = `/partner/applications/${ctx.id}?tab=messages`;
  const { error: notifErr } = await service.from('partner_notifications').insert(
    userIds.map((userId) => ({
      user_id: userId,
      partner_application_id: ctx.id,
      title: `New message from SICA${ctx.studentName ? ` about ${ctx.studentName}` : ''}`,
      message: shortPreview,
      type: 'message',
      link_url: linkUrl,
    })),
  );
  if (notifErr) console.error('[application-messages] partner notification failed:', notifErr.message);

  const last = await lastEmailedAt(service, ctx, ['admin'], message.id);
  if (!throttleOpen(last)) return;
  const hydrated = await hydrateUserEmails(service, userIds);
  const emails = [
    ...new Set(
      userIds
        .map((id) => hydrated.get(id)?.email ?? null)
        .filter(isDeliverableEmail)
        .map((e) => e.trim().toLowerCase()),
    ),
  ];
  let anySent = false;
  for (const to of emails) {
    const ok = await sendTemplatedEmail({
      to,
      slug: 'message.to_partner',
      locale: 'en',
      variables: {
        companyName: ctx.companyName || 'partner',
        studentName: ctx.studentName || 'your student',
        applicationRef: ctx.applicationRef || '',
        university: ctx.university || '—',
        messagePreview: preview,
        threadUrl: `${SITE_URL}${linkUrl}`,
      },
      supabase: service,
    });
    anySent = anySent || ok;
  }
  if (anySent) await markEmailed(service, message.id);
}

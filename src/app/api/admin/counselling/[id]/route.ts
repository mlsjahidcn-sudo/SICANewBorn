import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import {
  isCounsellingBookingStatus,
  mapCounsellingBookingFromDb,
} from '@/lib/counselling-mapper';
import {
  sendCounsellingCancelled,
  sendCounsellingCompleted,
  sendCounsellingConfirmed,
  sendCounsellingMeetingLinkUpdated,
  sendCounsellingNoShow,
  sendCounsellingRescheduled,
  type LoggedSendTextResult,
} from '@/lib/email';
import {
  isCandidateSlot,
  isSlotWithinLeadWindow,
  parseSlotInstant,
} from '@/lib/counselling-slots';

export const dynamic = 'force-dynamic';

/**
 * Admin single-booking surface for counselling bookings.
 *
 * GET   /api/admin/counselling/[id]  — full row
 * PATCH /api/admin/counselling/[id]  — { status?, meetingLink?, adminNotes?, slotStartIso? }
 *
 * Phase 114: status moves re-check slot ownership when going to Confirmed.
 * Phase 123: status transitions email the student (Confirmed / Cancelled).
 * Phase 124: reschedule (slotStartIso) + meeting-link-only updates + the
 * full lifecycle (Rescheduled / Completed / No-show / meeting-link
 * updated) all email the student, audit-log to email_log, and the
 * reschedule also clears the reminder stamps so the new slot's
 * reminders fire fresh. All sends are fire-and-forget — failures land
 * in the server log; the API always returns the updated row.
 */
interface ResolvedAdminContext {
  ok: false;
  error: NextResponse;
}
interface ResolvedBookingContext {
  ok: true;
  id: string;
  userId: string;
  service: ReturnType<typeof buildServiceClient>;
}

/** Row snapshot taken before an update — used for the student email. */
interface PreviousBookingSnapshot {
  status: string;
  name: string;
  email: string;
  reference: string;
  slot_start: string;
  meeting_link: string | null;
  locale: string | null;
}

async function resolveAdminContext(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
): Promise<ResolvedAdminContext | ResolvedBookingContext> {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return { ok: false, error: NextResponse.json({ error: auth.error }, { status: auth.status }) };
  }
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/.test(id)) {
    return { ok: false, error: NextResponse.json({ error: 'Invalid booking id' }, { status: 400 }) };
  }
  return { ok: true, id, userId: auth.user.id, service: buildServiceClient() };
}

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const resolved = await resolveAdminContext(request, ctx);
  if (!resolved.ok) return resolved.error;

  const { data, error } = await resolved.service
    .from('counselling_bookings')
    .select('*')
    .eq('id', resolved.id)
    .maybeSingle();
  if (error) {
    console.error('[admin/counselling/[id] GET] supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  return NextResponse.json({ booking: mapCounsellingBookingFromDb(data) });
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const resolved = await resolveAdminContext(request, ctx);
  if (!resolved.ok) return resolved.error;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  let slotStartIso: string | null = null; // captured for reschedule checks

  if (body.status !== undefined) {
    if (!isCounsellingBookingStatus(body.status)) {
      return NextResponse.json(
        { error: `status must be one of: Pending, Confirmed, Completed, Cancelled, No-show` },
        { status: 400 },
      );
    }
    update.status = body.status;
  }

  if (body.meetingLink !== undefined) {
    const raw = typeof body.meetingLink === 'string' ? body.meetingLink.trim() : '';
    if (raw) {
      if (raw.length > 500) {
        return NextResponse.json({ error: 'meetingLink must be ≤ 500 chars' }, { status: 400 });
      }
      if (!/^https?:\/\//i.test(raw)) {
        return NextResponse.json(
          { error: 'meetingLink must start with http:// or https://' },
          { status: 400 },
        );
      }
    }
    update.meeting_link = raw || null;
  }

  if (body.adminNotes !== undefined) {
    const raw = typeof body.adminNotes === 'string' ? body.adminNotes.trim() : '';
    if (raw.length > 2000) {
      return NextResponse.json({ error: 'adminNotes must be ≤ 2000 chars' }, { status: 400 });
    }
    update.admin_notes = raw || null;
  }

  if (body.slotStartIso !== undefined) {
    const raw = typeof body.slotStartIso === 'string' ? body.slotStartIso : '';
    const parsed = parseSlotInstant(raw);
    if (!parsed) {
      return NextResponse.json({ error: 'slotStartIso must be an ISO instant' }, { status: 400 });
    }
    if (!isCandidateSlot(parsed)) {
      return NextResponse.json(
        { error: 'slotStartIso must be a candidate slot on its own Beijing date' },
        { status: 400 },
      );
    }
    if (!isSlotWithinLeadWindow(new Date(), parsed)) {
      return NextResponse.json(
        { error: 'slotStartIso must start at least 2h from now' },
        { status: 400 },
      );
    }
    slotStartIso = parsed.toISOString();
    update.slot_start = slotStartIso;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  // Phase 123/124: any meaningful change (status, slot, meetingLink)
  // emails the student — so snapshot the current row (and 404 early)
  // before mutating anything.
  let previous: PreviousBookingSnapshot | null = null;
  if (
    update.status !== undefined ||
    update.slot_start !== undefined ||
    update.meeting_link !== undefined
  ) {
    const { data: row, error: rowErr } = await resolved.service
      .from('counselling_bookings')
      .select('status, name, email, reference, slot_start, meeting_link, locale')
      .eq('id', resolved.id)
      .maybeSingle();
    if (rowErr) {
      console.error('[admin/counselling/[id] PATCH] supabase error:', rowErr);
      return NextResponse.json({ error: rowErr.message }, { status: 500 });
    }
    if (!row) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    previous = row as PreviousBookingSnapshot;
  }

  // Moving to Confirmed OR rescheduling re-checks slot ownership: another
  // live booking on the same instant wins. The DB partial unique index
  // (counselling_bookings_slot_live_unique) is the final arbiter — we
  // check here so we can return a friendly 409 before burning a write.
  const targetSlotIso = slotStartIso ?? (previous?.slot_start ?? null);
  if (targetSlotIso && (update.status === 'Confirmed' || update.slot_start !== undefined)) {
    const { data: clash } = await resolved.service
      .from('counselling_bookings')
      .select('id')
      .eq('slot_start', targetSlotIso)
      .in('status', ['Pending', 'Confirmed'])
      .neq('id', resolved.id)
      .maybeSingle();
    if (clash) {
      return NextResponse.json(
        { error: 'Another live booking already holds this slot' },
        { status: 409 },
      );
    }
  }
  if (update.status === 'Confirmed' && previous) {
    update.confirmed_at = new Date().toISOString();
  }

  // Phase 124: reschedule audit + reminder stamp reset.
  if (update.slot_start !== undefined && previous && update.slot_start !== previous.slot_start) {
    update.rescheduled_at = new Date().toISOString();
    update.original_slot_start = previous.slot_start;
    // The new slot's reminders must fire fresh — clear the stamps so
    // the next worker tick claims them.
    update.reminder_24h_at = null;
    update.reminder_2h_at = null;
  } else if (update.slot_start !== undefined && previous && update.slot_start === previous.slot_start) {
    // Same→same slot is a no-op — keep whatever the admin typed but
    // don't stamp rescheduled_at or clear reminders.
    delete update.rescheduled_at;
    delete update.original_slot_start;
    delete update.reminder_24h_at;
    delete update.reminder_2h_at;
  }

  // Phase 124: meeting-link change audit. We capture the previous link
  // for the email; the route fires the update-notification email only
  // when the new link differs from the previous AND status isn't moving
  // (status transitions handle their own emails).
  const meetingLinkChanged =
    update.meeting_link !== undefined &&
    previous !== null &&
    (update.meeting_link || null) !== (previous.meeting_link || null) &&
    !update.status; // skip if we're also moving status

  if (meetingLinkChanged) {
    update.previous_meeting_link = previous?.meeting_link ?? null;
    update.meeting_link_updated_at = new Date().toISOString();
  }

  const { data, error } = await resolved.service
    .from('counselling_bookings')
    .update(update)
    .eq('id', resolved.id)
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Another live booking already holds this slot' },
        { status: 409 },
      );
    }
    console.error('[admin/counselling/[id] PATCH] supabase error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

  // Phase 123/124: fire the student email on a real transition.
  // Fire-and-forget — failures land in the server log + email_log row.
  const bookingId = resolved.id;
  const adminUserId = resolved.userId;
  const snapshot = {
    name: data.name as string,
    email: data.email as string,
    reference: data.reference as string,
    previousSlotStartIso: previous?.slot_start ?? null,
    newSlotStartIso: data.slot_start as string,
    meetingLink: typeof data.meeting_link === 'string' && data.meeting_link ? data.meeting_link : null,
    locale: data.locale === 'zh' ? 'zh' : 'en',
  };

  let slug: string | null = null;
  let sendPromise: Promise<LoggedSendTextResult> | null = null;

  const slotMoved =
    previous !== null && update.slot_start !== undefined && previous.slot_start !== data.slot_start;
  const statusChanged =
    previous !== null && update.status !== undefined && previous.status !== data.status;

  if (slotMoved) {
    // Reschedule takes priority over the status-transition email.
    slug = 'counselling.rescheduled';
    sendPromise = sendCounsellingRescheduled({
      toEmail: snapshot.email,
      name: snapshot.name,
      reference: snapshot.reference,
      previousSlotStartIso: snapshot.previousSlotStartIso!,
      newSlotStartIso: snapshot.newSlotStartIso,
      meetingLink: snapshot.meetingLink,
      locale: snapshot.locale,
    });
  } else if (statusChanged) {
    const nextStatus = data.status as string;
    if (nextStatus === 'Confirmed') {
      slug = 'counselling.confirmed';
      sendPromise = sendCounsellingConfirmed({
        toEmail: snapshot.email,
        name: snapshot.name,
        reference: snapshot.reference,
        slotStartIso: snapshot.newSlotStartIso,
        meetingLink: snapshot.meetingLink,
        locale: snapshot.locale,
      });
    } else if (nextStatus === 'Cancelled') {
      slug = 'counselling.cancelled';
      sendPromise = sendCounsellingCancelled({
        toEmail: snapshot.email,
        name: snapshot.name,
        reference: snapshot.reference,
        slotStartIso: snapshot.newSlotStartIso,
        locale: snapshot.locale,
      });
    } else if (nextStatus === 'Completed') {
      slug = 'counselling.completed';
      sendPromise = sendCounsellingCompleted({
        toEmail: snapshot.email,
        name: snapshot.name,
        reference: snapshot.reference,
        slotStartIso: snapshot.newSlotStartIso,
        locale: snapshot.locale,
      });
    } else if (nextStatus === 'No-show') {
      slug = 'counselling.no_show';
      sendPromise = sendCounsellingNoShow({
        toEmail: snapshot.email,
        name: snapshot.name,
        reference: snapshot.reference,
        slotStartIso: snapshot.newSlotStartIso,
        locale: snapshot.locale,
      });
    }
  } else if (meetingLinkChanged) {
    slug = 'counselling.meeting_link_updated';
    sendPromise = sendCounsellingMeetingLinkUpdated({
      toEmail: snapshot.email,
      name: snapshot.name,
      reference: snapshot.reference,
      slotStartIso: snapshot.newSlotStartIso,
      newMeetingLink: snapshot.meetingLink ?? '',
      locale: snapshot.locale,
    });
  }

  if (slug && sendPromise) {
    void (async () => {
      try {
        const result = await sendPromise;
        if (result.subject === null) return; // pipeline unconfigured
        const { error: logErr } = await resolved.service.from('email_log').insert({
          lead_type: 'counselling',
          lead_id: bookingId,
          template_slug: slug,
          to_email: snapshot.email,
          to_name: snapshot.name,
          subject: result.subject,
          body_text: result.text,
          resend_message_id: result.id ?? null,
          status: result.ok ? 'sent' : 'failed',
          error: result.error ?? null,
          sent_by: adminUserId,
          sent_at: result.ok ? new Date().toISOString() : null,
        });
        if (logErr) {
          console.error('[admin/counselling/[id]] email_log insert failed:', logErr);
        }
      } catch (err) {
        console.error('[admin/counselling/[id]] lifecycle email failed:', err);
      }
    })();
  }

  return NextResponse.json({ booking: mapCounsellingBookingFromDb(data) });
}

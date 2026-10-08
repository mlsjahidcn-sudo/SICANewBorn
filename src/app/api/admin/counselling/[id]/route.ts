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
  sendCounsellingProposed,
  sendCounsellingRescheduled,
  type LoggedSendTextResult,
} from '@/lib/email';
import {
  isCandidateSlot,
  isSlotWithinLeadWindow,
  parseSlotInstant,
} from '@/lib/counselling-slots';
import { fetchOccupiedSlotInstants } from '@/lib/counselling/occupancy';
import { mintProposalToken } from '@/lib/counselling-tokens';

export const dynamic = 'force-dynamic';

/**
 * Admin single-booking surface for counselling bookings.
 *
 * GET   /api/admin/counselling/[id]  — full row
 * PATCH /api/admin/counselling/[id]  — { status?, meetingLink?, adminNotes?,
 *                                      slotStartIso?, proposedSlotStartIso?,
 *                                      proposalTtlHours?, clearProposal? }
 *
 * Phase 114: status moves re-check slot ownership when going to Confirmed.
 * Phase 123: status transitions email the student (Confirmed / Cancelled).
 * Phase 124: reschedule (slotStartIso) + meeting-link-only updates + the
 * full lifecycle (Rescheduled / Completed / No-show / meeting-link
 * updated) all email the student, audit-log to email_log, and the
 * reschedule also clears the reminder stamps so the new slot's
 * reminders fire fresh.
 * Phase 125: proposedSlotStartIso transitions the booking to a new
 * 'Proposed' status, mints a single-use token, and emails the student
 * an accept / counter magic link. clearProposal drops the proposal.
 * All sends are fire-and-forget — failures land in the server log;
 * the API always returns the updated row.
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
  proposed_slot_start: string | null;
  proposal_token: string | null;
  proposal_expires_at: string | null;
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

const PROPOSAL_DEFAULT_TTL_HOURS = 24 * 7; // 7 days
const PROPOSAL_MIN_TTL_HOURS = 1;
const PROPOSAL_MAX_TTL_HOURS = 24 * 14;

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
  let proposedSlotStartIso: string | null = null; // captured for propose-time slot checks

  if (body.status !== undefined) {
    if (!isCounsellingBookingStatus(body.status)) {
      return NextResponse.json(
        { error: `status must be one of: Pending, Proposed, Confirmed, Completed, Cancelled, No-show` },
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

  // Phase 125: admin proposes a slot — same validation as a reschedule.
  if (body.proposedSlotStartIso !== undefined) {
    if (body.clearProposal === true) {
      return NextResponse.json(
        { error: 'proposedSlotStartIso and clearProposal are mutually exclusive' },
        { status: 400 },
      );
    }
    const raw = typeof body.proposedSlotStartIso === 'string' ? body.proposedSlotStartIso : '';
    const parsed = parseSlotInstant(raw);
    if (!parsed) {
      return NextResponse.json(
        { error: 'proposedSlotStartIso must be an ISO instant' },
        { status: 400 },
      );
    }
    if (!isCandidateSlot(parsed)) {
      return NextResponse.json(
        { error: 'proposedSlotStartIso must be a candidate slot on its own Beijing date' },
        { status: 400 },
      );
    }
    if (!isSlotWithinLeadWindow(new Date(), parsed)) {
      return NextResponse.json(
        { error: 'proposedSlotStartIso must start at least 2h from now' },
        { status: 400 },
      );
    }
    proposedSlotStartIso = parsed.toISOString();
    update.proposed_slot_start = proposedSlotStartIso;
    // Token + expiry
    const ttlHours =
      typeof body.proposalTtlHours === 'number' &&
      Number.isFinite(body.proposalTtlHours) &&
      body.proposalTtlHours >= PROPOSAL_MIN_TTL_HOURS &&
      body.proposalTtlHours <= PROPOSAL_MAX_TTL_HOURS
        ? body.proposalTtlHours
        : PROPOSAL_DEFAULT_TTL_HOURS;
    update.proposal_token = mintProposalToken();
    update.proposal_expires_at = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString();
    // Phase 125: transitioning to a proposal switches status to
    // 'Proposed' UNLESS the admin is also explicitly setting status
    // (rare — admin may have already flipped to Cancelled).
    if (update.status === undefined) {
      update.status = 'Proposed';
    }
  }

  // Phase 125: drop the proposal.
  // Phase 151 (#4): removed the empty `if (update.status === undefined &&
  // body.status === undefined) { /* comment only */ }` block — the
  // revert-to-Pending logic actually runs AFTER the snapshot read
  // below (the next block), where the previous status is known.
  if (body.clearProposal === true) {
    update.proposed_slot_start = null;
    update.proposal_token = null;
    update.proposal_expires_at = null;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  // Phase 123/124/125: any meaningful change (status, slot, meetingLink,
  // proposal) emails the student — so snapshot the current row (and
  // 404 early) before mutating anything.
  let previous: PreviousBookingSnapshot | null = null;
  if (
    update.status !== undefined ||
    update.slot_start !== undefined ||
    update.meeting_link !== undefined ||
    update.proposed_slot_start !== undefined ||
    update.proposal_token !== undefined ||
    update.clearProposal !== undefined
  ) {
    const { data: row, error: rowErr } = await resolved.service
      .from('counselling_bookings')
      .select(
        'status, name, email, reference, slot_start, meeting_link, locale, proposed_slot_start, proposal_token, proposal_expires_at',
      )
      .eq('id', resolved.id)
      .maybeSingle();
    if (rowErr) {
      console.error('[admin/counselling/[id] PATCH] supabase error:', rowErr);
      return NextResponse.json({ error: rowErr.message }, { status: 500 });
    }
    if (!row) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    previous = row as PreviousBookingSnapshot;

    // Dropping a proposal without an explicit status: send the row
    // back to Pending if it was only at Proposed (no admin-confirmed
    // booking underneath).
    if (body.clearProposal === true && update.status === undefined && previous?.status === 'Proposed') {
      update.status = 'Pending';
    }
  }

  // Slot-ownership re-check: any update that targets a real slot
  // (reschedule OR confirm OR propose-time) needs to see if another
  // live booking — or another UNEXPIRED proposal (Phase 137) —
  // already holds it. The partial unique index is the final arbiter
  // for the booking half; the proposal half is app-side only (an
  // expiry predicate can't live in an index). Both checks exclude
  // this row so a booking never clashes with itself.
  const targetSlotIso = slotStartIso ?? proposedSlotStartIso ?? previous?.slot_start ?? null;
  if (
    targetSlotIso &&
    (update.status === 'Confirmed' || update.slot_start !== undefined || update.proposed_slot_start !== undefined)
  ) {
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
    const targetInstant = new Date(targetSlotIso);
    const occupied = await fetchOccupiedSlotInstants(
      resolved.service,
      [targetSlotIso],
      { excludeBookingId: resolved.id },
    );
    if (occupied.has(targetInstant.getTime())) {
      return NextResponse.json(
        {
          error:
            'This slot is on hold for another student (pending proposal) — pick a different time or wait for that proposal to expire',
        },
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
    update.reminder_24h_at = null;
    update.reminder_2h_at = null;
  } else if (update.slot_start !== undefined && previous && update.slot_start === previous.slot_start) {
    delete update.rescheduled_at;
    delete update.original_slot_start;
    delete update.reminder_24h_at;
    delete update.reminder_2h_at;
  }

  // Phase 124: meeting-link change audit.
  const meetingLinkChanged =
    update.meeting_link !== undefined &&
    previous !== null &&
    (update.meeting_link || null) !== (previous.meeting_link || null) &&
    !update.status;

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

  // Phase 123/124/125: fire the student email on a real transition.
  // Fire-and-forget — failures land in the server log + email_log row.
  const bookingId = resolved.id;
  const adminUserId = resolved.userId;
  const snapshot = {
    name: data.name as string,
    email: data.email as string,
    reference: data.reference as string,
    previousSlotStartIso: previous?.slot_start ?? null,
    newSlotStartIso: data.slot_start as string,
    meetingLink:
      typeof data.meeting_link === 'string' && data.meeting_link ? data.meeting_link : null,
    locale: data.locale === 'zh' ? 'zh' : 'en',
    previousProposedSlotStartIso: previous?.proposed_slot_start ?? null,
    newProposedSlotStartIso:
      typeof data.proposed_slot_start === 'string' ? data.proposed_slot_start : null,
    newProposalToken:
      typeof data.proposal_token === 'string' ? data.proposal_token : null,
    newProposalExpiresAt:
      typeof data.proposal_expires_at === 'string' ? data.proposal_expires_at : null,
  };

  let slug: string | null = null;
  let sendPromise: Promise<LoggedSendTextResult> | null = null;

  const slotMoved =
    previous !== null && update.slot_start !== undefined && previous.slot_start !== data.slot_start;
  const statusChanged =
    previous !== null && update.status !== undefined && previous.status !== data.status;
  // Phase 125: a fresh proposal = previous.proposed_slot_start is null
  // OR the proposed slot changed.
  const proposalJustSent =
    !!snapshot.newProposalToken &&
    (!previous ||
      previous.proposed_slot_start !== data.proposed_slot_start ||
      previous.proposal_token !== data.proposal_token);

  if (proposalJustSent) {
    // A proposal email wins over the status-transition email when
    // both fire on the same PATCH (admin proposed + status changed).
    slug = 'counselling.proposed';
    sendPromise = sendCounsellingProposed({
      toEmail: snapshot.email,
      name: snapshot.name,
      reference: snapshot.reference,
      proposedSlotStartIso: snapshot.newProposedSlotStartIso!,
      proposalToken: snapshot.newProposalToken!,
      proposalExpiresAtIso: snapshot.newProposalExpiresAt!,
      locale: snapshot.locale,
    });
  } else if (slotMoved) {
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

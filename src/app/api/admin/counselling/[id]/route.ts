import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import {
  isCounsellingBookingStatus,
  mapCounsellingBookingFromDb,
} from '@/lib/counselling-mapper';
import { sendCounsellingCancelled, sendCounsellingConfirmed } from '@/lib/email';

export const dynamic = 'force-dynamic';

/**
 * Admin single-booking surface for counselling bookings (Phase 114).
 *
 * GET   /api/admin/counselling/[id]  — full row
 * PATCH /api/admin/counselling/[id]  — { status?, meetingLink?, adminNotes? }
 *
 * Status moves are free-form within the closed set (an admin can
 * re-confirm a cancelled booking to reopen it), EXCEPT moving to
 * Confirmed, which re-checks the slot isn't held by another live
 * booking — the same rule the public POST enforces.
 *
 * Phase 123: a real status transition (same→same stays a no-op) to
 * Confirmed or Cancelled fires the matching student email and an
 * email_log row, both fire-and-forget — failures are logged, never
 * thrown. Completed / No-show / re-opening stay silent.
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

/** Row snapshot taken before a status change, used for the student email. */
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

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  // Phase 123: a status change emails the student, so snapshot the
  // current row (and 404 early) before mutating anything.
  let previous: PreviousBookingSnapshot | null = null;
  if (update.status !== undefined) {
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

  // Moving to Confirmed re-checks slot ownership: another live booking
  // on the same instant wins (the partial unique index can't express
  // "excluding this row", so it's checked here).
  if (update.status === 'Confirmed' && previous) {
    const { data: clash } = await resolved.service
      .from('counselling_bookings')
      .select('id')
      .eq('slot_start', previous.slot_start)
      .in('status', ['Pending', 'Confirmed'])
      .neq('id', resolved.id)
      .maybeSingle();
    if (clash) {
      return NextResponse.json(
        { error: 'Another live booking already holds this slot' },
        { status: 409 },
      );
    }
    update.confirmed_at = new Date().toISOString();
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

  // Phase 123: fire the student email on a real status transition.
  // Fire-and-forget — the response returns immediately; failures land
  // in the server log and the email_log row (when one is attempted).
  const nextStatus = typeof data.status === 'string' ? data.status : null;
  if (previous && nextStatus && nextStatus !== previous.status) {
    const slug =
      nextStatus === 'Confirmed'
        ? 'counselling.confirmed'
        : nextStatus === 'Cancelled'
          ? 'counselling.cancelled'
          : null;
    if (slug) {
      const bookingId = resolved.id;
      const adminUserId = resolved.userId;
      const snapshot = {
        name: previous.name,
        email: previous.email,
        reference: previous.reference,
        slotStartIso: previous.slot_start,
        meetingLink: typeof data.meeting_link === 'string' && data.meeting_link ? data.meeting_link : null,
        locale: data.locale === 'zh' ? 'zh' : 'en',
      };
      void (async () => {
        try {
          const result =
            slug === 'counselling.confirmed'
              ? await sendCounsellingConfirmed({
                  toEmail: snapshot.email,
                  name: snapshot.name,
                  reference: snapshot.reference,
                  slotStartIso: snapshot.slotStartIso,
                  meetingLink: snapshot.meetingLink,
                  locale: snapshot.locale,
                })
              : await sendCounsellingCancelled({
                  toEmail: snapshot.email,
                  name: snapshot.name,
                  reference: snapshot.reference,
                  slotStartIso: snapshot.slotStartIso,
                  locale: snapshot.locale,
                });
          if (result.subject === null) {
            // Email pipeline not configured — nothing was attempted.
            return;
          }
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
          console.error('[admin/counselling/[id]] status-change email failed:', err);
        }
      })();
    }
  }

  return NextResponse.json({ booking: mapCounsellingBookingFromDb(data) });
}

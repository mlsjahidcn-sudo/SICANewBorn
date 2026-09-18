import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import {
  isCounsellingBookingStatus,
  mapCounsellingBookingFromDb,
} from '@/lib/counselling-mapper';

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
 * booking — the same rule the public POST enforces. Emails on status
 * change are deliberately not wired yet: the admin sends the meeting
 * link by email/WhatsApp themselves (the row surfaces both contacts).
 */
interface ResolvedAdminContext {
  ok: false;
  error: NextResponse;
}
interface ResolvedBookingContext {
  ok: true;
  id: string;
  service: ReturnType<typeof buildServiceClient>;
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
  return { ok: true, id, service: buildServiceClient() };
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

  // Moving to Confirmed re-checks slot ownership: another live booking
  // on the same instant wins (the partial unique index can't express
  // "excluding this row", so it's checked here).
  if (update.status === 'Confirmed') {
    const { data: current } = await resolved.service
      .from('counselling_bookings')
      .select('slot_start')
      .eq('id', resolved.id)
      .maybeSingle();
    if (current?.slot_start) {
      const { data: clash } = await resolved.service
        .from('counselling_bookings')
        .select('id')
        .eq('slot_start', current.slot_start)
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

  return NextResponse.json({ booking: mapCounsellingBookingFromDb(data) });
}

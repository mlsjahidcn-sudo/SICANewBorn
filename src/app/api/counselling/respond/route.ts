import { NextRequest, NextResponse } from 'next/server';
import {
  isCandidateSlot,
  isSlotWithinLeadWindow,
  parseSlotInstant,
} from '@/lib/counselling-slots';
import { checkPublicRateLimit, isHoneypotFilled } from '@/lib/rate-limit';
import { buildServiceClient } from '@/lib/supabase-auth';
import { mintProposalToken } from '@/lib/counselling-tokens';
import { fetchOccupiedSlotInstants } from '@/lib/counselling/occupancy';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

interface RespondRow {
  id: string;
  status: string;
  email: string;
  name: string;
  reference: string;
  slot_start: string;
  proposed_slot_start: string | null;
  proposal_token: string | null;
  proposal_expires_at: string | null;
  meeting_link: string | null;
  locale: string | null;
  admin_email_for_notify: string | null;
}

/**
 * Public respond surface (Phase 125).
 *
 *   POST /api/counselling/respond
 *     { token, action: 'accept' | 'counter' | 'decline', newSlotStartIso?, website? }
 *
 * - `token` is the single-use 32-byte base64url token emailed to the
 *   student (verified against counselling_bookings.proposal_token).
 * - `accept` confirms the proposed slot — sets slot_start =
 *   proposed_slot_start, status = 'Confirmed', clears proposal columns.
 *   Triggers the standard Confirmed email + .ics.
 * - `counter` records a different slot the student picked: replaces
 *   proposed_slot_start + re-mints a new token, status stays
 *   'Proposed', sends a fresh proposed email to the student and an
 *   admin notification email.
 * - `decline` just records decline (no slot change) — admin sees the
 *   flag on the row (status stays 'Proposed' but proposal_token is
 *   cleared so the magic link is dead).
 *
 * Honeypot + public rate limit (10/IP/hour) before body parse. The
 * route is public — no login — but the token row read + uniqueness
 * check is the security boundary.
 */
export async function POST(request: NextRequest) {
  const rl = checkPublicRateLimit({
    action: 'counselling-respond',
    request,
    maxPerIp: 10,
    maxGlobal: 200,
    windowMs: 60 * 60 * 1000,
  });
  if (rl.blocked) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${rl.retryAfterSec}s.` },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (isHoneypotFilled(body)) {
    return NextResponse.json({ ok: true, action: 'accept' });
  }

  const token = typeof body.token === 'string' ? body.token : '';
  const action = body.action === 'accept' || body.action === 'counter' || body.action === 'decline'
    ? body.action
    : null;
  if (!token || !action) {
    return NextResponse.json({ error: 'token and action are required' }, { status: 400 });
  }

  const supabase = buildServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const { data: row, error: rowErr } = await supabase
    .from('counselling_bookings')
    .select(
      'id, status, email, name, reference, slot_start, proposed_slot_start, proposal_token, proposal_expires_at, meeting_link, locale',
    )
    .eq('proposal_token', token)
    .maybeSingle<RespondRow>();
  if (rowErr) {
    console.error('[counselling/respond] row read failed:', rowErr);
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }
  if (!row) {
    return NextResponse.json({ error: 'This link is no longer valid.' }, { status: 404 });
  }

  if (row.status !== 'Proposed' || !row.proposed_slot_start || !row.proposal_expires_at) {
    return NextResponse.json(
      { error: 'This proposal is no longer open. Please book a new time at /counselling.' },
      { status: 409 },
    );
  }

  if (new Date(row.proposal_expires_at).getTime() < Date.now()) {
    return NextResponse.json(
      { error: 'This proposal expired. Please book a new time at /counselling.' },
      { status: 410 },
    );
  }

  if (action === 'decline') {
    // Drop the proposal columns — status stays 'Proposed' so the admin
    // sees the decline in their list (admin re-proposes or cancels).
    // #3 (Phase 151): .eq('proposal_token', token) guards against a
    // parallel-decline race; matches zero rows if the token was already
    // consumed. We don't error — decline is idempotent.
    await supabase
      .from('counselling_bookings')
      .update({ proposal_token: null, proposal_expires_at: null })
      .eq('id', row.id)
      .eq('proposal_token', token);
    return NextResponse.json({ ok: true, action: 'decline', reference: row.reference });
  }

  if (action === 'accept') {
    // #2 (Phase 151): the partial unique index only covers
    // (Pending|Confirmed) bookings at slot_start. If another
    // unexpired admin proposal holds proposed_slot_start right
    // now, accepting this one would silently steal the slot from
    // that other student. Check via the shared Phase 137 occupancy
    // lib before mutating.
    const acceptOccupied = await fetchOccupiedSlotInstants(supabase, [row.proposed_slot_start!], {
      excludeBookingId: row.id,
    });
    if (acceptOccupied.size > 0) {
      return NextResponse.json(
        { error: 'This slot was just reserved for someone else. Please book a new time at /counselling.' },
        { status: 409 },
      );
    }
    // Move slot_start to the proposed slot, confirm, clear proposal cols.
    // #3 (Phase 151): .eq('proposal_token', token) makes the magic link
    // truly single-use — two parallel POSTs with the same token can't
    // both succeed (the second UPDATE matches zero rows and 23505s).
    const { data: updated, error: updErr } = await supabase
      .from('counselling_bookings')
      .update({
        slot_start: row.proposed_slot_start,
        status: 'Confirmed',
        confirmed_at: new Date().toISOString(),
        proposal_token: null,
        proposal_expires_at: null,
        reminder_24h_at: null,
        reminder_2h_at: null,
      })
      .eq('id', row.id)
      .eq('proposal_token', token)
      .select('*')
      .single();
    if (updErr) {
      if (updErr.code === '23505') {
        return NextResponse.json(
          { error: 'Another booking already holds this slot.' },
          { status: 409 },
        );
      }
      // PGRST116 = .single() matched 0 rows (the token-conditional guard
      // already won, or the row moved out from under us). Treat as the
      // link-already-used case so the student gets a clear 409.
      if (updErr.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'This link has already been used.' },
          { status: 409 },
        );
      }
      console.error('[counselling/respond] accept update failed:', updErr);
      return NextResponse.json({ error: 'Could not confirm.' }, { status: 500 });
    }
    // Fire the Confirmed email + .ics (best-effort, never throws).
    void (async () => {
      try {
        const { sendCounsellingProposalAccepted } = await import('@/lib/email');
        const result = await sendCounsellingProposalAccepted({
          toEmail: updated.email as string,
          name: updated.name as string,
          reference: updated.reference as string,
          slotStartIso: updated.slot_start as string,
          meetingLink: typeof updated.meeting_link === 'string' ? updated.meeting_link : null,
          locale: updated.locale === 'zh' ? 'zh' : 'en',
        });
        if (result.subject === null) return;
        await supabase.from('email_log').insert({
          lead_type: 'counselling',
          lead_id: row.id,
          // #8 (Phase 151): `sendCounsellingProposalAccepted` delegates
          // to `sendCounsellingConfirmed` which renders the
          // `counselling.confirmed` template — log that slug so the
          // audit row matches what was actually rendered.
          template_slug: 'counselling.confirmed',
          to_email: updated.email,
          to_name: updated.name,
          subject: result.subject,
          body_text: result.text,
          resend_message_id: result.id ?? null,
          status: result.ok ? 'sent' : 'failed',
          error: result.error ?? null,
          sent_at: result.ok ? new Date().toISOString() : null,
        });
      } catch (err) {
        console.error('[counselling/respond] accepted email failed:', err);
      }
    })();
    return NextResponse.json({ ok: true, action: 'accept', reference: row.reference });
  }

  // counter
  const rawSlot = typeof body.newSlotStartIso === 'string' ? body.newSlotStartIso : '';
  const parsed = parseSlotInstant(rawSlot);
  if (!parsed) {
    return NextResponse.json({ error: 'newSlotStartIso must be an ISO instant' }, { status: 400 });
  }
  if (!isCandidateSlot(parsed)) {
    return NextResponse.json(
      { error: 'newSlotStartIso must be a candidate slot on its own Beijing date' },
      { status: 400 },
    );
  }
  if (!isSlotWithinLeadWindow(new Date(), parsed)) {
    return NextResponse.json(
      { error: 'newSlotStartIso must start at least 2h from now' },
      { status: 400 },
    );
  }
  // Slot-ownership re-check on the proposed new slot — another
  // booking OR another unexpired admin proposal might have grabbed
  // it since the original proposal. #1 (Phase 151): use the shared
  // Phase 137 occupancy lib so proposals count too (the inline
  // slot_start-only check was the double-booking hole).
  const newSlotIso = parsed.toISOString();
  const counterOccupied = await fetchOccupiedSlotInstants(supabase, [newSlotIso], {
    excludeBookingId: row.id,
  });
  if (counterOccupied.size > 0) {
    return NextResponse.json(
      { error: 'That slot was just taken. Please pick another.' },
      { status: 409 },
    );
  }
  // Mint a fresh token (kills the old magic link) and fire both emails.
  const newToken = mintProposalToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h on counter-pick
  const { data: updated, error: updErr } = await supabase
    .from('counselling_bookings')
    .update({
      proposed_slot_start: newSlotIso,
      proposal_token: newToken,
      proposal_expires_at: expires,
      status: 'Proposed',
    })
    .eq('id', row.id)
    // #3 (Phase 151): same single-use token guard as the accept path.
    .eq('proposal_token', token)
    .select('*')
    .single();
  if (updErr) {
    if (updErr.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'This link has already been used.' },
        { status: 409 },
      );
    }
    console.error('[counselling/respond] counter update failed:', updErr);
    return NextResponse.json({ error: 'Could not record counter-proposal.' }, { status: 500 });
  }
  void (async () => {
    try {
      const { sendCounsellingProposed, sendCounsellingProposalDeclined } = await import('@/lib/email');
      const studentMail = await sendCounsellingProposed({
        toEmail: updated.email as string,
        name: updated.name as string,
        reference: updated.reference as string,
        proposedSlotStartIso: updated.proposed_slot_start as string,
        proposalToken: updated.proposal_token as string,
        proposalExpiresAtIso: updated.proposal_expires_at as string,
        locale: updated.locale === 'zh' ? 'zh' : 'en',
      });
      if (studentMail.subject) {
        await supabase.from('email_log').insert({
          lead_type: 'counselling',
          lead_id: row.id,
          template_slug: 'counselling.proposed',
          to_email: updated.email,
          to_name: updated.name,
          subject: studentMail.subject,
          body_text: studentMail.text,
          resend_message_id: studentMail.id ?? null,
          status: studentMail.ok ? 'sent' : 'failed',
          error: studentMail.error ?? null,
          sent_at: studentMail.ok ? new Date().toISOString() : null,
        });
      }
      // Admin notification (counter-proposal email)
      const adminMail = await sendCounsellingProposalDeclined({
        reference: updated.reference as string,
        name: updated.name as string,
        previousSlotStartIso: row.proposed_slot_start as string,
        newSlotStartIso: updated.proposed_slot_start as string,
        adminUrl: `${SITE_URL}/admin/counselling`,
      });
      if (adminMail.subject) {
        await supabase.from('email_log').insert({
          lead_type: 'counselling',
          lead_id: row.id,
          template_slug: 'counselling.proposal_declined',
          // #18 (Phase 151): log the actual recipient (ADMIN_EMAIL) —
          // previously this row recorded the student's email, which
          // made audit searches misleading.
          to_email: adminMail.to ?? (adminMail.error ? 'admin-error' : 'unknown'),
          to_name: 'SICA Admissions',
          subject: adminMail.subject,
          body_text: adminMail.text,
          resend_message_id: adminMail.id ?? null,
          status: adminMail.ok ? 'sent' : 'failed',
          error: adminMail.error ?? null,
          sent_at: adminMail.ok ? new Date().toISOString() : null,
        });
      }
    } catch (err) {
      console.error('[counselling/respond] counter emails failed:', err);
    }
  })();
  return NextResponse.json({ ok: true, action: 'counter', reference: row.reference });
}

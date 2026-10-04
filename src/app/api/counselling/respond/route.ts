import { NextRequest, NextResponse } from 'next/server';
import {
  isCandidateSlot,
  isSlotWithinLeadWindow,
  parseSlotInstant,
} from '@/lib/counselling-slots';
import { checkPublicRateLimit, isHoneypotFilled } from '@/lib/rate-limit';
import { buildServiceClient } from '@/lib/supabase-auth';
import { mintProposalToken } from '@/lib/counselling-tokens';
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
    await supabase
      .from('counselling_bookings')
      .update({ proposal_token: null, proposal_expires_at: null })
      .eq('id', row.id);
    return NextResponse.json({ ok: true, action: 'decline', reference: row.reference });
  }

  if (action === 'accept') {
    // Move slot_start to the proposed slot, confirm, clear proposal cols.
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
      .select('*')
      .single();
    if (updErr) {
      if (updErr.code === '23505') {
        return NextResponse.json(
          { error: 'Another booking already holds this slot.' },
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
          template_slug: 'counselling.proposal_accepted',
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
  // booking might have grabbed it since the original proposal.
  const newSlotIso = parsed.toISOString();
  const { data: clash } = await supabase
    .from('counselling_bookings')
    .select('id')
    .eq('slot_start', newSlotIso)
    .in('status', ['Pending', 'Confirmed'])
    .neq('id', row.id)
    .maybeSingle();
  if (clash) {
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
    .select('*')
    .single();
  if (updErr) {
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
          to_email: adminMail.error ? 'admin-error' : (updated.email as string),
          to_name: updated.name as string,
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

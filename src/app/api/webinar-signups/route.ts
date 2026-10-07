import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { isSupabaseServerConfigured, getSupabaseServer } from '@/lib/supabase-server';
import { checkPublicRateLimit, isHoneypotFilled } from '@/lib/rate-limit';
import { sendWebinarConfirmation } from '@/lib/email';
import {
  getActiveSessionEmailFields,
  getActiveSessionCapacity,
  getActiveSessionId,
  formatWebinarDate,
} from '@/lib/webinar-sessions';

export const dynamic = 'force-dynamic';

const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * Phase 139 + 140: public webinar signup endpoint for
 * /webinar-2027-intake-csc. Persists the row, fires the
 * `webinar.confirmed` email with the live session's join
 * link / date / time (Phase 140 — instead of the Phase 139
 * "TBA" defaults), and returns the row id so the client can
 * show a reference number on /thank-you.
 *
 * Anti-abuse: same 5/hr/IP + 200/hr/global + honeypot pattern
 * as /api/leads and /api/assessments.
 *
 * Phase 140 expanded the program_interests taxonomy to 7
 * values — March bachelor + PhD were missing from Phase 139.
 */

const VALID_PROGRAM_INTERESTS = [
  'chinese_language',
  'foundation',
  'bachelor_march',
  'bachelor',
  'master',
  'phd',
  'csc',
] as const;
type ProgramInterest = (typeof VALID_PROGRAM_INTERESTS)[number];

export async function POST(request: NextRequest) {
  const rl = checkPublicRateLimit({
    action: 'public-webinar-signups',
    request,
    maxPerIp: 5,
    maxGlobal: 200,
    windowMs: ONE_HOUR_MS,
  });
  if (rl.blocked) {
    return NextResponse.json(
      { error: 'Too many submissions. Please try again later.', retryAfterSec: rl.retryAfterSec },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } },
    );
  }

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Honeypot: bots that auto-complete every field give themselves
  // away. Fake a success so the bot can't tell which field betrayed
  // it — no DB row, no email.
  if (isHoneypotFilled(body)) {
    return NextResponse.json({ success: true });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  // Required fields
  const firstName = (body.firstName as string)?.trim();
  const lastName = (body.lastName as string)?.trim();
  const email = (body.email as string)?.trim();
  const whatsapp = (body.whatsapp as string)?.trim();
  if (!firstName || !lastName || !email || !whatsapp) {
    return NextResponse.json(
      { error: 'firstName, lastName, email, and WhatsApp are required' },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  // Whitelist program_interests against the closed enum so a
  // hostile client can't smuggle arbitrary text[] values into
  // the DB. Empty array is allowed (the form lets the user skip
  // the checkboxes and submit only the contact fields).
  const rawInterests = Array.isArray(body.programInterests) ? body.programInterests : [];
  const programInterests: ProgramInterest[] = rawInterests.filter(
    (v): v is ProgramInterest =>
      typeof v === 'string' && (VALID_PROGRAM_INTERESTS as readonly string[]).includes(v),
  );

  // Attribution (Phase 26 pattern). Explicit whitelisting —
  // never `...body` because PostgREST silently drops unknown
  // keys, which is exactly the "I sent it but the DB didn't
  // get it" trap.
  const sourcePage = (body.sourcePage as string) ?? null;
  const referrer = request.headers.get('referer') ?? null;
  const userAgent = request.headers.get('user-agent') ?? null;
  // Phase 141: extract country as a top-level variable so the
  // email sender can render the per-recipient local time. The
  // same trimmed string also flows into the webinar_signups
  // row below.
  const country = ((body.country as string)?.trim() ?? null) || null;
  const utmSource = (body.utmSource as string)?.trim() || null;
  const utmMedium = (body.utmMedium as string)?.trim() || null;
  const utmCampaign = (body.utmCampaign as string)?.trim() || null;
  const gclid = (body.gclid as string)?.trim() || null;
  const fbclid = (body.fbclid as string)?.trim() || null;

  // ip_hash: sha256 of the originating IP. Lets us dedup + flag
  // abuse without ever writing the raw IP to a long-lived table.
  // Falls back to a constant string when the IP is missing so
  // the column is never NULL from the public form path.
  const xff = request.headers.get('x-forwarded-for');
  const ip = (xff ? xff.split(',')[0]?.trim() : null) ?? 'unknown';
  const ipHash = createHash('sha256').update(ip).digest('hex');

  // Phase 142: capacity check. Reject with a stable
  // `error: 'session_full'` so the client form can branch
  // to the waitlist panel. Seat-holders are `status IN
  // ('Registered', 'Attended')` — Cancelled + No-Show free
  // the seat immediately. count: 'exact' so the cap is
  // real, not an estimate.
  const capacity = await getActiveSessionCapacity();
  if (!capacity.acceptsSignups) {
    if (capacity.maxAttendees === 0) {
      // No active session — staff hasn't set one up yet.
      return NextResponse.json(
        { error: 'No active webinar session — please check back later.' },
        { status: 409 },
      );
    }
    return NextResponse.json(
      {
        error: 'session_full',
        maxAttendees: capacity.maxAttendees,
      },
      { status: 409 },
    );
  }

  // Phase 144b: lookup the active session id once so the FK
  // gets populated on insert. Without this, every signup row
  // had webinar_session_id = null and the capacity count query
  // returned 0 forever — which is why the public counter was
  // stuck at 50/50 even after signups landed. The capacity
  // check above already verified the session exists, so this
  // cheap SELECT is a near-cache hit in practice.
  const activeSessionId = await getActiveSessionId();

  try {
    const { data, error } = await supabase
      .from('webinar_signups')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        whatsapp,
        country,
        program_interests: programInterests,
        notes: ((body.notes as string)?.trim() ?? null) || null,
        source_page: sourcePage,
        referrer,
        user_agent: userAgent,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        gclid,
        fbclid,
        ip_hash: ipHash,
        // Phase 144b: populate the FK so the capacity count query
        // (eq('webinar_session_id', id).in('Registered','Attended'))
        // finds the row. Nullable for backfill (the ON DELETE
        // SET NULL preserves historical signups if a session is
        // ever deleted), but every new signup since this commit
        // gets the FK populated.
        webinar_session_id: activeSessionId,
      })
      .select('id, created_at')
      .single();

    if (error) {
      console.error('[POST /api/webinar-signups] insert failed:', error);
      return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
    }

    // Fire-and-forget confirmation email. Failures are logged,
    // never propagated — the signup row already exists, so a
    // 500 here would just confuse the user (their seat is
    // reserved, they just didn't get the auto-email).
    //
    // Phase 140: pull the active session's email-render fields
    // so the email carries the real join link + date instead
    // of the Phase 139 placeholders. The helper falls back to
    // {null, null, null} when no session is active, and
    // `sendWebinarConfirmation` already substitutes its own
    // "TBA" defaults in that branch — so the API never breaks
    // even before staff seed a session.
    const sessionFields = await getActiveSessionEmailFields();
    const reference = `SICA-WEB-${data.id.slice(0, 8).toUpperCase()}`;
    sendWebinarConfirmation({
      toEmail: email,
      name: firstName,
      reference,
      locale: (body.locale as string) ?? 'en',
      joinLink: sessionFields.joinUrl,
      webinarDate: formatWebinarDate(sessionFields.webinarDateIso) || null,
      webinarTime: sessionFields.webinarTime,
      // Phase 141: pass the captured country so the email
      // can render the webinar time in the student's local
      // timezone alongside China time. Unknown / null falls
      // back to the China-time-only branch in
      // sendWebinarConfirmation.
      studentCountry: country || null,
    }).catch((err) => console.error('[POST /api/webinar-signups] confirmation email failed:', err));

    return NextResponse.json({ success: true, id: data.id, reference });
  } catch (err) {
    console.error('[POST /api/webinar-signups] unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

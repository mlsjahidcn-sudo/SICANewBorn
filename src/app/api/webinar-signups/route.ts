import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { isSupabaseServerConfigured, getSupabaseServer } from '@/lib/supabase-server';
import { checkPublicRateLimit, isHoneypotFilled } from '@/lib/rate-limit';
import { sendWebinarConfirmation } from '@/lib/email';
import { trackServer } from '@/lib/analytics';
import {
  getSessionEmailFieldsById,
  formatWebinarDate,
  getWebinarBySlug,
  getActiveSessionId,
} from '@/lib/webinar-sessions';

export const dynamic = 'force-dynamic';

const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * Phase 139 + 140 + 161: public webinar signup endpoint.
 *
 * Phase 139/140: persists the row + fires the `webinar.confirmed`
 * email with the session's join link / date / time.
 *
 * Phase 161 (per-webinar): the body may carry `webinarSlug` (the
 * /webinar/[slug] pages always send it). The slug is resolved to a
 * webinar_sessions row; a capped webinar that is full answers 409
 * `{ code: 'WEBINAR_FULL' }` so the client switches to waitlist
 * mode, and a closed/draft webinar answers 403
 * `{ code: 'WEBINAR_CLOSED' }`. When the last seat fills, the stored
 * registration_status flips to 'full' (best-effort — the computed
 * gate in `computeSeatInfo` is what actually enforces the cap, so a
 * missed flip can't overbook).
 *
 * No `webinarSlug` → legacy behaviour (Phase 158): link to the
 * active session when one exists, else land as an uncapped
 * "register your interest" row.
 *
 * Anti-abuse: 5/hr/IP + 200/hr/global + honeypot, same as
 * /api/leads and /api/assessments.
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
  // the DB.
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
  const country = ((body.country as string)?.trim() ?? null) || null;
  const utmSource = (body.utmSource as string)?.trim() || null;
  const utmMedium = (body.utmMedium as string)?.trim() || null;
  const utmCampaign = (body.utmCampaign as string)?.trim() || null;
  const gclid = (body.gclid as string)?.trim() || null;
  const fbclid = (body.fbclid as string)?.trim() || null;

  // ip_hash: sha256 of the originating IP. Lets us dedup + flag
  // abuse without ever writing the raw IP to a long-lived table.
  const xff = request.headers.get('x-forwarded-for');
  const ip = (xff ? xff.split(',')[0]?.trim() : null) ?? 'unknown';
  const ipHash = createHash('sha256').update(ip).digest('hex');

  // ---------------------------------------------------------------------
  // Phase 161: resolve the target webinar + enforce the seat gate.
  // ---------------------------------------------------------------------
  const webinarSlug = typeof body.webinarSlug === 'string' ? body.webinarSlug.trim() : '';
  let sessionId: string | null = null;
  let seatCap: number | null = null;
  let seatsTakenBefore = 0;

  if (webinarSlug) {
    const bundle = await getWebinarBySlug(webinarSlug);
    if (!bundle) {
      return NextResponse.json({ error: 'Webinar not found' }, { status: 404 });
    }
    const { seatInfo, session } = bundle;
    if (seatInfo.formMode === 'closed') {
      return NextResponse.json(
        { error: 'Registration for this webinar is closed', code: 'WEBINAR_CLOSED' },
        { status: 403 },
      );
    }
    if (seatInfo.formMode === 'waitlist') {
      return NextResponse.json(
        {
          error: 'This webinar is full — join the waitlist instead',
          code: 'WEBINAR_FULL',
        },
        { status: 409 },
      );
    }
    sessionId = session.id;
    seatCap = seatInfo.seatCap;
    seatsTakenBefore = seatInfo.seatsTaken;
  } else {
    // Legacy path (popup teaser / old page): active session when one
    // exists, else uncapped interest capture (Phase 158).
    sessionId = await getActiveSessionId();
  }

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
        webinar_session_id: sessionId,
      })
      .select('id, created_at')
      .single();

    if (error) {
      console.error('[POST /api/webinar-signups] insert failed:', error);
      return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
    }

    // Best-effort flip to 'full' when this signup took the last seat.
    // The computed gate above is the real enforcement — this write only
    // keeps the admin list honest. (Two concurrent final-seat requests
    // can overshoot the count by one; accepted trade-off from Phase 142.)
    if (seatCap !== null && sessionId && seatsTakenBefore + 1 >= seatCap) {
      void supabase
        .from('webinar_sessions')
        .update({ registration_status: 'full' })
        .eq('id', sessionId)
        .then((res) => {
          if (res.error) {
            console.warn('[POST /api/webinar-signups] full-flip failed:', res.error);
          }
        });
    }

    // Fire-and-forget confirmation email. Failures are logged,
    // never propagated — the signup row already exists, so a
    // 500 here would just confuse the user.
    const sessionFields = sessionId
      ? await getSessionEmailFieldsById(sessionId)
      : { joinUrl: null, webinarDateIso: null, webinarTime: null, titleEn: null };
    const reference = `SICA-WEB-${data.id.slice(0, 8).toUpperCase()}`;
    sendWebinarConfirmation({
      toEmail: email,
      name: firstName,
      reference,
      locale: (body.locale as string) ?? 'en',
      joinLink: sessionFields.joinUrl,
      webinarDate: formatWebinarDate(sessionFields.webinarDateIso) || null,
      webinarTime: sessionFields.webinarTime,
      studentCountry: country || null,
    }).catch((err) => console.error('[POST /api/webinar-signups] confirmation email failed:', err));

    // Phase 161: server-side funnel event, wrapped in its own try/catch
    // so an analytics failure can NEVER turn into a 500 after the row is
    // saved — the row exists, the seat is reserved, the user must see
    // success even if GA is down.
    try {
      trackServer('webinar_signup_created', {
        locale: (body.locale as string) === 'zh' ? 'zh' : 'en',
        webinar_slug: webinarSlug || null,
        signup_id: data.id,
      });
    } catch (analyticsErr) {
      console.warn('[POST /api/webinar-signups] analytics failed (non-fatal):', analyticsErr);
    }

    return NextResponse.json({ success: true, id: data.id, reference });
  } catch (err) {
    console.error('[POST /api/webinar-signups] unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { isSupabaseServerConfigured, getSupabaseServer } from '@/lib/supabase-server';
import { checkPublicRateLimit, isHoneypotFilled } from '@/lib/rate-limit';
import { trackServer } from '@/lib/analytics';
import { getWebinarBySlug } from '@/lib/webinar-sessions';

export const dynamic = 'force-dynamic';

const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * Phase 161: public waitlist join for a FULL webinar.
 *
 * Phase 142 built the waitlist; Phase 157 removed it ("no cap, no
 * waitlist"); Phase 161 restores it per-webinar (seat_cap is
 * opt-in per webinar — the legacy Oct 13 webinar stays uncapped).
 *
 * Body: { webinarSlug, firstName, lastName, email, whatsapp?,
 * country?, notes?, website (honeypot), utm* }. The slug is
 * resolved to a webinar_sessions row and the row lands in
 * webinar_waitlist keyed by session_id.
 *
 * Joining the waitlist of an OPEN webinar is allowed (never punish
 * a stale tab), but the client only offers it once capacity says
 * full.
 *
 * Phase 161 hard rule (carried over from the Phase 142 bug): the
 * `trackServer('webinar_waitlist_added', ...)` call lives in its
 * OWN try/catch — an analytics failure must never produce a 500
 * after the row is already saved.
 */
export async function POST(request: NextRequest) {
  const rl = checkPublicRateLimit({
    action: 'public-webinar-waitlist',
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

  if (isHoneypotFilled(body)) {
    return NextResponse.json({ success: true });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const webinarSlug = typeof body.webinarSlug === 'string' ? body.webinarSlug.trim() : '';
  const firstName = (body.firstName as string)?.trim();
  const lastName = (body.lastName as string)?.trim();
  const email = (body.email as string)?.trim();
  if (!webinarSlug || !firstName || !lastName || !email) {
    return NextResponse.json(
      { error: 'webinarSlug, firstName, lastName, and email are required' },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const bundle = await getWebinarBySlug(webinarSlug);
  if (!bundle) {
    return NextResponse.json({ error: 'Webinar not found' }, { status: 404 });
  }
  if (bundle.seatInfo.formMode === 'closed') {
    return NextResponse.json(
      { error: 'Registration for this webinar is closed', code: 'WEBINAR_CLOSED' },
      { status: 403 },
    );
  }

  const xff = request.headers.get('x-forwarded-for');
  const ip = (xff ? xff.split(',')[0]?.trim() : null) ?? 'unknown';
  const ipHash = createHash('sha256').update(ip).digest('hex');

  try {
    const { data, error } = await supabase
      .from('webinar_waitlist')
      .insert({
        session_id: bundle.session.id,
        email,
        first_name: firstName,
        last_name: lastName,
        whatsapp: ((body.whatsapp as string)?.trim() ?? null) || null,
        country: ((body.country as string)?.trim() ?? null) || null,
        notes: ((body.notes as string)?.trim() ?? null) || null,
        source_page: (body.sourcePage as string) ?? null,
        referrer: request.headers.get('referer') ?? null,
        user_agent: request.headers.get('user-agent') ?? null,
        utm_source: (body.utmSource as string)?.trim() || null,
        utm_medium: (body.utmMedium as string)?.trim() || null,
        utm_campaign: (body.utmCampaign as string)?.trim() || null,
        gclid: (body.gclid as string)?.trim() || null,
        fbclid: (body.fbclid as string)?.trim() || null,
        ip_hash: ipHash,
      })
      .select('id, created_at')
      .single();

    if (error) {
      console.error('[POST /api/webinar-waitlist] insert failed:', error);
      return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 });
    }

    // The Phase 142 bug, fixed at birth this time: analytics lives in
    // its own try/catch so the row that just saved can never be
    // followed by a 500 the user misreads as "join failed".
    try {
      trackServer('webinar_waitlist_added', {
        locale: (body.locale as string) === 'zh' ? 'zh' : 'en',
        webinar_slug: webinarSlug,
      });
    } catch (analyticsErr) {
      console.warn('[POST /api/webinar-waitlist] analytics failed (non-fatal):', analyticsErr);
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error('[POST /api/webinar-waitlist] unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

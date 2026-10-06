import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { isSupabaseServerConfigured, getSupabaseServer } from '@/lib/supabase-server';
import { checkPublicRateLimit, isHoneypotFilled } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * Phase 142: public waitlist capture for the active webinar
 * session. Mirrors `/api/webinar-signups` POST (same 5/hr/IP
 * + 200/hr/global rate limit, same honeypot pattern), but
 * inserts into `webinar_waitlist` instead.
 *
 * No email fires on capture — staff drains the table via
 * `/admin/webinar-signups` (Waitlist sub-tab in SessionsTab).
 * FIFO auto-promote is Phase 143+ if the 50-cap turns out to
 * be tight enough to warrant it.
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

  // Honeypot — bots that auto-complete every field betray
  // themselves. Fake success so they don't learn which field
  // gave them away.
  if (isHoneypotFilled(body)) {
    return NextResponse.json({ success: true });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  // Required: session is the active one (lookup), email +
  // first_name required. WhatsApp + notes optional.
  const email = (body.email as string)?.trim();
  const firstName = (body.firstName as string)?.trim();
  if (!email || !firstName) {
    return NextResponse.json(
      { error: 'firstName and email are required' },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  // Resolve the active session id (FK requirement).
  const { data: sessionRow, error: sessionErr } = await supabase
    .from('webinar_sessions')
    .select('id')
    .eq('is_active', true)
    .maybeSingle();
  if (sessionErr) {
    console.error('[POST /api/webinar-waitlist] session lookup failed:', sessionErr);
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
  if (!sessionRow) {
    return NextResponse.json(
      { error: 'No active webinar session — try again later' },
      { status: 409 },
    );
  }

  // Attribution (Phase 26 pattern) — explicit whitelisting.
  const sourcePage = (body.sourcePage as string) ?? null;
  const referrer = request.headers.get('referer') ?? null;
  const userAgent = request.headers.get('user-agent') ?? null;
  const utmSource = (body.utmSource as string)?.trim() || null;
  const utmMedium = (body.utmMedium as string)?.trim() || null;
  const utmCampaign = (body.utmCampaign as string)?.trim() || null;
  const gclid = (body.gclid as string)?.trim() || null;
  const fbclid = (body.fbclid as string)?.trim() || null;

  // ip_hash — sha256 of the originating IP. Never raw IP
  // (Phase 139 pattern).
  const xff = request.headers.get('x-forwarded-for');
  const ipRaw = (xff ? xff.split(',')[0]?.trim() : null) ?? 'unknown';
  const ipHash = createHash('sha256').update(ipRaw).digest('hex');

  try {
    const { data, error } = await supabase
      .from('webinar_waitlist')
      .insert({
        session_id: sessionRow.id as string,
        email,
        first_name: firstName,
        whatsapp: ((body.whatsapp as string)?.trim() ?? null) || null,
        source_page: sourcePage,
        referrer,
        user_agent: userAgent,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        gclid,
        fbclid,
        ip_hash: ipHash,
        notes: ((body.notes as string)?.trim() ?? null) || null,
      })
      .select('id, created_at')
      .single();

    if (error) {
      console.error('[POST /api/webinar-waitlist] insert failed:', error);
      return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error('[POST /api/webinar-waitlist] unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
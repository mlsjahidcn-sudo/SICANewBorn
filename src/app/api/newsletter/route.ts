import { NextRequest, NextResponse } from 'next/server';
import { checkPublicRateLimit } from '@/lib/rate-limit';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * POST /api/newsletter  { email: string, locale?: 'en' | 'zh' }
 *
 * Phase 93: backs the footer signup form (which was a mailto: stub
 * since S40). Upserts into newsletter_subscribers via the service-role
 * client. Responds 200 { ok: true } whether the address is new or
 * already subscribed — the unique constraint makes re-subscribing a
 * no-op, and not distinguishing the two avoids address enumeration.
 * No confirmation email — the monthly send itself is the confirmation,
 * and the drip-style unsubscribe flow can be wired in when the first
 * real send exists.
 */
export async function POST(request: NextRequest) {
  const rl = checkPublicRateLimit({
    action: 'public-newsletter',
    request,
    maxPerIp: 5,
    maxGlobal: 100,
    windowMs: ONE_HOUR_MS,
  });
  if (rl.blocked) {
    return NextResponse.json(
      { error: 'Too many subscribe attempts. Please try again later.', retryAfterSec: rl.retryAfterSec },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } },
    );
  }

  let body: { email?: unknown; locale?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email || !EMAIL_RE.test(email) || email.length > 320) {
    return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
  }
  const locale = body.locale === 'zh' ? 'zh' : 'en';

  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { error } = await supabaseServer
    .from('newsletter_subscribers')
    .upsert(
      { email, locale, source: 'footer' },
      { onConflict: 'email', ignoreDuplicates: true },
    );

  if (error) {
    console.error('[newsletter] upsert failed:', error.message);
    return NextResponse.json({ error: 'Could not subscribe right now' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

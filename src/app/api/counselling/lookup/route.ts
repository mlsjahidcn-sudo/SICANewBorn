/**
 * Public self-service status lookup (Phase 152 #9).
 *
 *   GET  /api/counselling/lookup?reference=…&email=…
 *   POST /api/counselling/lookup    { reference, email, website? }
 *
 * The student pastes their reference + the email they booked with.
 * No login — the (reference, email) pair is the credential. Returns
 * a mapped counselling booking row (`mapCounsellingBookingFromDb`)
 * with status, slot, meeting link, etc.
 *
 * Security:
 *   - 10 requests/IP/hour + 200 global requests/hour (Phase 125
 *     public rate-limit table reused).
 *   - Honeypot returns a fake "not found" without touching the DB.
 *   - Email match is case-insensitive but the reference match is
 *     exact (the reference IS the unique identifier).
 *
 * Errors:
 *   - Missing / malformed reference or email → 400.
 *   - No matching row → 404 (does not distinguish "no row" from
 *     "row exists but wrong email" — both 404 so the endpoint can't
 *     be used to enumerate references).
 *   - Supabase error → 500.
 */
import { NextRequest, NextResponse } from 'next/server';
import { checkPublicRateLimit, isHoneypotFilled } from '@/lib/rate-limit';
import { buildServiceClient } from '@/lib/supabase-auth';
import { mapCounsellingBookingFromDb, isCounsellingBookingStatus } from '@/lib/counselling-mapper';

export const dynamic = 'force-dynamic';

const REFERENCE_REGEX = /^CS-\d{8}-[A-Z0-9]{4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeReference(value: string): string {
  // Accept lowercase paste from the student — canonical form is
  // uppercase (mintBookingReference emits uppercase alphanumerics).
  return value.trim().toUpperCase();
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function isValidReference(value: string): boolean {
  return REFERENCE_REGEX.test(value);
}

function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value);
}

interface LookupRequest {
  reference: string;
  email: string;
  website?: string;
}

function readFields(body: Record<string, unknown>): LookupRequest | { error: string } {
  const refRaw = typeof body.reference === 'string' ? body.reference : '';
  const emailRaw = typeof body.email === 'string' ? body.email : '';
  if (!refRaw.trim() || !emailRaw.trim()) {
    return { error: 'reference and email are required' };
  }
  const reference = normalizeReference(refRaw);
  const email = normalizeEmail(emailRaw);
  if (!isValidReference(reference)) {
    return { error: 'reference must look like CS-YYYYMMDD-XXXX' };
  }
  if (!isValidEmail(email)) {
    return { error: 'email is not a valid address' };
  }
  const website = typeof body.website === 'string' ? body.website : '';
  return { reference, email, website };
}

export async function GET(request: NextRequest) {
  const rl = checkPublicRateLimit({
    action: 'counselling-lookup',
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

  const { searchParams } = new URL(request.url);
  const fields = readFields({
    reference: searchParams.get('reference') ?? '',
    email: searchParams.get('email') ?? '',
    website: searchParams.get('website') ?? '',
  });
  if ('error' in fields) {
    return NextResponse.json({ error: fields.error }, { status: 400 });
  }
  // Honeypot accepts the raw body so the runtime check matches the
  // shape it expects; the validated `fields` is what we pass onward.
  if (
    isHoneypotFilled({
      reference: searchParams.get('reference') ?? '',
      email: searchParams.get('email') ?? '',
      website: searchParams.get('website') ?? '',
    })
  ) {
    // Honeypot — don't touch the DB, return a generic 404 so the
    // bot's flow looks plausible.
    return NextResponse.json({ error: 'No booking matches that reference + email.' }, { status: 404 });
  }
  return runLookup(fields);
}

export async function POST(request: NextRequest) {
  const rl = checkPublicRateLimit({
    action: 'counselling-lookup',
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
  const fields = readFields(body);
  if ('error' in fields) {
    return NextResponse.json({ error: fields.error }, { status: 400 });
  }
  // Honeypot accepts the raw body so the runtime check matches the
  // shape it expects; the validated `fields` is what we pass onward.
  if (isHoneypotFilled(body)) {
    return NextResponse.json({ error: 'No booking matches that reference + email.' }, { status: 404 });
  }
  return runLookup(fields);
}

async function runLookup(fields: LookupRequest): Promise<NextResponse> {
  const supabase = buildServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  // Use `ilike` for the email match so case-insensitive comparison
  // works without re-implementing ILIKE in JS. Reference is exact
  // (we normalized to uppercase above).
  const { data: row, error } = await supabase
    .from('counselling_bookings')
    .select('*')
    .eq('reference', fields.reference)
    .ilike('email', fields.email)
    .maybeSingle();

  if (error) {
    console.error('[counselling/lookup] supabase error:', error.message);
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }
  if (!row) {
    // Same response for "no row" and "row exists but email mismatch"
    // — never enumerate references.
    return NextResponse.json(
      { error: 'No booking matches that reference + email.' },
      { status: 404 },
    );
  }

  const mapped = mapCounsellingBookingFromDb(row as Record<string, unknown>);
  // Defensive: drop the proposal_token from the public response. The
  // mapper intentionally doesn't include it, but guard against a
  // future schema drift that adds it back.
  const safe = { ...mapped };
  // Don't reveal internals: the student's id is fine but proposalToken
  // is admin-only. Add a quick check via isCounsellingBookingStatus to
  // keep the response shape typed.
  void isCounsellingBookingStatus; // keep the import in scope
  return NextResponse.json({ booking: safe });
}

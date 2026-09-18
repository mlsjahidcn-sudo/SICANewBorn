import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseServerConfigured, getSupabaseServer } from '@/lib/supabase-server';
import {
  checkPublicRateLimit,
  isHoneypotFilled,
} from '@/lib/rate-limit';
import {
  beijingTodayStr,
  formatBeijingLabel,
  isCandidateSlot,
  isCounsellingEducationLevel,
  isSlotWithinLeadWindow,
  parseSlotInstant,
} from '@/lib/counselling-slots';
import {
  sendCounsellingAdminNotification,
  sendCounsellingConfirmation,
} from '@/lib/email';

export const dynamic = 'force-dynamic';

const ONE_HOUR_MS = 60 * 60 * 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Loose international phone shape: digits with optional +, spaces,
// dashes, parentheses. The phone is a contact method, not an identity —
// the DB never dials it.
const PHONE_RE = /^[+()\-\s\d]{5,25}$/;

// Reference suffix alphabet — no 0/O/1/I so a lead can read it over
// the phone without ambiguity.
const REF_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function mintBookingReference(now: Date): string {
  const bytes = randomBytes(4);
  let suffix = '';
  for (let i = 0; i < bytes.length; i++) {
    suffix += REF_ALPHABET[bytes[i] % REF_ALPHABET.length];
  }
  return `CS-${beijingTodayStr(now).replaceAll('-', '')}-${suffix}`;
}

function asTrimmed(value: unknown, maxLen: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLen);
}

/**
 * Public booking endpoint for the free 10-minute counselling session
 * (Phase 114). Creates a Pending booking that an admin confirms from
 * /admin/counselling.
 *
 * Defense in depth against double-booking: the route checks for an
 * existing live booking on the slot, but the DB's partial unique
 * index (status in Pending/Confirmed) is the final arbiter — a race
 * surfaces as 23505 and is answered with 409.
 */
export async function POST(request: NextRequest) {
  // Rate limit BEFORE parsing — malformed spam still counts, same as
  // /api/leads. 3 per IP per hour: a real lead books once; a script
  // farming slots trips this fast.
  const rl = checkPublicRateLimit({
    action: 'counselling-bookings',
    request,
    maxPerIp: 3,
    maxGlobal: 60,
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

  // Honeypot: fake success, no row, no email (bots auto-fill `website`).
  if (isHoneypotFilled(body)) {
    return NextResponse.json({ success: true });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  // --- Field validation (explicit whitelist, never spread `body`) ---
  const name = asTrimmed(body.name, 80);
  const email = asTrimmed(body.email, 254)?.toLowerCase() ?? null;
  const phone = asTrimmed(body.phone, 25);
  const country = asTrimmed(body.country, 60);
  const topic = asTrimmed(body.topic, 500);
  const locale = body.locale === 'zh' ? 'zh' : 'en';
  const sourcePage = asTrimmed(body.sourcePage, 200);

  if (!name || name.length < 2) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
  }
  if (!phone || !PHONE_RE.test(phone)) {
    return NextResponse.json({ error: 'A valid phone / WhatsApp number is required' }, { status: 400 });
  }
  // Undefined / empty → null (optional field). A junk value that isn't
  // in the closed set is a 400, not a silent 'other'.
  const rawEducation = asTrimmed(body.educationLevel, 40);
  if (rawEducation && !isCounsellingEducationLevel(rawEducation)) {
    return NextResponse.json({ error: 'Invalid educationLevel' }, { status: 400 });
  }

  // Phase 26 marketing attribution — same whitelist as /api/leads.
  const utmSource = asTrimmed(body.utmSource, 200);
  const utmMedium = asTrimmed(body.utmMedium, 200);
  const utmCampaign = asTrimmed(body.utmCampaign, 200);
  const gclid = asTrimmed(body.gclid, 200);
  const fbclid = asTrimmed(body.fbclid, 200);

  // --- Slot validation: parse, then prove it's a real grid slot ---
  const slotStart = parseSlotInstant(body.slotStart);
  if (!slotStart) {
    return NextResponse.json({ error: 'slotStart must be an ISO instant' }, { status: 400 });
  }
  const now = new Date();
  if (!isCandidateSlot(slotStart)) {
    return NextResponse.json(
      { error: 'That time is not an available session slot' },
      { status: 400 },
    );
  }
  if (!isSlotWithinLeadWindow(now, slotStart)) {
    return NextResponse.json(
      { error: 'That slot is too soon or already past — pick a later time' },
      { status: 400 },
    );
  }

  const slotIso = slotStart.toISOString();

  // Pre-insert check for a friendlier error; the DB unique index is
  // the real guard (see 23505 handling below).
  const { data: existing } = await supabase
    .from('counselling_bookings')
    .select('id')
    .eq('slot_start', slotIso)
    .in('status', ['Pending', 'Confirmed'])
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: 'That slot was just taken — please pick another time' },
      { status: 409 },
    );
  }

  const reference = mintBookingReference(now);

  const { data, error: insertError } = await supabase
    .from('counselling_bookings')
    .insert({
      reference,
      name,
      email,
      phone,
      country,
      education_level: rawEducation ?? null,
      topic,
      slot_start: slotIso,
      status: 'Pending',
      locale,
      source_page: sourcePage,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      gclid,
      fbclid,
    })
    .select('id, reference')
    .single();

  if (insertError) {
    // Unique violation on the partial index = lost the race for the slot.
    if (insertError.code === '23505') {
      return NextResponse.json(
        { error: 'That slot was just taken — please pick another time' },
        { status: 409 },
      );
    }
    console.error('[POST /api/counselling/bookings] insert failed:', insertError);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }

  const bookingReference = (data.reference as string) ?? reference;

  // Fire-and-forget emails — a failed send never fails the booking.
  sendCounsellingAdminNotification({
    reference: bookingReference,
    name,
    email,
    phone,
    country,
    educationLevel: rawEducation ?? null,
    topic,
    slotStartIso: slotIso,
    locale,
  }).catch((err) => console.error('[POST /api/counselling/bookings] admin email failed:', err));
  sendCounsellingConfirmation({
    toEmail: email,
    name,
    reference: bookingReference,
    slotStartIso: slotIso,
    locale,
  }).catch((err) => console.error('[POST /api/counselling/bookings] confirmation email failed:', err));

  return NextResponse.json(
    {
      success: true,
      booking: {
        id: data.id,
        reference: bookingReference,
        slotStart: slotIso,
        slotLabel: formatBeijingLabel(slotStart),
        status: 'Pending',
      },
    },
    { status: 201 },
  );
}

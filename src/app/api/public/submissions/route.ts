import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import {
  checkPublicRateLimit,
  isHoneypotFilled,
} from '@/lib/rate-limit';
import { mapPartnerApplicationToDb } from '@/lib/partner-application-mapper';
import { mapPartnerStudentToDb } from '@/lib/partner-student-mapper';
import { validatePartnerApplicationPayload } from '@/lib/partner-application-validation';

export const dynamic = 'force-dynamic';

/**
 * Phase 75: Public application submission form — no auth, no token.
 *
 * Endpoint:  POST /api/public/submissions
 * Auth:      None. Anyone can submit.
 * Use case:  A partner tells a student "go to studyinchina.academy/apply
 *            and fill this in". Student fills the form, gets a reference
 *            number, and admin picks it up in /admin/partner-applications.
 *
 * Hardening:
 *   - Per-IP rate limit (5/hr) + global cap (50/hr) — bots can spam
 *     but each spam costs them a request that the admin can ignore.
 *   - Honeypot field `website` (hidden via CSS, never filled by
 *     humans). Filled => fake 200 (don't teach bots which field to drop).
 *   - Service-role client (RLS bypass) — same pattern as /api/seed
 *     and the other admin-only mutations. The sentinel partner_id
 *     (Direct / Unassigned) is the partner_id, no real partner user
 *     owns it, so partner-portal RLS cannot read or modify these rows.
 *
 * Submission flow:
 *   1. Validate body with the shared partner-application validator
 *      (length overflows, malformed emails, enum typos, etc).
 *   2. Resolve partner_id: if the student picked a real partner
 *      from the optional dropdown, use that; otherwise default to
 *      the sentinel "Direct / Unassigned" partner.
 *   3. Create a `partner_students` row for the new student.
 *   4. Create a `partner_applications` row with `source='public_form'`,
 *      `status='Draft'`, `decision='Pending'`, and the auto-minted
 *      application_number (PA-YYYY-NNNN).
 *   5. Return { application, application_number } so the client
 *      can show a confirmation page.
 */

const DirectPartnerId = '00000000-0000-0000-0000-0000000000d1';

const SubmitPayload = z.object({
  // Honeypot — never filled by humans. Filled => fake 200.
  website: z.string().optional(),
  // Student
  studentName: z.string().min(1).max(255),
  studentEmail: z.string().email().max(255).optional().or(z.literal('')),
  studentPhone: z.string().min(5).max(50).optional().or(z.literal('')),
  nationality: z.string().max(100).optional().or(z.literal('')),
  // Program
  university: z.string().max(255).optional().or(z.literal('')),
  program: z.string().max(255).optional().or(z.literal('')),
  degree: z.enum(['Bachelor', 'Master', 'PhD']).optional().or(z.literal('')),
  intake: z.string().max(100).optional().or(z.literal('')),
  // Academics (all optional — admin can request transcripts later)
  gpa: z.string().max(16).optional().or(z.literal('')),
  englishTest: z.enum(['IELTS', 'TOEFL', 'Duolingo', 'PTE', 'Other']).optional().or(z.literal('')),
  englishScore: z.string().max(16).optional().or(z.literal('')),
  // Narrative (optional, 500 char cap)
  whyProgram: z.string().max(500).optional().or(z.literal('')),
  // Partner attribution (optional)
  referringPartnerId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Service not configured' }, { status: 503 });
  }

  // Rate limit FIRST (before parsing the body). Bots looping on
  // 400 still burn their per-IP bucket.
  const limit = checkPublicRateLimit({
    action: 'public-applications',
    request,
    maxPerIp: 5,        // 5 submissions per IP per hour
    maxGlobal: 50,      // 50 global cap
    windowMs: 60 * 60 * 1000,
  });
  if (limit.blocked) {
    return NextResponse.json(
      { error: 'Too many submissions. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(limit.retryAfterSec) },
      },
    );
  }

  // Parse + validate
  let raw: Record<string, unknown>;
  try {
    raw = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Honeypot: filled => fake success. Don't reveal which field.
  if (isHoneypotFilled(raw)) {
    return NextResponse.json({ ok: true, application_number: 'SPAM-IGNORED' });
  }

  const parsed = SubmitPayload.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Resolve referring partner. If the student picked one, verify
  // it's an Active partner in the DB (defends against a guessed
  // foreign UUID being attached to a row that doesn't belong to
  // them). The default sentinel partner is also "Active" in the seed.
  const service = buildServiceClient();
  let partnerId: string = DirectPartnerId;
  if (parsed.data.referringPartnerId) {
    const { data: partner, error: partnerErr } = await service
      .from('partners')
      .select('id, status')
      .eq('id', parsed.data.referringPartnerId)
      .maybeSingle();
    if (partnerErr) {
      console.error('[public/submissions] partner lookup error:', partnerErr);
      return NextResponse.json({ error: 'Failed to look up referring partner' }, { status: 500 });
    }
    if (!partner) {
      return NextResponse.json({ error: 'Referring partner not found' }, { status: 400 });
    }
    if (partner.status !== 'Active') {
      return NextResponse.json({ error: 'Referring partner is not active' }, { status: 400 });
    }
    partnerId = partner.id;
  }

  // Build the partner-application payload. The shared validator
  // catches length overflows, bad emails, enum typos before they
  // hit the DB.
  const validationErrors = validatePartnerApplicationPayload(
    parsed.data as Record<string, unknown>,
    'create',
  );
  if (validationErrors.length > 0) {
    return NextResponse.json(
      { error: validationErrors[0].message, errors: validationErrors },
      { status: 400 },
    );
  }

  // 1. Create the partner_students row (the student).
  const studentRow = mapPartnerStudentToDb(parsed.data as Record<string, unknown>);
  studentRow.partner_id = partnerId;
  const { data: student, error: studentErr } = await service
    .from('partner_students')
    .insert(studentRow)
    .select('id')
    .single();
  if (studentErr || !student) {
    console.error('[public/submissions] partner_students insert error:', studentErr);
    return NextResponse.json(
      { error: 'Failed to create student record' },
      { status: 500 },
    );
  }

  // 2. Build the partner_applications payload.
  const appRow = mapPartnerApplicationToDb({
    ...(parsed.data as Record<string, unknown>),
    studentId: student.id,
  });
  // Server-derived, never trust the client
  appRow.partner_id = partnerId;
  appRow.student_id = student.id;
  appRow.status = 'Draft';
  appRow.decision = 'Pending';
  // Public-form submissions have no human created_by — leave null.
  delete appRow.created_by_user_id;
  // Distinguish from partner-portal submissions in admin views
  appRow.source = 'public_form';

  // 3. Auto-mint application_number (PA-YYYY-NNNN per partner counter).
  //    Same RPC the partner-portal uses — counter is per-partner,
  //    so all Direct / Unassigned submissions share the same sequence.
  const { data: minted, error: mintError } = await service.rpc(
    'next_partner_app_number',
    { p_partner_id: partnerId },
  );
  if (mintError) {
    console.warn('[public/submissions] next_partner_app_number failed:', mintError);
  } else if (typeof minted === 'string' && minted) {
    appRow.application_number = minted;
  }

  // 4. Insert the application.
  const { data: app, error: appErr } = await service
    .from('partner_applications')
    .insert(appRow)
    .select('id, application_number')
    .single();
  if (appErr || !app) {
    console.error('[public/submissions] partner_applications insert error:', appErr);
    // Best-effort cleanup: orphan the student row so we don't have a
    // half-state. (We can afford to lose a public-form student; the
    // student can re-submit.)
    await service.from('partner_students').delete().eq('id', student.id);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      application_id: app.id,
      application_number: app.application_number,
      student_id: student.id,
      // Surface a small confirmation payload the success page can
      // render without a round-trip back to the DB.
      confirmation: {
        student_name: parsed.data.studentName,
        university: parsed.data.university || null,
        program: parsed.data.program || null,
      },
    },
    { status: 201 },
  );
}

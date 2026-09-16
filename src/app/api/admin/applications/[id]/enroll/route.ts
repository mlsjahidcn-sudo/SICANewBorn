import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient } from '@/lib/supabase-auth';
import { insertTimelineEvent } from '@/lib/timeline';
import {
  mapEnrollmentFromDb,
  type ApplicationEnrollment,
  type ApplicationEnrollmentDbRow,
} from '@/lib/application-history-mapper';

/**
 * Phase 107 / Batch 3 — mark an application as Enrolled.
 *
 * Only callable when the application is in 'Accepted' status. Writes a row
 * to application_enrollments (1:1 with the application via PK), stamps
 * student_applications.enrolled_at, and appends a stage_history event
 * (`Enrolled`).
 *
 * Admin-only. Idempotent at the API layer: re-running on an already-
 * enrolled application returns 409 (we do not silently overwrite a
 * completed enrollment — the admin should PATCH the existing row via
 * the timeline tab if they need to update deposit/visa).
 *
 * Request body:
 *   {
 *     deposit_amount?: string|number,    // 0..9999999999.99
 *     deposit_currency?: 'CNY'|'USD'|'EUR'|'GBP'|'JPY'|'KRW'|'HKD'|'SGD'|'AUD'|'CAD',
 *     deposit_paid_at?: string,         // ISO date or datetime
 *     visa_status?: 'Not Started'|'Documents Pending'|'Submitted'|'Approved'|'Rejected',
 *     arrival_date?: string,             // YYYY-MM-DD
 *     notes?: string,                    // free-text, <2000 chars
 *     internal?: boolean,                 // mirrors PATCH; prepends [internal]
 *   }
 */

const ALLOWED_VISA_STATUSES = [
  'Not Started',
  'Documents Pending',
  'Submitted',
  'Approved',
  'Rejected',
] as const;

type AllowedVisaStatus = (typeof ALLOWED_VISA_STATUSES)[number];

const ALLOWED_CURRENCIES = [
  'CNY',
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'KRW',
  'HKD',
  'SGD',
  'AUD',
  'CAD',
] as const;

const NOTES_MAX = 2000;

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function isVisaStatus(value: unknown): value is AllowedVisaStatus {
  return typeof value === 'string' && (ALLOWED_VISA_STATUSES as readonly string[]).includes(value);
}

function isCurrency(value: unknown): value is (typeof ALLOWED_CURRENCIES)[number] {
  return typeof value === 'string' && (ALLOWED_CURRENCIES as readonly string[]).includes(value);
}

function parseDateOnly(input: unknown): string | null {
  if (input === undefined || input === null || input === '') return null;
  if (typeof input !== 'string') return null;
  // Accept ISO date (YYYY-MM-DD) or full ISO datetime; store date-only
  // for arrival_date, datetime for deposit_paid_at.
  if (!/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(input)) return null;
  return input;
}

function parseDepositAmount(input: unknown): number | null | undefined {
  if (input === undefined || input === null || input === '') return null;
  if (typeof input === 'number') {
    if (!Number.isFinite(input) || input < 0) return undefined;
    return Math.round(input * 100) / 100;
  }
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed === '') return null;
    const n = Number(trimmed);
    if (!Number.isFinite(n) || n < 0) return undefined;
    return Math.round(n * 100) / 100;
  }
  return undefined;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.COZE_SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await context.params;
  if (!id) return badRequest('Missing id');

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return badRequest('Invalid JSON body');
  }

  // Validate optional fields up front so we don't write half-bad data.
  const visaStatusRaw = body.visa_status;
  if (visaStatusRaw !== undefined && !isVisaStatus(visaStatusRaw)) {
    return badRequest(
      `visa_status must be one of: ${ALLOWED_VISA_STATUSES.join(', ')}`,
    );
  }
  const currencyRaw = body.deposit_currency;
  if (currencyRaw !== undefined && currencyRaw !== null && currencyRaw !== '' && !isCurrency(currencyRaw)) {
    return badRequest(
      `deposit_currency must be one of: ${ALLOWED_CURRENCIES.join(', ')}`,
    );
  }
  const depositAmountParsed = parseDepositAmount(body.deposit_amount);
  if (depositAmountParsed === undefined) {
    return badRequest('deposit_amount must be a non-negative number');
  }
  const arrivalDate = parseDateOnly(body.arrival_date);
  if (body.arrival_date !== undefined && body.arrival_date !== null && body.arrival_date !== '' && arrivalDate === null) {
    return badRequest('arrival_date must be a YYYY-MM-DD string');
  }
  const depositPaidAt = parseDateOnly(body.deposit_paid_at);
  if (body.deposit_paid_at !== undefined && body.deposit_paid_at !== null && body.deposit_paid_at !== '' && depositPaidAt === null) {
    return badRequest('deposit_paid_at must be an ISO date or datetime string');
  }
  const notes = typeof body.notes === 'string' ? body.notes : null;
  if (notes !== null && notes.length > NOTES_MAX) {
    return badRequest(`notes must be ${NOTES_MAX} characters or fewer`);
  }
  const internalFlag = body.internal === true;

  const service = buildServiceClient();

  // Pre-read the application: must exist, must be Accepted, must NOT be
  // already enrolled.
  const { data: before, error: beforeErr } = await service
    .from('student_applications')
    .select('id, status, enrolled_at')
    .eq('id', id)
    .maybeSingle();
  if (beforeErr) {
    return NextResponse.json({ error: beforeErr.message }, { status: 500 });
  }
  if (!before) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }
  if (before.status !== 'Accepted') {
    return badRequest(
      `Application must be Accepted before enrolling (current: ${before.status})`,
    );
  }
  if (before.enrolled_at) {
    return NextResponse.json(
      { error: 'Application is already enrolled', code: 'ALREADY_ENROLLED' },
      { status: 409 },
    );
  }

  const now = new Date().toISOString();
  const enrollmentPayload = {
    application_id: id,
    enrolled_by: auth.user.id,
    enrolled_at: now,
    deposit_amount: depositAmountParsed,
    deposit_currency: typeof currencyRaw === 'string' && currencyRaw !== '' ? currencyRaw : 'CNY',
    deposit_paid_at: depositPaidAt,
    visa_status: (visaStatusRaw as AllowedVisaStatus | undefined) ?? 'Not Started',
    arrival_date: arrivalDate,
    notes: notes
      ? internalFlag
        ? `[internal] ${notes}`.slice(0, NOTES_MAX + INTERNAL_MARKER_OVERHEAD)
        : notes
      : internalFlag
        ? '[internal]'
        : null,
  };

  // 1. Write the enrollment row (1:1 PK so duplicate POSTs fail at the DB).
  const { data: enrollmentRow, error: enrollmentErr } = await service
    .from('application_enrollments')
    .insert(enrollmentPayload)
    .select('*')
    .single();
  if (enrollmentErr || !enrollmentRow) {
    return NextResponse.json(
      { error: enrollmentErr?.message ?? 'Enrollment insert failed' },
      { status: 400 },
    );
  }

  // 2. Stamp student_applications.enrolled_at.
  const { error: updateErr } = await service
    .from('student_applications')
    .update({ enrolled_at: now })
    .eq('id', id);
  if (updateErr) {
    console.error('[admin/applications /enroll] enrolled_at update failed:', updateErr);
    // The enrollment row exists — the UI will see the mismatch on next
    // refresh. Logged but not surfaced (admin retry isn't a clean path).
  }

  // 3. Append stage_history row so the admin timeline tab shows it.
  const { error: stageErr } = await service
    .from('application_stage_history')
    .insert({
      application_id: id,
      from_status: 'Accepted',
      to_status: 'Enrolled',
      actor_id: auth.user.id,
      actor_email: auth.user.email ?? null,
      actor_role: 'admin',
      note: internalFlag ? '[internal] Application marked as enrolled.' : 'Application marked as enrolled.',
    });
  if (stageErr) {
    console.error('[admin/applications /enroll] stage_history insert failed:', stageErr);
  }

  // 4. Legacy timeline table write (kept for student-side timeline tab
  //    parity).
  await insertTimelineEvent(service, {
    application_id: id,
    status: 'Enrolled',
    notes: 'Application marked as enrolled.',
    created_by: auth.user.id,
  });

  const enrollment: ApplicationEnrollment = mapEnrollmentFromDb(
    enrollmentRow as ApplicationEnrollmentDbRow,
  );
  return NextResponse.json({ enrollment }, { status: 201 });
}

const INTERNAL_MARKER_OVERHEAD = '[internal] '.length;
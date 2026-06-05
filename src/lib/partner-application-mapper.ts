/**
 * partner-application-mapper.ts
 *
 * Maps between the camelCase shape the partner portal UI uses and the
 * snake_case `partner_applications` DB table.
 *
 *   UI (camelCase)                    DB (snake_case)
 *   ────────────────────              ──────────────────
 *   id                  ↔             id
 *   partnerId           ↔             partner_id
 *   studentName         ↔             student_name
 *   university          ↔             university
 *   program             ↔             program
 *   status              ↔             status
 *   submittedAt         ↔             submitted_at
 *   decision            ↔             decision
 *   notes               ↔             notes
 *   createdAt           ↔             created_at
 *   updatedAt           ↔             updated_at
 *
 * The status set mirrors `student_applications` so admin + partner can
 * speak the same vocabulary: Draft | Submitted | In Review | Accepted
 * | Rejected | Withdrawn. (Partner usually only uses Draft, Submitted,
 * Accepted, Rejected in practice.)
 */

export const PARTNER_APPLICATION_STATUSES = [
  'Draft',
  'Submitted',
  'In Review',
  'Accepted',
  'Rejected',
  'Withdrawn',
] as const;
export type PartnerApplicationStatus = (typeof PARTNER_APPLICATION_STATUSES)[number];

export const PARTNER_APPLICATION_DECISIONS = [
  'Pending',
  'Accepted',
  'Rejected',
  'Waitlisted',
  'Deferred',
] as const;
export type PartnerApplicationDecision = (typeof PARTNER_APPLICATION_DECISIONS)[number];

export interface PartnerApplication {
  id: string;
  partnerId: string;
  studentName: string;
  university: string;
  program: string;
  status: PartnerApplicationStatus;
  submittedAt?: string | null;
  decision: PartnerApplicationDecision;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  // Phase 3: who created this row
  createdByUserId?: string | null;
  createdByEmail?: string | null;
}

export function parsePartnerApplicationStatus(input: unknown): PartnerApplicationStatus | null {
  if (typeof input !== 'string') return null;
  if ((PARTNER_APPLICATION_STATUSES as readonly string[]).includes(input)) {
    return input as PartnerApplicationStatus;
  }
  return null;
}

export function parsePartnerApplicationDecision(input: unknown): PartnerApplicationDecision | null {
  if (typeof input !== 'string') return null;
  if ((PARTNER_APPLICATION_DECISIONS as readonly string[]).includes(input)) {
    return input as PartnerApplicationDecision;
  }
  return null;
}

interface RawPartnerApplication {
  id: string;
  partner_id: string;
  student_name: string;
  university: string;
  program: string;
  status?: string | null;
  submitted_at?: string | null;
  decision?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  created_by_user_id?: string | null;
  created_by_email?: string | null;
}

export function mapPartnerApplicationFromDb(row: RawPartnerApplication): PartnerApplication {
  return {
    id: row.id,
    partnerId: row.partner_id,
    studentName: row.student_name,
    university: row.university,
    program: row.program,
    status: parsePartnerApplicationStatus(row.status) ?? 'Draft',
    submittedAt: row.submitted_at ?? null,
    decision: parsePartnerApplicationDecision(row.decision) ?? 'Pending',
    notes: row.notes ?? null,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
    createdByUserId: row.created_by_user_id ?? null,
    createdByEmail: row.created_by_email ?? null,
  };
}

export function mapPartnerApplicationToDb(
  payload: Record<string, unknown>,
): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (payload.studentName !== undefined) row.student_name = String(payload.studentName).trim();
  if (payload.university !== undefined) row.university = String(payload.university).trim();
  if (payload.program !== undefined) row.program = String(payload.program).trim();
  if (payload.status !== undefined) row.status = payload.status;
  if (payload.submittedAt !== undefined) row.submitted_at = payload.submittedAt || null;
  if (payload.decision !== undefined) row.decision = payload.decision;
  if (payload.notes !== undefined) row.notes = payload.notes || null;
  return row;
}

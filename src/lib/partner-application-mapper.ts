/**
 * partner-application-mapper.ts
 *
 * Maps between the camelCase shape the partner portal UI uses and the
 * snake_case `partner_applications` DB table.
 *
 *   UI (camelCase)                    DB (snake_case)
 *   ────────────────────              ──────────────────
 *   id                       ↔        id
 *   partnerId                ↔        partner_id
 *   studentName              ↔        student_name
 *   studentEmail             ↔        student_email
 *   studentPhone             ↔        student_phone
 *   university               ↔        university
 *   program                  ↔        program
 *   intake                   ↔        intake
 *   degree                   ↔        degree
 *   nationality              ↔        nationality
 *   priority                 ↔        priority
 *   applicationNumber        ↔        application_number
 *   status                   ↔        status
 *   submittedAt              ↔        submitted_at
 *   decision                 ↔        decision
 *   notes                    ↔        notes
 *   createdAt                ↔        created_at
 *   updatedAt                ↔        updated_at
 *   createdByUserId          ↔        created_by_user_id
 *   createdByEmail           ↔        created_by_email  (joined)
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

export const PARTNER_APPLICATION_PRIORITIES = [
  'Low',
  'Normal',
  'High',
  'Urgent',
] as const;
export type PartnerApplicationPriority = (typeof PARTNER_APPLICATION_PRIORITIES)[number];

export const PARTNER_APPLICATION_DEGREES = [
  'Bachelor',
  'Master',
  'PhD',
  'Chinese Language',
] as const;
export type PartnerApplicationDegree = (typeof PARTNER_APPLICATION_DEGREES)[number];

/**
 * Phase 4 (security hardening): server-enforced allow-list for
 * partner-driven status transitions. Mirrors the student portal's
 * STUDENT_STATUS_TRANSITIONS table — every PATCH that touches `status`
 * is checked against this map, and a status that isn't reachable
 * from the current state returns HTTP 400.
 *
 * Rules:
 *   - Same → same is a no-op (UI sends them, server short-circuits)
 *   - Accepted is terminal for the partner — admin writes the final
 *     decision via the admin portal, not the partner portal
 *   - The partner can re-open Rejected / Withdrawn back to Draft
 *     (the original event is preserved on the row, just not the
 *     status)
 *   - The Submitted → Submitted / In Review / Draft / Withdrawn
 *     fan-out covers the most common "I'm still working on it" and
 *     "changed my mind" cases
 */
export const PARTNER_STATUS_TRANSITIONS: Record<PartnerApplicationStatus, readonly PartnerApplicationStatus[]> = {
  Draft: ['Draft', 'Submitted', 'Withdrawn'],
  Submitted: ['Submitted', 'In Review', 'Draft', 'Withdrawn'],
  'In Review': ['In Review', 'Accepted', 'Rejected', 'Withdrawn'],
  // Terminal from the partner's perspective — only re-open back to
  // Draft is allowed (admin re-decisioning happens elsewhere).
  Accepted: ['Accepted', 'Draft'],
  Rejected: ['Rejected', 'Draft'],
  Withdrawn: ['Withdrawn', 'Draft'],
};

export function isPartnerStatusTransitionAllowed(
  from: PartnerApplicationStatus,
  to: PartnerApplicationStatus,
): boolean {
  const allowed = PARTNER_STATUS_TRANSITIONS[from] || [];
  return allowed.includes(to);
}

export interface PartnerApplication {
  id: string;
  partnerId: string;
  studentName: string;
  studentEmail?: string | null;
  studentPhone?: string | null;
  university: string;
  program: string;
  intake?: string | null;
  degree?: string | null;
  nationality?: string | null;
  priority: PartnerApplicationPriority;
  applicationNumber?: string | null;
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

export function parsePartnerApplicationPriority(input: unknown): PartnerApplicationPriority {
  if (typeof input !== 'string') return 'Normal';
  if ((PARTNER_APPLICATION_PRIORITIES as readonly string[]).includes(input)) {
    return input as PartnerApplicationPriority;
  }
  return 'Normal';
}

export function parsePartnerApplicationDegree(input: unknown): PartnerApplicationDegree | null {
  if (typeof input !== 'string') return null;
  if ((PARTNER_APPLICATION_DEGREES as readonly string[]).includes(input)) {
    return input as PartnerApplicationDegree;
  }
  return null;
}

interface RawPartnerApplication {
  id: string;
  partner_id: string;
  student_name: string;
  student_email?: string | null;
  student_phone?: string | null;
  university: string;
  program: string;
  intake?: string | null;
  degree?: string | null;
  nationality?: string | null;
  priority?: string | null;
  application_number?: string | null;
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
    studentEmail: row.student_email ?? null,
    studentPhone: row.student_phone ?? null,
    university: row.university,
    program: row.program,
    intake: row.intake ?? null,
    degree: row.degree ?? null,
    nationality: row.nationality ?? null,
    priority: parsePartnerApplicationPriority(row.priority),
    applicationNumber: row.application_number ?? null,
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
  if (payload.studentEmail !== undefined) row.student_email = payload.studentEmail || null;
  if (payload.studentPhone !== undefined) row.student_phone = payload.studentPhone || null;
  if (payload.university !== undefined) row.university = String(payload.university).trim();
  if (payload.program !== undefined) row.program = String(payload.program).trim();
  if (payload.intake !== undefined) row.intake = payload.intake || null;
  if (payload.degree !== undefined) {
    if (payload.degree && !parsePartnerApplicationDegree(payload.degree)) {
      throw new Error(
        `degree must be one of: ${PARTNER_APPLICATION_DEGREES.join(', ')}`,
      );
    }
    row.degree = payload.degree || null;
  }
  if (payload.nationality !== undefined) row.nationality = payload.nationality || null;
  if (payload.priority !== undefined) {
    const pri = parsePartnerApplicationPriority(payload.priority);
    row.priority = pri;
  }
  if (payload.applicationNumber !== undefined) {
    row.application_number = payload.applicationNumber || null;
  }
  if (payload.status !== undefined) row.status = payload.status;
  if (payload.submittedAt !== undefined) row.submitted_at = payload.submittedAt || null;
  if (payload.decision !== undefined) row.decision = payload.decision;
  if (payload.notes !== undefined) row.notes = payload.notes || null;
  return row;
}

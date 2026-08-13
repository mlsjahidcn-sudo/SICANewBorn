/**
 * partner-student-mapper.ts
 *
 * Maps between the camelCase shape the partner portal UI uses and the
 * snake_case `partner_students` DB table. Mirrors `student-mapper.ts`:
 *
 *   UI (camelCase)                    DB (snake_case)
 *   ────────────────────              ──────────────────
 *   id                  ↔             id
 *   partnerId           ↔             partner_id
 *   studentName         ↔             student_name
 *   studentEmail        ↔             student_email
 *   studentPhone        ↔             student_phone
 *   nationality         ↔             nationality
 *   targetUniversity    ↔             target_university
 *   targetProgram       ↔             target_program
 *   status              ↔             status
 *   notes               ↔             notes
 *   createdAt           ↔             created_at
 *   updatedAt           ↔             updated_at
 *
 * The status set is intentionally small and matches the existing
 * `PartnerStudent` interface in src/lib/data.ts (New | In Progress |
 * Applied | Accepted | Rejected). Hard-coded whitelist so a typo on
 * either side fails fast.
 */

export const PARTNER_STUDENT_STATUSES = [
  'New',
  'In Progress',
  'Applied',
  'Accepted',
  'Rejected',
] as const;
export type PartnerStudentStatus = (typeof PARTNER_STUDENT_STATUSES)[number];

export interface PartnerStudent {
  id: string;
  partnerId: string;
  studentName: string;
  studentEmail?: string | null;
  studentPhone?: string | null;
  nationality?: string | null;
  targetUniversity?: string | null;
  targetProgram?: string | null;
  status: PartnerStudentStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  // Phase 3: who created this row
  createdByUserId?: string | null;
  createdByEmail?: string | null;
  // Phase 50b: soft-delete markers. NULL = active. Non-null =
  // archived at this time. Set via the DELETE handler which
  // PATCHes archived_at = NOW() instead of hard delete.
  archivedAt?: string | null;
  archivedByUserId?: string | null;
  // Phase E: count of non-archived applications linked to this
  // student. Populated by the list API; null when not fetched.
  applicationCount?: number | null;
}

export function parsePartnerStudentStatus(input: unknown): PartnerStudentStatus | null {
  if (typeof input !== 'string') return null;
  if ((PARTNER_STUDENT_STATUSES as readonly string[]).includes(input)) {
    return input as PartnerStudentStatus;
  }
  return null;
}

/**
 * DB row shape (snake_case) — what `supabase.from('partner_students').select('*')` returns.
 */
interface RawPartnerStudent {
  id: string;
  partner_id: string;
  student_name: string;
  student_email?: string | null;
  student_phone?: string | null;
  nationality?: string | null;
  target_university?: string | null;
  target_program?: string | null;
  status?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  created_by_user_id?: string | null;
  // Optional: join column from auth.users (set by the API layer)
  created_by_email?: string | null;
  // Phase 50b: soft-delete markers
  archived_at?: string | null;
  archived_by_user_id?: string | null;
  // Phase E: denormalized application count from the list API.
  application_count?: number | null;
}

export function mapPartnerStudentFromDb(row: RawPartnerStudent): PartnerStudent {
  return {
    id: row.id,
    partnerId: row.partner_id,
    studentName: row.student_name,
    studentEmail: row.student_email ?? null,
    studentPhone: row.student_phone ?? null,
    nationality: row.nationality ?? null,
    targetUniversity: row.target_university ?? null,
    targetProgram: row.target_program ?? null,
    status: parsePartnerStudentStatus(row.status) ?? 'New',
    notes: row.notes ?? null,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
    createdByUserId: row.created_by_user_id ?? null,
    createdByEmail: row.created_by_email ?? null,
    archivedAt: row.archived_at ?? null,
    archivedByUserId: row.archived_by_user_id ?? null,
    applicationCount: typeof row.application_count === 'number' ? row.application_count : null,
  };
}

/**
 * Build a snake_case DB row from a camelCase payload. Only includes
 * fields the client is allowed to write — primary key and partner_id
 * are set by the server.
 */
export function mapPartnerStudentToDb(payload: Record<string, unknown>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (payload.studentName !== undefined) row.student_name = String(payload.studentName).trim();
  if (payload.studentEmail !== undefined) row.student_email = payload.studentEmail || null;
  if (payload.studentPhone !== undefined) row.student_phone = payload.studentPhone || null;
  if (payload.nationality !== undefined) row.nationality = payload.nationality || null;
  if (payload.targetUniversity !== undefined)
    row.target_university = payload.targetUniversity || null;
  if (payload.targetProgram !== undefined) row.target_program = payload.targetProgram || null;
  if (payload.status !== undefined) row.status = payload.status;
  if (payload.notes !== undefined) row.notes = payload.notes || null;
  return row;
}

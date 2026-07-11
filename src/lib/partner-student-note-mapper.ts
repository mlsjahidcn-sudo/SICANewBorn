/**
 * partner-student-note-mapper.ts
 *
 * Maps between the camelCase shape the partner student detail
 * page uses and the snake_case `partner_student_notes` DB
 * table. Mirrors the `partner-student-mapper.ts` and
 * `partner-application-mapper.ts` pattern.
 *
 *   UI (camelCase)              ↔  DB (snake_case)
 *   ─────────────────────         ──────────────────
 *   id                  ↔         id
 *   partnerStudentId    ↔         partner_student_id
 *   partnerId           ↔         partner_id
 *   authorUserId        ↔         author_user_id
 *   authorEmail         ↔         (join column, set by API layer)
 *   body                ↔         body
 *   pinned              ↔         pinned
 *   createdAt           ↔         created_at
 *   updatedAt           ↔         updated_at
 *
 * body is capped at 4000 chars by a DB-level CHECK constraint
 * (set in database/2026-07-11_partner_student_notes.sql). The
 * server-side validation in src/app/api/partner/student-notes/
 * also enforces the cap on PATCH/POST, so a runaway client
 * can't bypass it.
 */

export interface PartnerStudentNote {
  id: string;
  partnerStudentId: string;
  partnerId: string;
  authorUserId?: string | null;
  // Optional join column from auth.users (set by the API layer
  // when hydrating a list of notes for the UI).
  authorEmail?: string | null;
  body: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RawPartnerStudentNote {
  id: string;
  partner_student_id: string;
  partner_id: string;
  author_user_id?: string | null;
  // Optional: join column from auth.users (set by the API layer
  // when hydrating a list of notes for the UI).
  author_email?: string | null;
  body: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Read shape mirrors the sibling mappers (partner-student-mapper,
 * partner-application-mapper): accept the full raw row + the
 * optional joined author_email column. The cast in the API
 * layer is local and explicit.
 */
export function mapPartnerStudentNoteFromDb(
  row: RawPartnerStudentNote,
): PartnerStudentNote {
  return {
    id: row.id,
    partnerStudentId: row.partner_student_id,
    partnerId: row.partner_id,
    authorUserId: row.author_user_id ?? null,
    authorEmail: row.author_email ?? null,
    body: row.body,
    pinned: row.pinned,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Build a snake_case DB row from a camelCase POST/PATCH
 * payload. Only includes fields the client is allowed to
 * write — the partner_student_id + partner_id are set by the
 * server from the URL param + session, and author_user_id is
 * also set server-side.
 */
export function mapPartnerStudentNoteToDb(
  payload: Record<string, unknown>,
): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (payload.body !== undefined) {
    const body = String(payload.body);
    if (body.length > 4000) {
      throw new Error('body must be at most 4000 characters');
    }
    row.body = body;
  }
  if (payload.pinned !== undefined) row.pinned = Boolean(payload.pinned);
  return row;
}

/** Hard cap matched to the DB CHECK constraint. */
export const PARTNER_STUDENT_NOTE_MAX_BODY = 4000;

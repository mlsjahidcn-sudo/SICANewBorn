/**
 * student-fee-validation.ts
 *
 * Whitelist helpers for student_fees writes (Phase 108 Batch 7).
 *
 * Mirrors the pattern from src/lib/student-document-validation.ts:36-46:
 * explicit allow-list Set + iterate-and-filter, returns
 * Record<string, unknown> so callers can pass it straight to .update().
 *
 * Returns an empty object when no editable fields are present, which
 * callers can detect to surface a 400 'No editable fields provided'.
 */

const EDITABLE_FEE_FIELDS = new Set([
  'description',
  'amount',
  'currency',
  'amount_paid',
  'due_date',
  'paid_date',
  'status',
  'payment_method',
  'payment_notes',
  'payment_proof_url',
  'notes',
]);

// Fields that the server always sets (identity + bookkeeping) — must be
// rejected if a client tries to write them.
const SERVER_ONLY_FEE_FIELDS = new Set([
  'id',
  'student_id',
  'application_id',
  'fee_type',
  'created_at',
  'updated_at',
  'updated_by',
]);

export interface StudentFeeUpdatePayload {
  [key: string]: unknown;
}

/**
 * Returns the subset of `body` that contains only editable fields, in
 * snake_case. Empty payload → caller should 400.
 */
export function pickStudentFeeUpdates(
  body: StudentFeeUpdatePayload,
): StudentFeeUpdatePayload {
  const updates: StudentFeeUpdatePayload = {};
  for (const [k, v] of Object.entries(body)) {
    if (SERVER_ONLY_FEE_FIELDS.has(k)) continue;
    if (EDITABLE_FEE_FIELDS.has(k)) {
      updates[k] = v;
    }
  }
  return updates;
}
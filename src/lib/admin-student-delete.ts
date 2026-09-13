/**
 * Phase 85: pure validation helper for DELETE /api/admin/students/[id].
 *
 * Decides whether the request body (or its absence) should soft-suspend
 * (existing default) or hard-delete (requires `confirmEmail` to match
 * the student's email case-insensitively, trimmed).
 */

export interface StudentDeleteInput {
  action?: unknown;
  confirmEmail?: unknown;
}

export interface StudentRow {
  email: string;
  first_name?: string;
  last_name?: string;
}

export type DeleteDecision =
  | { action: 'suspend'; reason?: undefined }
  | { action: 'delete' }
  | { action: 'reject'; status: 400; error: string };

/**
 * Pure function: given the parsed (or empty) delete body + the loaded
 * student row, returns the decision. The route handler should then
 * branch on `.action` and return the appropriate response.
 */
export function decideStudentDelete(
  body: StudentDeleteInput | null,
  student: StudentRow,
): DeleteDecision {
  // Default path: no body / missing action → soft-suspend (back-compat).
  if (!body || body.action === undefined || body.action === 'suspend') {
    return { action: 'suspend' };
  }
  if (body.action === 'delete') {
    if (typeof body.confirmEmail !== 'string') {
      return {
        action: 'reject',
        status: 400,
        error: 'Email confirmation is required to delete',
      };
    }
    const expected = (student.email ?? '').toLowerCase().trim();
    const provided = body.confirmEmail.toLowerCase().trim();
    if (expected !== provided) {
      return { action: 'reject', status: 400, error: 'Email confirmation does not match' };
    }
    return { action: 'delete' };
  }
  return {
    action: 'reject',
    status: 400,
    error: `Unknown action: ${String(body.action)}`,
  };
}

/**
 * Parse the request body for the DELETE handler. Returns `null`
 * for a missing/empty body (treated as the default suspend), or
 * the parsed object otherwise.
 */
export function parseDeleteBody(raw: unknown): StudentDeleteInput | null {
  if (raw == null) return null;
  if (typeof raw === 'object') return raw as StudentDeleteInput;
  return null;
}
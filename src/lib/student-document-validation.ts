import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Phase 96: student-side document write validation.
 *
 * Two holes this closes (found in the portal review):
 *  1. PUT /api/student/documents/[id] used to spread unvalidated body
 *     fields into the UPDATE, so a student could PATCH
 *     `{ "status": "Verified", "verified_by": "<uuid>" }` on their own
 *     row and self-verify — RLS has no column restrictions.
 *  2. POST/PUT accepted any `applicationId` UUID without checking it
 *     belongs to the caller, so a student could attach their documents
 *     to another student's application (whose detail view then fetches
 *     documents by application_id).
 */

/**
 * Fields a STUDENT may write on their own student_documents row.
 * Deliberately excludes everything admin-controlled (status,
 * verified_at, verified_by, rejection_reason), identity columns
 * (id, student_id, document_type_id, uploaded_at), and — importantly —
 * `application_id` itself: application linkage goes ONLY through the
 * camelCase `applicationId` wrapper in the route, which runs the
 * ownership check. Passing the snake_case key directly must not work.
 */
const STUDENT_EDITABLE_DOCUMENT_FIELDS = new Set([
  'name',
  'name_cn',
  'notes',
  'file_url',
  'file_name',
  'file_type',
  'file_size',
]);

export function pickStudentEditableDocumentUpdates(
  body: Record<string, unknown>,
): Record<string, unknown> {
  const updates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (STUDENT_EDITABLE_DOCUMENT_FIELDS.has(key)) {
      updates[key] = value;
    }
  }
  return updates;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * True when the application exists AND belongs to studentId.
 * Malformed ids are simply not owned (no existence leak).
 */
export async function isApplicationOwnedBy(
  supabase: SupabaseClient,
  applicationId: string,
  studentId: string,
): Promise<boolean> {
  if (!UUID_RE.test(applicationId)) {
    return false;
  }
  const { data, error } = await supabase
    .from('student_applications')
    .select('id')
    .eq('id', applicationId)
    .eq('student_id', studentId)
    .maybeSingle();
  return !error && !!data;
}

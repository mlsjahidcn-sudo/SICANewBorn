/**
 * Timeline helper for application status events.
 *
 * Every time an application's status changes (create, update, cancel),
 * we INSERT a row into `application_timeline` so the audit trail
 * is complete. The merged activity feed in
 * `src/app/api/admin/students/[id]/activity/route.ts` reads from this
 * table (and from `student_notifications`) to render the
 * student detail "Activity" tab.
 *
 * IMPORTANT: uses the SERVICE-ROLE client, not the per-request authed
 * client. The application_timeline RLS policy lets students read
 * their own events, but doesn't let them INSERT (the timeline is a
 * system audit log, not user data). Service-role bypasses RLS.
 *
 * Schema reminder (database/migration-supabase-cloud.sql):
 *   application_timeline (
 *     id, application_id, status, notes, created_by, created_at
 *   )
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { buildServiceClient } from './supabase-auth';

export interface TimelineEventInput {
  application_id: string;
  status: string;
  notes?: string;
  created_by?: string;
}

/**
 * Insert a timeline event. Uses service-role (bypasses RLS) so the
 * student API and the admin API can both call it without tripping
 * the row-level security policy.
 */
export async function insertTimelineEvent(
  _ignoredClient: SupabaseClient, // kept in the signature for API compatibility, but unused
  event: TimelineEventInput,
): Promise<void> {
  try {
    const service = buildServiceClient();
    const { error } = await service.from('application_timeline').insert({
      application_id: event.application_id,
      status: event.status,
      notes: event.notes,
      created_by: event.created_by,
    });
    if (error) {
      // Don't throw — timeline writes are best-effort. The main
      // operation (the application update) has already succeeded.
      // We log so the operator can debug.
      console.error('[insertTimelineEvent] failed:', error);
    }
  } catch (err) {
    console.error('[insertTimelineEvent] unhandled:', err);
  }
}


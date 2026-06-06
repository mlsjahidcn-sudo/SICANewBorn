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
 * S29: the same `application_timeline` table now also stores events
 * for `partner_applications` rows. We added a nullable
 * `partner_application_id` column and a CHECK constraint that
 * exactly one of (application_id, partner_application_id) is set
 * per row. Student apps continue to use `application_id`; partner
 * apps use `partner_application_id`. The helper below accepts
 * either; the caller picks.
 *
 * IMPORTANT: uses the SERVICE-ROLE client, not the per-request authed
 * client. The application_timeline RLS policy lets students + partners
 * read their own events, but doesn't let them INSERT (the timeline is
 * a system audit log, not user data). Service-role bypasses RLS.
 *
 * Schema reminder:
 *   application_timeline (
 *     id,
 *     application_id          UUID FK student_applications(id),         -- nullable
 *     partner_application_id  UUID FK partner_applications(id),         -- nullable
 *     status VARCHAR(50) NOT NULL,
 *     notes TEXT,
 *     created_by UUID,
 *     created_at TIMESTAMPTZ
 *   )
 *   CHECK ((application_id IS NOT NULL)::int
 *          + (partner_application_id IS NOT NULL)::int = 1)
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { buildServiceClient } from './supabase-auth';

/**
 * Exactly one of these must be set per timeline event:
 *   - `application_id`         → student_applications row
 *   - `partner_application_id` → partner_applications row
 */
export interface TimelineEventInput {
  application_id?: string | null;
  partner_application_id?: string | null;
  status: string;
  notes?: string;
  created_by?: string;
}

/**
 * Insert a timeline event. Uses service-role (bypasses RLS) so the
 * student API, partner API, and admin API can all call it without
 * tripping the row-level security policy.
 */
export async function insertTimelineEvent(
  _ignoredClient: SupabaseClient, // kept in the signature for API compatibility, but unused
  event: TimelineEventInput,
): Promise<void> {
  // Validate exactly one of the two FK fields is set. The DB CHECK
  // constraint would catch it, but we want a clearer error before
  // the network round-trip.
  const studentSet = !!event.application_id;
  const partnerSet = !!event.partner_application_id;
  if (studentSet === partnerSet) {
    // both true OR both false
    console.error(
      '[insertTimelineEvent] need exactly one of application_id / partner_application_id',
      { event },
    );
    return;
  }
  try {
    const service = buildServiceClient();
    const { error } = await service.from('application_timeline').insert({
      application_id: event.application_id ?? null,
      partner_application_id: event.partner_application_id ?? null,
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


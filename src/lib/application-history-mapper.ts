/**
 * Phase 107 / Batch 2 — application_stage_history mapper.
 *
 * Two consumers:
 *   - Admin detail page's Timeline tab (sees every event)
 *   - Student detail page's Timeline tab (filtered by timeline_visible_to_student
 *     on the parent student_applications row + the per-row internal marker)
 *
 * The migration is forward-only: the new table can be empty for legacy
 * applications. Existing rows still get their pre-Phase-107 timeline
 * from application_timeline (status / notes rows); the mapper can merge
 * both tables into one shape.
 */

export interface StageHistoryRow {
  id: string;
  applicationId: string;
  fromStatus: string | null;
  toStatus: string;
  actorId: string | null;
  actorEmail: string | null;
  actorRole: string | null;
  note: string | null;
  createdAt: string;
}

export type StageHistoryDbRow = {
  id: string;
  application_id: string;
  from_status: string | null;
  to_status: string;
  actor_id: string | null;
  actor_email: string | null;
  actor_role: string | null;
  note: string | null;
  created_at: string;
};

/**
 * Inline marker an admin can add to a stage_history note to suppress the
 * row from the student's /student/applications/[id] timeline. The admin UI
 * exposes a "Mark as internal" toggle that prepends this string on write.
 *
 * Centralized so the writer (route), the reader (mapper + student route
 * filter), and the eventual UI label all agree.
 */
export const INTERNAL_NOTE_MARKER = '[internal]';

/**
 * True when the note contains the internal marker (admin-only). The
 * marker is stripped from the visible note so the student never sees it
 * even if they peek at the raw payload.
 */
export function isInternalNote(note: string | null | undefined): boolean {
  if (!note) return false;
  return note.includes(INTERNAL_NOTE_MARKER);
}

/**
 * Strip the internal marker from a note for student-visible rendering.
 * Admin views keep the full note so they remember why they hid it.
 */
export function stripInternalMarker(note: string | null | undefined): string {
  if (!note) return '';
  return note.replace(INTERNAL_NOTE_MARKER, '').trim();
}

export function mapStageHistoryFromDb(row: StageHistoryDbRow): StageHistoryRow {
  return {
    id: row.id,
    applicationId: row.application_id,
    fromStatus: row.from_status,
    toStatus: row.to_status,
    actorId: row.actor_id,
    actorEmail: row.actor_email,
    actorRole: row.actor_role,
    note: row.note,
    createdAt: row.created_at,
  };
}

/**
 * A merged event row for the timeline tab. Either a stage-history row
 * (status change with actor) or a timeline note row (free-form text).
 *
 * Used by /admin/applications/[id] + /student/applications/[id] so both
 * tabs read from the same shape.
 */
export type TimelineEventKind = 'stage' | 'note' | 'system';

export interface UnifiedTimelineEvent {
  id: string;
  kind: TimelineEventKind;
  /** For kind='stage': the status the application transitioned TO. */
  toStatus: string | null;
  /** For kind='stage': the previous status, or null for the create event. */
  fromStatus: string | null;
  /** Human-readable label of the actor ("admin@…", "Student", "System"). */
  actorLabel: string;
  /** Original note (may contain the [internal] marker; strip before student display). */
  note: string | null;
  /** ISO timestamp. */
  timestamp: string;
  /** For kind='stage': true when this row carries the [internal] marker. */
  internal: boolean;
}

export function mergeTimelineForAdmin(
  stageRows: StageHistoryRow[],
  timelineNotes: Array<{
    id: string;
    status: string | null;
    notes: string | null;
    createdAt: string;
    createdBy?: string | null;
  }>,
): UnifiedTimelineEvent[] {
  const stage: UnifiedTimelineEvent[] = stageRows.map((row) => ({
    id: `stage:${row.id}`,
    kind: 'stage',
    toStatus: row.toStatus,
    fromStatus: row.fromStatus,
    actorLabel:
      row.actorEmail ||
      (row.actorRole === 'system'
        ? 'System'
        : row.actorRole
          ? row.actorRole[0].toUpperCase() + row.actorRole.slice(1)
          : 'Unknown'),
    note: row.note,
    timestamp: row.createdAt,
    internal: isInternalNote(row.note),
  }));

  const notes: UnifiedTimelineEvent[] = timelineNotes.map((row) => ({
    id: `note:${row.id}`,
    kind: 'note',
    toStatus: row.status,
    fromStatus: null,
    actorLabel: row.createdBy || 'System',
    note: row.notes,
    timestamp: row.createdAt,
    internal: isInternalNote(row.notes),
  }));

  return [...stage, ...notes].sort((a, b) =>
    a.timestamp < b.timestamp ? 1 : a.timestamp > b.timestamp ? -1 : 0,
  );
}

/**
 * Student-visible variant: drops internal-flagged rows entirely so a
 * student cannot infer their existence from a missing slot in the list.
 * Strips the [internal] marker from any non-internal row that happens to
 * contain it (defense in depth — only the writer adds it).
 */
export function mergeTimelineForStudent(
  stageRows: StageHistoryRow[],
  timelineNotes: Array<{
    id: string;
    status: string | null;
    notes: string | null;
    createdAt: string;
    createdBy?: string | null;
  }>,
  timelineVisibleToStudent: boolean,
): UnifiedTimelineEvent[] {
  if (!timelineVisibleToStudent) return [];
  const stage = stageRows
    .filter((row) => !isInternalNote(row.note))
    .map<UnifiedTimelineEvent>((row) => ({
      id: `stage:${row.id}`,
      kind: 'stage',
      toStatus: row.toStatus,
      fromStatus: row.fromStatus,
      actorLabel:
        row.actorEmail ||
        (row.actorRole === 'system'
          ? 'System'
          : row.actorRole
            ? row.actorRole[0].toUpperCase() + row.actorRole.slice(1)
            : 'Unknown'),
      note: stripInternalMarker(row.note),
      timestamp: row.createdAt,
      internal: false,
    }));

  const notes = timelineNotes
    .filter((row) => !isInternalNote(row.notes))
    .map<UnifiedTimelineEvent>((row) => ({
      id: `note:${row.id}`,
      kind: 'note',
      toStatus: row.status,
      fromStatus: null,
      actorLabel: row.createdBy || 'System',
      note: stripInternalMarker(row.notes),
      timestamp: row.createdAt,
      internal: false,
    }));

  return [...stage, ...notes].sort((a, b) =>
    a.timestamp < b.timestamp ? 1 : a.timestamp > b.timestamp ? -1 : 0,
  );
}

/**
 * Application_enrollments shape (read-only — writes happen in
 * /api/admin/applications/[id]/enroll). Surfaced on the admin
 * detail page's Enrollment card.
 */
export interface ApplicationEnrollment {
  applicationId: string;
  enrolledBy: string | null;
  enrolledAt: string;
  depositAmount: number | null;
  depositCurrency: string | null;
  depositPaidAt: string | null;
  visaStatus:
    | 'Not Started'
    | 'Documents Pending'
    | 'Submitted'
    | 'Approved'
    | 'Rejected';
  arrivalDate: string | null;
  notes: string | null;
}

export type ApplicationEnrollmentDbRow = {
  application_id: string;
  enrolled_by: string | null;
  enrolled_at: string;
  deposit_amount: string | number | null;
  deposit_currency: string | null;
  deposit_paid_at: string | null;
  visa_status: ApplicationEnrollment['visaStatus'];
  arrival_date: string | null;
  notes: string | null;
};

export function mapEnrollmentFromDb(row: ApplicationEnrollmentDbRow): ApplicationEnrollment {
  return {
    applicationId: row.application_id,
    enrolledBy: row.enrolled_by,
    enrolledAt: row.enrolled_at,
    depositAmount: row.deposit_amount === null ? null : Number(row.deposit_amount),
    depositCurrency: row.deposit_currency,
    depositPaidAt: row.deposit_paid_at,
    visaStatus: row.visa_status,
    arrivalDate: row.arrival_date,
    notes: row.notes,
  };
}

/**
 * Phase 107 helper: derive the default enrollment payload from an
 * Accepted application. Returns sensible defaults (currency CNY, no
 * deposit yet, visa_status='Not Started') so the admin form has a
 * starting point when "Mark as Enrolled" is clicked.
 */
export function enrollmentDefaultsFromAccepted(_application: {
  status: string;
  decision: string | null;
}): Pick<ApplicationEnrollment, 'depositCurrency' | 'visaStatus'> {
  return {
    depositCurrency: 'CNY',
    visaStatus: 'Not Started',
  };
}

/**
 * Phase 107: an Accepted application is eligible to be enrolled once
 * the admin has the deposit / visa data. Other statuses cannot enroll.
 */
export function canMarkEnrolled(application: {
  status: string;
  decision: string | null;
}): boolean {
  return application.status === 'Accepted';
}
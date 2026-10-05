/**
 * Slot occupancy for the counselling calendar (Phase 137).
 *
 * One definition of "this instant is taken", shared by every surface:
 *   - GET /api/counselling/slots        (public picker availability)
 *   - POST /api/counselling/bookings    (public booking pre-check)
 *   - PATCH /api/admin/counselling/[id] (reschedule / confirm / propose)
 *
 * An instant is occupied when EITHER:
 *   a) a live booking holds it — row with status Pending|Confirmed and
 *      slot_start = the instant (the DB partial unique index is the
 *      hard guarantee for this case), OR
 *   b) an UNEXPIRED admin proposal holds it — row with status
 *      'Proposed' and proposed_slot_start = the instant and
 *      proposal_expires_at > now (Phase 125). Expired / declined
 *      proposals free the slot. Without this rule a student could
 *      book a slot that's on hold for another student, and their
 *      later accept would 409.
 *
 * Note (b) is enforced app-side only — proposal_expires_at > now() is
 * not immutable so it can't be an index predicate. The accept path's
 * 23505 handling (respond route) stays the final arbiter for the tiny
 * race window.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export interface OccupancyCandidateRow {
  slot_start?: string | null;
}

export interface OccupancyProposalRow {
  proposed_slot_start?: string | null;
}

/** Normalize any timestamptz string PostgREST returns ('...Z',
 * '...+00:00') to epoch ms — string comparison across formats is not
 * safe, epoch ms is. Returns null for null/invalid. */
export function toEpochMs(iso: string | null | undefined): number | null {
  if (typeof iso !== 'string' || !iso) return null;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : null;
}

/**
 * Pure merge of the two query results into the occupied-instant set.
 * Kept separate from the queries so it's unit-testable.
 */
export function buildOccupancySet(
  liveRows: ReadonlyArray<OccupancyCandidateRow>,
  proposalRows: ReadonlyArray<OccupancyProposalRow>,
): Set<number> {
  const occupied = new Set<number>();
  for (const row of liveRows) {
    const ms = toEpochMs(row.slot_start);
    if (ms !== null) occupied.add(ms);
  }
  for (const row of proposalRows) {
    const ms = toEpochMs(row.proposed_slot_start);
    if (ms !== null) occupied.add(ms);
  }
  return occupied;
}

/**
 * Query the holders for a batch of candidate instants and return the
 * occupied subset (epoch ms). Best-effort contract mirrors the rest of
 * the counselling surfaces: on a query error we log and return what we
 * have (the callers treat an empty set as "no known holders" — the DB
 * unique index still catches actual double-books at insert time).
 *
 * `excludeBookingId` skips the row being edited (admin PATCH: a row
 * must never clash with itself).
 */
export async function fetchOccupiedSlotInstants(
  supabase: SupabaseClient,
  candidateIsos: ReadonlyArray<string>,
  opts: { excludeBookingId?: string; now?: Date } = {},
): Promise<Set<number>> {
  if (candidateIsos.length === 0) return new Set();
  const now = opts.now ?? new Date();
  const candidates = [...candidateIsos];

  let liveQuery = supabase
    .from('counselling_bookings')
    .select('slot_start')
    .in('slot_start', candidates)
    .in('status', ['Pending', 'Confirmed']);
  if (opts.excludeBookingId) {
    liveQuery = liveQuery.neq('id', opts.excludeBookingId);
  }

  let proposalQuery = supabase
    .from('counselling_bookings')
    .select('proposed_slot_start')
    .in('proposed_slot_start', candidates)
    .eq('status', 'Proposed')
    .gt('proposal_expires_at', now.toISOString());
  if (opts.excludeBookingId) {
    proposalQuery = proposalQuery.neq('id', opts.excludeBookingId);
  }

  const [liveRes, proposalRes] = await Promise.all([liveQuery, proposalQuery]);
  if (liveRes.error) {
    console.error('[counselling/occupancy] live query failed:', liveRes.error.message);
  }
  if (proposalRes.error) {
    console.error('[counselling/occupancy] proposal query failed:', proposalRes.error.message);
  }
  return buildOccupancySet(
    (liveRes.data ?? []) as OccupancyCandidateRow[],
    (proposalRes.data ?? []) as OccupancyProposalRow[],
  );
}

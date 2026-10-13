/**
 * Phase 161: pure seat-capacity + waitlist routing logic.
 *
 * Pure functions only — no I/O — so the vitest suite can cover the
 * full decision table and both the public signup route and the
 * capacity polling endpoint share one source of truth.
 *
 * Seat semantics (Phase 142 convention, restored by Phase 161):
 *   seat holders = webinar_signups with status IN ('Registered','Attended').
 *   'Cancelled' and 'No-Show' free their seat.
 *
 * seat_cap semantics (Phase 161):
 *   NULL = uncapped — keeps Phase 157's "accept every registration"
 *   behaviour for the legacy webinar and any future uncapped session.
 *   >0   = capped; when holders reach the cap, new visitors are routed
 *          to the waitlist.
 *
 * registration_status (webinar_sessions.registration_status):
 *   stored values  : draft | open | full | closed
 *   'draft'/'closed' are deliberate staff gates — they always stop
 *   registration regardless of capacity.
 *   'full' is DERIVED, never authoritative: effectiveStatus reports
 *   'full' exactly when a cap is set and reached, and 'open'
 *   otherwise. So the opportunistic 'full' write when the last seat
 *   fills is a display cache, a raised cap reopens instantly, and no
 *   webinar can get stuck on the waitlist because someone forgot to
 *   flip a label back. Staff who WANT a forced waitlist set the cap
 *   to the current holder count.
 */

export type WebinarRegistrationStatus = 'draft' | 'open' | 'full' | 'closed';

/** Statuses that occupy a seat (mirror of the SQL comment above). */
export const SEAT_HOLDER_STATUSES = ['Registered', 'Attended'] as const;

export interface SeatInfo {
  /** Configured cap; null = uncapped. */
  seatCap: number | null;
  /** Rows currently holding a seat. */
  seatsTaken: number;
  /** Cap minus taken; null when uncapped (never negative). */
  seatsLeft: number | null;
  /** True when capped and no seats remain. */
  isFull: boolean;
  /**
   * What the signup form should do next.
   *   'signup'   — normal registration
   *   'waitlist' — seats exhausted (or stored status forces it)
   *   'closed'   — registration_status closed/draft — show closed copy
   */
  formMode: 'signup' | 'waitlist' | 'closed';
  /** The effective registration status for display. */
  effectiveStatus: WebinarRegistrationStatus;
}

export function computeSeatInfo(input: {
  seatCap: number | null;
  seatsTaken: number;
  storedStatus: WebinarRegistrationStatus;
}): SeatInfo {
  const { seatCap, seatsTaken, storedStatus } = input;
  const capped = seatCap !== null && seatCap > 0;
  const seatsLeft = capped ? Math.max(0, (seatCap as number) - seatsTaken) : null;
  const isFull = capped ? seatsLeft === 0 : false;

  // draft/closed are staff gates; open/full follow capacity.
  const gated = storedStatus === 'closed' || storedStatus === 'draft';
  const effectiveStatus: WebinarRegistrationStatus = gated
    ? storedStatus
    : isFull
      ? 'full'
      : 'open';

  const formMode: SeatInfo['formMode'] = gated ? 'closed' : isFull ? 'waitlist' : 'signup';

  return { seatCap, seatsTaken, seatsLeft, isFull, formMode, effectiveStatus };
}

/**
 * Guard for the signup route: does this registration attempt need the
 * waitlist? Split from computeSeatInfo so the route reads as policy,
 * while the test suite covers both.
 */
export function shouldRouteToWaitlist(seatInfo: SeatInfo): boolean {
  return seatInfo.formMode === 'waitlist';
}

/** Normalize a seat-cap input from an admin form: '' | null | 0 → null. */
export function parseSeatCapInput(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  const parsed = typeof raw === 'number' ? raw : Number.parseInt(String(raw), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.floor(parsed);
}

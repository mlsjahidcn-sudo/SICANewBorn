/**
 * Pure decision for the `/counselling/respond` RSC shell. Phase 152
 * (#10): the route used to render a single "invalid" card for every
 * failure mode (unknown token, expired, status moved past 'Proposed').
 * The expired case got the same generic copy as the missing-token case.
 * Now we branch into three outcomes so the i18n keys at
 * `counselling.respondInvalid*` vs `counselling.respondExpired*`
 * reach the student.
 *
 * Pure function — easy to unit-test, no supabase coupling.
 */

export type RespondRenderState =
  /** Missing token, row not found, status not Proposed, or required columns null. */
  | 'invalid'
  /** Token resolved but proposal_expires_at < now. */
  | 'expired'
  /** Token resolved, status Proposed, not yet expired — show the RespondClient. */
  | 'valid';

export interface RespondRenderInput {
  /** True if the row was resolved from the proposal_token lookup. */
  rowFound: boolean;
  /** Current status column from counselling_bookings, or null if row missing. */
  status: string | null;
  /** ISO instant of `proposal_expires_at`, or null if row missing. */
  proposalExpiresAtIso: string | null;
  /** Optional override for testability — defaults to Date.now(). */
  nowMs?: number;
}

export function decideRespondRender(input: RespondRenderInput): RespondRenderState {
  const { rowFound, status, proposalExpiresAtIso } = input;
  if (!rowFound || status !== 'Proposed' || !proposalExpiresAtIso) {
    return 'invalid';
  }
  const expiresMs = Date.parse(proposalExpiresAtIso);
  if (!Number.isFinite(expiresMs)) {
    return 'invalid';
  }
  const now = typeof input.nowMs === 'number' ? input.nowMs : Date.now();
  return expiresMs < now ? 'expired' : 'valid';
}

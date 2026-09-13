/**
 * Track 1.3 U4 #1: pure helpers for cascade deletes on the catalog.
 *
 * `programs.university_slug` has no FK to `universities.slug`
 * (it's a plain VARCHAR). Deleting a university therefore
 * orphans its programs instead of failing. The catalog DELETE
 * routes now:
 *   1. Count child programs (universities) / partner_promotions
 *      (programs + universities)
 *   2. Refuse unless `?force=true` is set — return 409 with the
 *      counts so the admin UI can warn before destruction
 *   3. When force=true, delete the children first then the parent
 *   4. Return the deletion counts so the UI can confirm
 *
 * Tested via src/lib/__tests__/cascade-delete.test.ts.
 */

export interface CascadeCounts {
  /** programs whose university_slug matches the parent (university delete) */
  programs: number;
  /** partner_promotions that reference this entity (university or program) */
  partnerPromotions: number;
}

export interface CascadeDeleteResponse {
  ok: boolean;
  /** Always populated on the success path. */
  counts?: CascadeCounts;
  /** 0 when the row didn't exist. */
  deleted?: boolean;
  /** When ok=false: the human-readable reason + child counts + force flag hint. */
  reason?: 'children';
  hint?: string;
}

/**
 * Compute the cascade counts for a university or program delete.
 *
 * The route passes the resolved counts straight to the response.
 * Pure function — does not touch the DB. Caller does the queries.
 */
export function summarizeCascade(counts: CascadeCounts): CascadeDeleteResponse {
  const total = counts.programs + counts.partnerPromotions;
  if (total === 0) {
    return { ok: true, counts, deleted: false };
  }
  return {
    ok: false,
    counts,
    reason: 'children',
    hint: `Pass ?force=true to delete this entity along with its ${total} dependent row(s).`,
  };
}

/**
 * Parse `?force=true` from a request URL. Anything other than the
 * literal string "true" returns false — case-sensitive, matching
 * the rest of the API's boolean query conventions.
 */
export function isForceDelete(url: URL): boolean {
  return url.searchParams.get('force') === 'true';
}
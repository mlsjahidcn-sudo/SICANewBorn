/**
 * Closing SICA's "please send these documents" requests on a partner
 * application (`partner_applications.documents_requested`, Phase 76).
 *
 * Before this module nothing ever wrote `fulfilled_at`, so every request
 * stayed open forever and the admin "fulfilled requests" count was always
 * empty. Two ways a request now closes:
 *
 *   1. Automatically — when, for EVERY category in the request, at least
 *      one document of the matching upload category was linked to the
 *      application at or after the request time. Requests that include a
 *      `photo` or `other` category have no upload category to match, so
 *      they are never auto-closed; an admin closes them by hand.
 *   2. Manually — an admin marks the request done (or reopens it).
 *
 * The functions work on the RAW JSONB array and only touch
 * `fulfilled_at` / `fulfilled_by` of the targeted entries, so legacy or
 * malformed entries are preserved byte-for-byte instead of being dropped
 * the way `parseDocumentsRequested` would.
 */

import { parseDocumentsRequested } from '@/lib/partner-application-mapper';
import { countDocumentsForRequest } from '@/lib/partner-status-styles';

export interface UploadedDocLike {
  category?: string | null;
  uploadedAt?: string | null;
}

/** True when every category of the request has a matching later upload. */
export function requestIsSatisfied(
  request: { categories: readonly string[]; requested_at: string },
  docs: UploadedDocLike[],
): boolean {
  if (request.categories.length === 0) return false;
  return request.categories.every((category) => {
    const count = countDocumentsForRequest(category, request.requested_at, docs);
    // null = no automatic evidence possible (photo / other) → never auto-close.
    return count !== null && count > 0;
  });
}

/**
 * Close every open request that the uploaded documents now satisfy.
 * Returns the new raw array and the ids that changed (empty = no write needed).
 */
export function applyAutoFulfillment(
  raw: unknown,
  docs: UploadedDocLike[],
  nowIso: string,
  actorId: string | null,
): { requests: unknown[]; changedIds: string[] } {
  const entries = Array.isArray(raw) ? raw : [];
  const parsedById = new Map(parseDocumentsRequested(entries).map((r) => [r.id, r]));
  const changedIds: string[] = [];

  const requests = entries.map((entry) => {
    if (!entry || typeof entry !== 'object') return entry;
    const id = (entry as { id?: unknown }).id;
    if (typeof id !== 'string') return entry;
    const parsed = parsedById.get(id);
    if (!parsed || parsed.fulfilled_at) return entry;
    if (!requestIsSatisfied(parsed, docs)) return entry;
    changedIds.push(id);
    return { ...(entry as Record<string, unknown>), fulfilled_at: nowIso, fulfilled_by: actorId };
  });

  return { requests, changedIds };
}

/**
 * Mark one request done (`fulfilled = true`) or reopen it. Returns null
 * when no entry has that id.
 */
export function setRequestFulfillment(
  raw: unknown,
  requestId: string,
  fulfilled: boolean,
  nowIso: string,
  actorId: string | null,
): unknown[] | null {
  const entries = Array.isArray(raw) ? raw : [];
  let found = false;
  const requests = entries.map((entry) => {
    if (!entry || typeof entry !== 'object') return entry;
    if ((entry as { id?: unknown }).id !== requestId) return entry;
    found = true;
    return {
      ...(entry as Record<string, unknown>),
      fulfilled_at: fulfilled ? nowIso : null,
      fulfilled_by: fulfilled ? actorId : null,
    };
  });
  return found ? requests : null;
}

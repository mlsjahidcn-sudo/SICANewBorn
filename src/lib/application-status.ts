/**
 * application-status.ts
 *
 * Phase 176: the single source of truth for application statuses.
 *
 * ── Why this exists ─────────────────────────────────────────────────
 * The student status vocabulary was duplicated in three places — the
 * POST route, the [id] PATCH route, and the bulk route's
 * ALLOWED_STUDENT_STATUSES — each an identical hand-maintained array.
 * The first time someone adds a status and remembers only some of
 * them, the admin gets a dropdown that offers a value the API rejects,
 * or (worse) a status that saves through one route and 400s through
 * another.
 *
 * Phase 176 added a fourth consumer (the grouped view's per-target
 * status dropdown), which is what finally made the drift concrete:
 * the first draft of that dropdown omitted 'Draft' and would have
 * offered an advisor a status the server rejects.
 *
 * ── Student vs partner ───────────────────────────────────────────────
 * These are DIFFERENT vocabularies and must stay separate.
 * partner_applications says "In Review"; student_applications says
 * "Under Review". The unified admin list renders both, so anything
 * that acts on one surface must use the matching list — see
 * isStatusAllowedFor in the bulk route.
 */

export const ALLOWED_STUDENT_STATUSES = [
  'Draft',
  'Submitted',
  'Under Review',
  'Documents Requested',
  'Decision Made',
  'Accepted',
  'Rejected',
  'Withdrawn',
] as const;

export type StudentApplicationStatus = (typeof ALLOWED_STUDENT_STATUSES)[number];

export const ALLOWED_PARTNER_STATUSES = [
  'Draft',
  'Submitted',
  'In Review',
  'Accepted',
  'Rejected',
  'Withdrawn',
] as const;

export type PartnerApplicationStatus = (typeof ALLOWED_PARTNER_STATUSES)[number];

/** Client-safe lookup: does this status map to a known badge colour?
 *  Unknown values (a partner row shown in a mixed list) fall back
 *  rather than rendering an unstyled chip. */
export function statusColorClass(status: string): string {
  switch (status) {
    case 'Draft':
      return 'bg-gray-100 text-gray-700 border-gray-300';
    case 'Submitted':
      return 'bg-gray-100 text-gray-700 border-gray-300';
    case 'Under Review':
    case 'In Review':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'Documents Requested':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'Decision Made':
      return 'bg-purple-50 text-purple-800 border-purple-200';
    case 'Accepted':
      return 'bg-green-50 text-green-800 border-green-200';
    case 'Rejected':
      return 'bg-red-50 text-red-800 border-red-200';
    case 'Withdrawn':
      return 'bg-gray-100 text-gray-600 border-gray-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
}

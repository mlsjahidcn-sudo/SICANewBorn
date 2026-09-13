/**
 * Phase 85: pure pagination-parameter parser for the partner list.
 *
 * The /api/admin/partners GET route accepts `?search=&page=&limit=`
 * with bounded defaults. This helper extracts them with clamping +
 * safe fallbacks so the route stays a thin HTTP shell.
 */

export const PARTNER_LIST_DEFAULT_LIMIT = 20;
export const PARTNER_LIST_MAX_LIMIT = 100;

export interface PartnerListParams {
  search: string;
  page: number;
  limit: number;
  offset: number;
}

export function parsePartnerListParams(searchParams: URLSearchParams): PartnerListParams {
  const search = (searchParams.get('search') || '').trim();
  const pageRaw = parseInt(searchParams.get('page') || '1', 10);
  const page =
    Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1;
  const limitRaw = parseInt(
    searchParams.get('limit') || String(PARTNER_LIST_DEFAULT_LIMIT),
    10,
  );
  const limit =
    Number.isFinite(limitRaw) && limitRaw >= 1
      ? Math.min(PARTNER_LIST_MAX_LIMIT, limitRaw)
      : PARTNER_LIST_DEFAULT_LIMIT;
  const offset = (page - 1) * limit;
  return { search, page, limit, offset };
}

/**
 * Build the `totalPages` value for the response envelope.
 * Always ≥ 1 (even for an empty result) so the UI can render
 * "Page 1 of 1" instead of an ugly "Page 1 of 0".
 */
export function computeTotalPages(total: number, limit: number): number {
  if (total <= 0) return 1;
  return Math.max(1, Math.ceil(total / limit));
}
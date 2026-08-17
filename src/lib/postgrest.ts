/**
 * PostgREST filter-string sanitizers.
 *
 * supabase-js `.or()` takes a comma-separated filter string like
 * `name.ilike.%x%,email.ilike.%x%`. Interpolating raw user input
 * into that string is fragile: `,` `(` `)` are filter-syntax
 * characters — a search for "Smith, John" silently splits into an
 * extra (malformed) filter → PostgREST 400 → 500 for the user, and
 * a crafted value can append arbitrary `col.op.value` filters.
 *
 * `sanitizeOrTerm` strips the syntax characters (replacing them with
 * a space so "Smith, John" still matches "Smith John") and escapes
 * the ILIKE wildcards `%`/`_` (backslash is Postgres LIKE's default
 * escape). Use it for any user-supplied term interpolated into
 * `.or()` or `.ilike()` calls.
 */
export function sanitizeOrTerm(raw: string): string {
  return raw
    .replace(/[%_]/g, '\\$&')
    .replace(/[,()"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parse a `?page=`/`?limit=`-style integer param with a fallback.
 * `parseInt('abc')` → NaN, and `Math.max(1, NaN)` → NaN, which then
 * flows into `.range(NaN, NaN)` and 500s the request. This helper
 * keeps garbage input on the default instead.
 */
export function parseIntParam(
  raw: string | null,
  fallback: number,
  { min = 1, max = Number.MAX_SAFE_INTEGER }: { min?: number; max?: number } = {},
): number {
  const n = raw === null ? NaN : parseInt(raw, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

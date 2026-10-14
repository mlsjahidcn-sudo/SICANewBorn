/**
 * program-search.ts
 *
 * Phase 173: pure helpers for "search programs by university name".
 *
 * Why a two-step resolution instead of a join:
 * `programs.university_slug` has no foreign key to `universities.slug`
 * (it's a bare VARCHAR — see docs/NEXT-PHASES.md U4 #1), so PostgREST
 * can't infer an embedded-resource relationship, and programs →
 * universities is 1-to-many anyway, which is the wrong shape for
 * "filter by parent name". So we resolve matching university slugs
 * first, then fold them into the programs filter as
 * `university_slug.in.(...)`.
 *
 * This module holds the DB-free half of that: given a term and a list
 * of universities, which slugs match? Both the live query path and the
 * static-fallback path funnel through the SAME function here, which is
 * what keeps the two in parity (they've already drifted once — see
 * Phase 128a U3 #1).
 *
 * Pure on purpose: no Supabase import, so it is directly unit-testable.
 */

/**
 * Cap on how many matching university slugs we fold into a single
 * `in.()` list.
 *
 * A broad term ("a", "the", "e") can match a large share of the
 * universities table. Without a cap the generated PostgREST filter
 * string grows unbounded, which bloats the query URL and pushes the
 * planner toward a worse plan. 50 covers every realistic
 * "type part of a university name" query — a user searching a term that
 * matches 50+ universities is really browsing, not searching.
 */
export const UNIVERSITY_SLUG_MATCH_CAP = 50;

/** Minimal university shape needed for matching. Keeps this unit-testable
 *  without constructing a full `University` (30+ required fields). */
export interface UniversityMatchable {
  slug: string;
  name: string;
  nameCn?: string | null;
}

/**
 * Return the slugs of every university whose English or Chinese name
 * contains `term` (case-insensitive), capped at `cap`.
 *
 * Matching is deliberately substring + case-insensitive to mirror the
 * `ilike` the live path issues, so the two agree. Chinese names need no
 * case folding but are matched the same way.
 *
 * Results are sorted by slug for deterministic output — the cap means
 * the result is "first N in slug order", and a stable order makes that
 * predictable rather than arbitrary.
 */
export function matchUniversitySlugs(
  term: string,
  universities: readonly UniversityMatchable[],
  cap: number = UNIVERSITY_SLUG_MATCH_CAP,
): string[] {
  const needle = term.trim().toLowerCase();
  if (!needle) return [];

  const hits: string[] = [];
  for (const u of universities) {
    if (!u?.slug) continue;
    const en = (u.name ?? '').toLowerCase();
    const cn = (u.nameCn ?? '').toLowerCase();
    if (en.includes(needle) || cn.includes(needle)) hits.push(u.slug);
  }

  hits.sort();
  return cap >= 0 ? hits.slice(0, cap) : hits;
}

/**
 * Build the PostgREST `.or()` fragment for a programs search term.
 *
 * Shape: `name.ilike.%t%,name_cn.ilike.%t%[,university_slug.in.(a,b)]`
 *
 * Kept as a single `.or()` group on purpose. Chaining two separate
 * `.or()` calls would be a second guess at PostgREST's AND-of-OR
 * semantics; one group is unambiguous and degrades to exactly the
 * pre-Phase-173 behaviour when no university matches.
 *
 * **Interpolation safety**: program slugs are validated against
 * /^[a-z0-9]+(?:-[a-z0-9]+)*$/ by the `slug` field of `programSchema`
 * (src/lib/validators/program.ts:7), so they cannot contain a comma,
 * paren, quote or whitespace and need no escaping here. That contract
 * is pinned by a test in programs-search.test.ts — if that regex is
 * ever loosened, that test must move with it.
 *
 * The term itself MUST be passed through `sanitizeOrTerm`
 * (src/lib/postgrest.ts) before reaching here.
 */
export function buildProgramsSearchOr(term: string, universitySlugs: readonly string[]): string {
  const parts = [`name.ilike.%${term}%`, `name_cn.ilike.%${term}%`];
  if (universitySlugs.length > 0) {
    parts.push(`university_slug.in.(${universitySlugs.join(',')})`);
  }
  return parts.join(',');
}

/**
 * Client-side parity check: does this program match the term when the
 * search considers name, Chinese name AND the parent university's name?
 *
 * The live page filters server-side, so this exists for (a) the static
 * fallback path in the API route, (b) keeping any client-side surface
 * (e.g. the admin list) semantically identical, and (c) tests. The
 * university name is passed in already-resolved because a program only
 * carries a slug.
 */
export function programMatchesSearch(
  program: { name: string; nameCn: string; universitySlug: string },
  term: string,
  universitySlugs: readonly string[],
): boolean {
  const needle = term.trim().toLowerCase();
  if (!needle) return true;
  if (program.name.toLowerCase().includes(needle)) return true;
  if ((program.nameCn ?? '').toLowerCase().includes(needle)) return true;
  return universitySlugs.includes(program.universitySlug);
}

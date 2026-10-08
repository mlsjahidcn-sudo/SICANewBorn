/**
 * Site-wide stat source of truth.
 *
 * Every public number — partner universities, countries served,
 * students helped, admission rate, visa rate — flows through this
 * config. No other file should hard-code these numbers.
 *
 * Empty string = the consumer hides that stat (per the spec:
 * "Hide any stat whose value is empty instead of showing a guess").
 *
 * The `programsAvailable` stat is intentionally NOT in this
 * config — it's derived from the live Supabase `programs` table
 * count at render time (see homepage By-the-Numbers section), not
 * a curated figure, so it doesn't suffer the "which number is
 * right" problem the others do.
 *
 * The 5 spec fields are TODO placeholders until Jahid fills in
 * the verified numbers. Until then, every consumer renders zero
 * stats rather than a guessed number.
 *
 * Related: src/lib/translate-site-stats.ts (if you need a server
 * helper that swaps these into UI strings).
 */

export interface SiteStats {
  /** e.g. '50+' — total SICA partner universities. */
  partnerUniversities: string;
  /** e.g. '30+' — total countries SICA has placed students in. */
  countriesServed: string;
  /** e.g. '10,000+' — total students helped to date. */
  studentsHelped: string;
  /** e.g. '95%' — admission success rate across placements. */
  admissionRate: string;
  /** e.g. '98%' — visa success rate across placements. */
  visaRate: string;
}

export const SITE_STATS: SiteStats = {
  partnerUniversities: '',
  countriesServed: '',
  studentsHelped: '',
  admissionRate: '',
  visaRate: '',
};

/**
 * Returns the stat for site `key`, or `''` if unset so consumers
 * can simply `if (getStat(key))` to hide the stat when no number is
 * available. Currying for empty strings means callers don't have to
 * check `=== ''` everywhere.
 */
export function getStat(key: keyof SiteStats): string {
  return SITE_STATS[key] || '';
}

/**
 * Returns the count of non-empty stats — used by the homepage
 * "By-the-Numbers" grid to choose a sensible column count when
 * not all 4 (or 5) slots are visible.
 */
export function countFilledStats(): number {
  return Object.values(SITE_STATS).filter((v) => v && v.trim().length > 0).length;
}
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
  // Owner-supplied figure (2026-10-21). "5,000+ successful
  // admissions" — the same claim the About page has carried since
  // the site launched, now moved here so the homepage band and the
  // About page read ONE source of truth instead of two copies that
  // can drift.
  //
  // Note for context, not a blocker: the `student_applications` +
  // `partner_applications` tables currently hold ~32 rows, i.e. the
  // platform's own tracking started later than the business. This
  // figure describes the whole business to date, not the rows this
  // database has seen. It is a business claim, not a derived count —
  // which is exactly why it lives in this file and not in
  // `getCatalogCounts()`.
  studentsHelped: '5,000+',
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

/**
 * Format a live catalogue count for display.
 *
 * 2075 → "2,000+" · 152 → "150+" · 10 → "10+"
 *
 * Rounds DOWN to a readable boundary and appends "+", so the result is
 * always a true lower bound on the real count (there really are at
 * least 2,000 programmes) and it matches the "+" style of the curated
 * stats sitting next to it in the band.
 *
 * Used by the homepage "By the Numbers" band and the footer trust
 * micro-stats for the three counts that are DERIVED from the live
 * catalogue (universities / programmes / scholarships). Those are
 * facts rather than marketing claims, so they are counted rather
 * than curated — see `getCatalogCounts()` in `src/lib/data-fetcher.ts`.
 *
 * Returns '' for a non-positive or non-finite count so the caller can
 * hide the stat rather than render "0+".
 */
export function formatCount(n: number): string {
  const v = formatCountValue(n);
  return v ? `${v}+` : '';
}

/**
 * Same rounding as `formatCount` but WITHOUT the "+" suffix — for
 * translation strings that supply their own suffix, e.g.
 * "{{count}}+ programs in English & Chinese" (2075 → "2,400+").
 */
export function formatCountValue(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '';
  if (n < 10) return `${n}`;
  if (n < 1000) return `${Math.floor(n / 10) * 10}`;
  if (n < 1_000_000) return (Math.floor(n / 100) * 100).toLocaleString('en-US');
  return `${Math.floor(n / 100_000) * 100}`;
}
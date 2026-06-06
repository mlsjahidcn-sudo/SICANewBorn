/**
 * Intake string normalization.
 *
 * The intake column is a freeform VARCHAR on BOTH student_applications
 * and partner_applications, so the same conceptual cohort shows up
 * under many spellings:
 *
 *   "2026 Fall"        ← canonical (what the wizard exposes)
 *   "Fall 2026"        ← what partners often type
 *   "September 2026"   ← what some students type
 *   "Sep 2026"         ← abbreviation
 *   "September (Fall)" ← the university table's intake list
 *   null / ""          ← unassigned (no intake picked yet)
 *
 * The cohort view needs to group all of those into a single bucket
 * per (year, season). This module is the single source of truth for
 * that grouping — used by:
 *   - the cohort dashboard (server-rendered, /admin/cohorts)
 *   - the applications list filter (?intake=2026-fall)
 *   - the CSV export filter (?intake=2026-fall)
 *
 * The reverse mapping (raw string → set of rows) is done in the
 * caller by re-running the normalizer on each row's intake.
 */

export interface NormalizedIntake {
  /** Canonical cohort label, e.g. "2026 Fall". Stable sort key. */
  cohort: string;
  /** URL-safe slug, e.g. "2026-fall". Used in query params. */
  slug: string;
}

/** Bucket for raw values that can't be parsed (null, empty, gibberish). */
export const UNASSIGNED_COHORT = 'Unassigned' as const;
export const UNASSIGNED_SLUG = 'none' as const;

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function seasonKey(year: string, season: string): NormalizedIntake {
  return { cohort: `${year} ${cap(season)}`, slug: `${year}-${season.toLowerCase()}` };
}

/**
 * Normalize a raw intake string into a (cohort, slug) pair, or null
 * if the value is unparseable (the caller should bucket it as
 * "Unassigned").
 *
 * The function is intentionally conservative — it only returns a
 * bucket for strings it can confidently classify. A weird value
 * like "TBD 2026" or "Maybe Fall" returns null rather than guessing.
 */
export function normalizeIntake(input: string | null | undefined): NormalizedIntake | null {
  if (!input) return null;
  const s = String(input).trim();
  if (!s) return null;

  // Canonical: "2026 Fall" / "2026 spring" (any case, any whitespace)
  let m = s.match(/^(\d{4})\s+(Spring|Fall|Summer|Winter)\b/i);
  if (m) return seasonKey(m[1], m[2]);

  // Reversed: "Fall 2026" / "spring 2026"
  m = s.match(/^(Spring|Fall|Summer|Winter)\s+(\d{4})\b/i);
  if (m) return seasonKey(m[2], m[1]);

  // Month-year: September/Sept → Fall, March/Mar → Spring
  // (The two big spring/fall intakes. Other months aren't typical
  //  for international-student applications; classify as null.)
  m = s.match(/^(September|Sept|Sep)\s+(\d{4})$/i);
  if (m) return seasonKey(m[2], 'Fall');
  m = s.match(/^(March|Mar)\s+(\d{4})$/i);
  if (m) return seasonKey(m[2], 'Spring');

  // Parenthesized: "September (Fall)" or "March (Spring)" with an
  // optional trailing year. The universities.intake column has
  // values like "September (Fall), March (Spring)" — those don't
  // parse (we only match a single season); we still want partial
  // matches from the application table where the value got
  // accidentally truncated to one half.
  m = s.match(/^(September|Sept|Sep|March|Mar)\s*\((Spring|Fall)\)\s*,?\s*(\d{4})?$/i);
  if (m && m[3]) return seasonKey(m[3], m[2]);

  return null;
}

/**
 * Build the canonical upcoming-cohort list (e.g. ['2026 Fall',
 * '2027 Spring', '2027 Fall', '2028 Spring']). The cohort dashboard
 * shows these as empty cards even when they have zero applications,
 * so the admin sees the next four intake windows at a glance.
 *
 * This mirrors `buildIntendedIntakes()` in src/lib/data.ts so the
 * cohort view and the student wizard show the same labels. Inlined
 * here to keep the normalization module dependency-free.
 */
export function getCanonicalCohorts(now: Date = new Date()): NormalizedIntake[] {
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11
  const out: NormalizedIntake[] = [];
  if (month < 7) {
    // Jan-Jul: current Spring (already passed, but students apply
    // late) + current Fall + 2 more years.
    out.push(seasonKey(String(year), 'Spring'));
    out.push(seasonKey(String(year), 'Fall'));
  } else {
    // Aug-Dec: current Spring is gone.
    out.push(seasonKey(String(year), 'Fall'));
  }
  out.push(seasonKey(String(year + 1), 'Spring'));
  out.push(seasonKey(String(year + 1), 'Fall'));
  out.push(seasonKey(String(year + 2), 'Spring'));
  return out;
}

/**
 * Resolve an `?intake=<slug>` query param into the set of raw
 * strings the applications query needs to filter on. Used by the
 * applications list + CSV export.
 *
 *   ?intake=2026-fall   → returns the set of raw strings that
 *                         normalizeIntake() maps to "2026 Fall".
 *                         We can't reverse-map from a slug alone,
 *                         so we have to normalize every row's
 *                         intake and compare slugs server-side.
 *   ?intake=none        → returns the special sentinel that means
 *                         "raw value was null/empty/unparseable".
 *                         The query turns this into `intake IS NULL
 *                         OR intake = ''` (or a JS-side skip in
 *                         fetchStudentApplications).
 *
 * The caller is expected to either:
 *   (a) do a SQL `.is('intake', null)` filter, or
 *   (b) over-fetch and JS-side filter using normalizeIntake() on
 *       every row.
 *
 * Option (b) is what the cohort-aware list endpoint should do,
 * because we don't have a single canonical-string column to filter
 * on — the raw column is messy and bucketing happens in this util.
 */
export type IntakeFilter =
  | { kind: 'cohort'; cohort: string; slug: string }
  | { kind: 'none' }
  | null;

export function parseIntakeFilter(slug: string | null | undefined): IntakeFilter {
  if (!slug) return null;
  if (slug === UNASSIGNED_SLUG) return { kind: 'none' };

  // Try the 4 canonical slugs first
  const canonical = getCanonicalCohorts();
  const match = canonical.find((c) => c.slug === slug);
  if (match) return { kind: 'cohort', cohort: match.cohort, slug: match.slug };

  // Try to match arbitrary "YYYY-season" slugs (historical cohorts
  // that aren't in the upcoming list). This is what lets a card
  // for "2025 Fall" still work even though the canonical list
  // skips past it.
  const m = slug.match(/^(\d{4})-(spring|fall|summer|winter)$/i);
  if (m) {
    return { kind: 'cohort', cohort: `${m[1]} ${cap(m[2])}`, slug: slug.toLowerCase() };
  }
  return null;
}

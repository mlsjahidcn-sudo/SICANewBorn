/**
 * Shared tally helper for the admin assessments analytics endpoint
 * (Phase 126 follow-up). Lives in lib (not inside the route) so it can
 * be unit-tested — route.ts modules may only export HTTP handlers.
 */

export interface BreakdownEntry {
  label: string;
  count: number;
}

/**
 * Payload guard for "show all countries": there are ~195 countries on
 * Earth, so the admin sees the true full list long before this could
 * ever bite. It only exists so a corrupted table can't balloon the
 * stats response without bound.
 */
export const MAX_DISTINCT = 500;

/**
 * Tally a sampled single-column result and return ALL distinct values.
 *
 * Case-insensitive merge: the public assessment form lets students
 * type their country free-text, so "Nigeria" / "nigeria" / "NIGERIA"
 * are one row, not three. The display label is the most-frequent
 * original spelling (ties → lexicographically smallest, so the list is
 * stable across 30s polls). Values that differ beyond case ("Namibia"
 * vs "Namibian") stay separate — we merge spelling case, not words.
 *
 * Sort: count desc, then label asc.
 */
export function aggregateStrings(
  rows: ReadonlyArray<Record<string, unknown>>,
  field: string = 'country',
): BreakdownEntry[] {
  // lowercase key → total count
  const counts = new Map<string, number>();
  // lowercase key → original spelling → frequency
  const spellings = new Map<string, Map<string, number>>();

  for (const row of rows) {
    const v = row[field];
    if (typeof v !== 'string') continue;
    const trimmed = v.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
    const forms = spellings.get(key) ?? new Map<string, number>();
    forms.set(trimmed, (forms.get(trimmed) ?? 0) + 1);
    spellings.set(key, forms);
  }

  const entries: BreakdownEntry[] = [];
  for (const [key, count] of counts) {
    const forms = spellings.get(key);
    if (!forms) continue; // unreachable, but keeps the type honest
    // Most-frequent spelling; ties → code-point smallest. (localeCompare
    // is case-insensitive, which would leave 'nigeria' vs 'Nigeria'
    // tied at 0 and fall back to insertion order — not deterministic.)
    const label = Array.from(forms.entries()).sort(
      (a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0),
    )[0][0];
    entries.push({ label, count });
  }

  return entries
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, MAX_DISTINCT);
}

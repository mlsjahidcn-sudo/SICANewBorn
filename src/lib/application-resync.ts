/**
 * application-resync.ts
 *
 * Phase 177: re-sync denormalized catalog snapshots on
 * student_applications.
 *
 * ── Finding B ───────────────────────────────────────────────────────
 * `university_name` / `program_name` on student_applications are
 * SNAPSHOTS, written at creation time. Rename a university in the
 * catalog and every historical application row keeps the old name
 * forever. There is no re-sync path — the only fix today is opening
 * each row and retyping it by hand.
 *
 * That matters because these rows are what an advisor reads when they
 * ask "what did this student apply to?", and because the detail page
 * and the CSV export both render the snapshot, not the live catalog.
 * A rename leaves the whole historical record wrong, silently.
 *
 * ─────────────────────────────────────────────────────────────────
 * THE RULE THAT MATTERS: a re-sync NEVER BLANKS A NAME.
 * ─────────────────────────────────────────────────────────────────
 * If the catalog lookup fails — the university was deleted, the slug
 * is 'manual', the row predates the catalog — the EXISTING snapshot is
 * kept exactly as it is and the row is reported as unresolvable.
 *
 * This is the opposite of the obvious implementation, which would be
 * "look up, write whatever comes back" and turn a missing lookup into
 * a NULL. Blanking 200 historical rows to 200 rows reading "—" would
 * destroy the only record of what those students actually applied to.
 * A stale name is embarrassing; an empty one is data loss.
 *
 * Pure module — no Supabase, no React — so the rules are testable
 * independently of any route.
 */

export interface ResyncTarget {
  id: string;
  universityId: string | null;
  universityName: string | null;
  universityNameCn: string | null;
  programId: string | null;
  programName: string | null;
  programNameCn: string | null;
}

export interface CatalogEntry {
  slug: string;
  name: string;
  nameCn: string | null;
}

/** `university_id` is 'manual' for every row entered by hand in the
 *  wizard — a sentinel, not a slug. Trying to look it up would either
 *  miss (fine) or, worse, match some future university whose slug
 *  happens to collide. */
export const MANUAL_ID_SENTINELS = new Set(['', 'manual', 'unknown', 'n/a']);

export interface ResyncPlanEntry {
  id: string;
  /** Only the fields that actually change. Empty = already current. */
  changes: Record<string, string>;
  /** Human-readable reasons a field could not be re-synced. Non-fatal. */
  unresolved: string[];
}

export interface ResyncPlan {
  plan: ResyncPlanEntry[];
  /** Rows that will be written. */
  changed: number;
  /** Rows already matching the catalog. Reported so the admin can see
   *  "38 of 50 were already correct" instead of guessing. */
  alreadyCurrent: number;
  /** Rows where at least one field couldn't be resolved. They may
   *  still be in `changed` for their other fields. */
  withUnresolved: number;
  /** Every distinct unresolved reason, for the result dialog. */
  unresolvedReasons: string[];
}

function isResolvable(id: string | null | undefined): id is string {
  return typeof id === 'string' && !MANUAL_ID_SENTINELS.has(id.trim().toLowerCase());
}

/**
 * Compute what needs writing. Does not touch the database.
 *
 * Only fields whose catalog value is non-empty are ever considered,
 * so a catalog row with a blank name_cn can't erase a good
 * `*_name_cn` the advisor typed.
 */
export function planResync(
  targets: ResyncTarget[],
  universities: CatalogEntry[],
  programs: CatalogEntry[],
): ResyncPlan {
  const uniIndex = new Map(universities.map((u) => [u.slug, u]));
  const progIndex = new Map(programs.map((p) => [p.slug, p]));

  const plan: ResyncPlanEntry[] = [];
  const unresolvedReasons = new Set<string>();
  let changed = 0;
  let alreadyCurrent = 0;
  let withUnresolved = 0;

  for (const t of targets) {
    const changes: Record<string, string> = {};
    const unresolved: string[] = [];

    // ── University ──
    if (!isResolvable(t.universityId)) {
      unresolved.push('university: no catalog slug (entered manually)');
    } else if (!uniIndex.has(t.universityId)) {
      unresolved.push(`university: slug "${t.universityId}" not in catalog`);
    } else {
      const u = uniIndex.get(t.universityId)!;
      if (u.name && u.name !== t.universityName) {
        changes.university_name = u.name;
      }
      // A blank catalog name_cn must NOT clear a good existing one.
      if (u.nameCn && u.nameCn !== t.universityNameCn) {
        changes.university_name_cn = u.nameCn;
      }
    }

    // ── Program ──
    // A null program_id is legitimate — plenty of applications are
    // university-level, with no program chosen yet. Not a problem to
    // report, just nothing to do.
    if (t.programId === null || t.programId === '') {
      // no-op
    } else if (!isResolvable(t.programId)) {
      unresolved.push('program: no catalog slug (entered manually)');
    } else if (!progIndex.has(t.programId)) {
      unresolved.push(`program: slug "${t.programId}" not in catalog`);
    } else {
      const p = progIndex.get(t.programId)!;
      if (p.name && p.name !== t.programName) {
        changes.program_name = p.name;
      }
      if (p.nameCn && p.nameCn !== t.programNameCn) {
        changes.program_name_cn = p.nameCn;
      }
    }

    if (unresolved.length) {
      withUnresolved += 1;
      for (const r of unresolved) unresolvedReasons.add(r);
    }

    if (Object.keys(changes).length === 0) {
      alreadyCurrent += 1;
    } else {
      changed += 1;
    }

    plan.push({ id: t.id, changes, unresolved });
  }

  return {
    plan,
    changed,
    alreadyCurrent,
    withUnresolved,
    unresolvedReasons: [...unresolvedReasons],
  };
}

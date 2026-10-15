/**
 * application-grouping.ts
 *
 * Phase 176: grouping the admin applications list by shortlist.
 *
 * ── Why ────────────────────────────────────────────────────────────
 * Finding C from the admin review: `student_applications` is strictly
 * one row per application, so an advisor managing a 3-university
 * shortlist sees three unrelated rows and has to mentally reassemble
 * them. Part A made shortlists *recordable*; this makes them *usable*.
 *
 * ── The grouping key ───────────────────────────────────────────────
 *   campaignId  → one shortlist created by the builder
 *   studentId   → everything else, including every pre-Phase-175 row
 *                 (campaign_id IS NULL) and every manual entry
 *
 * Student grouping is the fallback rather than a separate mode
 * because it's always correct: two rows for one student ARE one
 * student's list of schools, however they came to exist.
 *
 * ── Flat stays the default ─────────────────────────────────────────
 * This is a pure function over an already-filtered array. Nothing here
 * mutates, re-queries or re-sorts — the caller keeps its existing
 * filtering, sorting, bulk-select and CSV export untouched. The
 * grouped view is strictly additive, which is what keeps that
 * regression risk at zero.
 *
 * No React, no Supabase: unit-testable, and reusable from the
 * student portal later.
 */

export interface GroupableApplication {
  id: string;
  studentId: string | null;
  campaignId?: string | null;
  campaignRole?: string | null;
  status: string;
  university: string;
  program: string;
  createdAt: string;
}

export type GroupKind = 'campaign' | 'student' | 'single';

export interface ApplicationGroup {
  /** Stable key for React + expansion state. */
  key: string;
  kind: GroupKind;
  /** Non-null for campaign/student groups. Null groups fall back to
   *  per-application keys so orphan rows still render. */
  studentId: string | null;
  campaignId: string | null;
  /** 1 row renders as itself — no expander, no collapse. */
  items: GroupableApplication[];
  /** Role tally, only meaningful for kind='campaign'. */
  roleCounts: { Reach: number; Target: number; Safety: number };
  /** True when every member shares one status — the parent row can
   *  then show that status instead of "Mixed". */
  uniformStatus: string | null;
}

/** Rows with no student_id (manual admin entries with an applicant
 *  email) can't be grouped by anything real, so each stands alone.
 *  Grouping them together by intake would fabricate a relationship
 *  that doesn't exist. */
const ORPHAN_PREFIX = 'app:';

export function groupKeyFor(app: GroupableApplication): string {
  if (app.campaignId) return `campaign:${app.campaignId}`;
  if (app.studentId) return `student:${app.studentId}`;
  return `${ORPHAN_PREFIX}${app.id}`;
}

function emptyRoleCounts() {
  return { Reach: 0, Target: 0, Safety: 0 };
}

function tallyRoles(items: GroupableApplication[]) {
  const counts = emptyRoleCounts();
  for (const a of items) {
    if (a.campaignRole === 'Reach') counts.Reach += 1;
    else if (a.campaignRole === 'Target') counts.Target += 1;
    else if (a.campaignRole === 'Safety') counts.Safety += 1;
  }
  return counts;
}

function uniformStatus(items: GroupableApplication[]): string | null {
  const first = items[0]?.status;
  if (!first) return null;
  return items.every((a) => a.status === first) ? first : null;
}

/**
 * Group an already-filtered, already-sorted application list.
 *
 * Input order is preserved: groups appear in the order their first
 * member appeared, and members keep their relative order inside the
 * group. That means the caller's existing sort still reads correctly
 * in the grouped view instead of silently reverting to created_at.
 *
 * `single` groups are emitted when a campaign/student group happens to
 * contain exactly one row. We keep them as groups rather than
 * unwrapping, so the toggle doesn't change the row count and an
 * advisor who groups then un-groups lands back where they started.
 */
export function groupApplications(apps: GroupableApplication[]): ApplicationGroup[] {
  const order: string[] = [];
  const buckets = new Map<string, GroupableApplication[]>();

  for (const app of apps) {
    const key = groupKeyFor(app);
    const existing = buckets.get(key);
    if (existing) existing.push(app);
    else {
      buckets.set(key, [app]);
      order.push(key);
    }
  }

  return order.map((key) => {
    const items = buckets.get(key)!;
    const campaignId = items[0].campaignId ?? null;
    const studentId = items[0].studentId ?? null;
    return {
      key,
      kind: campaignId ? 'campaign' : studentId ? 'student' : 'single',
      studentId,
      campaignId,
      items,
      roleCounts: tallyRoles(items),
      uniformStatus: uniformStatus(items),
    };
  });
}

/** Count only the groups worth collapsing — a `single` group has
 *  nothing to expand, so it's excluded from the "N shortlists" claim
 *  the UI makes. Otherwise the header would say "3 shortlists" when
 *  two of them are one application each. */
export function collapsibleCount(groups: ApplicationGroup[]): number {
  return groups.filter((g) => g.kind !== 'single').length;
}

/** Rows that are part of a real multi-application group. */
export function groupedRowCount(groups: ApplicationGroup[]): number {
  return groups.filter((g) => g.kind !== 'single').reduce((n, g) => n + g.items.length, 0);
}

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import {
  normalizeIntake,
  getCanonicalCohorts,
  UNASSIGNED_COHORT,
  UNASSIGNED_SLUG,
} from '@/lib/intake-normalize';

/**
 * S34: Cohort View — aggregate applications by intake.
 *
 * GET /api/admin/cohorts
 *
 * Returns one bucket per canonical upcoming cohort + one bucket
 * per historical cohort that has at least one application + one
 * "Unassigned" bucket for null/empty/unparseable intakes.
 *
 * The intake column is freeform VARCHAR on both tables, so we
 * normalize via src/lib/intake-normalize.ts. See that file for
 * the set of patterns we recognize.
 *
 * Each bucket carries:
 *   - cohort:        canonical label, e.g. "2026 Fall"
 *   - slug:          URL-safe, e.g. "2026-fall" or "none"
 *   - isCanonical:   true for the 4 upcoming cohorts
 *   - isUnassigned:  true only for the null/empty bucket
 *   - total / studentCount / partnerCount
 *   - byStatus:      { 'Submitted': 2, 'Under Review': 1, ... }
 *   - byPriority:    { 'High': 1, 'Normal': 2, ... }
 *   - sampleNames:   up to 3 names for the hover preview
 *
 * Auth: requireAdmin (Bearer token). Response: { cohorts, totals }.
 */
export async function GET(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const service = buildServiceClient();

    const [studentRes, partnerRes] = await Promise.all([
      service
        .from('student_applications')
        .select('id, intake, status, priority, student_profiles(first_name, last_name)'),
      service
        .from('partner_applications')
        .select('id, intake, status, priority, student_name'),
    ]);

    if (studentRes.error) {
      console.error('[admin/cohorts GET] supabase error:', studentRes.error);
      return NextResponse.json({ error: studentRes.error.message }, { status: 500 });
    }
    if (partnerRes.error) {
      console.error('[admin/cohorts GET] partner supabase error:', partnerRes.error);
      return NextResponse.json({ error: partnerRes.error.message }, { status: 500 });
    }

    interface CohortBucket {
      cohort: string;
      slug: string;
      isCanonical: boolean;
      isUnassigned: boolean;
      total: number;
      studentCount: number;
      partnerCount: number;
      byStatus: Record<string, number>;
      byPriority: Record<string, number>;
      sampleNames: string[];
    }

    const buckets = new Map<string, CohortBucket>();
    const seedBucket = (
      key: string,
      cohort: string,
      slug: string,
      isCanonical: boolean,
      isUnassigned: boolean,
    ): CohortBucket => {
      const b: CohortBucket = {
        cohort,
        slug,
        isCanonical,
        isUnassigned,
        total: 0,
        studentCount: 0,
        partnerCount: 0,
        byStatus: {},
        byPriority: {},
        sampleNames: [],
      };
      buckets.set(key, b);
      return b;
    };

    // Pre-populate the canonical 4 upcoming cohorts so they
    // render as empty cards on the page (gives the admin a
    // "what's coming" view of the next 4 intake windows).
    for (const c of getCanonicalCohorts()) seedBucket(c.cohort, c.cohort, c.slug, true, false);
    seedBucket(UNASSIGNED_COHORT, UNASSIGNED_COHORT, UNASSIGNED_SLUG, false, true);

    const bumpCount = (rec: Record<string, number>, key: string | null | undefined) => {
      if (!key) return;
      rec[key] = (rec[key] || 0) + 1;
    };

    const ensureBucket = (key: string): CohortBucket => {
      const existing = buckets.get(key);
      if (existing) return existing;
      // Historical cohort (e.g. "2025 Fall") — synthesize a slug
      // from the cohort label. The slug format is "<year>-<season>"
      // to match what parseIntakeFilter() expects.
      const m = key.match(/^(\d{4})\s+(Spring|Fall|Summer|Winter)$/i);
      const slug = m
        ? `${m[1]}-${m[2].toLowerCase()}`
        : key.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return seedBucket(key, key, slug, false, false);
    };

    for (const row of studentRes.data || []) {
      const norm = normalizeIntake(row.intake as string | null);
      const key = norm ? norm.cohort : UNASSIGNED_COHORT;
      const b = ensureBucket(key);
      b.total++;
      b.studentCount++;
      bumpCount(b.byStatus, row.status as string);
      if (row.priority) bumpCount(b.byPriority, row.priority as string);
      if (b.sampleNames.length < 3) {
        const sp = Array.isArray(row.student_profiles) ? row.student_profiles[0] : row.student_profiles;
        const name = sp ? `${sp.first_name || ''} ${sp.last_name || ''}`.trim() : '';
        b.sampleNames.push(name || '—');
      }
    }

    for (const row of partnerRes.data || []) {
      const norm = normalizeIntake(row.intake as string | null);
      const key = norm ? norm.cohort : UNASSIGNED_COHORT;
      const b = ensureBucket(key);
      b.total++;
      b.partnerCount++;
      bumpCount(b.byStatus, row.status as string);
      if (row.priority) bumpCount(b.byPriority, row.priority as string);
      if (b.sampleNames.length < 3) {
        b.sampleNames.push((row.student_name as string) || '—');
      }
    }

    // Sort: canonical upcoming cohorts first (in their canonical
    // order, which is time-ordered), then historical by total
    // desc, then Unassigned last. The cohort view should put
    // the "next thing happening" front and center.
    const canonicalOrder = new Map(
      getCanonicalCohorts().map((c, i) => [c.cohort, i] as const),
    );
    const all = Array.from(buckets.values());
    const canonical = all
      .filter((b) => b.isCanonical)
      .sort((a, b) => (canonicalOrder.get(a.cohort) ?? 0) - (canonicalOrder.get(b.cohort) ?? 0));
    const historical = all
      .filter((b) => !b.isCanonical && !b.isUnassigned)
      .sort((a, b) => b.total - a.total);
    const unassigned = all.filter((b) => b.isUnassigned);
    const ordered = [...canonical, ...historical, ...unassigned];

    const totals = ordered.reduce(
      (s, b) => ({
        total: s.total + b.total,
        student: s.student + b.studentCount,
        partner: s.partner + b.partnerCount,
      }),
      { total: 0, student: 0, partner: 0 },
    );

    return NextResponse.json({ cohorts: ordered, totals });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/cohorts GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

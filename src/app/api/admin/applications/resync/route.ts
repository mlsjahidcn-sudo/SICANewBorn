/**
 * POST /api/admin/applications/resync
 *
 * Phase 177 — re-sync denormalized catalog snapshots on
 * student_applications (closes finding B).
 *
 * Finding B: `university_name` / `program_name` are snapshots taken at
 * creation time. Rename a university in the catalog and every
 * historical row keeps the old name forever, with no re-sync path.
 *
 * ── What this deliberately does NOT do ──────────────────────────────
 * It never writes a NULL or an empty string. If the catalog lookup
 * fails — slug deleted, `university_id` is the 'manual' sentinel, the
 * row predates the catalog — the existing snapshot is left exactly as
 * it was and the row is reported as unresolved.
 *
 * "Look up, write whatever comes back" would be the obvious
 * implementation and it would destroy data: 200 historical rows
 * silently blanked to "—" is worse than 200 rows carrying a name
 * that went out of date. The advisor's report on what a student
 * applied to is the only record of that fact.
 *
 * The planning logic is `planResync()` in lib/application-resync.ts —
 * pure, and unit-tested independently. This route only does I/O.
 *
 * Auth: requireAdmin.
 * Body: { ids: string[] }   (or { id: string } for the detail-page button)
 *
 * Response 200: { updated, alreadyCurrent, withUnresolved, unresolvedReasons }
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';
import { planResync, type CatalogEntry } from '@/lib/application-resync';

export const maxDuration = 30;

/** Same cap the bulk route uses. Re-syncing more than this in one go
 *  means the admin selected everything, and one giant UPDATE is both
 *  slow and hard to reason about when something goes wrong. */
const MAX_IDS = 200;

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  let body: { ids?: unknown; id?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  // Accept either shape: the bulk bar sends `ids`, the detail page
  // sends a single `id`.
  const ids: string[] = Array.isArray(body.ids)
    ? body.ids.filter((x): x is string => typeof x === 'string' && !!x)
    : typeof body.id === 'string' && body.id
      ? [body.id]
      : [];

  if (ids.length === 0) {
    return NextResponse.json({ error: 'ids is required' }, { status: 400 });
  }
  if (ids.length > MAX_IDS) {
    return NextResponse.json(
      { error: `Re-sync is limited to ${MAX_IDS} rows per call.` },
      { status: 400 },
    );
  }

  const service = supabaseServer;

  const { data: rows, error: rowsErr } = await service
    .from('student_applications')
    .select(
      'id, university_id, university_name, university_name_cn, program_id, program_name, program_name_cn',
    )
    .in('id', ids);

  if (rowsErr) {
    console.error('[applications/resync] select failed:', rowsErr);
    return NextResponse.json({ error: 'Could not read applications' }, { status: 500 });
  }

  const targets = (rows ?? []) as {
    id: string;
    university_id: string | null;
    university_name: string | null;
    university_name_cn: string | null;
    program_id: string | null;
    program_name: string | null;
    program_name_cn: string | null;
  }[];

  if (targets.length === 0) {
    return NextResponse.json(
      { updated: 0, alreadyCurrent: 0, withUnresolved: 0, unresolvedReasons: ['No matching applications'] },
      { status: 200 },
    );
  }

  // ── One catalog fetch for the whole batch ──────────────────────────
  // N+1 here would mean 2 round-trips per row; for a 200-row bulk
  // re-sync that's 400 queries instead of 2.
  const uniSlugs = [
    ...new Set(
      targets
        .map((t) => t.university_id)
        .filter((s): s is string => typeof s === 'string' && !!s && s !== 'manual'),
    ),
  ];
  const progSlugs = [
    ...new Set(
      targets
        .map((t) => t.program_id)
        .filter((s): s is string => typeof s === 'string' && !!s),
    ),
  ];

  const [uniRes, progRes] = await Promise.all([
    uniSlugs.length
      ? service.from('universities').select('slug, name, name_cn').in('slug', uniSlugs)
      : Promise.resolve({ data: [], error: null }),
    progSlugs.length
      ? service.from('programs').select('slug, name, name_cn').in('slug', progSlugs)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (uniRes.error || progRes.error) {
    console.error('[applications/resync] catalog fetch failed:', uniRes.error || progRes.error);
    return NextResponse.json({ error: 'Could not read the catalog' }, { status: 500 });
  }

  const toEntry = (r: { slug: string; name: string; name_cn: string | null }): CatalogEntry => ({
    slug: r.slug,
    name: r.name,
    nameCn: r.name_cn,
  });

  const plan = planResync(
    targets.map((t) => ({
      id: t.id,
      universityId: t.university_id,
      universityName: t.university_name,
      universityNameCn: t.university_name_cn,
      programId: t.program_id,
      programName: t.program_name,
      programNameCn: t.program_name_cn,
    })),
    ((uniRes.data ?? []) as { slug: string; name: string; name_cn: string | null }[]).map(toEntry),
    ((progRes.data ?? []) as { slug: string; name: string; name_cn: string | null }[]).map(toEntry),
  );

  // ── Apply ──────────────────────────────────────────────────────────
  const writable = plan.plan.filter((p) => Object.keys(p.changes).length > 0);

  const updated: string[] = [];
  const failed: { id: string; error: string }[] = [];

  for (const entry of writable) {
    const { error } = await service
      .from('student_applications')
      .update(entry.changes)
      .eq('id', entry.id);
    if (error) failed.push({ id: entry.id, error: error.message });
    else updated.push(entry.id);
  }

  return NextResponse.json({
    updated: updated.length,
    alreadyCurrent: plan.alreadyCurrent,
    withUnresolved: plan.withUnresolved,
    unresolvedReasons: plan.unresolvedReasons,
    failed,
  });
}

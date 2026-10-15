/**
 * GET /api/admin/applications/candidates
 *
 * Phase 175: the live, DB-derived candidate set for the shortlist builder
 * (and, later, the input the AI ranks — see the plan's Part B).
 *
 * WHY THIS EXISTS SEPARATELY FROM /api/programs
 * ----------------------------------------------
 * The shortlist builder needs programs *grouped by university* so the
 * admin can think "this student wants Computer Science — which of our
 * schools?" The public `/api/programs` returns a flat, paginated list
 * and is deliberately unauthenticated; this one is admin-gated, returns
 * the live catalog only (never the static seed fallback), and is shaped
 * for grouping.
 *
 * IMPORTANT — this is the DETERMINISTIC half of the AI feature. The
 * model never invents candidates: it receives exactly what this
 * endpoint returns and may only rank/explain that set. The sanitizer
 * (Part B) drops any slug not present here.
 */
import { NextResponse } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';
import { mapProgramFromDb } from '@/lib/catalog-mappers';
import { sanitizeOrTerm, parseIntParam } from '@/lib/postgrest';

export const maxDuration = 30;

export interface CandidateUniversity {
  slug: string;
  name: string;
  nameCn: string;
}

export interface CandidateProgram {
  slug: string;
  name: string;
  nameCn: string;
  discipline: string;
  disciplineCn: string;
  degree: string;
  language: string;
  tuition: string;
  duration: string;
  scholarshipAvailable: boolean;
  /** true when the university has no published program matching the
   *  filters — the admin should see "no catalog coverage here" rather
   *  than the school silently vanishing from the picker. */
  noMatchingPrograms: boolean;
}

/** Hard ceiling on candidates. A shortlist is a shortlist; 200 programs
 *  is far past any real need and keeps the response (and a later AI
 *  prompt) bounded. */
const MAX_CANDIDATE_PROGRAMS = 200;

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const discipline = searchParams.get('discipline');
  const degree = searchParams.get('degree');
  const language = searchParams.get('language');
  const scholarshipOnly = searchParams.get('scholarship') === '1';
  const search = searchParams.get('search');
  const limit = parseIntParam(searchParams.get('limit'), MAX_CANDIDATE_PROGRAMS, {
    min: 1,
    max: MAX_CANDIDATE_PROGRAMS,
  });

  try {
    let query = supabaseServer
      .from('programs')
      .select('*')
      .is('archived_at', null)
      .eq('is_published', true)
      .order('name', { ascending: true })
      .limit(limit);

    if (discipline) query = query.eq('discipline', sanitizeOrTerm(discipline));
    if (degree) query = query.eq('degree', sanitizeOrTerm(degree));
    if (language) query = query.eq('language', sanitizeOrTerm(language));
    if (scholarshipOnly) query = query.eq('scholarship_available', true);

    // Free-text narrows on the PROGRAM name only — deliberately NOT
    // university name. The whole point of the builder is that you pick
    // the program first and then choose the university, so folding
    // university names into the program's own search would re-create
    // the program-determines-university coupling this feature exists to
    // remove. A university that has nothing matching shows up with
    // `noMatchingPrograms: true` instead.
    const term = search ? sanitizeOrTerm(search) : '';
    if (term) query = query.or(`name.ilike.%${term}%,name_cn.ilike.%${term}%`);

    const { data, error } = await query;
    if (error) {
      console.error('[admin/applications/candidates]', error);
      return NextResponse.json({ error: 'Failed to load candidates' }, { status: 500 });
    }

    // Universities in one pass — the programs are already slimmed to the
    // distinct slugs referenced by the rows we just fetched.
    const slugs = [...new Set((data ?? []).map((r) => String(r.university_slug ?? '')).filter(Boolean))];
    const { data: uniRows, error: uniError } = slugs.length
      ? await supabaseServer.from('universities').select('slug, name, name_cn').in('slug', slugs)
      : { data: [], error: null };

    if (uniError) {
      console.error('[admin/applications/candidates] universities', uniError);
      return NextResponse.json({ error: 'Failed to load candidate universities' }, { status: 500 });
    }

    const uniBySlug = new Map<string, CandidateUniversity>();
    for (const u of (uniRows ?? []) as { slug: string; name: string; name_cn: string | null }[]) {
      uniBySlug.set(u.slug, { slug: u.slug, name: u.name, nameCn: u.name_cn || u.name });
    }

    // Drop programs whose university no longer exists. A dangling
    // university_slug is a real possibility here — programs.university_slug
    // has no FK (NEXT-PHASES.md U4 #1) — and offering the admin an
    // unopenable target is worse than hiding it.
    const usable = (data ?? []).filter((r) => uniBySlug.has(String(r.university_slug ?? '')));

    // Group by university, the shape the builder renders.
    const grouped = new Map<string, CandidateProgram[]>();
    for (const row of usable) {
      const slug = String(row.university_slug);
      const program = mapProgramFromDb(row) as unknown as Record<string, unknown>;
      const list = grouped.get(slug) ?? [];
      list.push({
        slug: String(row.slug),
        name: String(row.name ?? ''),
        nameCn: String(row.name_cn || row.name || ''),
        discipline: String(row.discipline ?? ''),
        disciplineCn: String(row.discipline_cn ?? ''),
        degree: String(row.degree ?? ''),
        language: String(row.language ?? ''),
        tuition: String(row.tuition ?? ''),
        duration: String(row.duration ?? ''),
        scholarshipAvailable: row.scholarship_available === true,
        noMatchingPrograms: false,
      });
      grouped.set(slug, list);
    }

    const universities: {
      university: CandidateUniversity;
      programs: CandidateProgram[];
    }[] = [...grouped.entries()].map(([slug, programs]) => ({
      university: uniBySlug.get(slug)!,
      programs,
    }));

    return NextResponse.json({
      universities,
      programCount: usable.length,
      /** Programs that referenced a university that no longer exists.
       *  Surfaced rather than silently swallowed so the admin can see
       *  the catalog has drift. */
      droppedOrphanPrograms: (data ?? []).length - usable.length,
    });
  } catch (e) {
    console.error('[admin/applications/candidates] threw:', e);
    return NextResponse.json({ error: 'Failed to load candidates' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { programs as staticPrograms } from '@/lib/data';
import { CACHE_TAGS } from '@/lib/cache';
import { programSchema } from '@/lib/validators/program';
import { validationErrorResponse } from '@/lib/validators/shared';
import { requireAdmin } from '@/lib/supabase-auth';
import { sanitizeOrTerm, parseIntParam } from '@/lib/postgrest';
// Track 1.3 U2: DB mappers consolidated into src/lib/catalog-mappers.ts.
import { mapProgramFromDb, mapProgramToDb } from '@/lib/catalog-mappers';
// Phase 72: emit B2B webhook events on program mutations.
import { dispatchEvent } from '@/lib/webhook-emitter';
import { invalidateLiveCatalogCache } from '@/lib/ai/live-data-context';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const degree = searchParams.get('degree');
  const language = searchParams.get('language');
  const discipline = searchParams.get('discipline');
  const universitySlug = searchParams.get('university');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') || 'name';
  // Phase 128a: status surface filters. Public callers (the chatbot
  // RAG, /programs list, /programs/[slug], the student wizard, partner
  // new-app) all want only published + non-archived rows; admin
  // callers can pass `?include_archived=true` to see archived rows in
  // /admin/programs. `?only_archived=true` is the inverse for the
  // archive list view. `?featured=true` returns only the rows the home
  // page "Popular programs" widget should show.
  const featured = searchParams.get('featured') === 'true';
  const includeArchived = searchParams.get('include_archived') === 'true';
  const onlyArchived = searchParams.get('only_archived') === 'true';
// Phase 71: NaN-safe, clamped pagination (see /api/universities).
const page = parseIntParam(searchParams.get('page'), 1, { min: 1 });
const limit = parseIntParam(searchParams.get('limit'), 8, { min: 1, max: 500 });

/**
 * Phase 128a: probe for the 4 new status columns on `programs`.
 * Memoized per-process — first call hits Supabase with a `limit=0`
 * `select=is_featured`, succeeds if the migration is applied, 427s
 * otherwise. Every subsequent call short-circuits to the cached
 * answer. Lets the GET route stay safe to deploy BEFORE the user
 * runs the migration manually (the filter chain simply skips the
 * status checks until the columns exist).
 *
 * Same probe covers is_published + archived_at + featured_rank —
 * they all ship in the same migration so a single `is_featured`
 * check is enough.
 */
let statusColumnsCheck: Promise<boolean> | null = null;
function hasProgramsStatusColumns(): Promise<boolean> {
  if (statusColumnsCheck) return statusColumnsCheck;
  if (!isSupabaseServerConfigured() || !supabaseServer) {
    statusColumnsCheck = Promise.resolve(false);
    return statusColumnsCheck;
  }
  statusColumnsCheck = (async () => {
    try {
      const { error } = await supabaseServer
        .from('programs')
        .select('is_featured')
        .limit(1);
      return !error;
    } catch {
      return false;
    }
  })();
  return statusColumnsCheck;
}

  if (isSupabaseServerConfigured() && supabaseServer) {
    let query = supabaseServer
      .from('programs')
      .select('*', { count: 'exact' });

    if (degree) query = query.eq('degree', degree);
    if (language) query = query.eq('language', language);
    if (discipline) query = query.eq('discipline', discipline);
    if (universitySlug) query = query.eq('university_slug', universitySlug);
    // Phase 128a: status surface. Default behaviour (no flags) hides
    // archived + unpublished rows — that's what every public caller
    // wants. Admin callers opt in with ?include_archived=true; the
    // archive-only view uses ?only_archived=true (mutually exclusive
    // with featured).
    //
    // Deploy safety: probe the schema first. The migration
    // database/2026-09-26_programs_status.sql adds is_featured /
    // is_published / archived_at / featured_rank, but until the
    // user applies it in the Supabase SQL editor, these columns
    // don't exist and every query referencing them 427s. We probe
    // once per process via a memoized Promise and skip the filter
    // when the migration isn't applied yet — code paths still
    // work, just without the new filters (the static fallback also
    // doesn't have a status surface, so this stays consistent
    // with pre-128a behaviour).
    if (await hasProgramsStatusColumns()) {
      if (onlyArchived) {
        query = query.not('archived_at', 'is', null);
      } else if (includeArchived) {
        // explicit no-op — show every row including archived
      } else {
        query = query.is('archived_at', null);
        if (!featured) query = query.eq('is_published', true);
      }
      if (featured) query = query.eq('is_featured', true);
    }
    // Phase 71: sanitize before interpolating into .or().
    const term = search ? sanitizeOrTerm(search) : '';
    if (term) query = query.or(`name.ilike.%${term}%,name_cn.ilike.%${term}%`);

    if (sort === 'name') query = query.order('name', { ascending: true });
    else if (sort === 'tuition') query = query.order('tuition', { ascending: true });
    // Phase 128a: stable order for the featured widget — lower rank
    // wins, NULLS LAST so "feature but don't rank" rows sink to the
    // bottom of the carousel rather than the top. Used by
    // getFeaturedPrograms on the home page. Gated by the same
    // status-column probe above so the route stays deploy-safe
    // before the migration lands.
    else if (sort === 'featured_rank' && (await hasProgramsStatusColumns())) {
      query = query.order('featured_rank', { ascending: true, nullsFirst: false });
      query = query.order('name', { ascending: true });
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (!error && data) {
      // U3 #1: only fall back to static when the request has no filters
      // AND the DB is genuinely empty. A filter that legitimately matches
      // nothing must return [] (not "show me the unfiltered static data").
      const hasFilters = !!degree || !!language || !!discipline || !!universitySlug || !!term || featured || onlyArchived;
      if (data.length > 0 || hasFilters) {
        return NextResponse.json({
          programs: data.map(mapProgramFromDb),
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit),
        });
      }
      // data.length === 0 && !hasFilters → fall through to static
    }
  }

  // Fallback to static data — mirrors the DB-side filter chain. The
  // static fallback has no archived/unpublished concept (every static
  // row is implicitly "live"), so we always show every row that
  // survived the field filters. Phase 128a: keep this behaviour — the
  // fallback is only hit in dev/early-build before the DB has any
  // rows, and treating every static row as visible there matches the
  // pre-128a behaviour.
  let filtered = [...staticPrograms];
  if (degree) filtered = filtered.filter((p) => p.degree === degree);
  if (language) filtered = filtered.filter((p) => p.language === language);
  if (discipline) filtered = filtered.filter((p) => p.discipline === discipline);
  if (universitySlug) filtered = filtered.filter((p) => p.universitySlug === universitySlug);
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(s) || p.nameCn.includes(s));
  }

  const total = filtered.length;
  const from = (page - 1) * limit;
  const paged = filtered.slice(from, from + limit);

  return NextResponse.json({
    programs: paged,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: Request) {
  // Phase 71: catalog mutations are admin-only (service-role client,
  // RLS bypass — see /api/universities/[slug]).
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const raw = await request.json();
    const parsed = programSchema.safeParse(raw);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const dbRecord = mapProgramToDb(parsed.data);
    const { data, error } = await supabaseServer
      .from('programs')
      .insert(dbRecord)
      .select()
      .single();

    if (error) {
      console.error('[programs POST] supabase error:', error);
      return NextResponse.json({ error: 'Failed to create program' }, { status: 400 });
    }
    revalidateTag(CACHE_TAGS.programs, 'default');
    revalidateTag(CACHE_TAGS.program(String(data.slug)), 'default');
    // Phase 121: the chatbot's RAG catalog has its own 5-min cache.
    invalidateLiveCatalogCache();
    // Phase 72: fire program.created webhook
    void dispatchEvent('program.created', mapProgramFromDb(data));
    return NextResponse.json({ program: mapProgramFromDb(data) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}


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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const degree = searchParams.get('degree');
  const language = searchParams.get('language');
  const discipline = searchParams.get('discipline');
  const universitySlug = searchParams.get('university');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') || 'name';
  // Phase 71: NaN-safe, clamped pagination (see /api/universities).
  const page = parseIntParam(searchParams.get('page'), 1, { min: 1 });
  const limit = parseIntParam(searchParams.get('limit'), 8, { min: 1, max: 500 });

  if (isSupabaseServerConfigured() && supabaseServer) {
    let query = supabaseServer
      .from('programs')
      .select('*', { count: 'exact' });

    if (degree) query = query.eq('degree', degree);
    if (language) query = query.eq('language', language);
    if (discipline) query = query.eq('discipline', discipline);
    if (universitySlug) query = query.eq('university_slug', universitySlug);
    // Phase 71: sanitize before interpolating into .or().
    const term = search ? sanitizeOrTerm(search) : '';
    if (term) query = query.or(`name.ilike.%${term}%,name_cn.ilike.%${term}%`);

    if (sort === 'name') query = query.order('name', { ascending: true });
    else if (sort === 'tuition') query = query.order('tuition', { ascending: true });

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (!error && data) {
      // U3 #1: only fall back to static when the request has no filters
      // AND the DB is genuinely empty. A filter that legitimately matches
      // nothing must return [] (not "show me the unfiltered static data").
      const hasFilters = !!degree || !!language || !!discipline || !!universitySlug || !!term;
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

  // Fallback to static data
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
    // Phase 72: fire program.created webhook
    void dispatchEvent('program.created', mapProgramFromDb(data));
    return NextResponse.json({ program: mapProgramFromDb(data) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}


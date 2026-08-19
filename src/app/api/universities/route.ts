import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { universities as staticUniversities } from '@/lib/data';
import { CACHE_TAGS } from '@/lib/cache';
import { universitySchema } from '@/lib/validators/university';
import { validationErrorResponse } from '@/lib/validators/shared';
import { requireAdmin } from '@/lib/supabase-auth';
import { sanitizeOrTerm, parseIntParam } from '@/lib/postgrest';
// Track 1.3 U2: DB mappers consolidated into src/lib/catalog-mappers.ts.
import { mapUniversityFromDb, mapUniversityToDb } from '@/lib/catalog-mappers';
// Phase 72: emit B2B webhook events on university mutations.
import { dispatchEvent } from '@/lib/webhook-emitter';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const discipline = searchParams.get('discipline');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') || 'ranking';
  // Phase 71: NaN-safe, clamped pagination — ?page=abc used to flow
  // into .range(NaN, NaN) and silently trigger the static fallback.
  const page = parseIntParam(searchParams.get('page'), 1, { min: 1 });
  const limit = parseIntParam(searchParams.get('limit'), 8, { min: 1, max: 500 });

  // Try Supabase first, fall back to static data
  if (isSupabaseServerConfigured() && supabaseServer) {
    let query = supabaseServer
      .from('universities')
      .select('*', { count: 'exact' });

    if (city) query = query.eq('city', city);
    if (discipline) query = query.contains('disciplines', [discipline]);
    // Phase 71: sanitize before interpolating into .or() — raw input
    // containing , ( ) " % _ could rewrite the filter or 400 the query.
    const term = search ? sanitizeOrTerm(search) : '';
    if (term) query = query.or(`name.ilike.%${term}%,name_cn.ilike.%${term}%,city.ilike.%${term}%`);
    
    if (sort === 'ranking') query = query.order('ranking', { ascending: true });
    else if (sort === 'name') query = query.order('name', { ascending: true });
    else if (sort === 'rating') query = query.order('rating', { ascending: false });

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (!error && data && data.length > 0) {
      const mapped = data.map(mapUniversityFromDb);
      return NextResponse.json({
        universities: mapped,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      });
    }
  }

  // Fallback to static data
  let filtered = [...staticUniversities];
  if (city) filtered = filtered.filter((u) => u.city === city);
  if (discipline) filtered = filtered.filter((u) => u.disciplines.includes(discipline));
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (u) => u.name.toLowerCase().includes(s) || u.nameCn.includes(s) || u.city.toLowerCase().includes(s)
    );
  }
  if (sort === 'ranking') filtered.sort((a, b) => a.ranking - b.ranking);
  else if (sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);

  const total = filtered.length;
  const from = (page - 1) * limit;
  const paged = filtered.slice(from, from + limit);

  return NextResponse.json({
    universities: paged,
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
    const parsed = universitySchema.safeParse(raw);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const dbRecord = mapUniversityToDb(parsed.data);
    const { data, error } = await supabaseServer
      .from('universities')
      .insert(dbRecord)
      .select()
      .single();

    if (error) {
      console.error('[universities POST] supabase error:', error);
      return NextResponse.json({ error: 'Failed to create university' }, { status: 400 });
    }
    revalidateTag(CACHE_TAGS.universities, 'default');
    revalidateTag(CACHE_TAGS.university(String(data.slug)), 'default');
    // Phase 72: fire university.created webhook (fire-and-forget;
    // the event emitter handles queueing + delivery)
    void dispatchEvent('university.created', mapUniversityFromDb(data));
    return NextResponse.json({ university: mapUniversityFromDb(data) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}


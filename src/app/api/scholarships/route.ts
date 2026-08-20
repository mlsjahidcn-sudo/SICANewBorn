import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { scholarships as staticScholarships } from '@/lib/data';
import { CACHE_TAGS } from '@/lib/cache';
import { scholarshipSchema } from '@/lib/validators/scholarship';
import { validationErrorResponse } from '@/lib/validators/shared';
import { requireAdmin } from '@/lib/supabase-auth';
import { sanitizeOrTerm, parseIntParam } from '@/lib/postgrest';
// Track 1.3 U2: DB mappers consolidated into src/lib/catalog-mappers.ts.
import { mapScholarshipFromDb, mapScholarshipToDb } from '@/lib/catalog-mappers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const degreeLevel = searchParams.get('degreeLevel');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') || 'name';
  // Phase 71: NaN-safe, clamped pagination (see /api/universities).
  const page = parseIntParam(searchParams.get('page'), 1, { min: 1 });
  const limit = parseIntParam(searchParams.get('limit'), 6, { min: 1, max: 500 });

  if (isSupabaseServerConfigured() && supabaseServer) {
    let query = supabaseServer
      .from('scholarships')
      .select('*', { count: 'exact' });

    if (type) query = query.eq('type', type);
    if (degreeLevel) query = query.contains('degree_levels', [degreeLevel]);
    // Phase 71: sanitize before interpolating into .or().
    const term = search ? sanitizeOrTerm(search) : '';
    if (term) query = query.or(`name.ilike.%${term}%,name_cn.ilike.%${term}%`);

    if (sort === 'name') query = query.order('name', { ascending: true });
    else if (sort === 'deadline') query = query.order('deadline', { ascending: true });

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (!error && data) {
      // U3 #1: only fall back to static when the request has no filters
      // AND the DB is genuinely empty. A filter that legitimately matches
      // nothing must return [] (not "show me the unfiltered static data").
      const hasFilters = !!type || !!degreeLevel || !!term;
      if (data.length > 0 || hasFilters) {
        return NextResponse.json({
          scholarships: data.map(mapScholarshipFromDb),
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
  let filtered = [...staticScholarships];
  if (type) filtered = filtered.filter((s) => s.type === type);
  if (degreeLevel) filtered = filtered.filter((s) => s.degreeLevels.includes(degreeLevel));
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter((sc) => sc.name.toLowerCase().includes(s) || sc.nameCn.includes(s));
  }

  const total = filtered.length;
  const from = (page - 1) * limit;
  const paged = filtered.slice(from, from + limit);

  return NextResponse.json({
    scholarships: paged,
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
    const parsed = scholarshipSchema.safeParse(raw);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const dbRecord = mapScholarshipToDb(parsed.data);
    const { data, error } = await supabaseServer
      .from('scholarships')
      .insert(dbRecord)
      .select()
      .single();

    if (error) {
      console.error('[scholarships POST] supabase error:', error);
      return NextResponse.json({ error: 'Failed to create scholarship' }, { status: 400 });
    }
    revalidateTag(CACHE_TAGS.scholarships, 'default');
    revalidateTag(CACHE_TAGS.scholarship(String(data.slug)), 'default');
    return NextResponse.json({ scholarship: mapScholarshipFromDb(data) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}


import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { scholarships as staticScholarships } from '@/lib/data';
import { CACHE_TAGS } from '@/lib/cache';
import { scholarshipSchema } from '@/lib/validators/scholarship';
import { validationErrorResponse } from '@/lib/validators/shared';
import { requireAdmin } from '@/lib/supabase-auth';
import { sanitizeOrTerm, parseIntParam } from '@/lib/postgrest';

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

    if (!error && data && data.length > 0) {
      return NextResponse.json({
        scholarships: data.map(mapScholarshipFromDb),
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      });
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

function mapScholarshipFromDb(row: Record<string, unknown>) {
  return {
    slug: row.slug,
    name: row.name,
    nameCn: row.name_cn,
    type: row.type,
    degreeLevels: row.degree_levels,
    eligibleRegions: row.eligible_regions,
    duration: row.duration,
    description: row.description,
    descriptionCn: row.description_cn,
    coverage: row.coverage,
    coverageCn: row.coverage_cn,
    requirements: row.requirements,
    requirementsCn: row.requirements_cn,
    applicationProcess: row.application_process,
    applicationProcessCn: row.application_process_cn,
    deadline: row.deadline,
    applicationMethod: row.application_method,
    applicationMethodCn: row.application_method_cn,
  };
}

function mapScholarshipToDb(s: Record<string, unknown>) {
  return {
    slug: s.slug,
    name: s.name,
    name_cn: s.nameCn,
    type: s.type,
    degree_levels: s.degreeLevels,
    eligible_regions: s.eligibleRegions,
    duration: s.duration,
    description: s.description,
    description_cn: s.descriptionCn,
    coverage: s.coverage,
    coverage_cn: s.coverageCn,
    requirements: s.requirements,
    requirements_cn: s.requirementsCn,
    application_process: s.applicationProcess,
    application_process_cn: s.applicationProcessCn,
    deadline: s.deadline,
    application_method: s.applicationMethod,
    application_method_cn: s.applicationMethodCn,
  };
}

import { NextResponse } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { universities as staticUniversities } from '@/lib/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const discipline = searchParams.get('discipline');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') || 'ranking';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '8');

  // Try Supabase first, fall back to static data
  if (isSupabaseServerConfigured() && supabaseServer) {
    let query = supabaseServer
      .from('universities')
      .select('*', { count: 'exact' });

    if (city) query = query.eq('city', city);
    if (discipline) query = query.contains('disciplines', [discipline]);
    if (search) query = query.or(`name.ilike.%${search}%,name_cn.ilike.%${search}%,city.ilike.%${search}%`);
    
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
  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const dbRecord = mapUniversityToDb(body);
    const { data, error } = await supabaseServer
      .from('universities')
      .insert(dbRecord)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ university: mapUniversityFromDb(data) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

function mapUniversityFromDb(row: Record<string, unknown>) {
  return {
    slug: row.slug,
    name: row.name,
    nameCn: row.name_cn,
    city: row.city,
    cityCn: row.city_cn,
    ranking: row.ranking,
    rating: row.rating !== null && row.rating !== undefined ? Number(row.rating) : undefined,
    type: row.type,
    typeCn: row.type_cn,
    established: row.established,
    students: row.students,
    intlStudents: row.intl_students,
    description: row.description,
    descriptionCn: row.description_cn,
    popularPrograms: row.popular_programs ?? [],
    popularProgramsCn: row.popular_programs_cn ?? [],
    tuitionUndergrad: row.tuition_undergrad,
    tuitionGraduate: row.tuition_graduate,
    intake: row.intake,
    intakeCn: row.intake_cn,
    disciplines: row.disciplines ?? [],
    image: row.image,
    logo: row.logo,
    qsRanking: row.qs_ranking,
    qsWorldRanking: row.qs_world_ranking,
    tags: row.tags ?? [],
    tagsCn: row.tags_cn ?? [],
    accommodation: row.accommodation,
    accommodationCn: row.accommodation_cn,
    accommodationCost: row.accommodation_cost,
    accommodationCostCn: row.accommodation_cost_cn,
    accommodationTypes: row.accommodation_types ?? [],
    accommodationTypesCn: row.accommodation_types_cn ?? [],
    gallery: row.gallery ?? [],
    highlights: {
      en: row.highlights_en ?? [],
      zh: row.highlights_zh ?? [],
    },
  };
}

function mapUniversityToDb(u: Record<string, unknown>) {
  return {
    slug: u.slug,
    name: u.name,
    name_cn: u.nameCn,
    city: u.city,
    city_cn: u.cityCn,
    ranking: u.ranking,
    rating: u.rating,
    type: u.type,
    type_cn: u.typeCn,
    established: u.established,
    students: u.students,
    intl_students: u.intlStudents,
    description: u.description,
    description_cn: u.descriptionCn,
    popular_programs: u.popularPrograms,
    popular_programs_cn: u.popularProgramsCn,
    tuition_undergrad: u.tuitionUndergrad,
    tuition_graduate: u.tuitionGraduate,
    intake: u.intake,
    intake_cn: u.intakeCn,
    disciplines: u.disciplines,
    image: u.image,
    logo: u.logo,
    qs_ranking: u.qsRanking,
    qs_world_ranking: u.qsWorldRanking,
    tags: u.tags,
    tags_cn: u.tagsCn,
    accommodation: u.accommodation,
    accommodation_cn: u.accommodationCn,
    accommodation_cost: u.accommodationCost,
    accommodation_cost_cn: u.accommodationCostCn,
    accommodation_types: u.accommodationTypes,
    accommodation_types_cn: u.accommodationTypesCn,
    gallery: u.gallery,
    // Highlights: AI used to return a flat array. The new prompt asks
    // for {en, zh} but we accept both shapes so existing generations
    // and any future ones with the old shape still work.
    highlights_en: extractHighlightArray(u.highlights, 'en'),
    highlights_zh: extractHighlightArray(u.highlights, 'zh'),
  };
}

/**
 * Pull the `en` (or `zh`) sub-array out of a highlights value that
 * may be either:
 *  - the canonical {en: string[], zh: string[]} object (new AI prompt)
 *  - a flat string[] (legacy AI prompt)
 *  - a single string with bullet separators (defensive)
 * Returns an empty array for null/undefined.
 */
function extractHighlightArray(
  value: unknown,
  lang: 'en' | 'zh',
): string[] {
  if (Array.isArray(value)) {
    // Flat array — same content for both languages (legacy shape).
    return value.map((v) => String(v));
  }
  if (value && typeof value === 'object' && lang in (value as Record<string, unknown>)) {
    const arr = (value as Record<string, unknown>)[lang];
    if (Array.isArray(arr)) return arr.map((v) => String(v));
  }
  if (typeof value === 'string') {
    // Bullet-separated string — split and trim.
    return value
      .split(/[\n•·]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

import { NextResponse } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { universities as staticUniversities } from '@/lib/data';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Try Supabase first
  if (isSupabaseServerConfigured() && supabaseServer) {
    const { data, error } = await supabaseServer
      .from('universities')
      .select('*')
      .eq('slug', slug)
      .single();

    if (!error && data) {
      return NextResponse.json({ university: mapUniversityFromDb(data) });
    }
  }

  // Fallback to static data
  const university = staticUniversities.find((u) => u.slug === slug);
  if (!university) {
    return NextResponse.json({ error: 'University not found' }, { status: 404 });
  }
  return NextResponse.json({ university });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { slug } = await params;
  try {
    const body = await request.json();
    const { data, error } = await supabaseServer
      .from('universities')
      .update(mapUniversityToDb(body))
      .eq('slug', slug)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (!data) return NextResponse.json({ error: 'University not found' }, { status: 404 });
    return NextResponse.json({ university: mapUniversityFromDb(data) });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { slug } = await params;
  const { error } = await supabaseServer
    .from('universities')
    .delete()
    .eq('slug', slug);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
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
    scholarshipInfo: row.scholarship_info ?? row.scholarshipInfo,
    scholarshipInfoCn: row.scholarship_info_cn ?? row.scholarshipInfoCn,
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
    // Highlights: accept the new {en, zh} shape, legacy flat array,
    // or bullet-separated string. See extractHighlightArray in
    // src/app/api/universities/route.ts for the full implementation.
    highlights_en: extractHighlightArray(u.highlights, 'en'),
    highlights_zh: extractHighlightArray(u.highlights, 'zh'),
    scholarship_info: u.scholarshipInfo ?? u.scholarship_info,
    scholarship_info_cn: u.scholarshipInfoCn ?? u.scholarship_info_cn,
  };
}

/**
 * Same shape tolerance as the [route.ts] sibling — duplicated here so
 * the [slug] route is self-contained and the [route.ts] file can
 * stay focused on list/create logic.
 */
function extractHighlightArray(
  value: unknown,
  lang: 'en' | 'zh',
): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v));
  }
  if (value && typeof value === 'object' && lang in (value as Record<string, unknown>)) {
    const arr = (value as Record<string, unknown>)[lang];
    if (Array.isArray(arr)) return arr.map((v) => String(v));
  }
  if (typeof value === 'string') {
    return value
      .split(/[\n•·]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

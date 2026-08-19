import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { universities as staticUniversities } from '@/lib/data';
import { CACHE_TAGS } from '@/lib/cache';
import { universitySchema } from '@/lib/validators/university';
import { validationErrorResponse } from '@/lib/validators/shared';
import { requireAdmin } from '@/lib/supabase-auth';

/**
 * For fields the DB doesn't have yet (because the migration hasn't
 * been applied), fall back to the static-data row with the same slug
 * if it exists. Lets the page render useful values for legacy DB
 * rows while the migration is in flight. Once the migration is
 * applied and rows are backfilled, this fallback becomes a no-op.
 */
function withStaticFallback<T>(slug: string, key: keyof (typeof staticUniversities)[number], value: T): T {
  if (value !== undefined && value !== null) return value;
  const staticRow = staticUniversities.find((u) => u.slug === slug);
  return (staticRow?.[key] as T) ?? value;
}

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
  // Phase 71: catalog mutations are admin-only. This route uses the
  // service-role client (RLS bypass), so without this gate anyone
  // could rewrite the catalog.
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { slug } = await params;
  try {
    const raw = await request.json();
    const parsed = universitySchema.safeParse(raw);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const { data, error } = await supabaseServer
      .from('universities')
      .update(mapUniversityToDb(parsed.data))
      .eq('slug', slug)
      .select()
      .single();

    if (error) {
      console.error('[universities/:slug PUT] supabase error:', error);
      return NextResponse.json({ error: 'Failed to update university' }, { status: 400 });
    }
    if (!data) return NextResponse.json({ error: 'University not found' }, { status: 404 });
    revalidateTag(CACHE_TAGS.universities, 'default');
    revalidateTag(CACHE_TAGS.university(slug), 'default');
    return NextResponse.json({ university: mapUniversityFromDb(data) });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Phase 71: admin-only (see PUT above).
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { slug } = await params;
  const { error } = await supabaseServer
    .from('universities')
    .delete()
    .eq('slug', slug);

  if (error) {
    console.error('[universities/:slug DELETE] supabase error:', error);
    return NextResponse.json({ error: 'Failed to delete university' }, { status: 400 });
  }
  revalidateTag(CACHE_TAGS.universities, 'default');
  revalidateTag(CACHE_TAGS.university(slug), 'default');
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
    applicationDeadline: withStaticFallback(
      row.slug as string,
      'applicationDeadline',
      (row.application_deadline ?? row.applicationDeadline) as string | undefined,
    ),
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
    application_deadline: u.applicationDeadline ?? u.application_deadline,
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

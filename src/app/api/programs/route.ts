import { NextResponse } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { programs as staticPrograms } from '@/lib/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const degree = searchParams.get('degree');
  const language = searchParams.get('language');
  const discipline = searchParams.get('discipline');
  const universitySlug = searchParams.get('university');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') || 'name';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '8');

  if (isSupabaseServerConfigured() && supabaseServer) {
    let query = supabaseServer
      .from('programs')
      .select('*', { count: 'exact' });

    if (degree) query = query.eq('degree', degree);
    if (language) query = query.eq('language', language);
    if (discipline) query = query.eq('discipline', discipline);
    if (universitySlug) query = query.eq('university_slug', universitySlug);
    if (search) query = query.or(`name.ilike.%${search}%,name_cn.ilike.%${search}%`);

    if (sort === 'name') query = query.order('name', { ascending: true });
    else if (sort === 'tuition') query = query.order('tuition', { ascending: true });

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (!error && data && data.length > 0) {
      return NextResponse.json({
        programs: data.map(mapProgramFromDb),
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      });
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
  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const dbRecord = mapProgramToDb(body);
    const { data, error } = await supabaseServer
      .from('programs')
      .insert(dbRecord)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ program: mapProgramFromDb(data) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// Fall back to the matching static row for any bilingual (Cn) field
// the DB row doesn't carry — keeps the page rendering in Chinese for
// legacy rows that pre-date the Cn columns. Same pattern as
// /api/universities/[slug]/route.ts.
function cnFallback(slug: string, key: 'disciplineCn' | 'durationCn' | 'intakeCn'): string | undefined {
  const row = staticPrograms.find((p) => p.slug === slug);
  return (row?.[key] as string | undefined) ?? undefined;
}

function mapProgramFromDb(row: Record<string, unknown>) {
  const slug = row.slug as string;
  return {
    slug,
    name: row.name,
    nameCn: row.name_cn,
    universitySlug: row.university_slug,
    degree: row.degree,
    discipline: row.discipline,
    disciplineCn: row.discipline_cn ?? cnFallback(slug, 'disciplineCn'),
    language: row.language,
    duration: row.duration,
    durationCn: row.duration_cn ?? cnFallback(slug, 'durationCn'),
    tuition: row.tuition,
    description: row.description,
    descriptionCn: row.description_cn,
    requirements: row.requirements,
    requirementsCn: row.requirements_cn,
    curriculum: row.curriculum,
    curriculumCn: row.curriculum_cn,
    scholarshipAvailable: row.scholarship_available,
    intake: row.intake,
    intakeCn: row.intake_cn ?? cnFallback(slug, 'intakeCn'),
  };
}

function mapProgramToDb(p: Record<string, unknown>) {
  return {
    slug: p.slug,
    name: p.name,
    name_cn: p.nameCn,
    university_slug: p.universitySlug,
    degree: p.degree,
    discipline: p.discipline,
    discipline_cn: p.disciplineCn,
    language: p.language,
    duration: p.duration,
    duration_cn: p.durationCn,
    tuition: p.tuition,
    description: p.description,
    description_cn: p.descriptionCn,
    requirements: p.requirements,
    requirements_cn: p.requirementsCn,
    curriculum: p.curriculum,
    curriculum_cn: p.curriculumCn,
    scholarship_available: p.scholarshipAvailable,
    intake: p.intake,
    intake_cn: p.intakeCn,
  };
}

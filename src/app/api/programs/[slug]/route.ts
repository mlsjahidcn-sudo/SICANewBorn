import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { programs as staticPrograms } from '@/lib/data';
import { CACHE_TAGS } from '@/lib/cache';
import { programSchema } from '@/lib/validators/program';
import { validationErrorResponse } from '@/lib/validators/shared';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (isSupabaseServerConfigured() && supabaseServer) {
    const { data, error } = await supabaseServer
      .from('programs')
      .select('*')
      .eq('slug', slug)
      .single();

    if (!error && data) {
      return NextResponse.json({ program: mapProgramFromDb(data) });
    }
  }

  const program = staticPrograms.find((p) => p.slug === slug);
  if (!program) {
    return NextResponse.json({ error: 'Program not found' }, { status: 404 });
  }
  return NextResponse.json({ program });
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
    const raw = await request.json();
    const parsed = programSchema.safeParse(raw);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const { data, error } = await supabaseServer
      .from('programs')
      .update(mapProgramToDb(parsed.data))
      .eq('slug', slug)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (!data) return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    revalidateTag(CACHE_TAGS.programs, 'default');
    revalidateTag(CACHE_TAGS.program(slug), 'default');
    return NextResponse.json({ program: mapProgramFromDb(data) });
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
    .from('programs')
    .delete()
    .eq('slug', slug);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidateTag(CACHE_TAGS.programs, 'default');
  revalidateTag(CACHE_TAGS.program(slug), 'default');
  return NextResponse.json({ success: true });
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

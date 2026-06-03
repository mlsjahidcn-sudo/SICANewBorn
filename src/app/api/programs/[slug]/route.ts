import { NextResponse } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { programs as staticPrograms } from '@/lib/data';

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
    const body = await request.json();
    const { data, error } = await supabaseServer
      .from('programs')
      .update(mapProgramToDb(body))
      .eq('slug', slug)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (!data) return NextResponse.json({ error: 'Program not found' }, { status: 404 });
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
  return NextResponse.json({ success: true });
}

function mapProgramFromDb(row: Record<string, unknown>) {
  return {
    slug: row.slug,
    name: row.name,
    nameCn: row.name_cn,
    universitySlug: row.university_slug,
    degree: row.degree,
    discipline: row.discipline,
    language: row.language,
    duration: row.duration,
    tuition: row.tuition,
    description: row.description,
    descriptionCn: row.description_cn,
    requirements: row.requirements,
    requirementsCn: row.requirements_cn,
    curriculum: row.curriculum,
    curriculumCn: row.curriculum_cn,
    scholarshipAvailable: row.scholarship_available,
    intake: row.intake,
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
    language: p.language,
    duration: p.duration,
    tuition: p.tuition,
    description: p.description,
    description_cn: p.descriptionCn,
    requirements: p.requirements,
    requirements_cn: p.requirementsCn,
    curriculum: p.curriculum,
    curriculum_cn: p.curriculumCn,
    scholarship_available: p.scholarshipAvailable,
    intake: p.intake,
  };
}

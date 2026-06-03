import { NextResponse } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { scholarships as staticScholarships } from '@/lib/data';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (isSupabaseServerConfigured() && supabaseServer) {
    const { data, error } = await supabaseServer
      .from('scholarships')
      .select('*')
      .eq('slug', slug)
      .single();

    if (!error && data) {
      return NextResponse.json({ scholarship: mapScholarshipFromDb(data) });
    }
  }

  const scholarship = staticScholarships.find((s) => s.slug === slug);
  if (!scholarship) {
    return NextResponse.json({ error: 'Scholarship not found' }, { status: 404 });
  }
  return NextResponse.json({ scholarship });
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
      .from('scholarships')
      .update(mapScholarshipToDb(body))
      .eq('slug', slug)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (!data) return NextResponse.json({ error: 'Scholarship not found' }, { status: 404 });
    return NextResponse.json({ scholarship: mapScholarshipFromDb(data) });
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
    .from('scholarships')
    .delete()
    .eq('slug', slug);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
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

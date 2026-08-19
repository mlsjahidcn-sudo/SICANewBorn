import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { scholarships as staticScholarships } from '@/lib/data';
import { CACHE_TAGS } from '@/lib/cache';
import { scholarshipSchema } from '@/lib/validators/scholarship';
import { validationErrorResponse } from '@/lib/validators/shared';
import { requireAdmin } from '@/lib/supabase-auth';

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
  // Phase 71: catalog mutations are admin-only (service-role client,
  // RLS bypass — see /api/universities/[slug]).
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
    const parsed = scholarshipSchema.safeParse(raw);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const { data, error } = await supabaseServer
      .from('scholarships')
      .update(mapScholarshipToDb(parsed.data))
      .eq('slug', slug)
      .select()
      .single();

    if (error) {
      console.error('[scholarships/:slug PUT] supabase error:', error);
      return NextResponse.json({ error: 'Failed to update scholarship' }, { status: 400 });
    }
    if (!data) return NextResponse.json({ error: 'Scholarship not found' }, { status: 404 });
    revalidateTag(CACHE_TAGS.scholarships, 'default');
    revalidateTag(CACHE_TAGS.scholarship(slug), 'default');
    return NextResponse.json({ scholarship: mapScholarshipFromDb(data) });
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
    .from('scholarships')
    .delete()
    .eq('slug', slug);

  if (error) {
    console.error('[scholarships/:slug DELETE] supabase error:', error);
    return NextResponse.json({ error: 'Failed to delete scholarship' }, { status: 400 });
  }
  revalidateTag(CACHE_TAGS.scholarships, 'default');
  revalidateTag(CACHE_TAGS.scholarship(slug), 'default');
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

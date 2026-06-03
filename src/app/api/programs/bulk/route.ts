import { NextResponse } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';

export async function POST(request: Request) {
  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { programs } = body;

    if (!Array.isArray(programs) || programs.length === 0) {
      return NextResponse.json({ error: 'Programs array is required and must not be empty' }, { status: 400 });
    }

    if (programs.length > 100) {
      return NextResponse.json({ error: 'Maximum 100 programs per bulk import' }, { status: 400 });
    }

    const dbRecords = programs.map((p: Record<string, unknown>) => ({
      slug: p.slug || `${String(p.name || 'program').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${String(p.universitySlug || 'unknown')}`,
      name: p.name,
      name_cn: p.nameCn || '',
      university_slug: p.universitySlug,
      degree: p.degree,
      discipline: p.discipline,
      discipline_cn: p.disciplineCn || '',
      language: p.language || 'English',
      duration: p.duration || '',
      duration_cn: p.durationCn || '',
      tuition: p.tuition || '',
      description: p.description || '',
      description_cn: p.descriptionCn || '',
      requirements: p.requirements || [],
      requirements_cn: p.requirementsCn || [],
      curriculum: p.curriculum || [],
      curriculum_cn: p.curriculumCn || [],
      scholarship_available: p.scholarshipAvailable === true || p.scholarshipAvailable === 'true',
      intake: p.intake || 'September',
      intake_cn: p.intakeCn || '9月',
    }));

    // Validate required fields
    for (let i = 0; i < dbRecords.length; i++) {
      const r = dbRecords[i];
      if (!r.name || !r.university_slug || !r.degree || !r.discipline) {
        return NextResponse.json(
          { error: `Row ${i + 1}: name, universitySlug, degree, and discipline are required` },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabaseServer
      .from('programs')
      .insert(dbRecords)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      imported: data?.length || 0,
      programs: data?.map(mapProgramFromDb) || [],
    }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid request body';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

function mapProgramFromDb(row: Record<string, unknown>) {
  return {
    slug: row.slug,
    name: row.name,
    nameCn: row.name_cn,
    universitySlug: row.university_slug,
    degree: row.degree,
    discipline: row.discipline,
    disciplineCn: row.discipline_cn,
    language: row.language,
    duration: row.duration,
    durationCn: row.duration_cn,
    tuition: row.tuition,
    description: row.description,
    descriptionCn: row.description_cn,
    requirements: row.requirements,
    requirementsCn: row.requirements_cn,
    curriculum: row.curriculum,
    curriculumCn: row.curriculum_cn,
    scholarshipAvailable: row.scholarship_available,
    intake: row.intake,
    intakeCn: row.intake_cn,
  };
}

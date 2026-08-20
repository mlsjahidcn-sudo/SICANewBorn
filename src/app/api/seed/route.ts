import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';
import { universities, programs, scholarships } from '@/lib/data';

/**
 * POST /api/seed
 *
 * Upserts the static seed data (src/lib/data.ts) into the DB. Useful
 * for one-time bootstrapping a fresh Supabase project — NOT something
 * to expose unauthenticated. Any unauthenticated POST to this route
 * would let an attacker overwrite the catalog with whatever the
 * static seed currently contains (which is fine for greenfield, but
 * still requires an admin to be the one running it).
 *
 * U3 #3: this handler was previously unauthenticated. Added
 * requireAdmin (consistent with every other mutation route). Admin
 * must be signed in (Bearer session via cookies) to invoke.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const results = { universities: 0, programs: 0, scholarships: 0, errors: [] as string[] };

  // Seed universities
  for (const u of universities) {
    const { error } = await supabaseServer
      .from('universities')
      .upsert(
        {
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
          highlights_en: u.highlights.en,
          highlights_zh: u.highlights.zh,
        },
        { onConflict: 'slug' }
      );
    if (error) results.errors.push(`University ${u.slug}: ${error.message}`);
    else results.universities++;
  }

  // Seed programs
  for (const p of programs) {
    const { error } = await supabaseServer
      .from('programs')
      .upsert(
        {
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
        },
        { onConflict: 'slug' }
      );
    if (error) results.errors.push(`Program ${p.slug}: ${error.message}`);
    else results.programs++;
  }

  // Seed scholarships
  for (const s of scholarships) {
    const { error } = await supabaseServer
      .from('scholarships')
      .upsert(
        {
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
          application_process: [s.applicationMethod],
          application_process_cn: [s.applicationMethodCn],
          deadline: s.deadline,
          application_method: s.applicationMethod,
          application_method_cn: s.applicationMethodCn,
        },
        { onConflict: 'slug' }
      );
    if (error) results.errors.push(`Scholarship ${s.slug}: ${error.message}`);
    else results.scholarships++;
  }

  return NextResponse.json({
    message: 'Seeding completed',
    results,
  });
}

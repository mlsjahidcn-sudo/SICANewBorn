import { NextResponse } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';

/**
 * POST /api/programs/bulk
 *
 * Bulk-import programs (used by the admin /admin/programs/bulk
 * paste-text page). Body shape:
 *   { programs: Array<{ name, nameCn?, universidadSlug, degree, ... }> }
 *
 * Two collision risks the route defends against:
 *
 * 1. In-batch duplicates. The user can paste a CSV with two rows
 *    for "BSc in Computer Science" at the same school — the naive
 *    slugifier would emit the same slug for both and the INSERT
 *    would fail. We dedupe within the batch by appending `-2`,
 *    `-3`, etc. to the conflicting slug.
 *
 * 2. Cross-batch duplicates. If the user re-imports the same list
 *    a week later, every row's slug already exists in the DB.
 *    The naive `insert()` would fail with a unique-constraint
 *    violation and roll back the entire batch. We use Supabase's
 *    `upsert()` with `ignoreDuplicates: true` so existing rows
 *    are silently skipped and only the new ones land.
 *
 * Response: { imported, skipped, errors: string[] }
 *   - imported: rows that actually got inserted
 *   - skipped:  rows that were duplicates of existing DB rows
 *               (silently ignored) OR duplicates within the batch
 *               that got a unique suffix
 *   - errors:   rows that failed validation (no name, etc.)
 */
export async function POST(request: Request) {
  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { programs } = body;

    if (!Array.isArray(programs) || programs.length === 0) {
      return NextResponse.json(
        { error: 'Programs array is required and must not be empty' },
        { status: 400 },
      );
    }

    if (programs.length > 200) {
      return NextResponse.json(
        { error: 'Maximum 200 programs per bulk import' },
        { status: 400 },
      );
    }

    // Build the DB records. We slugify the name + universitySlug
    // pair and dedupe within the batch.
    const errors: string[] = [];
    const dbRecords: Record<string, unknown>[] = [];
    const seenSlugs = new Set<string>();
    for (let i = 0; i < programs.length; i++) {
      const p = programs[i] as Record<string, unknown>;
      if (!p.name || !p.universitySlug || !p.degree || !p.discipline) {
        errors.push(
          `Row ${i + 1}: name, universitySlug, degree, and discipline are required`,
        );
        continue;
      }
      const baseSlug = String(p.slug ?? '').trim() ||
        `${slugify(String(p.name))}-${slugify(String(p.universitySlug))}`;
      let slug = baseSlug;
      let suffix = 2;
      while (seenSlugs.has(slug)) {
        slug = `${baseSlug}-${suffix++}`;
      }
      seenSlugs.add(slug);
      dbRecords.push({
        slug,
        name: String(p.name).trim(),
        name_cn: String(p.nameCn || '').trim(),
        university_slug: String(p.universitySlug).trim(),
        degree: String(p.degree).trim(),
        discipline: String(p.discipline).trim(),
        discipline_cn: String(p.disciplineCn || '').trim(),
        language: String(p.language || 'English').trim(),
        duration: String(p.duration || '').trim(),
        duration_cn: String(p.durationCn || '').trim(),
        tuition: String(p.tuition || '').trim(),
        description: String(p.description || '').trim(),
        description_cn: String(p.descriptionCn || '').trim(),
        requirements: Array.isArray(p.requirements) ? p.requirements : [],
        requirements_cn: Array.isArray(p.requirementsCn) ? p.requirementsCn : [],
        curriculum: Array.isArray(p.curriculum) ? p.curriculum : [],
        curriculum_cn: Array.isArray(p.curriculumCn) ? p.curriculumCn : [],
        scholarship_available:
          p.scholarshipAvailable === true || p.scholarshipAvailable === 'true',
        intake: String(p.intake || 'September').trim(),
        intake_cn: String(p.intakeCn || '9月').trim(),
      });
    }

    if (dbRecords.length === 0) {
      // Nothing valid to insert. Return the validation errors +
      // a 400 so the UI can show them.
      return NextResponse.json(
        {
          imported: 0,
          skipped: 0,
          errors,
        },
        { status: 400 },
      );
    }

    // Upsert with ignoreDuplicates so re-importing the same list
    // is a no-op (instead of a unique-constraint 400). Supabase
    // returns the rows that were actually inserted (excluding
    // the ones that already existed).
    const { data, error } = await supabaseServer
      .from('programs')
      .upsert(dbRecords, { onConflict: 'slug', ignoreDuplicates: true })
      .select();

    if (error) {
      console.error('[programs/bulk POST] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const importedCount = data?.length || 0;
    // skipped = (rows we tried to upsert) - (rows that actually inserted).
    // This is a tight approximation: it counts both in-batch
    // collisions (where we picked a unique suffix so they all
    // count as inserts) and cross-batch duplicates (which the DB
    // silently skipped). The UI shows this as "skipped (already
    // existed)" which is the dominant case.
    const skippedCount = Math.max(0, dbRecords.length - importedCount);

    return NextResponse.json(
      {
        imported: importedCount,
        skipped: skippedCount,
        submitted: dbRecords.length,
        errors,
        programs: data?.map(mapProgramFromDb) || [],
      },
      { status: 201 },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid request body';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

/** Slugify a string the way the rest of the app does. */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function mapProgramFromDb(row: Record<string, unknown>) {
  return {
    slug: row.slug,
    name: row.name,
    nameCn: row.name_cn,
    universitySlug: row.universidad_slug,
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

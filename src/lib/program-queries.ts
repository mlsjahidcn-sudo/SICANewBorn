import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { programs as staticPrograms, type Program } from '@/lib/data';

export interface GetProgramsOptions {
  limit?: number;
}

/**
 * Server-only helper for fetching a single program by slug.
 * Tries Supabase first, then falls back to the curated static data.
 */
export async function getProgramBySlug(slug: string): Promise<Program | null> {
  if (isSupabaseServerConfigured() && supabaseServer) {
    const { data, error } = await supabaseServer
      .from('programs')
      .select('*')
      .eq('slug', slug)
      .single();

    if (!error && data) {
      return mapProgramFromDb(data);
    }
  }

  return staticPrograms.find((p) => p.slug === slug) ?? null;
}

/**
 * Server-only helper for fetching programs linked to a university.
 * Tries Supabase first, then falls back to the curated static data.
 */
export async function getProgramsByUniversity(universitySlug: string, limit = 50): Promise<Program[]> {
  if (isSupabaseServerConfigured() && supabaseServer) {
    const { data, error } = await supabaseServer
      .from('programs')
      .select('*')
      .eq('university_slug', universitySlug)
      .order('name', { ascending: true })
      .limit(limit);

    if (!error && data && data.length > 0) {
      return data.map(mapProgramFromDb);
    }
  }

  return staticPrograms
    .filter((p) => p.universitySlug === universitySlug)
    .slice(0, limit);
}

/**
 * Server-only helper for fetching the program list.
 * Tries Supabase first, then falls back to the curated static data.
 * Used by the listing API and by the /programs server page so the
 * initial HTML already contains the grid (no client-side fetch delay).
 */
export async function getPrograms(options: GetProgramsOptions = {}): Promise<Program[]> {
  const { limit = 2000 } = options;

  if (isSupabaseServerConfigured() && supabaseServer) {
    const { data, error } = await supabaseServer
      .from('programs')
      .select('*')
      .order('name', { ascending: true })
      .limit(limit);

    if (!error && data && data.length > 0) {
      return data.map(mapProgramFromDb);
    }
  }

  return staticPrograms.slice(0, limit);
}

function cnFallback(slug: string, key: 'disciplineCn' | 'durationCn' | 'intakeCn'): string | undefined {
  const row = staticPrograms.find((p) => p.slug === slug);
  return (row?.[key] as string | undefined) ?? undefined;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') return value.split(/[\n•·]+/).map((s) => s.trim()).filter(Boolean);
  return [];
}

function mapProgramFromDb(row: Record<string, unknown>): Program {
  const slug = String(row.slug);
  return {
    slug,
    name: String(row.name ?? ''),
    nameCn: String(row.name_cn ?? ''),
    universitySlug: String(row.university_slug ?? ''),
    degree: String(row.degree ?? 'Bachelor') as Program['degree'],
    discipline: String(row.discipline ?? ''),
    disciplineCn: row.discipline_cn ? String(row.discipline_cn) : cnFallback(slug, 'disciplineCn') ?? '',
    language: String(row.language ?? 'English') as Program['language'],
    duration: String(row.duration ?? ''),
    durationCn: row.duration_cn ? String(row.duration_cn) : cnFallback(slug, 'durationCn') ?? '',
    tuition: String(row.tuition ?? ''),
    description: String(row.description ?? ''),
    descriptionCn: String(row.description_cn ?? ''),
    requirements: toStringArray(row.requirements),
    requirementsCn: toStringArray(row.requirements_cn),
    curriculum: toStringArray(row.curriculum),
    curriculumCn: toStringArray(row.curriculum_cn),
    scholarshipAvailable: Boolean(row.scholarship_available),
    intake: String(row.intake ?? ''),
    intakeCn: row.intake_cn ? String(row.intake_cn) : cnFallback(slug, 'intakeCn') ?? '',
  };
}

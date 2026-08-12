import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { scholarships as staticScholarships, type Scholarship } from '@/lib/data';

export interface GetScholarshipsOptions {
  limit?: number;
}

/**
 * Server-only helper for fetching the scholarship list.
 * Tries Supabase first, then falls back to the curated static data.
 * Used by the listing API and by the /scholarships server page so the
 * initial HTML already contains the grid (no client-side fetch delay).
 */
export async function getScholarships(options: GetScholarshipsOptions = {}): Promise<Scholarship[]> {
  const { limit = 500 } = options;

  if (isSupabaseServerConfigured() && supabaseServer) {
    const { data, error } = await supabaseServer
      .from('scholarships')
      .select('*')
      .order('name', { ascending: true })
      .limit(limit);

    if (!error && data && data.length > 0) {
      return data.map(mapScholarshipFromDb);
    }
  }

  return staticScholarships.slice(0, limit);
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') return value.split(/[\n•·]+/).map((s) => s.trim()).filter(Boolean);
  return [];
}

function mapScholarshipFromDb(row: Record<string, unknown>): Scholarship {
  return {
    slug: String(row.slug),
    name: String(row.name),
    nameCn: String(row.name_cn),
    type: String(row.type ?? 'Partial') as Scholarship['type'],
    typeCn: String(row.type_cn),
    coverage: toStringArray(row.coverage),
    coverageCn: toStringArray(row.coverage_cn),
    degreeLevels: toStringArray(row.degree_levels),
    degreeLevelsCn: toStringArray(row.degree_levels_cn),
    eligibleRegions: String(row.eligible_regions),
    eligibleRegionsCn: String(row.eligible_regions_cn),
    duration: String(row.duration),
    durationCn: String(row.duration_cn),
    deadline: String(row.deadline),
    deadlineCn: String(row.deadline_cn),
    description: String(row.description),
    descriptionCn: String(row.description_cn),
    requirements: toStringArray(row.requirements),
    requirementsCn: toStringArray(row.requirements_cn),
    applicationMethod: String(row.application_method),
    applicationMethodCn: String(row.application_method_cn),
    benefits: toStringArray(row.benefits),
    benefitsCn: toStringArray(row.benefits_cn),
    officialLink: String(row.official_link),
  };
}

/**
 * application-candidates.ts
 *
 * Phase 175b: the SINGLE source of the shortlist candidate set.
 *
 * WHY THIS IS A SHARED MODULE AND NOT A ROUTE
 * --------------------------------------------
 * Two things need the same list:
 *   1. GET  /api/admin/applications/candidates — what the builder shows
 *   2. POST /api/admin/ai/recommend-shortlist  — what the model may rank
 *
 * If those were two queries, they would drift: someone adds a filter to
 * one, the AI's idea of "available programs" silently diverges from the
 * advisor's, and the model starts recommending things the UI can't add.
 * That breaks the core guarantee of Part B — **the AI ranks a
 * deterministic, DB-derived set, and never invents one.** One function,
 * one query, one definition of "a candidate".
 *
 * Everything here is deterministic and DB-derived. There is no scoring,
 * no ranking, no inference. The AI layer's entire job is to ORDER this
 * set for a specific student — never to add to it.
 */
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { sanitizeOrTerm } from '@/lib/postgrest';

export interface CandidateProgram {
  slug: string;
  name: string;
  nameCn: string;
  discipline: string;
  disciplineCn: string;
  degree: string;
  language: string;
  tuition: string;
  duration: string;
  scholarshipAvailable: boolean;
}

export interface CandidateUniversity {
  slug: string;
  name: string;
  nameCn: string;
}

export interface CandidateGroup {
  university: CandidateUniversity;
  programs: CandidateProgram[];
}

export interface CandidateSet {
  groups: CandidateGroup[];
  /** Flat program list — what the prompt and sanitizer actually walk. */
  programs: CandidateProgram[];
  programCount: number;
  /** Programs referencing a university_slug that no longer exists.
   *  programs.university_slug has no FK (NEXT-PHASES.md U4 #1), so
   *  orphans are real. Surfaced so drift is visible instead of silent. */
  droppedOrphanPrograms: number;
}

export interface CandidateFilters {
  discipline?: string;
  degree?: string;
  language?: string;
  scholarshipOnly?: boolean;
  search?: string;
  limit?: number;
}

/** Hard ceiling. A shortlist is a shortlist; 200 programs is far past
 *  any real need and keeps both the response and the AI prompt bounded. */
export const MAX_CANDIDATE_PROGRAMS = 200;

export class CandidatesNotConfiguredError extends Error {}

/**
 * Load the candidate set. Throws `CandidatesNotConfiguredError` when
 * Supabase isn't configured; callers map that to a 503.
 */
export async function fetchCandidates(filters: CandidateFilters = {}): Promise<CandidateSet> {
  if (!isSupabaseServerConfigured() || !supabaseServer) {
    throw new CandidatesNotConfiguredError('Database not configured');
  }

  // The limit arrives already-parsed (it may come from an admin query
  // string or a fixed internal cap), so clamp rather than re-parse —
  // parseIntParam is for raw strings and would silently NaN here.
  const limit = Math.min(
    MAX_CANDIDATE_PROGRAMS,
    Math.max(1, filters.limit ?? MAX_CANDIDATE_PROGRAMS),
  );

  let query = supabaseServer
    .from('programs')
    .select('*')
    .is('archived_at', null)
    .eq('is_published', true)
    .order('name', { ascending: true })
    .limit(limit);

  if (filters.discipline) query = query.eq('discipline', sanitizeOrTerm(filters.discipline));
  if (filters.degree) query = query.eq('degree', sanitizeOrTerm(filters.degree));
  if (filters.language) query = query.eq('language', sanitizeOrTerm(filters.language));
  if (filters.scholarshipOnly) query = query.eq('scholarship_available', true);

  // Free-text narrows on the PROGRAM name only — deliberately NOT
  // university name. The builder is program-first: you describe the
  // program you want and see every university offering it. Folding
  // university names in would re-create the program-determines-university
  // coupling Part B exists to remove.
  const term = filters.search ? sanitizeOrTerm(filters.search) : '';
  if (term) query = query.or(`name.ilike.%${term}%,name_cn.ilike.%${term}%`);

  const { data, error } = await query;
  if (error) throw error;

  // Universities in one pass, keyed to the slugs actually referenced.
  const slugs = [...new Set((data ?? []).map((r) => String(r.university_slug ?? '')).filter(Boolean))];
  const { data: uniRows, error: uniError } = slugs.length
    ? await supabaseServer.from('universities').select('slug, name, name_cn').in('slug', slugs)
    : { data: [], error: null };
  if (uniError) throw uniError;

  const uniBySlug = new Map<string, CandidateUniversity>();
  for (const u of (uniRows ?? []) as { slug: string; name: string; name_cn: string | null }[]) {
    uniBySlug.set(u.slug, { slug: u.slug, name: u.name, nameCn: u.name_cn || u.name });
  }

  // Drop programs whose university no longer exists — offering the
  // admin an unopenable target is worse than hiding it.
  const usable = (data ?? []).filter((r) => uniBySlug.has(String(r.university_slug ?? '')));

  const groups = new Map<string, CandidateProgram[]>();
  const programs: CandidateProgram[] = [];
  for (const row of usable) {
    const slug = String(row.university_slug);
    const program: CandidateProgram = {
      slug: String(row.slug),
      name: String(row.name ?? ''),
      nameCn: String(row.name_cn || row.name || ''),
      discipline: String(row.discipline ?? ''),
      disciplineCn: String(row.discipline_cn ?? ''),
      degree: String(row.degree ?? ''),
      language: String(row.language ?? ''),
      tuition: String(row.tuition ?? ''),
      duration: String(row.duration ?? ''),
      scholarshipAvailable: row.scholarship_available === true,
    };
    const list = groups.get(slug) ?? [];
    list.push(program);
    groups.set(slug, list);
    programs.push(program);
  }

  return {
    groups: [...groups.entries()].map(([slug, list]) => ({
      university: uniBySlug.get(slug)!,
      programs: list,
    })),
    programs,
    programCount: programs.length,
    droppedOrphanPrograms: (data ?? []).length - usable.length,
  };
}

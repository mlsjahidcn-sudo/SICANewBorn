/**
 * live-data-context.ts
 *
 * Phase 3: Live catalog context for the AI chatbot.
 *
 * The chatbot used to be wired to a hardcoded 9-university
 * fallback in `src/lib/data.ts`, so anything the admin added
 * through `/admin/universities` was invisible. This module
 * fetches the live Supabase tables (universities, programs,
 * scholarships) and renders them as a compact, RAG-friendly
 * markdown block that gets injected into the chat system
 * prompt. The result: the bot can answer questions about any
 * university / program / scholarship in the system, including
 * ones the admin added yesterday.
 *
 * Token-budget design:
 *   - Universities: one-line summary per school (max 30)
 *   - Programs:     one-line summary, grouped by discipline,
 *                   capped at 24 total programs
 *   - Scholarships: one-line per scholarship (max 20)
 * The full block lands at ~2-3k tokens — well under any
 * model's context window, and small enough that the rule-
 * based fallback path can also use it without bloat.
 *
 * Freshness:
 *   - 5-minute in-memory TTL. Admin changes propagate within
 *     5 min on the next chat. (The first chat after the TTL
 *     expires refetches; subsequent chats in the same window
 *     reuse the cached string.)
 *   - The cache is process-local, so dev-mode HMR + multiple
 *     Node workers each have their own copy. That's fine —
 *     worst case is N copies of the same 2-3k token string.
 *   - On any Supabase error, we fall back to the static
 *     `data.ts` arrays so the bot still works (better a
 *     stale-but-correct answer than no answer).
 *
 * Rendered as plain markdown so the model can quote it
 * verbatim. Each section is a heading + bullet list.
 */

import { universities as staticUniversities, type University } from '@/lib/data';
import { scholarships as staticScholarships, type Scholarship } from '@/lib/data';
import { getSupabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

interface CacheEntry {
  fetchedAt: number;
  context: string;
  universities: University[];
  scholarshipCount: number;
  programCount: number;
}

let cache: CacheEntry | null = null;

/**
 * Map a raw `universities` row into the camelCase `University`
 * shape. Mirrors `mapUniversityFromDb` in `/api/universities/route.ts`
 * so a single source of truth would be ideal — but pulling the
 * mapper out of the API route is a bigger refactor. For now,
 * this stays in sync via comment + a sanity test in the route.
 *
 * Note: the `University` type in data.ts declares most fields
 * as required `string` (e.g. `tuitionUndergrad: string`), even
 * though the DB column is nullable. We normalize null DB values
 * to empty string here so the cast is safe.
 */
function mapUniversityFromDb(row: Record<string, unknown>): University {
  const s = (v: unknown): string => (v == null ? '' : String(v));
  const n = (v: unknown): number => {
    if (v === null || v === undefined || v === '') return 0;
    const num = Number(v);
    return Number.isFinite(num) ? num : 0;
  };
  return {
    slug: s(row.slug),
    name: s(row.name),
    nameCn: s(row.name_cn),
    city: s(row.city),
    cityCn: s(row.city_cn),
    ranking: n(row.ranking),
    rating:
      row.rating !== null && row.rating !== undefined
        ? Number(row.rating)
        : 0,
    type: s(row.type),
    typeCn: s(row.type_cn),
    established: n(row.established),
    students: s(row.students),
    intlStudents: s(row.intl_students),
    description: s(row.description),
    descriptionCn: s(row.description_cn),
    popularPrograms: (row.popular_programs as string[]) ?? [],
    popularProgramsCn: (row.popular_programs_cn as string[]) ?? [],
    tuitionUndergrad: s(row.tuition_undergrad),
    tuitionGraduate: s(row.tuition_graduate),
    intake: s(row.intake),
    intakeCn: s(row.intake_cn),
    disciplines: (row.disciplines as string[]) ?? [],
    image: s(row.image),
    logo: s(row.logo),
    qsRanking: s(row.qs_ranking),
    qsWorldRanking: n(row.qs_world_ranking),
    tags: (row.tags as string[]) ?? [],
    tagsCn: (row.tags_cn as string[]) ?? [],
    accommodation: s(row.accommodation),
    accommodationCn: s(row.accommodation_cn),
    accommodationCost: s(row.accommodation_cost),
    accommodationCostCn: s(row.accommodation_cost_cn),
    accommodationTypes: (row.accommodation_types as string[]) ?? [],
    accommodationTypesCn: (row.accommodation_types_cn as string[]) ?? [],
    gallery: (row.gallery as string[]) ?? [],
    highlights: {
      en: (row.highlights_en as string[]) ?? [],
      zh: (row.highlights_zh as string[]) ?? [],
    },
    scholarshipInfo: s(row.scholarship_info),
    scholarshipInfoCn: s(row.scholarship_info_cn),
    applicationDeadline: s(row.application_deadline),
  };
}

interface ProgramSummary {
  slug: string;
  name: string;
  universitySlug: string;
  degree: string;
  language: string;
  duration: string | null;
  tuition: string | null;
  discipline: string;
}

interface ScholarshipSummary {
  slug: string;
  name: string;
  type: string | null;
  /** What the scholarship covers — array in the DB (e.g. ['Tuition', 'Stipend']). */
  coverage: string[] | null;
  deadline: string | null;
}

interface LiveData {
  universities: University[];
  programs: ProgramSummary[];
  scholarships: ScholarshipSummary[];
  source: 'live' | 'fallback';
}

async function fetchLiveData(): Promise<LiveData> {
  if (!isSupabaseServerConfigured()) {
    return {
      universities: staticUniversities,
      programs: [],
      scholarships: staticScholarships,
      source: 'fallback',
    };
  }
  const supabase = getSupabaseServer();
  if (!supabase) {
    return {
      universities: staticUniversities,
      programs: [],
      scholarships: staticScholarships,
      source: 'fallback',
    };
  }

  // Fire all three queries in parallel — they're independent.
  // Cap each at a reasonable max so a runaway DB can't blow out
  // our token budget.
  const UNI_CAP = 30;
  const PROG_CAP = 24;
  const SCHOL_CAP = 20;

  const [uniRes, progRes, scholRes] = await Promise.all([
    supabase
      .from('universities')
      .select('*')
      .order('ranking', { ascending: true, nullsFirst: false })
      .limit(UNI_CAP),
    supabase
      .from('programs')
      .select('slug, name, university_slug, degree, language, duration, tuition, discipline')
      .order('discipline', { ascending: true })
      .limit(PROG_CAP * 4 /* over-fetch so we can group+cap per discipline */),
    supabase
      .from('scholarships')
      .select('slug, name, type, coverage, amount, deadline')
      .order('name')
      .limit(SCHOL_CAP),
  ]);

  // If the university query failed, fall back. Programs/scholarships
  // are optional additions.
  const universities: University[] = uniRes.error || !uniRes.data
    ? staticUniversities
    : uniRes.data.map(mapUniversityFromDb);

  // If we hit the live universities path but programs failed,
  // still surface what we have.
  const rawPrograms: ProgramSummary[] = !progRes.error && progRes.data
    ? progRes.data.map((r) => ({
        slug: (r.slug as string) ?? '',
        name: (r.name as string) ?? '',
        universitySlug: (r.university_slug as string) ?? '',
        degree: (r.degree as string) ?? '',
        language: (r.language as string) ?? '',
        duration: (r.duration as string) ?? null,
        tuition: (r.tuition as string) ?? null,
        discipline: (r.discipline as string) ?? 'Other',
      }))
    : [];

  // Group programs by discipline + cap total at PROG_CAP.
  // We do at most 3 per discipline so the final list feels
  // representative rather than dominated by one big field.
  const programsByDiscipline = new Map<string, ProgramSummary[]>();
  for (const p of rawPrograms) {
    const arr = programsByDiscipline.get(p.discipline) ?? [];
    if (arr.length < 3) arr.push(p);
    programsByDiscipline.set(p.discipline, arr);
  }
  const programs: ProgramSummary[] = [];
  for (const [, arr] of programsByDiscipline) {
    for (const p of arr) {
      if (programs.length >= PROG_CAP) break;
      programs.push(p);
    }
    if (programs.length >= PROG_CAP) break;
  }

  const scholarships: ScholarshipSummary[] = !scholRes.error && scholRes.data
    ? scholRes.data.map((r) => ({
        slug: (r.slug as string) ?? '',
        name: (r.name as string) ?? '',
        type: (r.type as string) ?? null,
        coverage: (r.coverage as string[] | null) ?? null,
        deadline: (r.deadline as string) ?? null,
      }))
    : staticScholarships.map((s) => ({
        slug: s.slug,
        name: s.name,
        // The static `Scholarship` type uses the strict
        // 'Full' | 'Partial' union for `type` and a string[]
        // for `coverage`; both line up with the live schema.
        type: s.type as string,
        coverage: s.coverage,
        deadline: s.deadline,
      }));

  return {
    universities,
    programs,
    scholarships,
    source: uniRes.error ? 'fallback' : 'live',
  };
}

/**
 * Build a uni lookup for cross-referencing program → university.
 */
function buildUniLookup(universities: University[]): Map<string, University> {
  const m = new Map<string, University>();
  for (const u of universities) m.set(u.slug, u);
  return m;
}

function formatUniversityLine(u: University): string {
  const parts: string[] = [];
  parts.push(`- **${u.name}** (${u.city})`);
  if (u.ranking) parts.push(`ranked #${u.ranking} in China`);
  if (u.qsRanking) parts.push(u.qsRanking);
  if (u.type) parts.push(u.type);
  if (u.established) parts.push(`est. ${u.established}`);
  if (u.disciplines.length > 0) parts.push(`disciplines: ${u.disciplines.slice(0, 5).join(', ')}`);
  if (u.tuitionUndergrad) parts.push(`tuition: ${u.tuitionUndergrad}/yr undergrad`);
  if (u.intake) parts.push(`intake: ${u.intake}`);
  if (u.tags.length > 0) parts.push(`tags: ${u.tags.slice(0, 3).join(', ')}`);
  return parts.join(' · ');
}

function formatProgramLine(p: ProgramSummary, uniLookup: Map<string, University>): string {
  const uni = uniLookup.get(p.universitySlug);
  const uniName = uni?.name ?? p.universitySlug;
  const parts: string[] = [];
  parts.push(`- **${p.name}** at ${uniName}`);
  if (p.degree) parts.push(p.degree);
  if (p.duration) parts.push(p.duration);
  if (p.language) parts.push(`${p.language}-taught`);
  if (p.tuition) parts.push(`tuition: ${p.tuition}`);
  return parts.join(' · ');
}

function formatScholarshipLine(s: ScholarshipSummary): string {
  const parts: string[] = [];
  parts.push(`- **${s.name}**`);
  if (s.type) parts.push(s.type);
  if (s.coverage && s.coverage.length > 0) parts.push(`covers: ${s.coverage.join(', ')}`);
  if (s.deadline) parts.push(`deadline: ${s.deadline}`);
  return parts.join(' · ');
}

function renderContext(data: LiveData): string {
  const sections: string[] = [];
  const uniLookup = buildUniLookup(data.universities);

  // Universities — sort by ranking ascending so top schools come first
  const unis = [...data.universities]
    .filter((u) => u.name)
    .sort((a, b) => {
      const ra = a.ranking ?? 9999;
      const rb = b.ranking ?? 9999;
      return ra - rb;
    });

  sections.push(`## Partner Universities (${unis.length} total in the SICA catalog)`);
  if (unis.length === 0) {
    sections.push('(no university data available right now)');
  } else {
    sections.push(unis.map(formatUniversityLine).join('\n'));
  }

  // Programs — already grouped + capped by discipline
  sections.push(`\n## Sample Programs (${data.programs.length} representative programs across disciplines)`);
  if (data.programs.length === 0) {
    sections.push('(no program data available right now)');
  } else {
    // Group by discipline for readability
    const byDiscipline = new Map<string, ProgramSummary[]>();
    for (const p of data.programs) {
      const arr = byDiscipline.get(p.discipline) ?? [];
      arr.push(p);
      byDiscipline.set(p.discipline, arr);
    }
    const blocks: string[] = [];
    for (const [disc, arr] of byDiscipline) {
      blocks.push(`### ${disc}\n${arr.map((p) => formatProgramLine(p, uniLookup)).join('\n')}`);
    }
    sections.push(blocks.join('\n\n'));
  }

  // Scholarships
  sections.push(`\n## Available Scholarships (${data.scholarships.length} total)`);
  if (data.scholarships.length === 0) {
    sections.push('(no scholarship data available right now)');
  } else {
    sections.push(data.scholarships.map(formatScholarshipLine).join('\n'));
  }

  return sections.join('\n');
}

/**
 * Get the live catalog context. Cached for 5 minutes.
 *
 * Returns the rendered markdown context block. The caller is
 * expected to inject this into the chat system prompt (or the
 * rule-based fallback) as additional reference material.
 */
export async function getLiveCatalogContext(): Promise<string> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.context;
  }

  const data = await fetchLiveData();
  const freshness = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const sourceNote = data.source === 'live'
    ? `(sourced live from the SICA catalog; refreshed ${freshness} UTC)`
    : `(sourced from the static catalog fallback; Supabase not available)`;

  const context = `${sourceNote}\n\n${renderContext(data)}`;

  cache = {
    fetchedAt: now,
    context,
    universities: data.universities,
    scholarshipCount: data.scholarships.length,
    programCount: data.programs.length,
  };

  return context;
}

/**
 * Get the live universities list (mapped to the camelCase
 * `University` shape) for the rule-based fallback's name
 * matching. Same 5-min cache as the context.
 */
export async function getLiveUniversities(): Promise<University[]> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.universities;
  }
  // Force a refresh by going through the context path, which
  // will populate the cache as a side effect.
  await getLiveCatalogContext();
  return cache?.universities ?? staticUniversities;
}

/**
 * Diagnostic: return counts of what's currently cached.
 * Useful for /api/ai/chat?stats=1 or a future healthcheck.
 */
export function getLiveCatalogStats(): { ageMs: number; universities: number; programs: number; scholarships: number } | null {
  if (!cache) return null;
  return {
    ageMs: Date.now() - cache.fetchedAt,
    universities: cache.universities.length,
    programs: cache.programCount,
    scholarships: cache.scholarshipCount,
  };
}

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
  // Phase 4: include the slug right after the name so the LLM
  // can emit the [[CARD:university:<slug>]] inline tag for
  // any school in the catalog (was previously only the 9
  // hardcoded slugs the model had memorized).
  parts.push(`- **${u.name}** (slug: \`${u.slug}\`) (${u.city})`);
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
  // Phase 4: same — include program slug for [[CARD:program:<slug>]]
  // so the model can render a program card for any of the
  // admin-added programs.
  parts.push(`- **${p.name}** (slug: \`${p.slug}\`) at ${uniName}`);
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
 * Get the live programs list (program slug + university slug) for
 * per-query matching. Pulls a fresh batch from Supabase (no cache)
 * because the program set is small (≤149 rows) and the per-uni
 * detail query below already filters by university_slug.
 */
async function getAllProgramSlugs(): Promise<{ slug: string; name: string; universitySlug: string; degree: string; language: string }[]> {
  if (!isSupabaseServerConfigured()) return [];
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('programs')
    .select('slug, name, university_slug, degree, language')
    .order('name')
    .limit(2000);
  if (error || !data) return [];
  return data.map((r) => ({
    slug: (r.slug as string) ?? '',
    name: (r.name as string) ?? '',
    universitySlug: (r.university_slug as string) ?? '',
    degree: (r.degree as string) ?? '',
    language: (r.language as string) ?? '',
  }));
}

async function getAllScholarshipSlugs(): Promise<{ slug: string; name: string }[]> {
  if (!isSupabaseServerConfigured()) return [];
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('scholarships')
    .select('slug, name')
    .order('name')
    .limit(200);
  if (error || !data) return [];
  return data.map((r) => ({
    slug: (r.slug as string) ?? '',
    name: (r.name as string) ?? '',
  }));
}

// Phase 4: per-entity detail blocks for the user's most recent
// message. We pull a university + its full programs list, or a
// program + the parent university, or a scholarship — whichever
// the user asked about. Capped at 2 of each to keep tokens sane.

const MAX_DETAIL_UNIS = 2;
const MAX_DETAIL_PROGS = 2;
const MAX_DETAIL_SCHOLS = 2;
const MAX_PROGRAMS_PER_UNI = 12;

/** Match a user message against a list of named entities. */
function matchByName<T extends { name: string; nameEn?: string; nameCn?: string | null }>(
  message: string,
  items: T[],
  max: number,
): T[] {
  const lower = message.toLowerCase();
  // Rank by name length (longest match first) so a query for
  // "Tianjin University" doesn't get swallowed by a generic
  // "University" partial-match.
  const matches: { item: T; score: number }[] = [];
  for (const item of items) {
    const name = item.name.toLowerCase();
    if (lower.includes(name)) {
      matches.push({ item, score: name.length });
    }
  }
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, max).map((m) => m.item);
}

async function fetchUniversityDetail(slug: string): Promise<string> {
  const supabase = getSupabaseServer();
  if (!supabase) return '';
  const { data: uni } = await supabase
    .from('universities')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (!uni) return '';

  // Pull this university's programs (capped) so the LLM can
  // answer "what programs does X offer" without needing a
  // second round-trip from the user.
  const { data: progs } = await supabase
    .from('programs')
    .select('slug, name, degree, language, duration, tuition, discipline')
    .eq('university_slug', slug)
    .order('name')
    .limit(MAX_PROGRAMS_PER_UNI);

  const lines: string[] = [];
  lines.push(`### ${uni.name as string} (\`${uni.slug as string}\`)`);
  if (uni.city) lines.push(`- **City:** ${uni.city as string}${uni.city_cn ? ` (${uni.city_cn})` : ''}`);
  if (uni.ranking) lines.push(`- **Ranking:** #${uni.ranking} in China${uni.qs_ranking ? `, ${uni.qs_ranking}` : ''}`);
  if (uni.qs_world_ranking) lines.push(`- **QS World:** #${uni.qs_world_ranking}`);
  if (uni.type) lines.push(`- **Type:** ${uni.type as string}`);
  if (uni.established) lines.push(`- **Established:** ${uni.established}`);
  if (uni.students) lines.push(`- **Total students:** ${uni.students}${uni.intl_students ? ` (${uni.intl_students} international)` : ''}`);
  if (uni.disciplines && (uni.disciplines as string[]).length > 0) {
    lines.push(`- **Disciplines:** ${(uni.disciplines as string[]).join(', ')}`);
  }
  if (uni.popular_programs && (uni.popular_programs as string[]).length > 0) {
    lines.push(`- **Popular programs (high-level):** ${(uni.popular_programs as string[]).join(', ')}`);
  }
  if (uni.tuition_undergrad || uni.tuition_graduate) {
    const tu = uni.tuition_undergrad ? `Undergraduate: ${uni.tuition_undergrad}` : '';
    const tg = uni.tuition_graduate ? `Graduate: ${uni.tuition_graduate}` : '';
    lines.push(`- **Tuition:** ${[tu, tg].filter(Boolean).join(' · ')}`);
  }
  if (uni.intake) lines.push(`- **Intake:** ${uni.intake as string}`);
  if (uni.application_deadline) lines.push(`- **Application deadline:** ${uni.application_deadline as string}`);
  if (uni.accommodation) lines.push(`- **Accommodation:** ${uni.accommodation as string}`);
  if (uni.accommodation_cost) lines.push(`- **Accommodation cost:** ${uni.accommodation_cost as string}`);
  if (uni.scholarship_info) lines.push(`- **Scholarships:** ${uni.scholarship_info as string}`);
  if (uni.description) {
    // Truncate long descriptions so a single uni doesn't eat
    // 2k tokens of context. 600 chars is enough for the LLM
    // to quote a "what is X like" answer.
    const d = (uni.description as string).slice(0, 600);
    lines.push(`- **About:** ${d}${d.length === 600 ? '…' : ''}`);
  }
  if (uni.tags && (uni.tags as string[]).length > 0) {
    lines.push(`- **Tags:** ${(uni.tags as string[]).join(', ')}`);
  }

  if (progs && progs.length > 0) {
    lines.push('');
    lines.push(`#### Programs offered (${progs.length}${progs.length === MAX_PROGRAMS_PER_UNI ? '+' : ''})`);
    for (const p of progs as Array<Record<string, unknown>>) {
      const parts: string[] = [];
      parts.push(`- **${p.name as string}** (\`${p.slug as string}\`)`);
      const meta: string[] = [];
      if (p.degree) meta.push(p.degree as string);
      if (p.duration) meta.push(p.duration as string);
      if (p.language) meta.push(`${p.language as string}-taught`);
      if (p.tuition) meta.push(`tuition: ${p.tuition as string}`);
      if (p.discipline) meta.push(`discipline: ${p.discipline as string}`);
      if (meta.length > 0) parts.push(`— ${meta.join(' · ')}`);
      lines.push(parts.join(' '));
    }
  }

  return lines.join('\n');
}

async function fetchProgramDetail(slug: string): Promise<string> {
  const supabase = getSupabaseServer();
  if (!supabase) return '';
  const { data: p } = await supabase
    .from('programs')
    .select('*, university_slug')
    .eq('slug', slug)
    .maybeSingle();
  if (!p) return '';

  // Look up the parent university name for the response
  let uniName = p.university_slug as string;
  const { data: uni } = await supabase
    .from('universities')
    .select('name, slug, city, ranking')
    .eq('slug', p.university_slug as string)
    .maybeSingle();
  if (uni) uniName = `${uni.name as string} (${uni.city as string})`;

  const lines: string[] = [];
  lines.push(`### ${p.name as string} (\`${p.slug as string}\`)`);
  lines.push(`- **University:** ${uniName}${uni ? ` (\`${uni.slug as string}\`)` : ''}`);
  if (p.degree) lines.push(`- **Degree:** ${p.degree as string}`);
  if (p.language) lines.push(`- **Language:** ${p.language as string}-taught`);
  if (p.duration) lines.push(`- **Duration:** ${p.duration as string}`);
  if (p.tuition) lines.push(`- **Tuition:** ${p.tuition as string}`);
  if (p.discipline) lines.push(`- **Discipline:** ${p.discipline as string}`);
  if (p.description) {
    const d = (p.description as string).slice(0, 500);
    lines.push(`- **About:** ${d}${d.length === 500 ? '…' : ''}`);
  }
  return lines.join('\n');
}

async function fetchScholarshipDetail(slug: string): Promise<string> {
  const supabase = getSupabaseServer();
  if (!supabase) return '';
  const { data: s } = await supabase
    .from('scholarships')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (!s) return '';

  const lines: string[] = [];
  lines.push(`### ${s.name as string} (\`${s.slug as string}\`)`);
  if (s.type) lines.push(`- **Type:** ${s.type as string}`);
  if (s.coverage && (s.coverage as string[]).length > 0) {
    lines.push(`- **Coverage:** ${(s.coverage as string[]).join(', ')}`);
  }
  if (s.degree_levels && (s.degree_levels as string[]).length > 0) {
    lines.push(`- **Eligible degree levels:** ${(s.degree_levels as string[]).join(', ')}`);
  }
  if (s.eligible_regions) lines.push(`- **Eligible regions:** ${s.eligible_regions as string}`);
  if (s.duration) lines.push(`- **Duration:** ${s.duration as string}`);
  if (s.deadline) lines.push(`- **Deadline:** ${s.deadline as string}`);
  if (s.description) {
    const d = (s.description as string).slice(0, 500);
    lines.push(`- **About:** ${d}${d.length === 500 ? '…' : ''}`);
  }
  if (s.requirements && (s.requirements as string[]).length > 0) {
    lines.push(`- **Requirements:** ${(s.requirements as string[]).join('; ')}`);
  }
  return lines.join('\n');
}

/**
 * Phase 4: on-demand detail injection.
 *
 * The user mentioned a specific school / program / scholarship
 * in their last message. We detect which, fetch their full
 * records from Supabase, and return a markdown RAG block the
 * route can splice into the system prompt for that one turn.
 *
 * Caps at MAX_DETAIL_UNIS / MAX_DETAIL_PROGS / MAX_DETAIL_SCHOLS
 * so a query like "compare Tsinghua, Peking, Fudan, and
 * Shanghai Jiao Tong" doesn't explode the context window.
 *
 * Returns empty string when nothing matched (so callers can
 * skip the section).
 */
export async function getDetailContext(userMessage: string): Promise<string> {
  if (!userMessage || userMessage.length < 4) return '';

  // Pull name lists from the cache + a fresh full program list.
  // University + scholarship name lists are already in cache;
  // programs are not (the cache only holds 24 sample programs
  // grouped by discipline).
  const [universities, allPrograms, allScholarships] = await Promise.all([
    getLiveUniversities(),
    getAllProgramSlugs(),
    getAllScholarshipSlugs(),
  ]);

  const matchedUnis = matchByName(userMessage, universities, MAX_DETAIL_UNIS);
  const matchedProgs = matchByName(userMessage, allPrograms, MAX_DETAIL_PROGS);
  const matchedSchols = matchByName(userMessage, allScholarships, MAX_DETAIL_SCHOLS);

  if (matchedUnis.length === 0 && matchedProgs.length === 0 && matchedSchols.length === 0) {
    return '';
  }

  // Fetch all detail blocks in parallel. Failures are silently
  // skipped (a missing entity just doesn't get a section).
  const [uniBlocks, progBlocks, scholBlocks] = await Promise.all([
    Promise.all(matchedUnis.map((u) => fetchUniversityDetail(u.slug))),
    Promise.all(matchedProgs.map((p) => fetchProgramDetail(p.slug))),
    Promise.all(matchedSchols.map((s) => fetchScholarshipDetail(s.slug))),
  ]);

  const sections: string[] = [];
  const nonEmptyUni = uniBlocks.filter(Boolean);
  const nonEmptyProg = progBlocks.filter(Boolean);
  const nonEmptySchol = scholBlocks.filter(Boolean);

  if (nonEmptyUni.length > 0) {
    sections.push(`## University Details (per-message, on-demand)\n${nonEmptyUni.join('\n\n')}`);
  }
  if (nonEmptyProg.length > 0) {
    sections.push(`## Program Details (per-message, on-demand)\n${nonEmptyProg.join('\n\n')}`);
  }
  if (nonEmptySchol.length > 0) {
    sections.push(`## Scholarship Details (per-message, on-demand)\n${nonEmptySchol.join('\n\n')}`);
  }

  if (sections.length === 0) return '';
  return sections.join('\n\n') + '\n';
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

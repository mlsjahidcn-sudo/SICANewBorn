import { NextRequest, NextResponse } from 'next/server';
import { getAIProvider } from '@/lib/ai/provider';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';

/**
 * POST /api/admin/universities/bulk-suggest-names
 *
 * Phase 35 — first step of the bulk-AI university generator. Given
 * the existing catalog, asks the AI for 5 NEW Chinese universities
 * that (a) aren't already in the DB and (b) actively accept
 * international students (English-taught programs, scholarship-
 * eligible, public/private with an intl office).
 *
 * Returns the lightest possible payload — only the name + city +
 * slug + ranking needed for the admin's review step. Full detail
 * generation happens in a second pass via the existing
 * `/api/ai/generate-university` endpoint, called once per kept
 * suggestion in parallel from the client. Two-step so the admin
 * can prune bad suggestions before we burn the long-tail tokens.
 *
 * Auth: requireAdmin (admin or super_admin role).
 *
 * Body: none — the existing catalog is read server-side.
 *
 * Response shape:
 *   { suggestions: [{ name, nameCn, slug, city, cityCn, ranking }] }
 *
 * HTTP status:
 *   - 200 ok with `suggestions: []` on AI failure (caller treats as
 *     empty state, no need to re-throw)
 *   - 400 if AI returned malformed JSON after 1 repair attempt
 *   - 401 if no / non-admin auth
 *   - 503 if AI provider not configured or DB unconfigured
 */
export const maxDuration = 120;

interface SuggestedUniversity {
  name: string;
  nameCn: string;
  slug: string;
  city: string;
  cityCn: string;
  ranking: number;
}

// Server-side hard cap — admin sees 5 cards but if the provider
// goes off-script we don't accept more than 7 (5 + 2 slack we
// prune client-side). Lower = more predictable UX.
const MAX_SUGGESTIONS = 7;
const REQUESTED_SUGGESTIONS = 5;

// Prompt: instructs the LLM to bias toward universities that
// accept international students, vary geography + project size,
// and avoid any name/slug overlap with the existing catalog
// passed in the user message.
const SYSTEM_PROMPT = `You are a university data curator for a Chinese-university platform serving international students.

Return a JSON array of EXACTLY ${REQUESTED_SUGGESTIONS} (count: ${REQUESTED_SUGGESTIONS}) new Chinese universities that fit this profile:

1. Actively accept international students — the school runs English-taught programs at undergrad + grad level, has an international student office, and awards scholarships to non-Chinese applicants.
2. Reputable — appear in the QS Asia / ShanghaiRanking / THE World top ~500, OR are well-known specialized schools (e.g. top medical, top finance, top art/design institutes).
3. Not specialized academies that exclude foreigners — skip PLA military academies (e.g. PLA Academy of Military Science, NDU), MFA diplomatic academies, and any school whose name signals "national defence" / "armed police" / "foreign affairs service".
4. Geographic + disciplinary diversity — vary the cities (don't put all 5 in Beijing/Shanghai) and the dominant disciplines (mix engineering, medicine, business, languages, arts, agriculture).

You will be given the current database catalog in the user message. NONE of the names + Chinese names + slugs you generate may overlap with any entry in that list (case-insensitive on name + Chinese name; exact on slug base — no suffix-juggling).

Each array element MUST be a flat object with EXACTLY these field names and types:

[
  {
    "name": "English name (string, e.g. 'Nanjing University')",
    "nameCn": "Chinese name (string, e.g. '南京大学')",
    "slug": "lowercase-hyphenated-english-name (string, ASCII only, ≤60 chars)",
    "city": "City in English (string)",
    "cityCn": "City in Chinese (string)",
    "ranking": "Approximate China-domestic ranking as INTEGER (1-300)"
  }
]

Critical rules:
- Output a top-level JSON ARRAY, not an object. No wrapping object.
- "ranking" must be an INTEGER (number, not string).
- Do NOT add fields beyond the 6 listed.
- Slugs are unique, lowercase, hyphen-separated. No spaces, no underscores, no Chinese characters.
- Do NOT wrap in markdown code blocks or any prose — output ONLY the JSON array.
- Every element must have all 6 fields populated (no nulls, no empty strings).
- Keep the order arbitrary; the client sorts by ranking.

If you genuinely cannot think of ${REQUESTED_SUGGESTIONS} qualifying schools, return as many as you can — at minimum 3 — but never duplicate anyone in the existing list.`;

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const provider = getAIProvider();
  if (!provider.isConfigured) {
    return NextResponse.json(
      {
        error:
          'AI provider not configured. Set DEEPSEEK_API_KEY or DOUBAO_API_KEY on the server.',
      },
      { status: 503 },
    );
  }

  // Read existing catalog — only the fields needed for dedup +
  // ranking-fit comparison. Cap at 500 most-recent to keep the
  // user message well under provider context limits.
  let existingBlock = '(Supabase not configured — falling back to AI general knowledge. Existing names from the static fallback catalog are listed below if present.)';
  if (isSupabaseServerConfigured() && supabaseServer) {
    const { data, error } = await supabaseServer
      .from('universities')
      .select('name, name_cn, slug, city, ranking, intl_students')
      .order('ranking', { ascending: true })
      .limit(500);

    if (!error && data && data.length > 0) {
      // Per-row one-line tag — keeps the block dense so the model
      // can scan all 27+ entries at a glance.
      const lines = data
        .map(
          (r, i) =>
            `${i + 1}. ${r.name} / ${r.name_cn ?? '?'} / slug=${r.slug} / ${r.city ?? '?'} / rank=${r.ranking ?? '?'} / intl=${r.intl_students ?? '?'}`,
        )
        .join('\n');
      existingBlock = `Existing catalog (${data.length} entries — DO NOT repeat any of these names or slugs):

${lines}`;
    }
  }

  const messages: Array<{ role: 'system' | 'user'; content: string }> = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `${existingBlock}\n\nSuggest ${REQUESTED_SUGGESTIONS} new universities that fit the profile and don't overlap with any above. Output ONLY the JSON array.`,
    },
  ];

  try {
    const response = await provider.chat(messages, {
      temperature: 0.4,
      maxTokens: 1500,
    });

    const parsed = parseSuggestions(response.content, linesFromExisting(existingBlock));
    if ('error' in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        suggestions: parsed.suggestions.slice(0, MAX_SUGGESTIONS),
        model: response.model,
      },
      { status: 200 },
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'AI request failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Extract the per-line entries the prompt injects so dedup can
// match against them regardless of how the existing list was built.
function linesFromExisting(block: string): string[] {
  if (!block.startsWith('Existing catalog')) return [];
  return block
    .split('\n')
    .slice(1)
    .map((line) => line.trim())
    .filter((line) => /^\d+\./.test(line));
}

// Parse + validate the LLM's JSON array. Tolerant of markdown
// fences (common LLM fail-mode) and trailing commas. Returns a
// discriminated union — caller chooses between 400 / 200.
function parseSuggestions(
  raw: string,
  existingLines: string[],
): { suggestions: SuggestedUniversity[] } | { error: string } {
  let jsonStr = raw.trim();
  // Strip markdown code fences
  jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  // Strip any prose before the first [ or after the last ]
  const firstBrack = jsonStr.indexOf('[');
  const lastBrack = jsonStr.lastIndexOf(']');
  if (firstBrack === -1 || lastBrack === -1 || lastBrack <= firstBrack) {
    return { error: 'AI did not return a JSON array. Try again.' };
  }
  jsonStr = jsonStr.slice(firstBrack, lastBrack + 1);
  // Trailing-comma repair (LLMs love trailing commas in objects/arrays)
  jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    return { error: 'AI returned invalid JSON. Try again.' };
  }
  if (!Array.isArray(parsed)) {
    return { error: 'AI returned a non-array. Try again.' };
  }

  const existingNames = new Set<string>();
  const existingSlugs = new Set<string>();
  for (const line of existingLines) {
    const nameMatch = line.match(/^\d+\.\s+([^/]+?)\s*\//);
    const slugMatch = line.match(/slug=([^\s/]+)/);
    if (nameMatch) existingNames.add(nameMatch[1].trim().toLowerCase());
    if (slugMatch) existingSlugs.add(slugMatch[1].trim());
  }

  const suggestions: SuggestedUniversity[] = [];
  const seenNames = new Set<string>();
  const seenSlugs = new Set<string>();

  for (const entry of parsed) {
    if (!entry || typeof entry !== 'object') continue;
    const e = entry as Record<string, unknown>;
    const name = typeof e.name === 'string' ? e.name.trim() : '';
    const nameCn = typeof e.nameCn === 'string' ? e.nameCn.trim() : '';
    const slug = typeof e.slug === 'string' ? e.slug.trim().toLowerCase() : '';
    const city = typeof e.city === 'string' ? e.city.trim() : '';
    const cityCn = typeof e.cityCn === 'string' ? e.cityCn.trim() : '';
    const ranking = typeof e.ranking === 'number' ? e.ranking : Number(e.ranking);

    // Skip fields that don't validate — give feedback to the LLM
    // through the user's "Try again" button rather than masking.
    if (
      !name ||
      !nameCn ||
      !slug ||
      !city ||
      !cityCn ||
      !Number.isFinite(ranking) ||
      ranking <= 0
    ) {
      continue;
    }
    // Skip duplicates within the AI's own batch.
    const nameKey = name.toLowerCase();
    if (seenNames.has(nameKey) || seenSlugs.has(slug)) continue;
    // Skip duplicates against the existing catalog.
    if (existingNames.has(nameKey) || existingSlugs.has(slug)) continue;
    seenNames.add(nameKey);
    seenSlugs.add(slug);

    suggestions.push({ name, nameCn, slug, city, cityCn, ranking });
  }

  if (suggestions.length === 0) {
    return {
      error:
        'AI returned suggestions but every name overlapped with the existing catalog. Try again — it usually picks new schools the second time.',
    };
  }

  return { suggestions: suggestions.slice(0, MAX_SUGGESTIONS) };
}

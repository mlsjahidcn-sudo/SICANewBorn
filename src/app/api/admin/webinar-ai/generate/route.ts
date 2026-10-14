import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';
import { isSupabaseServerConfigured, getSupabaseServer } from '@/lib/supabase-server';
import { getAIProvider } from '@/lib/ai/provider';
import { trackServer } from '@/lib/analytics';
import {
  buildWebinarBriefSystemPrompt,
  buildWebinarBriefUserPrompt,
  type WebinarBriefPromptUniversity,
} from '@/lib/ai/webinar-brief-prompt';
import {
  extractRawModelInput,
  normalizeBriefPayload,
} from '@/lib/ai/webinar-brief-sanitize';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Phase 163: AI-generated webinar brief.
 *
 * POST /api/admin/webinar-ai/generate
 *
 * Input body:
 *   {
 *     intent: string,                              // freeform staff prompt
 *     featuredUniversitySlugs: string[],          // up to 5 slugs
 *     sessionDateLabel?: string | null,           // optional context
 *     sessionId?: string | null,                  // not used here; apply route reads it
 *   }
 *
 * Output (200):
 *   {
 *     brief: NormalizedBrief,                      // sanitized + normalized
 *     warnings: string[],                          // sanitization warnings (also in brief.warnings)
 *     rawModelOutput: string,                     // for debugging / diff view
 *     model: string,                               // the provider model that ran
 *   }
 *
 * Errors:
 *   - 400  invalid body
 *   - 401  not admin
 *   - 503  AI provider not configured OR no DB
 *   - 500  AI call failed OR response couldn't be sanitized at all
 *
 * Mirrors the existing /api/admin/universities/refine-scholarship-info
 * pattern: pure sanitize functions are extracted so they can be
 * unit-tested independently of OpenAI-compatible providers.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const intent = typeof body.intent === 'string' ? body.intent.trim() : '';
  const rawSlugs = Array.isArray(body.featuredUniversitySlugs)
    ? body.featuredUniversitySlugs.filter((v): v is string => typeof v === 'string')
    : [];
  const sessionDateLabel =
    typeof body.sessionDateLabel === 'string' && body.sessionDateLabel.trim()
      ? body.sessionDateLabel.trim()
      : null;

  if (!intent) {
    return NextResponse.json({ error: 'intent is required' }, { status: 400 });
  }
  if (rawSlugs.length === 0 || rawSlugs.length > 5) {
    return NextResponse.json(
      { error: 'featuredUniversitySlugs must contain 1-5 entries' },
      { status: 400 },
    );
  }
  const featuredUniversitySlugs = Array.from(new Set(rawSlugs));
  if (featuredUniversitySlugs.length > 5) {
    return NextResponse.json(
      { error: 'featuredUniversitySlugs must contain 1-5 distinct entries' },
      { status: 400 },
    );
  }

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  // Fetch the universities + their programs + scholarships so
  // the prompt has the structured facts the model must preserve.
  // Programs are bound by university_slug (no university_id FK),
  // scholarships have no per-link per the live schema.
  const { data: uniRows, error: uniErr } = await supabase
    .from('universities')
    .select('id, slug, name, name_cn, city')
    .in('slug', featuredUniversitySlugs);
  if (uniErr) {
    console.error('[POST /api/admin/webinar-ai/generate] universities query failed:', uniErr);
    return NextResponse.json({ error: 'Failed to load universities' }, { status: 500 });
  }
  if (!uniRows || uniRows.length === 0) {
    return NextResponse.json(
      { error: 'None of the requested universities exist' },
      { status: 400 },
    );
  }

  // Reorder the rows to match the requested slug order (PostgREST
  // doesn't preserve WHERE IN order — the sanitizer preserves
  // input order, but the prompt input needs to be in the
  // requested order so the AI emits them in the same order).
  const uniBySlug = new Map(uniRows.map((r) => [r.slug as string, r]));
  const orderedUnis = featuredUniversitySlugs
    .map((slug) => uniBySlug.get(slug))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));

  const uniIds = orderedUnis.map((r) => r.id as string);

  // Programs keyed by university_slug (column on programs).
  // Cap at top 5 per school to keep the prompt token-count bounded.
  const { data: programRows, error: programErr } = await supabase
    .from('programs')
    .select('university_slug, name, name_cn')
    .in('university_slug', featuredUniversitySlugs)
    .order('ranking', { ascending: true })
    .limit(100);
  if (programErr) {
    console.error('[POST /api/admin/webinar-ai/generate] programs query failed:', programErr);
    return NextResponse.json({ error: 'Failed to load programs' }, { status: 500 });
  }
  // Group programs by slug — each entry: { name, name_cn }
  const programsBySlug = new Map<string, { name: string; nameCn: string }[]>();
  for (const p of programRows ?? []) {
    const slug = p.university_slug as string;
    if (!programsBySlug.has(slug)) programsBySlug.set(slug, []);
    const arr = programsBySlug.get(slug);
    if (arr && arr.length < 5) {
      arr.push({ name: (p.name as string) ?? '', nameCn: (p.name_cn as string) ?? '' });
    }
  }

  // Scholarships: pick the per-school scholarship(s) whose slug
  // starts with the school's slug. The Phase 162 seed used
  // `<school-slug>-<scholarship-slug>` naming, so this filter
  // is reliable for those; non-matching scholarships get dropped
  // at the prompt input. (The sanitizer whitelist further protects
  // against invented content downstream.)
  const { data: scholarshipRows, error: scholErr } = await supabase
    .from('scholarships')
    .select('slug, name, name_cn')
    .order('slug', { ascending: true })
    .limit(200);
  if (scholErr) {
    console.error('[POST /api/admin/webinar-ai/generate] scholarships query failed:', scholErr);
    return NextResponse.json({ error: 'Failed to load scholarships' }, { status: 500 });
  }
  const scholarshipsBySlug = new Map<string, { name: string; nameCn: string }[]>();
  for (const s of scholarshipRows ?? []) {
    const slug = (s.slug as string) ?? '';
    const owner = featuredUniversitySlugs.find((u) => slug.startsWith(u + '-'));
    if (!owner) continue;
    if (!scholarshipsBySlug.has(owner)) scholarshipsBySlug.set(owner, []);
    const arr = scholarshipsBySlug.get(owner);
    if (arr && arr.length < 3) {
      arr.push({ name: (s.name as string) ?? '', nameCn: (s.name_cn as string) ?? '' });
    }
  }

  const promptInput: WebinarBriefPromptUniversity[] = orderedUnis.map((u) => ({
    slug: u.slug as string,
    name: (u.name as string) ?? '',
    nameZh: (u.name_cn as string) ?? '',
    city: (u.city as string | null) ?? null,
    programs: (programsBySlug.get(u.slug as string) ?? []).map((p) => ({
      name: p.name,
      nameZh: p.nameCn,
    })),
    scholarships: (scholarshipsBySlug.get(u.slug as string) ?? []).map((s) => ({
      name: s.name,
      nameZh: s.nameCn,
    })),
  }));

  // Call the AI provider. The provider abstraction already handles
  // provider selection (doubao | deepseek) via AI_PROVIDER env var.
  const ai = getAIProvider();
  if (!ai.isConfigured) {
    return NextResponse.json(
      { error: 'AI provider not configured. Set DEEPSEEK_API_KEY or DOUBAO_API_KEY on the server.' },
      { status: 503 },
    );
  }

  let rawOutput = '';
  let model = '';
  try {
    const result = await ai.chat(
      [
        { role: 'system', content: buildWebinarBriefSystemPrompt() },
        {
          role: 'user',
          content: buildWebinarBriefUserPrompt({
            intent,
            featuredUniversities: promptInput,
            sessionDateLabel,
          }),
        },
      ],
      { temperature: 0.4, maxTokens: 4000 },
    );
    rawOutput = result.content;
    model = result.model;
  } catch (err) {
    console.error('[POST /api/admin/webinar-ai/generate] provider call failed:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'AI call failed' },
      { status: 502 },
    );
  }

  const parsed = extractRawModelInput(rawOutput);
  if (!parsed) {
    return NextResponse.json(
      {
        error:
          'Model returned output that was not parseable as JSON. Try again or simplify the intent.',
        rawModelOutput: rawOutput.slice(0, 2000),
      },
      { status: 502 },
    );
  }

  const brief = normalizeBriefPayload(parsed, featuredUniversitySlugs);
  if (!brief) {
    return NextResponse.json(
      {
        error:
          'Model returned JSON but every field was empty or every slug was unknown. Try a more specific intent.',
        rawModelOutput: rawOutput.slice(0, 2000),
      },
      { status: 502 },
    );
  }

  // Analytics: log the new mode so GA can segment by slug set.
  trackServer('webinar_brief_generated', {
    locale: 'en',
    university_count: String(promptInput.length),
    topic_count: String(
      brief.featuredUniversities.reduce((acc, u) => acc + Object.keys(u.topics).length, 0),
    ),
    warning_count: String(brief.warnings.length),
    model,
  });

  return NextResponse.json({
    brief,
    warnings: brief.warnings,
    rawModelOutput: rawOutput,
    model,
  });
}
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';
import { captureAIError } from '@/lib/ai/with-capture';
import { checkAdminAIRateLimit } from '@/lib/ai/admin-ai-rate-limit';
import { getAIProvider } from '@/lib/ai/provider';
import {
  extractRefineJson,
  normalizeRefinePayload,
} from '@/lib/ai/university-refine-sanitize';

export const maxDuration = 120;

/**
 * POST /api/admin/universities/refine-scholarship-info
 *
 * Phase 128+ — admin-gated AI refine of the `universities.scholarship_info`
 * (English) and `universities.scholarship_info_cn` (Chinese) free-text
 * fields. Modeled on `/api/programs/ai-parse` (Phase 127) — non-streaming
 * `provider.chat()`, admin auth + per-admin rate limit, plain JSON
 * response shape.
 *
 * The endpoint is **read-only on the server side** — it returns the
 * AI's refined strings but does not write to the DB. The admin's
 * existing save flow (the form's `onSubmit` PUT) persists the values
 * once the admin has reviewed the side-by-side preview in the modal
 * and clicked Accept. This mirrors the chatbot FAQ review pattern:
 * AI proposes, DB only updates after human review.
 *
 * Auth: requireAdmin (admin or super_admin).
 *
 * Body: { slug: string, scholarshipInfo?: string, scholarshipInfoCn?: string }
 *   - At least one of scholarshipInfo / scholarshipInfoCn must be
 *     provided. If only one is, the AI still writes both — EN is a
 *     refine, ZH is a translation of the refine.
 *   - If both are empty / missing the endpoint returns 400 (no source
 *     for the AI to refine).
 *   - slug is validated server-side (no path-traversal / SSRF).
 *
 * Response 200: { en: string, zh: string, model: string }
 *   - Both `en and `zh` are non-empty strings on success.
 *   - On AI parse failure → 502 with a friendly retry message.
 *
 * HTTP status:
 *   - 200 ok with the refined text
 *   - 400 bad payload (no source text, bad slug)
 *   - 401 not authed / not admin
 *   - 429 rate limited (10 / 15 min per admin)
 *   - 502 the AI reply could not be parsed as JSON
 *   - 503 AI provider not configured (DEEPSEEK_API_KEY / DOUBAO_API_KEY)
 */
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const SYSTEM_PROMPT = `You are a copy editor for SICA (Study in China Academy), a Chinese-university information platform that helps international students learn about Chinese universities and apply to study in China. You refine the free-text "Scholarship Information" card on the university detail page.

Input you receive:
  - scholarship_info_en (string, may be empty if user only had a Chinese version)
  - scholarship_info_cn (string, may be empty if user only had an English version)
  - university_name, university_name_cn, city, city_cn, ranking, intl_students
  - popular_programs_en, popular_programs_cn (the row's existing program list)
  - disciplines_en, disciplines_cn

Output you produce — a single JSON object, no markdown fences, no prose:
  {
    "en": "refined English scholarship narrative",
    "zh": "refined Chinese scholarship narrative"
  }

Hard rules — do NOT violate:
  1. **Preserve named scholarships exactly as written** (e.g. if the source mentions "CSC", "Confucius Institute Scholarship", "Sil University Scholarship", keep those names intact in the output — students search for scholarships by name and a renamed scholarship = a missed search).
  2. **Preserve numerical amounts, percentages, and deadlines** exactly (¥ amounts, percent coverage, monthly stipends, application deadlines, dates — all are public-facing facts; do not round, rephrase, or "estimate").
  3. **Do NOT invent scholarship programs** the source text doesn't mention. If the source text is empty, write nothing — return empty strings for both en and zh. Do NOT fill in plausible-sounding scholarships based on the university name alone.
  4. **Auto-translate between en and zh** as needed so the two outputs are coherent cross-language versions of each other, not independent rewrites. When only ONE of the two source fields is populated (the other is empty), produce the missing one by translating from the populated side — do NOT make up new scholarship names that aren't in the source.
  5. If BOTH source fields are empty, return empty strings for both. Never invent content for an entirely blank row.

Style rules:
  - Plain text (no markdown headers, no bullets with markdown syntax — the source page renders this inside a <p> tag). Use newlines for paragraph separation only.
  - Length within ±20% of the source. If the source is 2 sentences, don't produce 5 paragraphs. If the source is 5 paragraphs, expand proportionally rather than shrinking to a tweet.
  - Clear factual tone — what scholarships exist, who is eligible, what is covered, how to apply. No marketing fluff ("world-class", "prestigious"). The reader is comparing universities, not reading a brochure.
  - If the source mentions a link or contact (email, URL, office), preserve it verbatim.`;

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const rl = checkAdminAIRateLimit(auth.user.id, 'refine-scholarship-info');
  if (rl.blocked) return rl.response;

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

  let body: { slug?: unknown; scholarshipInfo?: unknown; scholarshipInfoCn?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
  const scholarshipInfo =
    typeof body.scholarshipInfo === 'string' ? body.scholarshipInfo.trim() : '';
  const scholarshipInfoCn =
    typeof body.scholarshipInfoCn === 'string' ? body.scholarshipInfoCn.trim() : '';

  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ error: 'Invalid university slug.' }, { status: 400 });
  }
  if (!scholarshipInfo && !scholarshipInfoCn) {
    return NextResponse.json(
      {
        error:
          'Provide at least one of scholarshipInfo or scholarshipInfoCn for the AI to refine.',
      },
      { status: 400 },
    );
  }
  if (scholarshipInfo.length > 20_000 || scholarshipInfoCn.length > 20_000) {
    return NextResponse.json(
      { error: 'Source text too long (max 20k chars per field).' },
      { status: 400 },
    );
  }

  // Pull the university row so the prompt has full context (city,
  // ranking, popular programs, disciplines). One RTT to Supabase;
  // falls back to the slug-only context if Supabase isn't configured.
  let rowContext = '';
  if (isSupabaseServerConfigured() && supabaseServer) {
    const { data, error } = await supabaseServer
      .from('universities')
      .select(
        'name, name_cn, city, city_cn, ranking, intl_students, popular_programs, popular_programs_cn, disciplines',
      )
      .eq('slug', slug)
      .maybeSingle();
    if (!error && data) {
      const p = data as Record<string, unknown>;
      rowContext = [
        `University name: ${p.name} (${p.name_cn ?? ''})`,
        `City: ${p.city ?? ''} (${p.city_cn ?? ''})`,
        `Ranking: ${p.ranking ?? 'n/a'}`,
        `International students: ${p.intl_students ?? 'n/a'}`,
        `Popular programs (en): ${Array.isArray(p.popular_programs) ? p.popular_programs.join(', ') : ''}`,
        `Popular programs (cn): ${Array.isArray(p.popular_programs_cn) ? p.popular_programs_cn.join(', ') : ''}`,
        `Disciplines: ${Array.isArray(p.disciplines) ? p.disciplines.join(', ') : ''}`,
      ].join('\n');
    }
  }

  const messages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    {
      role: 'user' as const,
      content: `University slug: ${slug}

${rowContext || '(university row context unavailable — refine based on the source text alone)'}

--- Source text the admin wrote (to be refined) ---

scholarship_info_en:
${scholarshipInfo || '(empty — please return an empty string for "en")'}

scholarship_info_cn:
${scholarshipInfoCn || '(empty — please return an empty string for "zh")'}

--- Output ---
Respond with ONLY the JSON object ({"en": "...", "zh": "..."}). No markdown fences, no prose.`,
    },
  ];

  try {
    // Low temperature: this is factual editing, not creative writing.
    // 1500 max_tokens is enough for ~two paragraphs × 2 languages.
    const response = await provider.chat(messages, {
      temperature: 0.3,
      maxTokens: 1500,
    });

    const parsed = extractRefineJson(response.content);
    if (!parsed) {
      captureAIError('admin-refine-scholarship-info', new Error('No JSON object in model output'), {
        stage: 'parse',
        responseModel: response.model,
        responseLength: response.content.length,
      });
      return NextResponse.json(
        {
          error:
            'The AI reply could not be read as a refine payload. Try again — rephrasing or shortening the source text usually helps.',
        },
        { status: 502 },
      );
    }

    const { en, zh } = normalizeRefinePayload(parsed);

    // If both sources were empty (the admin never wrote anything),
    // the model must return empty strings — never invent content.
    // When only ONE source is empty, translating from the
    // populated side is the expected behaviour (the user asked
    // for auto-translation between fields).
    if (!scholarshipInfo && !scholarshipInfoCn && (en || zh)) {
      return NextResponse.json(
        {
          error:
            'AI returned content even though both source fields were empty — refusing to save invented copy. Add at least some text on one side first.',
        },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { en, zh, model: response.model },
      { status: 200 },
    );
  } catch (err) {
    captureAIError('admin-refine-scholarship-info', err, { stage: 'request' });
    const errorMessage = err instanceof Error ? err.message : 'AI request failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
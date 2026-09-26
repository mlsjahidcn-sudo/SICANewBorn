import { NextRequest, NextResponse } from 'next/server';
import { getAIProvider } from '@/lib/ai/provider';
import { requireAdmin } from '@/lib/supabase-auth';
import { captureAIError } from '@/lib/ai/with-capture';
import { checkAdminAIRateLimit } from '@/lib/ai/admin-ai-rate-limit';
import {
  extractProgramsJson,
  normalizeProgramRows,
  MAX_PARSED_PROGRAMS,
} from '@/lib/ai/program-parse-sanitize';

/**
 * POST /api/programs/ai-parse
 *
 * Phase 127 — "AI Parse" mode for the admin bulk program import
 * (/admin/programs/bulk). The admin picks a university and pastes
 * free-form notes (degree headings + comma lists, messy text, either
 * language); this endpoint sends the text to the AI provider and
 * returns structured program rows shaped for the existing preview
 * table. Nothing is written to the DB here — the admin reviews the
 * rows and the existing POST /api/programs/bulk does the insert
 * (slug dedupe + idempotent upsert).
 *
 * Auth: requireAdmin (admin or super_admin role), same as
 * /api/programs/bulk. Rate-limited via checkAdminAIRateLimit.
 *
 * Body: { text: string, universitySlug: string }
 *
 * Response 200: { programs: ParsedProgramRow[], warnings: string[], model }
 *   - `programs` may be empty with warnings explaining why.
 * HTTP status:
 *   - 200 ok (possibly with zero rows)
 *   - 400 bad body (missing/oversized text or universitySlug)
 *   - 401 if no / non-admin auth
 *   - 429 rate limited (10 parses / 15 min per admin)
 *   - 502 the AI replied but no JSON array could be recovered
 *   - 503 AI provider not configured
 */
export const maxDuration = 120;

// Input guard. 30k chars is ~10x a realistic university program
// list; the cap keeps the provider prompt well under context limits.
const MAX_INPUT_CHARS = 30_000;

const SYSTEM_PROMPT = `You are a data-entry assistant for SICA (Study in China Academy), a platform listing Chinese universities and their programs for international students.

You will receive an admin's raw notes listing the majors/programs a university offers, grouped by degree level. Your job is to turn them into structured program rows.

Output a top-level JSON ARRAY. Each element MUST be a flat object with EXACTLY these field names (all strings except the boolean):

[
  {
    "name": "English program name",
    "nameCn": "Chinese program name (or empty string)",
    "degree": "Bachelor | Master | PhD",
    "discipline": "Broad discipline in English",
    "disciplineCn": "Broad discipline in Chinese (or empty string)",
    "language": "English | Chinese | Bilingual (or empty string)",
    "duration": "only if the notes state it, e.g. '4 years'",
    "durationCn": "Chinese duration, e.g. '4年' (only if stated)",
    "tuition": "only if the notes state it, e.g. '¥30,000/year'",
    "intake": "only if the notes state it, e.g. 'September'",
    "intakeCn": "e.g. '9月' (only if stated)",
    "scholarshipAvailable": false
  }
]

Rules:
- "name": a clean, public-facing English program title. Translate Chinese major names (计算机科学与技术 → Computer Science and Technology). Prefix with the degree abbreviation when natural (BSc in ..., MSc in ..., PhD in ...) and stay consistent within the batch.
- "nameCn"/"disciplineCn": use the Chinese name from the notes when present; otherwise give the standard Chinese translation of the major — these are conventional, not guesses. Use "" only when genuinely unsure.
- "degree": EXACTLY one of Bachelor, Master, PhD. Infer from the heading the program sits under (本科/Undergraduate → Bachelor, 硕士 → Master, 博士 → PhD).
- "discipline": the broad field in English (e.g. Computer Science, Business Administration, Clinical Medicine, Civil Engineering) — not a copy of the program name unless nothing broader applies.
- "language"/"duration"/"durationCn"/"tuition"/"intake"/"intakeCn": fill ONLY from what the notes state (a note like "English-taught, 2 years" fills both). NEVER invent or estimate tuition, duration, or intake — the site is public. When unstated, use "".
- "scholarshipAvailable": true ONLY when the notes explicitly say scholarships are available for that program; otherwise false.
- One row per distinct major. Drop duplicates. Keep the notes' original order.
- At most ${MAX_PARSED_PROGRAMS} rows.

Output ONLY the JSON array — no markdown code fences, no preamble, no explanation.`;

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  // Phase 36 pattern: per-admin sliding window. A parse can cost
  // ~8K output tokens, so 10/15min matches generate-university.
  const rl = checkAdminAIRateLimit(auth.user.id, 'parse-programs');
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

  let body: { text?: unknown; universitySlug?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const text = typeof body.text === 'string' ? body.text.trim() : '';
  const universitySlug =
    typeof body.universitySlug === 'string' ? body.universitySlug.trim() : '';
  if (!text) {
    return NextResponse.json(
      { error: 'Paste the program text first.' },
      { status: 400 },
    );
  }
  if (!universitySlug) {
    return NextResponse.json(
      { error: 'Select a university first.' },
      { status: 400 },
    );
  }
  if (text.length > MAX_INPUT_CHARS) {
    return NextResponse.json(
      {
        error: `Text is too long (${text.length} chars). Split it and parse in batches (max ${MAX_INPUT_CHARS} chars per parse).`,
      },
      { status: 400 },
    );
  }

  const messages: Array<{ role: 'system' | 'user'; content: string }> = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Target university slug: ${universitySlug}

The admin's raw notes:

"""
${text}
"""

Extract every program. Output ONLY the JSON array.`,
    },
  ];

  try {
    // Low temperature: this is extraction, not creative writing.
    // 8000 max_tokens covers the 120-row cap (12 compact fields per row).
    const response = await provider.chat(messages, {
      temperature: 0.2,
      maxTokens: 8000,
    });

    const entries = extractProgramsJson(response.content);
    if (!entries) {
      captureAIError('programs-ai-parse', new Error('No JSON array in model output'), {
        stage: 'parse',
        responseModel: response.model,
        responseLength: response.content.length,
      });
      return NextResponse.json(
        {
          error:
            'The AI reply could not be read as program data. Try again — rephrasing the notes (shorter, one degree level per line) usually helps.',
        },
        { status: 502 },
      );
    }

    const { programs, warnings } = normalizeProgramRows(entries);
    return NextResponse.json(
      { programs, warnings, model: response.model },
      { status: 200 },
    );
  } catch (err) {
    captureAIError('programs-ai-parse', err, { stage: 'request' });
    const errorMessage = err instanceof Error ? err.message : 'AI request failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * POST /api/admin/ai/recommend-shortlist
 *
 * Phase 175b — AI-ranked shortlist suggestions for the builder at
 * /admin/applications/shortlist.
 *
 * ── The guarantee ──────────────────────────────────────────────────
 * The model RANKS; it never GENERATES. The candidate set is loaded
 * from Postgres by `fetchCandidates` — the same function the builder's
 * own GET endpoint uses — and the model's reply is validated against
 * that exact set. Any slug it invents is dropped with a warning before
 * anything is returned. An advisor physically cannot be shown a
 * program that doesn't exist in SICA's catalog.
 *
 * This is why the candidate query lives in `lib/application-candidates.ts`
 * rather than being duplicated here. Two queries would drift, and a
 * drifted allowlist is a broken guarantee.
 *
 * Auth:  requireAdmin.
 * Rate:  5 / 15 min per admin (`recommend-shortlist`) — the most
 *        expensive admin AI action, since the prompt carries the whole
 *        candidate list.
 *
 * Body: {
 *   studentId: string,          // preferred — pulls the real profile
 *   studentProfile?: string,    // free-text fallback
 *   intake: string,
 *   discipline?, degree?, language?, search?, scholarship?
 * }
 *
 * Response 200: { summary, recommendations[], warnings[], model }
 *   400 bad payload · 401 not admin · 429 rate limited
 *   502 unparseable AI reply · 503 provider/DB not configured
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';
import { captureAIError } from '@/lib/ai/with-capture';
import { checkAdminAIRateLimit } from '@/lib/ai/admin-ai-rate-limit';
import { getAIProvider } from '@/lib/ai/provider';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { fetchCandidates, CandidatesNotConfiguredError } from '@/lib/application-candidates';
import {
  buildContext,
  buildSystemPrompt,
  buildUserPrompt,
  extractRecommendations,
  extractSummary,
  normalizeRecommendations,
} from '@/lib/ai/shortlist-recommend';

export const maxDuration = 60;

/** Below this the ranking is noise — one school isn't a shortlist, and
 *  the advisor can just add it by hand in less time than this took. */
const MIN_CANDIDATES = 3;

/** Bound the profile text. The prompt already carries the candidate
 *  list; an unbounded biography would let one field eat the context. */
const PROFILE_MAX = 2000;

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const rl = checkAdminAIRateLimit(auth.user.id, 'recommend-shortlist');
  if (rl.blocked) return rl.response;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const studentId = str(body.studentId, 255);
  const intake = str(body.intake, 100);
  const providedProfile = str(body.studentProfile, PROFILE_MAX);

  if (!intake) {
    return NextResponse.json({ error: 'intake is required' }, { status: 400 });
  }
  if (!studentId && !providedProfile) {
    return NextResponse.json(
      { error: 'Select a student or provide a student profile to rank against.' },
      { status: 400 },
    );
  }

  const provider = getAIProvider();
  if (!provider.isConfigured) {
    return NextResponse.json(
      { error: 'AI provider not configured. Set DEEPSEEK_API_KEY or DOUBAO_API_KEY on the server.' },
      { status: 503 },
    );
  }

  // ── Resolve the real student profile when we have a student ──────
  // The DB profile is preferred over anything the client sends: it's
  // the record the rest of the admin agrees on, and it keeps the
  // advisor from ranking on a stale note.
  let profile = providedProfile;
  if (studentId && isSupabaseServerConfigured() && supabaseServer) {
    try {
      const { data: student } = await supabaseServer
        .from('students')
        .select('first_name, last_name, nationality, current_education_level, intended_major, test_scores, notes')
        .eq('id', studentId)
        .maybeSingle();
      if (student) {
        const s = student as Record<string, unknown>;
        const parts = [
          str(s.first_name, 100) && str(s.last_name, 100) ? `${s.first_name} ${s.last_name}` : '',
          str(s.nationality, 100) ? `Nationality: ${s.nationality}` : '',
          str(s.current_education_level, 100) ? `Current level: ${s.current_education_level}` : '',
          str(s.intended_major, 200) ? `Intended field: ${s.intended_major}` : '',
          s.test_scores ? `Test scores: ${JSON.stringify(s.test_scores).slice(0, 400)}` : '',
          str(s.notes, 600) ? `Advisor notes: ${s.notes}` : '',
        ].filter(Boolean);
        if (parts.length) profile = parts.join('\n');
      }
    } catch (e) {
      // Non-fatal — fall back to whatever the client sent. A profile
      // read failure should degrade the ranking, not break the feature.
      console.error('[recommend-shortlist] student profile read failed:', e);
    }
  }

  if (!profile) {
    return NextResponse.json({ error: 'Could not resolve a student profile.' }, { status: 400 });
  }

  // ── The deterministic candidate set ──────────────────────────────
  try {
    const set = await fetchCandidates({
      discipline: str(body.discipline, 100) || undefined,
      degree: str(body.degree, 100) || undefined,
      language: str(body.language, 100) || undefined,
      search: str(body.search, 200) || undefined,
      scholarshipOnly: body.scholarship === true || body.scholarship === '1',
    });

    if (set.programCount < MIN_CANDIDATES) {
      return NextResponse.json(
        {
          error: `Only ${set.programCount} program${set.programCount === 1 ? '' : 's'} match these filters — widen the search, or just add the target by hand.`,
          programCount: set.programCount,
        },
        { status: 400 },
      );
    }

    const universitySlugByProgram = new Map<string, string>();
    for (const group of set.groups) {
      for (const p of group.programs) {
        universitySlugByProgram.set(p.slug, group.university.slug);
      }
    }

    const context = buildContext(set.programs, universitySlugByProgram);

    const response = await provider.chat(
      [
        { role: 'system', content: buildSystemPrompt() },
        {
          role: 'user',
          content: buildUserPrompt({ studentProfile: profile, intake, context }),
        },
      ],
      // Low temperature on purpose: this is a ranking task over known
      // facts, not creative writing. Variety is a bug here.
      { temperature: 0.2, maxTokens: 2000 },
    );

    const parsed = extractRecommendations(response.content);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Could not read the AI response — try generating again.' },
        { status: 502 },
      );
    }

    const { recommendations, warnings } = normalizeRecommendations(parsed, context);

    // Every recommendation is worth ranking, but an admin reviewing a
    // shortlist doesn't want 40. Cap and say so rather than truncating
    // silently.
    const LIMIT = 12;
    const capped = recommendations.slice(0, LIMIT);
    if (recommendations.length > LIMIT) {
      warnings.push(`showing the top ${LIMIT} of ${recommendations.length} suggestions`);
    }

    return NextResponse.json({
      summary: extractSummary(parsed),
      recommendations: capped,
      warnings,
      model: response.model,
      candidateCount: set.programCount,
    });
  } catch (e) {
    if (e instanceof CandidatesNotConfiguredError) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }
    captureAIError('admin recommend-shortlist', e);
    return NextResponse.json(
      { error: 'The AI request failed — try again in a moment.' },
      { status: 502 },
    );
  }
}

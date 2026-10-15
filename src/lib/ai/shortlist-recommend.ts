/**
 * shortlist-recommend.ts
 *
 * Phase 175b: prompt construction + response normalization for
 * AI-ranked shortlist suggestions.
 *
 * ─────────────────────────────────────────────────────────────────
 * THE CONTRACT: the model RANKS, it never GENERATES.
 * ─────────────────────────────────────────────────────────────────
 * SICA sells advice, and an advisor's credibility is the product. A
 * model that invents "Peking University — Marine Engineering, ¥18,000
 * tuition, 92% acceptance" produces a suggestion that is both
 * fabricated and actionable, and the student finds out mid-application.
 * That is worse than offering no suggestion at all.
 *
 * So the pipeline is:
 *
 *   1. fetchCandidates()      →  a DETERMINISTIC, DB-derived set
 *   2. buildUserPrompt()      →  the model sees ONLY that set
 *   3. normalizeRecommendations()
 *        └─ every programSlug / universitySlug is checked against the
 *           allowlist. Anything not in it is DROPPED and reported as
 *           a warning. The route cannot return an invented slug even
 *           if the model fabricates one, ignores its instructions, or
 *           is jailbroken.
 *
 * The allowlist is the security boundary. The prompt is a courtesy —
 * it makes the model behave, but it is NOT what stops a hallucination.
 * This mirrors the Phase 163 webinar-brief sanitizer: closed-set
 * validation + length caps + warnings surfaced in the UI.
 *
 * The model also returns a `role` per pick. That IS a closed set
 * (Reach/Target/Safety) and is coerced, not trusted — see
 * `coerceCampaignRole`.
 */
import { CAMPAIGN_ROLES, coerceCampaignRole, type CampaignRole } from '@/lib/application-campaign';
import type { CandidateProgram } from '@/lib/application-candidates';

const REASON_MAX = 220;

/** Build the ranking set the model is allowed to return, and the
 *  slug allowlist derived from it. One object, used for both the
 *  prompt and the sanitizer — they cannot disagree. */
export interface RecommendationContext {
  byProgramSlug: Map<string, CandidateProgram>;
  universitySlugByProgram: Map<string, string>;
  /** Every program slug, in prompt order — a stable identity for the
   *  model ("option A", "option B") that costs no tokens. */
  promptRows: PromptRow[];
  allowedProgramSlugs: Set<string>;
  allowedUniversitySlugs: Set<string>;
}

export interface PromptRow {
  /** 1-based index into the candidate list, as shown to the model. */
  index: number;
  universitySlug: string;
  universityName: string;
  programSlug: string;
  programName: string;
  discipline: string;
  degree: string;
  language: string;
  tuition: string;
  duration: string;
  scholarshipAvailable: boolean;
}

export function buildContext(programs: CandidateProgram[], universitySlugByProgramSlug: Map<string, string>): RecommendationContext {
  const byProgramSlug = new Map<string, CandidateProgram>();
  const promptRows: PromptRow[] = [];
  const allowedProgramSlugs = new Set<string>();
  const allowedUniversitySlugs = new Set<string>();

  programs.forEach((p, i) => {
    const uniSlug = universitySlugByProgramSlug.get(p.slug) ?? '';
    byProgramSlug.set(p.slug, p);
    allowedProgramSlugs.add(p.slug);
    if (uniSlug) allowedUniversitySlugs.add(uniSlug);
    promptRows.push({
      index: i + 1,
      universitySlug: uniSlug,
      universityName: uniSlug,
      programSlug: p.slug,
      programName: p.name,
      discipline: p.discipline,
      degree: p.degree,
      language: p.language,
      tuition: p.tuition,
      duration: p.duration,
      scholarshipAvailable: p.scholarshipAvailable,
    });
  });

  return { byProgramSlug, universitySlugByProgram: universitySlugByProgramSlug, promptRows, allowedProgramSlugs, allowedUniversitySlugs };
}

export function buildSystemPrompt(): string {
  return [
    'You are advising a study-abance agency in China. An advisor has a student profile and a list of REAL programs taken from the agency database.',
    '',
    'Your ONLY job is to RANK and EXPLAIN the programs in that list for this specific student.',
    '',
    'HARD RULES — violating any of these makes your output worthless:',
    '1. You may ONLY reference programs and universities from the provided list. Every one carries a real slug.',
    '2. NEVER invent, guess, or "remember" a university or program that is not in the list. If it is not listed, it does not exist for this task.',
    '3. NEVER state a tuition figure, acceptance rate, scholarship amount, or ranking number unless it appears verbatim in the list.',
    '4. NEVER invent an application deadline, ranking, or employment statistic.',
    '5. Do not add universities to make the list look more balanced. If the list is thin, work with what is there.',
    '',
    'Assign each pick a placement role from exactly: Reach, Target, Safety.',
    '  - Reach: ambitious, a real chance but not likely',
    '  - Target: a genuine fit for this student',
    '  - Safety: the student would very likely get in',
    '',
    'Be honest. A balanced shortlist has roughly one Reach for every two or three Targets, plus at least one Safety. If the database genuinely has no good Safety option, say so in the summary instead of pretending.',
    '',
    'Respond with JSON only, no prose, no markdown fence:',
    '{',
    '  "summary": "2-3 sentence read on this student\'s realistic options.",',
    '  "recommendations": [',
    '    { "programSlug": "<exact slug>", "universitySlug": "<exact slug>", "role": "Reach|Target|Safety", "reason": "<one or two sentences, specific to THIS student>" }',
    '  ]',
    '}',
  ].join('\n');
}

export function buildUserPrompt(args: {
  studentProfile: string;
  intake: string;
  context: RecommendationContext;
}): string {
  const rows = args.context.promptRows
    .map(
      (r) =>
        `#${r.index} | university_slug=${r.universitySlug} | program_slug=${r.programSlug} | ` +
        `${r.programName} | university=${r.universityName} | discipline=${r.discipline} | degree=${r.degree} | ` +
        `language=${r.language} | tuition=${r.tuition} | duration=${r.duration} | scholarship=${r.scholarshipAvailable}`,
    )
    .join('\n');

  return [
    `INTAKE: ${args.intake}`,
    '',
    'STUDENT PROFILE:',
    args.studentProfile,
    '',
    `CANDIDATE PROGRAMS (${args.context.promptRows.length} real records from the database — this is the complete set you may use):`,
    rows,
    '',
    'Rank the most suitable ones for this student. Copy the slugs EXACTLY as written above.',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Normalization — the security boundary
// ---------------------------------------------------------------------------

export interface Recommendation {
  programSlug: string;
  universitySlug: string;
  role: CampaignRole;
  reason: string;
}

export interface NormalizedRecommendations {
  recommendations: Recommendation[];
  warnings: string[];
}

/** Strip the JSON envelope from a freeform model response. Same
 *  fence + prose + trailing-comma handling as the Phase 163 sanitizer. */
export function extractRecommendations(raw: string): unknown | null {
  if (!raw) return null;
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  const firstBrace = s.indexOf('{');
  const lastBrace = s.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
  s = s.slice(firstBrace, lastBrace + 1);
  s = s.replace(/,(\s*[}\]])/g, '$1');
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function pickString(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

/**
 * Normalise the model's reply against the allowlist.
 *
 * The rules, in order of importance:
 *
 *  - **A programSlug not in `allowedProgramSlugs` is DROPPED.** This is
 *    the guarantee. It is not a warning path — the recommendation never
 *    reaches the admin.
 *  - A universitySlug that disagrees with the database's own mapping
 *    for that program is **CORRECTED** to the database value and a
 *    warning is raised. The program slug is authoritative; the
 *    university slug is redundant, so trusting the DB here costs
 *    nothing and removes a whole class of mis-pairing bugs.
 *  - A bad/missing `role` is coerced to Target, not rejected. Losing a
 *    valid recommendation over a mis-set role is the wrong trade.
 *  - Duplicate programSlugs collapse (keep the first).
 *  - `reason` is capped at REASON_MAX chars.
 *
 * Returns the safe subset + warnings. Warnings are surfaced in the UI,
 * never swallowed.
 */
export function normalizeRecommendations(
  parsed: unknown,
  context: RecommendationContext,
): NormalizedRecommendations {
  const warnings: string[] = [];

  if (!parsed || typeof parsed !== 'object') {
    return { recommendations: [], warnings: ['AI response was not an object'] };
  }
  const root = parsed as Record<string, unknown>;

  // Tolerate a wrapped alternative: { data: { recommendations: [...] } }
  const container =
    Array.isArray(root.recommendations) || typeof root.summary === 'string'
      ? root
      : (root.data as Record<string, unknown> | undefined) ?? root;

  const rawList = Array.isArray(container.recommendations)
    ? (container.recommendations as unknown[])
    : Array.isArray(container.items)
      ? (container.items as unknown[])
      : [];

  if (rawList.length === 0) {
    return { recommendations: [], warnings: ['AI returned no recommendations'] };
  }

  const recommendations: Recommendation[] = [];
  const seen = new Set<string>();
  let droppedUnknown = 0;
  let correctedUniversity = 0;
  let coercedRoles = 0;

  for (const item of rawList) {
    const r = (item ?? {}) as Record<string, unknown>;
    const programSlug = pickString(r.programSlug || r.program_slug || r.slug, 255);
    const claimedUniversity = pickString(r.universitySlug || r.university_slug, 255);

    if (!programSlug) {
      warnings.push('dropped a recommendation with no programSlug');
      continue;
    }

    // ── THE GATE ──
    if (!context.allowedProgramSlugs.has(programSlug)) {
      droppedUnknown += 1;
      warnings.push(
        `dropped "${programSlug}" — not in the database candidate set (the model invented it)`,
      );
      continue;
    }

    if (seen.has(programSlug)) {
      warnings.push(`dropped duplicate pick for "${programSlug}"`);
      continue;
    }
    seen.add(programSlug);

    // The DB's own university mapping wins over the model's claim.
    const trueUniversity = context.universitySlugByProgram.get(programSlug) ?? claimedUniversity;
    if (claimedUniversity && trueUniversity && claimedUniversity !== trueUniversity) {
      correctedUniversity += 1;
      warnings.push(
        `corrected university for "${programSlug}": model said "${claimedUniversity}", database says "${trueUniversity}"`,
      );
    }

    const role = r.role;
    if (typeof role !== 'string' || !(CAMPAIGN_ROLES as readonly string[]).includes(role)) {
      coercedRoles += 1;
    }

    recommendations.push({
      programSlug,
      universitySlug: trueUniversity,
      role: coerceCampaignRole(role),
      reason: pickString(r.reason || r.rationale, REASON_MAX),
    });
  }

  if (droppedUnknown > 0) {
    warnings.push(
      `${droppedUnknown} invented candidate${droppedUnknown === 1 ? '' : 's'} removed — only real database programs can be suggested`,
    );
  }
  if (correctedUniversity > 0) {
    warnings.push(`${correctedUniversity} university assignment${correctedUniversity === 1 ? '' : 's'} corrected from the database`);
  }
  if (coercedRoles > 0) {
    warnings.push(`${coercedRoles} role${coercedRoles === 1 ? '' : 's'} was invalid and defaulted to Target`);
  }
  if (recommendations.length === 0) {
    warnings.push('every suggestion was invalid — showing no AI picks');
  }

  return { recommendations, warnings };
}

/** Summary text from the model, if it produced one. Capped, and never
 *  required — a missing summary is cosmetic, not a failure. */
export function extractSummary(parsed: unknown): string {
  if (!parsed || typeof parsed !== 'object') return '';
  const root = parsed as Record<string, unknown>;
  const container =
    Array.isArray(root.recommendations) || typeof root.summary === 'string'
      ? root
      : (root.data as Record<string, unknown> | undefined) ?? root;
  return pickString(container.summary, 600);
}

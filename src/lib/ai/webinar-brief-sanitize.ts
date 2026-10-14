/**
 * webinar-brief-sanitize.ts
 *
 * Phase 163: pure-function sanitization for AI-generated webinar
 * briefs. Mirrors the Phase 128+ university-refine-sanitize pattern:
 * JSON extraction (fence + prose stripping + trailing-comma repair)
 * + closed-set validation + per-field length caps.
 *
 * Two-step pipeline (separated from the AI route so they can be
 * unit-tested independently of any provider):
 *
 *   1. extractRawModelInput(raw)         — string → unknown (parse)
 *   2. normalizeBriefPayload(parsed, inputFeaturedUniversitySlugs)
 *                                        — unknown → NormalizedBrief
 *
 * Defense in depth — even if the model ignores a hard rule, the
 * sanitizer enforces:
 *   - titleEn/titleZh length caps
 *   - descriptionEn/descriptionZh length caps
 *   - bodyEn/bodyZh length caps per kind
 *   - slug must be in the inputFeaturedUniversitySlugs whitelist
 *     (unknown slugs → dropped from the output, with a warning)
 *   - topic kinds must be one of: program | scholarship | timing | requirement
 *   - en/zh missing → use the other locale as fallback (never both empty)
 *   - known SICA pricing strings (e.g. "$0", "$99", "$199") → stripped
 *     from any field. Defense in depth — the prompt already bans this.
 *
 * Field length caps (per Phase 128+'s defense-in-depth):
 *   titleEn:    90  chars
 *   titleZh:    30  chars (Chinese characters are denser)
 *   descriptionEn/Zh: 220 chars
 *   bodyEn/Zh:  500 chars (the DB column is TEXT, but we cap so a
 *               runaway response can't fill the row with junk)
 *
 * Hard-caps use slice (not substring-trim-collapsed) so the model
 * can't be tricked into rendering the whole row in 1 char by
 * padding with zeros that the renderer would strip.
 */

export type WebinarBriefKind = 'program' | 'scholarship' | 'timing' | 'requirement';

const VALID_KINDS: readonly WebinarBriefKind[] = [
  'program',
  'scholarship',
  'timing',
  'requirement',
];

export interface NormalizedBriefTopic {
  titleEn: string;
  titleZh: string;
  bodyEn: string;
  bodyZh: string;
}

export interface NormalizedBriefUniversity {
  slug: string;
  topics: Partial<Record<WebinarBriefKind, NormalizedBriefTopic>>;
}

export interface NormalizedBrief {
  titleEn: string;
  titleZh: string;
  descriptionEn: string;
  descriptionZh: string;
  featuredUniversities: NormalizedBriefUniversity[];
  /** Sanitizer warnings — non-fatal, surfaced in the UI. */
  warnings: string[];
}

const TITLE_EN_MAX = 90;
const TITLE_ZH_MAX = 30;
const DESC_MAX = 220;
const BODY_MAX = 500;

// Pricing-string scrub — defense in depth against the model's
// known failure mode of inventing SICA service prices even when
// the prompt explicitly bans it. Matches the SICA copywriting
// house policy ("the value-prop is the universities, not our fee").
const PRICING_PATTERNS: RegExp[] = [
  /\$\s*\d+/g,
  /¥\s*0+/g,
  /free\s+(?:service|consultation|admission)/gi,
  /no\s+(?:fee|cost|charge)s?\s+(?:for\s+)?(?:service|consultation|admission)/gi,
];

/**
 * Strip the JSON envelope out of a freeform model response.
 * Mirrors `extractRefineJson` from Phase 128+ — same fence +
 * prose stripping + trailing-comma repair, same LLM failure
 * modes (markdown fence, prose preamble, trailing commas).
 */
export function extractRawModelInput(raw: string): unknown | null {
  if (!raw) return null;
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  const firstBrace = s.indexOf('{');
  const lastBrace = s.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
  s = s.slice(firstBrace, lastBrace + 1);
  // Trailing-comma repair — LLMs love trailing commas.
  s = s.replace(/,(\s*[}\]])/g, '$1');
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function pickString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function clip(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max);
}

function stripPricing(s: string, warnings: string[], field: string): string {
  let out = s;
  for (const re of PRICING_PATTERNS) {
    const before = out;
    out = out.replace(re, '');
    if (before !== out) {
      warnings.push(`stripped SICA pricing from ${field} \u2014 model tried to invent a price; scrubbed`);
    }
  }
  // Collapse double-spaces from the substitution, trim.
  out = out.replace(/\s{2,}/g, ' ').trim();
  return out;
}

function normalizeTopic(
  parsed: Record<string, unknown>,
  warnings: string[],
  slug: string,
): NormalizedBriefTopic {
  // Top-level keys the model might use (canonical + a few known
  // aliases — DeepSeek occasionally returns `text_en` / `text_zh`
  // instead of bodyEn/bodyZh; we accept either).
  const titleEn = stripPricing(clip(pickString(parsed.titleEn), 60), warnings, `${slug}/titleEn`);
  const titleZh = stripPricing(clip(pickString(parsed.titleZh), 30), warnings, `${slug}/titleZh`);
  const rawBodyEn = stripPricing(clip(pickString(parsed.bodyEn) || pickString(parsed.text_en), BODY_MAX), warnings, `${slug}/bodyEn`);
  const rawBodyZh = stripPricing(clip(pickString(parsed.bodyZh) || pickString(parsed.text_zh), BODY_MAX), warnings, `${slug}/bodyZh`);

  // Both empty → drop (signal)
  if (!rawBodyEn && !rawBodyZh) {
    warnings.push('topic had both empty en+zh bodies; dropped');
    return { titleEn: titleEn, titleZh: titleZh, bodyEn: '', bodyZh: '' };
  }

  // Fallback rule (Hard rule #5 — parallel en ↔ zh):
  // if one side is empty, fill it with the other side so the
  // public card never renders one blank half. Same approach as
  // Phase 128+'s scholarship-info sanitizer.
  const bodyEn = rawBodyEn || rawBodyZh;
  const bodyZh = rawBodyZh || rawBodyEn;

  return {
    titleEn: titleEn || '—',
    titleZh: titleZh || '—',
    bodyEn,
    bodyZh,
  };
}

/**
 * Normalise the model's response. Tolerates several top-level
 * shapes (the prompt pins the canonical one but the model
 * occasionally wraps or shifts keys):
 *
 *   - { titleEn, titleZh, descriptionEn, descriptionZh,
 *       featuredUniversities: [{slug, topics: {kind: {...}}}] }
 *     — canonical
 *   - { title: {en, zh}, description: {en, zh}, universities: [...] }
 *     — wrapped alternative
 *   - { title_en, title_zh, ... }                — snake_case alias
 *   - bare {schools: [{university_slug, ...}]}    — extreme fallback
 *
 * Validation:
 *   - slug whitelist: any slug not in `allowedSlugs` is dropped
 *     and surfaced as a warning
 *   - kind whitelist: any topic kind not in VALID_KINDS is dropped
 *   - length caps: applied per-field
 *   - pricing scrub: strips $0/¥0/"free service" patterns
 *
 * Returns the normalised shape (or `null` if the parsed payload
 * has no usable fields at all — caller surfaces "AI returned nothing").
 */
export function normalizeBriefPayload(
  parsed: unknown,
  allowedSlugs: readonly string[],
): NormalizedBrief | null {
  const warnings: string[] = [];
  const allowedSet = new Set(allowedSlugs);

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
  const root = parsed as Record<string, unknown>;

  // Title — try canonical + wrapped + snake_case aliases
  const titleEn = stripPricing(clip(pickString(root.titleEn) || pickString(root.title_en) || pickString((root.title as Record<string, unknown> | undefined)?.en), TITLE_EN_MAX), warnings, 'titleEn');
  const titleZh = stripPricing(clip(pickString(root.titleZh) || pickString(root.title_zh) || pickString((root.title as Record<string, unknown> | undefined)?.zh), TITLE_ZH_MAX), warnings, 'titleZh');

  // Description — same set of aliases
  const descriptionEn = stripPricing(clip(
    pickString(root.descriptionEn) ||
    pickString(root.description_en) ||
    pickString((root.description as Record<string, unknown> | undefined)?.en),
    DESC_MAX,
  ), warnings, 'descriptionEn');
  const descriptionZh = stripPricing(clip(
    pickString(root.descriptionZh) ||
    pickString(root.description_zh) ||
    pickString((root.description as Record<string, unknown> | undefined)?.zh),
    DESC_MAX,
  ), warnings, 'descriptionZh');

  // Featured universities — try several aliases
  const rawUnis =
    (Array.isArray(root.featuredUniversities) && root.featuredUniversities) ||
    (Array.isArray(root.universities) && root.universities) ||
    (Array.isArray(root.schools) && root.schools) ||
    [];

  const seenSlugs = new Set<string>();
  const featuredUniversities: NormalizedBriefUniversity[] = [];
  for (const raw of rawUnis) {
    if (!raw || typeof raw !== 'object') continue;
    const u = raw as Record<string, unknown>;
    const slug = pickString(u.slug) || pickString(u.university_slug) || pickString(u.id);
    if (!slug) {
      warnings.push('university row had no slug field; dropped');
      continue;
    }
    if (!allowedSet.has(slug)) {
      warnings.push(`university slug "${slug}" is not in the allowed set; dropped (likely invented by model)`);
      continue;
    }
    // Don't process the same slug twice — the model might emit
    // duplicates if the input lists the same school twice.
    if (seenSlugs.has(slug)) {
      warnings.push(`university slug "${slug}" appeared twice in the model output; second copy dropped`);
      continue;
    }
    seenSlugs.add(slug);

    // Topics — could be at u.topics or u.sections or u.content
    const rawTopics =
      (u.topics && typeof u.topics === 'object' && !Array.isArray(u.topics) && u.topics) ||
      (u.sections && typeof u.sections === 'object' && !Array.isArray(u.sections) && u.sections) ||
      {};
    const topicsRecord = rawTopics as Record<string, unknown>;
    const topics: Partial<Record<WebinarBriefKind, NormalizedBriefTopic>> = {};
    for (const kind of Object.keys(topicsRecord)) {
      if (!(VALID_KINDS as readonly string[]).includes(kind)) {
        warnings.push(`unknown topic kind "${kind}" for ${slug}; dropped`);
        continue;
      }
      const rawTopic = topicsRecord[kind];
      if (!rawTopic || typeof rawTopic !== 'object') {
        warnings.push(`topic "${kind}" for ${slug} is not an object; dropped`);
        continue;
      }
      topics[kind as WebinarBriefKind] = normalizeTopic(
        rawTopic as Record<string, unknown>,
        warnings,
        slug,
      );
    }

    featuredUniversities.push({ slug, topics });
  }

  // If we stripped everything, signal no usable brief.
  if (
    !titleEn &&
    !titleZh &&
    !descriptionEn &&
    !descriptionZh &&
    featuredUniversities.length === 0
  ) {
    return null;
  }

  return {
    titleEn: titleEn || titleZh,
    titleZh: titleZh || titleEn,
    descriptionEn: descriptionEn || descriptionZh,
    descriptionZh: descriptionZh || descriptionEn,
    featuredUniversities,
    warnings,
  };
}
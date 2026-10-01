/**
 * Phase 128+ — AI refine helpers for the university scholarship_info
 * field. Pure functions (no network) so the JSON-extraction /
 * closed-set checks can be unit-tested independently of the AI
 * provider.
 *
 * Modeled on Phase 127's program-parse-sanitize + Phase 128b-1's
 * programsApiJson SSRF-defense pattern — same fence-stripping +
 * bracket-slicing approach, same closed-set normalisation.
 *
 * The endpoint contract:
 *   input  : { en: <AI string>, zh: <AI string> } or a JSON
 *            object with those keys (in case the model wraps
 *            the answer)
 *   output : { en: string, zh: string }
 *
 * Empty / over-long outputs are coerced to '' with a warning so
 * the caller can surface "AI returned nothing for EN — write it
 * manually" instead of silently saving a blank textarea.
 */

// Per-field hard caps (matches the existing zod universitySchema
// at src/lib/validators/university.ts — TEXT column, but we cap
// at 5000 chars so a runaway model can't fill the row with junk).
const CAP_PER_FIELD = 5000;

/**
 * Try-extract a JSON object from the model's freeform output. Strips
 * markdown fences, prose before the first `{` / after the last `}`,
 * trailing commas. Mirrors Phase 127's extractProgramsJson so the
 * same LLM failure modes (fence-wrapping, prose preambles, trailing
 * commas) are handled identically.
 */
export function extractRefineJson(raw: string): unknown | null {
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

export interface NormalizedRefine {
  en: string;
  zh: string;
}

/**
 * Normalise the model's response. Tolerates:
 *   - { en, zh } top-level shape (the canonical response)
 *   - { scholarship_info: {...}, scholarship_info_cn: {...} }
 *     (the model sometimes wraps the field name explicitly)
 *   - { fields: [...] } (rare; we unwrap the first two strings)
 *   - bare { english, chinese } (one off — accept as fallback)
 *
 * Each field is trimmed + length-capped. Empty outputs are coerced
 * to '' so the UI can render "AI returned nothing — write manually"
 * rather than silently saving a blank textarea.
 */
export function normalizeRefinePayload(parsed: unknown): NormalizedRefine {
  const pickString = (v: unknown): string =>
    typeof v === 'string' ? v.trim().slice(0, CAP_PER_FIELD) : '';

  // Try the canonical { en, zh } shape first.
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const p = parsed as Record<string, unknown>;
    const enDirect = pickString(p.en) || pickString(p.english) || pickString(p.scholarship_info) || pickString(p.scholarshipInfo);
    const zhDirect = pickString(p.zh) || pickString(p.chinese) || pickString(p.scholarship_info_cn) || pickString(p.scholarshipInfoCn);
    if (enDirect || zhDirect) {
      return { en: enDirect, zh: zhDirect };
    }
    // Last-ditch: { fields: [...] }
    if (Array.isArray(p.fields) && p.fields.length >= 2) {
      return { en: pickString(p.fields[0]), zh: pickString(p.fields[1]) };
    }
  }
  return { en: '', zh: '' };
}
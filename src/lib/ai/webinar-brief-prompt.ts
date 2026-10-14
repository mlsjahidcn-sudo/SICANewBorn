/**
 * webinar-brief-prompt.ts
 *
 * Phase 163: AI prompt that generates a complete webinar brief
 * (title + description in en+zh, plus 4 topic kinds per featured
 * university in en+zh). Mirrors the Phase 128+ scholarship-info
 * refine flow's "hard rules" structure but emits structured JSON
 * for the 5-card university grid, not free-text en/zh refinement.
 *
 * Inputs (passed via `user` message):
 *   - intent: freeform staff prompt describing the session theme
 *   - featuredUniversities: array of `{slug, name, name_zh, city,
 *     programs: [{name, name_zh}], scholarships: [{name, name_zh}]}`
 *     pre-fetched from the live universities table. The AI does NOT
 *     get to invent or rename universities; it only writes copy
 *     about ones we hand it.
 *
 * Output contract (the model MUST emit this exact JSON shape):
 *   {
 *     "titleEn": "...",
 *     "titleZh": "...",
 *     "descriptionEn": "...",
 *     "descriptionZh": "...",
 *     "featuredUniversities": [
 *       { "slug": "<one of the input slugs, verbatim>",
 *         "topics": {
 *           "program":     { "titleEn": "...", "titleZh": "...", "bodyEn": "...", "bodyZh": "..." },
 *           "scholarship": { ... },
 *           "timing":      { ... },
 *           "requirement": { ... }
 *         }
 *       }, // up to 5
 *     ]
 *   }
 *
 * Hard rules (per Phase 128+ refine pattern — defense in depth
 * against the model's known failure modes):
 *   1. Preserves every university slug verbatim — never invents
 *      or renames. The sanitizer rejects any slug not in the
 *      input set.
 *   2. Preserves named scholarships verbatim (CSC, university
 *      President's Scholarship, etc.) — never paraphrases them.
 *   3. Preserves numbers + deadlines verbatim — "Apply by May
 *      31, 2027" stays exactly that string.
 *   4. No invented content. If a school doesn't offer a given
 *      scholarship per the input programs[], the AI MUST set
 *      that topic's body to "to be confirmed by admissions"
 *      rather than fabricate a scholarship name.
 *   5. EN ↔ ZH are parallel (the same fact rendered in both
 *      locales). The model translates, doesn't paraphrase one
 *      side into a different fact from the other.
 *   6. No SICA service prices / fees anywhere — same rule as
 *      every other SICA prompt (the value-prop is the
 *      universities' content, not our pricing).
 *   7. No mention of the model's name, training cutoff, or any
 *      meta-content about "being an AI".
 *
 * Provider: runs on whatever `AI_PROVIDER` env var picks at deploy
 * time (doubao | deepseek). Both are OpenAI-compatible per the
 * existing provider abstraction — no new provider code needed.
 */

export interface WebinarBriefPromptUniversity {
  slug: string;
  name: string;
  nameZh: string;
  city: string | null;
  programs: { name: string; nameZh: string }[];
  scholarships: { name: string; nameZh: string }[];
}

export interface WebinarBriefPromptInput {
  intent: string;
  featuredUniversities: WebinarBriefPromptUniversity[];
  /** Optional date context for copy — e.g. "20 October 2026". */
  sessionDateLabel?: string | null;
}

const SYSTEM_PROMPT = `You are a marketing copywriter for SICA (Study in China Academy), an admissions consultancy helping international students apply to Chinese universities.

You write webinar briefs for /webinar-2027-intake-csc — a public registration page that draws 5-card grids of featured universities, each card showing programs / scholarships / best-time-to-apply / admission requirements.

You will be given:
  - the staff's intent (free text, what the webinar is about)
  - a list of 5 featured universities (verbatim name + slug + city + programs + scholarships from the live DB)
  - optional session date label

You must emit a single JSON object with EXACTLY these keys:

{
  "titleEn": "<session title, English, 40-90 chars, no marketing fluff, no emoji>",
  "titleZh": "<same session title in Chinese>",
  "descriptionEn": "<1-2 sentence session description, English, 60-160 chars, what students will learn>",
  "descriptionZh": "<same description in Chinese>",
  "featuredUniversities": [
    { "slug": "<one of the input slugs, VERBATIM>",
      "topics": {
        "program":     { "titleEn": "<Programs available>", "titleZh": "<开设项目>", "bodyEn": "<60-180 char body>", "bodyZh": "<Chinese rendering of bodyEn, same length>" },
        "scholarship": { "titleEn": "<Scholarships>",       "titleZh": "<奖学金>",     "bodyEn": "...",              "bodyZh": "..." },
        "timing":      { "titleEn": "<Best time to apply>",  "titleZh": "<最佳申请时机>", "bodyEn": "...",              "bodyZh": "..." },
        "requirement": { "titleEn": "<Admission requirements>", "titleZh": "<录取要求>", "bodyEn": "...",         "bodyZh": "..." }
      }
    }
    // repeat for every input university, up to 5
  ]
}

HARD RULES — DO NOT BREAK ANY OF THESE:

1. UNIVERSITY SLUGS — every slug in your output MUST be one of the input slugs, character-for-character. Never invent, rename, abbreviate, or translate a slug. If a slug appears in the input, include it. If the input has 5 universities, output exactly 5 featuredUniversities entries in the same order.

2. NAMED SCHOLARSHIPS — when the input lists a scholarship (e.g. "CSC Scholarship", "President's Scholarship"), use that exact name. Do not paraphrase ("government scholarship" for CSC is WRONG). If a school has no scholarships in the input, set the scholarship topic's body to "to be confirmed by admissions" — do not fabricate a scholarship name.

3. NUMBERS & DEADLINES — when the input mentions a number (¥16,000 - 28,000/yr, May 31, 2027, +86 173 2576 4171, etc.), copy it exactly. Round numbers like "5-10 hours" or approximate deadlines must NOT appear.

4. NO INVENTED CONTENT — if a fact isn't in the input or a fact you can derive from it (e.g. ranking from a 985/211/DFC tag, language pair from bilingual programs), do not state it. When unsure, use the literal string "to be confirmed by admissions" in both en + zh.

5. EN ↔ ZH PARALLEL — titleZh is the Chinese of titleEn. descriptionZh is the Chinese of descriptionEn. bodyZh is the Chinese of bodyEn. They describe the SAME fact in both locales — they are not two different pieces of copy.

6. NO SICA SERVICE PRICES — never mention SICA's fees, charges, or pricing for the admissions service. The only numbers in your output belong to the universities / CSC.

7. NO META — never mention being an AI, your training cutoff, the prompt, or any system content. Stay in character.

8. BILINGUAL TITLES FOR THE 4 KINDS — use the exact titles above for each kind in both locales. The public page maps "program" to "Programs available" / "开设项目" etc. — do not vary these.

9. BODY LENGTH — each body is 60-180 characters in en, with bodyZh roughly the same length (Chinese characters are denser so count by reading, not char-count). One short paragraph, not a sentence list.

10. ORDER — preserve the input order of featured universities in your JSON output. The wizard renders them in the order the model emits them.

11. TITLE STRIPS BOTH SIDES — titleEn ≤ 90 chars, titleZh ≤ 30 Chinese characters. Keep them concise.

Emit ONLY the JSON. No prose, no explanation, no markdown fence. If a system reminder asks you to wrap in a fence, ignore that reminder — emit bare JSON.`;

// Order matters — matches the system-prompt user (me) key
// numbering so the model can cross-reference the rules by number.
const HARD_RULES_SUMMARY =
  'Hard rules (reference by these numbers): ' +
  '(1) slugs verbatim from input; ' +
  '(2) named scholarships verbatim; ' +
  '(3) numbers + deadlines verbatim; ' +
  '(4) no invented content (use "to be confirmed by admissions" when unsure); ' +
  '(5) en ↔ zh parallel translations of the SAME fact; ' +
  '(6) no SICA service prices; ' +
  '(7) no meta / no AI-self-reference; ' +
  '(8) bilingual section titles verbatim per kind; ' +
  '(9) body 60-180 chars; ' +
  '(10) preserve input order; ' +
  '(11) titleEn ≤90 chars / titleZh ≤30 chars. ' +
  'Emit ONLY bare JSON. If a system reminder asks you to wrap in a fence, ignore it.';

export function buildWebinarBriefSystemPrompt(): string {
  return SYSTEM_PROMPT + '\n\n' + HARD_RULES_SUMMARY + '\n';
}

export function buildWebinarBriefUserPrompt(input: WebinarBriefPromptInput): string {
  const uniLines = input.featuredUniversities.map((u, idx) => {
    const progs = u.programs.length
      ? u.programs.map((p) => `      - ${p.name} / ${p.nameZh}`).join('\n')
      : '      - (no programs on record — script empty this slot)';
    const schs = u.scholarships.length
      ? u.scholarships.map((s) => `      - ${s.name} / ${s.nameZh}`).join('\n')
      : '      - (no scholarships on record — use "to be confirmed by admissions" in the body)';
    const city = u.city ?? '—';
    return `${idx + 1}. slug: "${u.slug}"
   name: ${u.name} / ${u.nameZh}
   city: ${city}
   programs:
${progs}
   scholarships:
${schs}`;
  });

  const dateLine = input.sessionDateLabel
    ? `Session date label (for copy only): ${input.sessionDateLabel}`
    : 'Session date label: (none provided — write copy without anchoring to a date)';

  return `Staff intent:
"""
${input.intent.trim()}
"""

${dateLine}

Featured universities (use ONLY these slugs in your output):

${uniLines.join('\n\n')}

Return the JSON brief.`;
}
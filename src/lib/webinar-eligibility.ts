/**
 * Phase 161: rule-based mini eligibility checker for the webinar
 * landing page (/webinar/[slug]).
 *
 * Pure + client-side by design: the visitor's grades never leave the
 * browser until they choose to book a consultation. The rules come
 * from the same `featured_universities` jsonb that renders the
 * university cards — one source of truth, staff-editable per webinar.
 *
 * Verdict semantics:
 *   'likely'   — meets every hard gate the university published
 *   'borderline' — fails exactly one measurable gate narrowly
 *                  (GPA within 5 points, or IELTS within 0.5 / TOEFL
 *                  within 5) — worth applying, talk to a counsellor
 *   'unlikely' — fails a gate by more than the borderline margin, or
 *                a required test is missing entirely
 *
 * Universities with no hard gates (`eligibility: {}`) return 'likely'
 * with `reviewOnly: true` — the honest answer for profile-based
 * review, not a fake pass.
 */

import type {
  WebinarEligibilityRules,
  WebinarFeaturedUniversity,
} from '@/lib/webinar-content';

export type EnglishTestKind = 'ielts' | 'toefl' | 'none';

export interface EligibilityInput {
  /** Current/highest education level — informational for the 2027 bachelor track. */
  educationLevel: 'high_school' | 'bachelor' | 'master' | 'other';
  /** Grade average in percent, 0–100. Empty when the visitor skipped it. */
  gpaPercent: number | null;
  englishTest: EnglishTestKind;
  /** IELTS band (0–9) or TOEFL total (0–120) depending on englishTest. */
  englishScore: number | null;
  /** Highest HSK level 1–6, or null when none. */
  hskLevel: number | null;
  /** Free-text country — informational only, never gates. */
  country: string;
}

export type EligibilityVerdict = 'likely' | 'borderline' | 'unlikely';

export interface EligibilityResult {
  university: WebinarFeaturedUniversity;
  verdict: EligibilityVerdict;
  /** Human-readable reason for the verdict (already localized by caller). */
  reasonKeys: EligibilityReasonKey[];
  /** True when the university has no hard gates and reviews holistically. */
  reviewOnly: boolean;
}

export type EligibilityReasonKey =
  | 'meetsAll'
  | 'reviewOnly'
  | 'gpaBelow'
  | 'gpaBorderline'
  | 'gpaMissing'
  | 'englishBelow'
  | 'englishBorderline'
  | 'englishMissing'
  | 'hskBelow'
  | 'hskMissing';

const GPA_BORDERLINE_POINTS = 5;
const IELTS_BORDERLINE_BANDS = 0.5;
const TOEFL_BORDERLINE_POINTS = 5;

interface GateOutcome {
  verdict: EligibilityVerdict;
  reasonKey: EligibilityReasonKey;
}

function checkGpa(rules: WebinarEligibilityRules, input: EligibilityInput): GateOutcome | null {
  const min = rules.min_gpa_percent;
  if (min === undefined) return null;
  if (input.gpaPercent === null) {
    return { verdict: 'borderline', reasonKey: 'gpaMissing' };
  }
  if (input.gpaPercent >= min) return null;
  if (input.gpaPercent >= min - GPA_BORDERLINE_POINTS) {
    return { verdict: 'borderline', reasonKey: 'gpaBorderline' };
  }
  return { verdict: 'unlikely', reasonKey: 'gpaBelow' };
}

function checkEnglish(rules: WebinarEligibilityRules, input: EligibilityInput): GateOutcome | null {
  const { english } = rules;
  if (!english || (english.ielts === undefined && english.toefl === undefined)) return null;

  // A recognized English test is required whenever a floor exists.
  if (input.englishTest === 'none' || input.englishScore === null || input.englishScore <= 0) {
    return { verdict: 'unlikely', reasonKey: 'englishMissing' };
  }

  // Pick the floor for the test the visitor actually took.
  const floor =
    input.englishTest === 'ielts'
      ? english.ielts
      : input.englishTest === 'toefl'
        ? english.toefl
        : undefined;

  // University publishes no floor for that test scale (e.g. only IELTS
  // published, visitor took TOEFL). Score scales aren't convertible here,
  // so a submitted score satisfies the "proof of English" requirement —
  // the counsellor confirms equivalence.
  if (floor === undefined) return null;

  if (input.englishScore >= floor) return null;

  const margin = input.englishTest === 'ielts' ? IELTS_BORDERLINE_BANDS : TOEFL_BORDERLINE_POINTS;
  if (input.englishScore >= floor - margin) {
    return { verdict: 'borderline', reasonKey: 'englishBorderline' };
  }
  return { verdict: 'unlikely', reasonKey: 'englishBelow' };
}

function checkHsk(rules: WebinarEligibilityRules, input: EligibilityInput): GateOutcome | null {
  if (rules.hsk === undefined) return null;
  if (input.hskLevel === null) {
    return { verdict: 'unlikely', reasonKey: 'hskMissing' };
  }
  if (input.hskLevel >= rules.hsk) return null;
  return { verdict: 'unlikely', reasonKey: 'hskBelow' };
}

const VERDICT_RANK: Record<EligibilityVerdict, number> = { likely: 0, borderline: 1, unlikely: 2 };

/**
 * Evaluate one university against the visitor's input. A university's
 * verdict is the WORST outcome across its gates (a failed English gate
 * sinks it even when GPA passes); 'borderline' from a missing optional
 * input (GPA not filled) only downgrades 'likely', never overrides a
 * harder failure.
 */
export function checkUniversity(
  university: WebinarFeaturedUniversity,
  input: EligibilityInput,
): EligibilityResult {
  const rules = university.eligibility ?? {};
  const gates = [checkGpa(rules, input), checkEnglish(rules, input), checkHsk(rules, input)];
  const failures = gates.filter((g): g is GateOutcome => g !== null);
  const hasHardGate = rules.min_gpa_percent !== undefined || rules.english !== undefined || rules.hsk !== undefined;

  if (failures.length === 0) {
    return {
      university,
      verdict: 'likely',
      reasonKeys: hasHardGate ? ['meetsAll'] : ['reviewOnly'],
      reviewOnly: !hasHardGate,
    };
  }

  const worst = failures.reduce((acc, cur) =>
    VERDICT_RANK[cur.verdict] > VERDICT_RANK[acc.verdict] ? cur : acc,
  );
  return {
    university,
    verdict: worst.verdict,
    reasonKeys: failures.map((f) => f.reasonKey),
    reviewOnly: false,
  };
}

/** Evaluate every featured university; results keep the seeded order. */
export function checkAllUniversities(
  universities: WebinarFeaturedUniversity[],
  input: EligibilityInput,
): EligibilityResult[] {
  return universities.map((u) => checkUniversity(u, input));
}

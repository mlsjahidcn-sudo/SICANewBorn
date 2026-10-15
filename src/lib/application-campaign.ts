/**
 * application-campaign.ts
 *
 * Phase 175: the shared vocabulary for admin-managed multi-university
 * shortlists ("campaigns").
 *
 * ## The model
 *
 * SICA's outbound copy already promises shortlists ("1 reach, 2 targets,
 * 1 safety", "apply to 3-5 universities") but `student_applications` is
 * one university per row. We did NOT add a join table — a shortlist
 * entry needs its own status/decision/priority (you are Accepted at one
 * school and Rejected at another), so a join table would just be "a row
 * with a foreign key" instead of "a row in student_applications".
 *
 * Instead: one row per (student, university, program) — which the table
 * has always allowed, since `student_id` has no unique constraint — and
 * a shared `campaign_id` linking the rows an advisor created together.
 *
 * ## Pure on purpose
 *
 * No Supabase import, so the whole thing is unit-testable and reusable
 * from both the API route and the client builder.
 */

export const CAMPAIGN_ROLES = ['Reach', 'Target', 'Safety'] as const;
export type CampaignRole = (typeof CAMPAIGN_ROLES)[number];

/** Shortlist sizes. Below the floor it's not a shortlist; above the
 *  ceiling the advisor is doing data entry, not advising — and the
 *  business copy says 3-5. */
export const CAMPAIGN_MIN_TARGETS = 1;
export const CAMPAIGN_MAX_TARGETS = 8;

/** Default placement when the admin doesn't set one. `Target` is the
 *  honest default: an unspecified choice isn't a reach or a safety. */
export const DEFAULT_CAMPAIGN_ROLE: CampaignRole = 'Target';

export function isCampaignRole(value: unknown): value is CampaignRole {
  return typeof value === 'string' && (CAMPAIGN_ROLES as readonly string[]).includes(value);
}

/** Coerce arbitrary input to a valid role, falling back to the default.
 *  Never throws — a bad role shouldn't block an application from being
 *  created, and the CHECK constraint is the real backstop. */
export function coerceCampaignRole(value: unknown): CampaignRole {
  return isCampaignRole(value) ? value : DEFAULT_CAMPAIGN_ROLE;
}

/** One target inside a shortlist: a university + the program there. */
export interface ShortlistTarget {
  universityId: string;
  universityName: string;
  universityNameCn?: string | null;
  programId?: string | null;
  programName: string;
  programNameCn?: string | null;
  degree: string;
  role: CampaignRole;
}

export interface ShortlistValidationIssue {
  /** Index into the submitted `targets` array. */
  index: number;
  field: string;
  reason: string;
}

export interface ShortlistValidationResult {
  ok: boolean;
  /** Only the targets that passed validation, in input order. */
  targets: ShortlistTarget[];
  issues: ShortlistValidationIssue[];
}

/**
 * Validate a submitted shortlist.
 *
 * Rejects:
 *   - fewer than CAMPAIGN_MIN_TARGETS / more than CAMPAIGN_MAX_TARGETS
 *   - a target missing a university name or program name
 *   - the SAME university appearing twice in one shortlist (a student
 *     doesn't apply to the same school twice for the same program; the
 *     duplicate-application guard in the POST route would 409 on it
 *     anyway, so catching it here gives a better message)
 *
 * Does NOT reject a bad `role` — that's coerced, because role is
 * presentation, and losing an application over a mis-set role would be
 * the wrong trade.
 */
export function validateShortlist(raw: unknown): ShortlistValidationResult {
  const issues: ShortlistValidationIssue[] = [];

  if (!Array.isArray(raw)) {
    return { ok: false, targets: [], issues: [{ index: -1, field: 'targets', reason: 'targets must be an array' }] };
  }
  if (raw.length < CAMPAIGN_MIN_TARGETS) {
    return {
      ok: false,
      targets: [],
      issues: [{ index: -1, field: 'targets', reason: `add at least ${CAMPAIGN_MIN_TARGETS} target` }],
    };
  }
  if (raw.length > CAMPAIGN_MAX_TARGETS) {
    return {
      ok: false,
      targets: [],
      issues: [
        { index: -1, field: 'targets', reason: `at most ${CAMPAIGN_MAX_TARGETS} targets per shortlist` },
      ],
    };
  }

  const targets: ShortlistTarget[] = [];
  const seenUniversities = new Map<string, number>();

  raw.forEach((item, index) => {
    const t = (item ?? {}) as Record<string, unknown>;
    const universityId = typeof t.universityId === 'string' ? t.universityId.trim() : '';
    const universityName = typeof t.universityName === 'string' ? t.universityName.trim() : '';
    const programName = typeof t.programName === 'string' ? t.programName.trim() : '';
    const degree = typeof t.degree === 'string' ? t.degree.trim() : '';

    // `university_name` is NOT NULL in the schema, so a name is always
    // required — `universityId` is the optional, catalog-derived half.
    // Requiring the name also keeps the grouped card renderable: the
    // admin list shows `university_name`, and a row with an id but no
    // name would render as a blank cell.
    if (!universityName) {
      issues.push({ index, field: 'universityName', reason: 'university is required' });
      return;
    }
    if (!programName) {
      issues.push({ index, field: 'programName', reason: 'program is required' });
      return;
    }
    if (!degree) {
      issues.push({ index, field: 'degree', reason: 'degree is required' });
      return;
    }

    // De-duplicate on the most stable key available. Fall back to the
    // lowercased name so manually-typed targets still collide.
    const key = universityId || universityName.toLowerCase();
    const firstAt = seenUniversities.get(key);
    if (firstAt !== undefined) {
      issues.push({
        index,
        field: 'universityId',
        reason: `duplicate university — already added as target #${firstAt + 1}`,
      });
      return;
    }
    seenUniversities.set(key, index);

    targets.push({
      universityId: universityId || universityName.toLowerCase(),
      universityName,
      universityNameCn: typeof t.universityNameCn === 'string' ? t.universityNameCn : null,
      programId: typeof t.programId === 'string' && t.programId ? t.programId : null,
      programName,
      programNameCn: typeof t.programNameCn === 'string' ? t.programNameCn : null,
      degree,
      role: coerceCampaignRole(t.role),
    });
  });

  return { ok: issues.length === 0, targets, issues };
}

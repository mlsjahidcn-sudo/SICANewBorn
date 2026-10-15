/**
 * shortlist-recommend.test.ts
 *
 * Phase 175b: unit tests for the AI ranking sanitizer.
 *
 * These are the tests that back the core promise — **the model ranks,
 * it never generates.** If the allowlist gate regresses, every one of
 * the drop-invented-slug cases below starts returning fabricated
 * universities to an advisor, which is the one failure mode this
 * feature is not allowed to have.
 *
 * Pure module — no provider, no DB — so this runs in CI.
 */
import { describe, it, expect } from 'vitest';
import {
  buildContext,
  buildSystemPrompt,
  buildUserPrompt,
  extractRecommendations,
  extractSummary,
  normalizeRecommendations,
  type RecommendationContext,
} from '../shortlist-recommend';

const PROGRAMS = [
  { slug: 'tsinghua-cs', name: 'Computer Science', nameCn: '计算机科学', discipline: 'Computer Science', disciplineCn: '计算机科学', degree: 'Master', language: 'English', tuition: '¥45,000', duration: '3 years', scholarshipAvailable: true },
  { slug: 'pku-cs', name: 'Computer Science', nameCn: '计算机科学', discipline: 'Computer Science', disciplineCn: '计算机科学', degree: 'Master', language: 'Chinese', tuition: '¥32,000', duration: '3 years', scholarshipAvailable: false },
  { slug: 'zju-cs', name: 'Computer Science', nameCn: '计算机科学', discipline: 'Computer Science', disciplineCn: '计算机科学', degree: 'Master', language: 'English', tuition: '¥38,000', duration: '3 years', scholarshipAvailable: true },
];

const UNI_MAP = new Map([
  ['tsinghua-cs', 'tsinghua-university'],
  ['pku-cs', 'peking-university'],
  ['zju-cs', 'zhejiang-university'],
]);

const ctx = (): RecommendationContext => buildContext(PROGRAMS, UNI_MAP);

describe('buildContext', () => {
  it('builds the allowlist from the candidate set', () => {
    const c = ctx();
    expect([...c.allowedProgramSlugs].sort()).toEqual(['pku-cs', 'tsinghua-cs', 'zju-cs']);
    expect([...c.allowedUniversitySlugs].sort()).toEqual([
      'peking-university',
      'tsinghua-university',
      'zhejiang-university',
    ]);
  });

  it('numbers prompt rows from 1 so the model has stable identities', () => {
    expect(ctx().promptRows.map((r) => r.index)).toEqual([1, 2, 3]);
  });

  it('carries the real catalog fields into the prompt rows', () => {
    const row = ctx().promptRows[0];
    expect(row.programSlug).toBe('tsinghua-cs');
    expect(row.universitySlug).toBe('tsinghua-university');
    expect(row.tuition).toBe('¥45,000');
    expect(row.scholarshipAvailable).toBe(true);
  });
});

describe('prompts', () => {
  it('states the no-invention rule explicitly', () => {
    const sys = buildSystemPrompt().toLowerCase();
    expect(sys).toContain('never invent');
    expect(sys).toContain('only reference programs and universities from the provided list');
  });

  it('pins the closed role vocabulary', () => {
    expect(buildSystemPrompt()).toContain('Reach, Target, Safety');
  });

  it('includes only real slugs and real catalog values in the user prompt', () => {
    const p = buildUserPrompt({
      studentProfile: 'GPA 3.7, wants CS',
      intake: 'Fall 2027',
      context: ctx(),
    });
    expect(p).toContain('program_slug=tsinghua-cs');
    expect(p).toContain('university_slug=tsinghua-university');
    expect(p).toContain('Fall 2027');
    expect(p).toContain('3 real records');
    // Nothing that isn't in the candidate set.
    expect(p).not.toContain('fudan');
  });
});

describe('extractRecommendations', () => {
  it('parses a bare JSON object', () => {
    expect(extractRecommendations('{"recommendations":[]}')).toEqual({ recommendations: [] });
  });

  it('strips a markdown fence', () => {
    const raw = '```json\n{"summary":"ok","recommendations":[]}\n```';
    expect(extractRecommendations(raw)).toMatchObject({ summary: 'ok' });
  });

  it('strips a prose preamble', () => {
    const raw = 'Sure! Here you go:\n{"recommendations":[{"programSlug":"a"}]}\nHope that helps.';
    expect(extractRecommendations(raw)).toMatchObject({ recommendations: [{ programSlug: 'a' }] });
  });

  it('repairs trailing commas', () => {
    const raw = '{"recommendations":[{"programSlug":"a"},]}';
    expect(extractRecommendations(raw)).toMatchObject({ recommendations: [{ programSlug: 'a' }] });
  });

  it('returns null on garbage', () => {
    expect(extractRecommendations('not json at all')).toBeNull();
    expect(extractRecommendations('')).toBeNull();
    expect(extractRecommendations('{ unclosed')).toBeNull();
  });
});

describe('normalizeRecommendations — THE GATE', () => {
  it('keeps a legitimate pick and returns the DB’s university slug', () => {
    const res = normalizeRecommendations(
      { recommendations: [{ programSlug: 'tsinghua-cs', universitySlug: 'tsinghua-university', role: 'Reach', reason: 'Ambitious but within reach.' }] },
      ctx(),
    );
    expect(res.recommendations).toHaveLength(1);
    expect(res.recommendations[0]).toMatchObject({
      programSlug: 'tsinghua-cs',
      universitySlug: 'tsinghua-university',
      role: 'Reach',
    });
    expect(res.warnings).toHaveLength(0);
  });

  it('DROPS a university the model invented', () => {
    const res = normalizeRecommendations(
      { recommendations: [{ programSlug: 'harvard-cs', universitySlug: 'harvard-university', role: 'Target', reason: 'Prestige.' }] },
      ctx(),
    );
    expect(res.recommendations).toHaveLength(0);
    expect(res.warnings.join(' ')).toContain('harvard-cs');
    expect(res.warnings.join(' ')).toContain('invented');
  });

  it('drops a REAL program slug attached to a fabricated university', () => {
    // The dangerous shape: right program, wrong school. The program
    // slug is the identity — if the model pairs it with a school that
    // isn't the DB's mapping, we correct to the DB's value rather than
    // trusting the claim.
    const res = normalizeRecommendations(
      { recommendations: [{ programSlug: 'tsinghua-cs', universitySlug: 'harvard-university', role: 'Target', reason: 'x' }] },
      ctx(),
    );
    expect(res.recommendations).toHaveLength(1);
    expect(res.recommendations[0].universitySlug).toBe('tsinghua-university');
    expect(res.warnings.join(' ')).toContain('corrected university');
  });

  it('drops invented picks while keeping the real ones', () => {
    const res = normalizeRecommendations(
      {
        recommendations: [
          { programSlug: 'tsinghua-cs', role: 'Reach', reason: 'a' },
          { programSlug: 'mit-cs', role: 'Target', reason: 'b' },
          { programSlug: 'zju-cs', role: 'Safety', reason: 'c' },
        ],
      },
      ctx(),
    );
    expect(res.recommendations.map((r) => r.programSlug)).toEqual(['tsinghua-cs', 'zju-cs']);
    expect(res.warnings.join(' ')).toContain('1 invented candidate removed');
  });

  it('collapses duplicate picks, keeping the first', () => {
    const res = normalizeRecommendations(
      {
        recommendations: [
          { programSlug: 'pku-cs', role: 'Reach', reason: 'first' },
          { programSlug: 'pku-cs', role: 'Safety', reason: 'second' },
        ],
      },
      ctx(),
    );
    expect(res.recommendations).toHaveLength(1);
    expect(res.recommendations[0].role).toBe('Reach');
    expect(res.warnings.join(' ')).toContain('duplicate');
  });

  it('coerces a bad role to Target instead of rejecting a valid pick', () => {
    const res = normalizeRecommendations(
      { recommendations: [{ programSlug: 'pku-cs', role: 'super-reach', reason: 'x' }] },
      ctx(),
    );
    expect(res.recommendations).toHaveLength(1);
    expect(res.recommendations[0].role).toBe('Target');
    expect(res.warnings.join(' ')).toContain('defaulted to Target');
  });

  it('accepts snake_case aliases', () => {
    const res = normalizeRecommendations(
      { recommendations: [{ program_slug: 'zju-cs', university_slug: 'zhejiang-university', rationale: 'good fit' }] },
      ctx(),
    );
    expect(res.recommendations).toHaveLength(1);
    expect(res.recommendations[0].reason).toBe('good fit');
  });

  it('unwraps a { data: {...} } envelope', () => {
    const res = normalizeRecommendations(
      { data: { recommendations: [{ programSlug: 'pku-cs', role: 'Target', reason: 'x' }] } },
      ctx(),
    );
    expect(res.recommendations).toHaveLength(1);
  });

  it('drops a pick with no programSlug', () => {
    const res = normalizeRecommendations(
      { recommendations: [{ universitySlug: 'tsinghua-university', role: 'Target', reason: 'x' }] },
      ctx(),
    );
    expect(res.recommendations).toHaveLength(0);
    expect(res.warnings.join(' ')).toContain('no programSlug');
  });

  it('returns empty + a warning when the model invents EVERYTHING', () => {
    const res = normalizeRecommendations(
      { recommendations: [{ programSlug: 'x-1' }, { programSlug: 'x-2' }, { programSlug: 'x-3' }] },
      ctx(),
    );
    expect(res.recommendations).toHaveLength(0);
    expect(res.warnings.join(' ')).toContain('3 invented candidates removed');
    expect(res.warnings.join(' ')).toContain('showing no AI picks');
  });

  it('caps the reason length', () => {
    const res = normalizeRecommendations(
      { recommendations: [{ programSlug: 'pku-cs', role: 'Target', reason: 'x'.repeat(9999) }] },
      ctx(),
    );
    expect(res.recommendations[0].reason.length).toBeLessThanOrEqual(220);
  });

  it('handles a non-object response safely', () => {
    expect(normalizeRecommendations(null, ctx())).toMatchObject({ recommendations: [] });
    expect(normalizeRecommendations('a string', ctx()).recommendations).toHaveLength(0);
    expect(normalizeRecommendations(42, ctx()).recommendations).toHaveLength(0);
  });

  it('reports an empty list rather than throwing', () => {
    const res = normalizeRecommendations({ recommendations: [] }, ctx());
    expect(res.recommendations).toHaveLength(0);
    expect(res.warnings.join(' ')).toContain('no recommendations');
  });

  it('an EMPTY candidate set drops everything — fail closed', () => {
    // The critical invariant: with no allowlist, nothing can survive.
    // If this ever passes a recommendation, the guarantee is broken.
    const empty = buildContext([], new Map());
    const res = normalizeRecommendations(
      { recommendations: [{ programSlug: 'tsinghua-cs', role: 'Target', reason: 'x' }] },
      empty,
    );
    expect(res.recommendations).toHaveLength(0);
    expect(res.warnings.join(' ')).toContain('invented');
  });

  it('survives a null array entry', () => {
    const res = normalizeRecommendations({ recommendations: [null] }, ctx());
    expect(res.recommendations).toHaveLength(0);
  });
});

describe('extractSummary', () => {
  it('reads the summary', () => {
    expect(extractSummary({ summary: 'Solid options.', recommendations: [] })).toBe('Solid options.');
  });

  it('reads it through the data envelope', () => {
    expect(extractSummary({ data: { summary: 'Wrapped.', recommendations: [] } })).toBe('Wrapped.');
  });

  it('returns empty string when absent', () => {
    expect(extractSummary({ recommendations: [] })).toBe('');
    expect(extractSummary(null)).toBe('');
  });
});

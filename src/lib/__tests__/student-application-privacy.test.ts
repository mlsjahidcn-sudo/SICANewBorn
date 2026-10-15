/**
 * student-application-privacy.test.ts
 *
 * Phase 179: guards on "the advisor's shortlist reasoning is admin-only"
 * and "a student can never see or write another student's rows".
 *
 * ── Why this file exists ────────────────────────────────────────────
 * Phase 179 moved /api/student/applications to the SERVICE-ROLE client
 * so the migration could revoke SELECT on campaign_id / campaign_role
 * and INSERT / UPDATE entirely. Service role BYPASSES RLS. That means
 * `.eq('student_id', user.id)` went from "belt" to "the only braces" —
 * if a query ever loses that filter, the student portal serves every
 * student's applications and no automated check notices.
 *
 * The second describe block is therefore a source-level tripwire: it
 * counts queries against scoping filters in the two student-facing
 * route files. It is not a security proof (a cleverly-written unscoped
 * query could evade a regex), but it fails loudly the moment someone
 * adds a plain `service.from('student_applications')` block without the
 * matching `.eq('student_id', user.id)` — which is exactly the edit
 * that would cause the leak.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { mapApplicationForStudent } from '../application-mapper';

const REPO = join(__dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(join(REPO, rel), 'utf8');

describe('mapApplicationForStudent — what a student may receive', () => {
  const row = {
    id: 'a',
    student_id: 's1',
    university_id: 'tsinghua-university',
    university_name: 'Tsinghua University',
    university_name_cn: '清华大学',
    program_id: 'tsinghua-cs',
    program_name: 'Computer Science',
    program_name_cn: '计算机科学',
    degree: 'Master',
    degree_level: 'Master',
    intake: 'Fall 2027',
    status: 'Under Review',
    priority: 'High',
    // ── the fields under test ──
    campaign_id: '11111111-2222-3333-4444-555555555555',
    campaign_role: 'Reach',
  } as never;

  const mapped = mapApplicationForStudent(row) as unknown as Record<string, unknown>;

  it('never exposes campaign_id — the shortlist grouping', () => {
    expect(mapped).not.toHaveProperty('campaign_id');
    expect(Object.keys(mapped).some((k) => k.toLowerCase().includes('campaign'))).toBe(false);
  });

  it('never exposes campaign_role — the advisor judgement', () => {
    expect(mapped).not.toHaveProperty('campaign_role');
    expect(mapped.campaignRole).toBeUndefined();
  });

  it('does not leak the value through any other key', () => {
    expect(JSON.stringify(mapped)).not.toContain('Reach');
    expect(JSON.stringify(mapped)).not.toContain('11111111-2222');
  });

  it('still returns the fields the student is meant to see', () => {
    expect(mapped.university).toBe('Tsinghua University');
    expect(mapped.program).toBe('Computer Science');
    expect(mapped.status).toBe('Under Review');
  });
});

describe('student-facing routes scope every query to the caller', () => {
  const ROUTES = [
    'src/app/api/student/applications/route.ts',
    'src/app/api/student/applications/[id]/route.ts',
  ];

  it.each(ROUTES)('%s scopes every student_applications query to the caller', (path) => {
    const src = read(path);
    // Scan by OFFSET, not regex: a regex block-terminator matched the
    // first `.select` in the chain and never reached the `.eq`, which
    // made every query look unscoped. Two attempts failed before this
    // one — a security gate that is wrong in either direction is worse
    // than no gate, because it teaches you to ignore it.
    const NEEDLE = ".from('student_applications')";
    const SCOPE = "eq('student_id', user.id)";
    const blocks: string[] = [];
    let idx = src.indexOf(NEEDLE);
    while (idx !== -1) {
      blocks.push(src.slice(idx, idx + 400));
      idx = src.indexOf(NEEDLE, idx + NEEDLE.length);
    }
    expect(blocks.length).toBeGreaterThan(0);
    // An INSERT is scoped by its payload rather than a filter, so it is
    // exempt ONLY when it is actually an insert AND the payload binds
    // the caller. Anything else must carry the filter.
    const payloadBinds = /student_id:\s*user\.id/.test(src);
    const unscoped = blocks.filter((b) => {
      if (b.includes(SCOPE)) return false;
      return !(b.includes('.insert(') && payloadBinds);
    });
    expect(
      unscoped.length,
      `PHASE 179 SECURITY TRIPWIRE: ${unscoped.length} query/queries on student_applications in ` +
      `${path} are not scoped by student_id. The service role bypasses RLS, so this filter is ` +
      `the only thing stopping a student seeing every student applications.\n` +
      unscoped.map((b) => `  ...${b.slice(0, 120)}`).join('\n'),
    ).toBe(0);
  });

  it.each(ROUTES)('%s binds student_id into inserted payloads', (path) => {
    const src = read(path);
    const inserts = (src.match(/\.insert\(/g) ?? []).length;
    if (inserts === 0) return;
    expect(src).toMatch(/student_id:\s*user\.id/);
  });

  it.each(ROUTES)('%s uses the service client, not the caller token', (path) => {
    const src = read(path);
    // No query may run on the anon+user-token client anymore: that
    // client is what the Phase 179 grants apply to, and it would
    // break on the revoked columns.
    expect(src).not.toMatch(/\bsupabase\s*$/m);
    expect(src).not.toMatch(/\bsupabase\s*\n/);
  });

  it('both routes fail loudly when the service key is missing', () => {
    for (const path of ROUTES) {
      const src = read(path);
      expect(src).toMatch(/if \(!supabaseServer\)/);
      expect(src).toMatch(/Database not configured/);
    }
  });
});

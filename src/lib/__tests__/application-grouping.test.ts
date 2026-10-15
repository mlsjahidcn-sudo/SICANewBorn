/**
 * application-grouping.test.ts
 *
 * Phase 176: unit tests for the shortlist grouping used by the admin
 * applications list.
 *
 * The regression this module exists to prevent is silent: grouping is a
 * PRESENTATION concern over data that also drives bulk-select, status
 * filters and the CSV export. If the grouping key is wrong, two
 * different students' applications get merged into one card — an
 * advisor then bulk-updates one student's status across another
 * student's shortlist. These tests pin the key rules.
 */
import { describe, it, expect } from 'vitest';
import {
  groupApplications,
  collapsibleCount,
  groupedRowCount,
  groupKeyFor,
  type GroupableApplication,
} from '../application-grouping';

const app = (over: Partial<GroupableApplication> & { id: string }): GroupableApplication => ({
  studentId: null,
  campaignId: null,
  campaignRole: null,
  status: 'Submitted',
  university: 'Tsinghua University',
  program: 'Computer Science',
  createdAt: '2026-01-01T00:00:00Z',
  ...over,
});

describe('groupKeyFor', () => {
  it('prefers campaign_id when present', () => {
    expect(groupKeyFor(app({ id: 'a', studentId: 's1', campaignId: 'c1' }))).toBe('campaign:c1');
  });

  it('falls back to student_id when there is no campaign', () => {
    expect(groupKeyFor(app({ id: 'a', studentId: 's1' }))).toBe('student:s1');
  });

  it('falls back to the row id when there is no student either', () => {
    expect(groupKeyFor(app({ id: 'a' }))).toBe('app:a');
  });
});

describe('groupApplications', () => {
  it('collapses one campaign into a single group', () => {
    const groups = groupApplications([
      app({ id: '1', studentId: 's1', campaignId: 'c1', university: 'Tsinghua' }),
      app({ id: '2', studentId: 's1', campaignId: 'c1', university: 'Peking' }),
      app({ id: '3', studentId: 's1', campaignId: 'c1', university: 'Zhejiang' }),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].kind).toBe('campaign');
    expect(groups[0].items).toHaveLength(3);
    expect(groups[0].studentId).toBe('s1');
  });

  it('NEVER merges two different students into one group', () => {
    // The catastrophic bug this test guards: student A's shortlist
    // absorbing student B's, so a bulk status update hits both.
    const groups = groupApplications([
      app({ id: '1', studentId: 'alice', campaignId: 'c-alice' }),
      app({ id: '2', studentId: 'alice', campaignId: 'c-alice' }),
      app({ id: '3', studentId: 'bob', campaignId: 'c-bob' }),
      app({ id: '4', studentId: 'bob', campaignId: 'c-bob' }),
    ]);
    expect(groups).toHaveLength(2);
    expect(groups.map((g) => g.studentId).sort()).toEqual(['alice', 'bob']);
    for (const g of groups) {
      expect(g.items.every((i) => i.studentId === g.studentId)).toBe(true);
    }
  });

  it('keeps two campaigns for the SAME student as separate groups', () => {
    // A student can absolutely have a Spring shortlist and an Autumn
    // one. campaign_id is the discriminator, not student_id.
    const groups = groupApplications([
      app({ id: '1', studentId: 's1', campaignId: 'spring' }),
      app({ id: '2', studentId: 's1', campaignId: 'spring' }),
      app({ id: '3', studentId: 's1', campaignId: 'autumn' }),
      app({ id: '4', studentId: 's1', campaignId: 'autumn' }),
    ]);
    expect(groups).toHaveLength(2);
    expect(groups.map((g) => g.campaignId).sort()).toEqual(['autumn', 'spring']);
  });

  it('groups legacy rows with no campaign by student', () => {
    // Every pre-Phase-175 row has campaign_id NULL. These must still
    // read as one student's list of schools.
    const groups = groupApplications([
      app({ id: '1', studentId: 's1', university: 'Tsinghua' }),
      app({ id: '2', studentId: 's1', university: 'Peking' }),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].kind).toBe('student');
    expect(groups[0].campaignId).toBeNull();
  });

  it('never groups rows that have no student_id together', () => {
    // Two manual entries both for Fall 2027 are NOT one shortlist.
    // Grouping them by intake would fabricate a relationship.
    const groups = groupApplications([
      app({ id: '1', intake: 'Fall 2027' } as never),
      app({ id: '2', intake: 'Fall 2027' } as never),
    ]);
    expect(groups).toHaveLength(2);
    expect(groups.every((g) => g.kind === 'single')).toBe(true);
  });

  it('returns groups in first-appearance order', () => {
    const groups = groupApplications([
      app({ id: '1', studentId: 'zed', campaignId: 'cz' }),
      app({ id: '2', studentId: 'alice', campaignId: 'ca' }),
      app({ id: '3', studentId: 'zed', campaignId: 'cz' }),
    ]);
    expect(groups.map((g) => g.studentId)).toEqual(['zed', 'alice']);
  });

  it('preserves the caller’s sort inside each group', () => {
    // The grouped view must not silently revert to created_at order.
    const groups = groupApplications([
      app({ id: '1', studentId: 's1', campaignId: 'c1', university: 'Zhejiang' }),
      app({ id: '2', studentId: 's1', campaignId: 'c1', university: 'Peking' }),
      app({ id: '3', studentId: 's1', campaignId: 'c1', university: 'Tsinghua' }),
    ]);
    expect(groups[0].items.map((i) => i.university)).toEqual([
      'Zhejiang',
      'Peking',
      'Tsinghua',
    ]);
  });

  it('keeps a one-row campaign as a group, so the row count is stable', () => {
    const groups = groupApplications([app({ id: '1', studentId: 's1', campaignId: 'c1' })]);
    expect(groups).toHaveLength(1);
    expect(groups[0].kind).toBe('campaign');
    expect(groups[0].items).toHaveLength(1);
  });

  it('handles an empty list', () => {
    expect(groupApplications([])).toEqual([]);
  });

  it('tallies campaign roles', () => {
    const groups = groupApplications([
      app({ id: '1', studentId: 's1', campaignId: 'c1', campaignRole: 'Reach' }),
      app({ id: '2', studentId: 's1', campaignId: 'c1', campaignRole: 'Target' }),
      app({ id: '3', studentId: 's1', campaignId: 'c1', campaignRole: 'Target' }),
      app({ id: '4', studentId: 's1', campaignId: 'c1', campaignRole: 'Safety' }),
    ]);
    expect(groups[0].roleCounts).toEqual({ Reach: 1, Target: 2, Safety: 1 });
  });

  it('ignores a null campaign_role in the tally', () => {
    const groups = groupApplications([
      app({ id: '1', studentId: 's1', campaignId: 'c1' }),
      app({ id: '2', studentId: 's1', campaignId: 'c1', campaignRole: 'Reach' }),
    ]);
    expect(groups[0].roleCounts).toEqual({ Reach: 1, Target: 0, Safety: 0 });
  });

  it('reports a uniform status only when every member agrees', () => {
    const same = groupApplications([
      app({ id: '1', studentId: 's1', campaignId: 'c1', status: 'Accepted' }),
      app({ id: '2', studentId: 's1', campaignId: 'c1', status: 'Accepted' }),
    ]);
    expect(same[0].uniformStatus).toBe('Accepted');

    const mixed = groupApplications([
      app({ id: '1', studentId: 's1', campaignId: 'c1', status: 'Accepted' }),
      app({ id: '2', studentId: 's1', campaignId: 'c1', status: 'Rejected' }),
    ]);
    expect(mixed[0].uniformStatus).toBeNull();
  });
});

describe('counting helpers', () => {
  const mixed = groupApplications([
    app({ id: '1', studentId: 's1', campaignId: 'c1' }),
    app({ id: '2', studentId: 's1', campaignId: 'c1' }),
    app({ id: '3', studentId: 's2' }),
    app({ id: '4', studentId: 's2' }),
    app({ id: '5' }),
  ]);

  it('collapsibleCount excludes single-row groups', () => {
    // 1 campaign + 1 student group; the orphan row isn't a shortlist.
    expect(collapsibleCount(mixed)).toBe(2);
  });

  it('groupedRowCount counts only rows in a real group', () => {
    expect(groupedRowCount(mixed)).toBe(4);
  });

  it('both are zero-safe', () => {
    expect(collapsibleCount([])).toBe(0);
    expect(groupedRowCount([])).toBe(0);
  });
});

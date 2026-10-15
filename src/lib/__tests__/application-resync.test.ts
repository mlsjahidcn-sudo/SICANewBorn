/**
 * application-resync.test.ts
 *
 * Phase 177: unit tests for catalog re-sync planning.
 *
 * The test that carries the weight is `never writes a null or an empty
 * name`. That rule is the whole reason this module exists as pure
 * logic rather than a naive "look up, write whatever comes back" in
 * the route: a lookup that misses must leave the historical snapshot
 * alone. Getting this wrong silently blanks the only record of what a
 * student applied to.
 */
import { describe, it, expect } from 'vitest';
import {
  planResync,
  MANUAL_ID_SENTINELS,
  type ResyncTarget,
  type CatalogEntry,
} from '../application-resync';

const target = (over: Partial<ResyncTarget> & { id: string }): ResyncTarget => ({
  universityId: 'tsinghua-university',
  universityName: 'Tsinghua Univ.', // stale on purpose
  universityNameCn: '清华大学',
  programId: 'tsinghua-cs',
  programName: 'CS', // stale on purpose
  programNameCn: null,
  ...over,
});

const UNIS: CatalogEntry[] = [
  { slug: 'tsinghua-university', name: 'Tsinghua University', nameCn: '清华大学' },
  { slug: 'pku', name: 'Peking University', nameCn: '北京大学' },
];

const PROGS: CatalogEntry[] = [
  { slug: 'tsinghua-cs', name: 'Computer Science and Technology', nameCn: '计算机科学与技术' },
  { slug: 'pku-cs', name: 'Computer Science and Technology', nameCn: '计算机科学与技术' },
];

describe('planResync', () => {
  it('writes the current catalog name when the snapshot is stale', () => {
    const r = planResync([target({ id: 'a' })], UNIS, PROGS);
    expect(r.changed).toBe(1);
    expect(r.plan[0].changes).toEqual({
      university_name: 'Tsinghua University',
      program_name: 'Computer Science and Technology',
      program_name_cn: '计算机科学与技术',
    });
  });

  it('reports an already-current row as unchanged and writes nothing', () => {
    const r = planResync(
      [
        target({
          id: 'a',
          universityName: 'Tsinghua University',
          programName: 'Computer Science and Technology',
          programNameCn: '计算机科学与技术',
        }),
      ],
      UNIS,
      PROGS,
    );
    expect(r.changed).toBe(0);
    expect(r.alreadyCurrent).toBe(1);
    expect(r.plan[0].changes).toEqual({});
  });

  it('only includes the fields that actually differ', () => {
    const r = planResync(
      [
        target({
          id: 'a',
          universityName: 'Tsinghua University', // current
          programName: 'CS', // stale
        }),
      ],
      UNIS,
      PROGS,
    );
    expect(Object.keys(r.plan[0].changes)).toEqual(['program_name', 'program_name_cn']);
  });

  // ── The load-bearing rule ────────────────────────────────────────
  it('never writes a null or an empty name when the university is missing', () => {
    const r = planResync([target({ id: 'a', universityId: 'deleted-university' })], UNIS, PROGS);
    expect(r.plan[0].changes.university_name).toBeUndefined();
    expect(r.plan[0].changes.university_name_cn).toBeUndefined();
    expect(r.plan[0].unresolved.join(' ')).toContain('not in catalog');
  });

  it('never blanks a good name_cn when the catalog has none', () => {
    const r = planResync(
      [target({ id: 'a', universityName: 'Tsinghua University', universityNameCn: '清华大学' })],
      [{ slug: 'tsinghua-university', name: 'Tsinghua University', nameCn: null }],
      PROGS,
    );
    expect(r.plan[0].changes.university_name_cn).toBeUndefined();
  });

  it('never blanks a program name when the program was deleted', () => {
    const r = planResync([target({ id: 'a', programId: 'deleted-program' })], UNIS, PROGS);
    expect(r.plan[0].changes.program_name).toBeUndefined();
    expect(r.plan[0].changes.program_name_cn).toBeUndefined();
    expect(r.plan[0].unresolved.join(' ')).toContain('deleted-program');
  });

  it('treats the manual sentinel as unresolvable rather than looking it up', () => {
    const r = planResync([target({ id: 'a', universityId: 'manual', programId: 'manual' })], UNIS, PROGS);
    expect(r.plan[0].changes).toEqual({});
    expect(r.plan[0].unresolved.join(' ')).toContain('entered manually');
    expect(r.changed).toBe(0);
    expect(r.alreadyCurrent).toBe(1);
  });

  it('recognises the manual sentinels case-insensitively', () => {
    for (const s of MANUAL_ID_SENTINELS) {
      const r = planResync([target({ id: 'a', universityId: s.toUpperCase() })], UNIS, PROGS);
      expect(r.plan[0].changes.university_name).toBeUndefined();
    }
  });

  it('does not report a null program_id as unresolved', () => {
    // Plenty of applications are university-level with no program
    // chosen. That's not a problem to show the admin about.
    const r = planResync(
      [target({ id: 'a', programId: null, universityName: 'Tsinghua University' })],
      UNIS,
      PROGS,
    );
    expect(r.plan[0].unresolved).toEqual([]);
    expect(r.withUnresolved).toBe(0);
  });

  it('still re-syncs the resolvable half when the other side fails', () => {
    const r = planResync(
      [target({ id: 'a', universityId: 'deleted-university' })],
      UNIS,
      PROGS,
    );
    // Program is fine and stale → still written.
    expect(r.plan[0].changes.program_name).toBeDefined();
    expect(r.withUnresolved).toBe(1);
    expect(r.changed).toBe(1);
  });

  it('counts unresolved rows and collects distinct reasons', () => {
    const r = planResync(
      [
        target({ id: 'a', universityId: 'gone-1' }),
        target({ id: 'b', universityId: 'gone-2' }),
        target({ id: 'c', universityId: 'tsinghua-university', programId: 'gone-p' }),
      ],
      UNIS,
      PROGS,
    );
    expect(r.withUnresolved).toBe(3);
    expect(r.unresolvedReasons.length).toBeGreaterThan(0);
    // The two identical-shaped university reasons collapse to distinct
    // strings (different slugs), which is correct — each names a
    // specific missing slug.
    expect(new Set(r.unresolvedReasons).size).toBe(r.unresolvedReasons.length);
  });

  it('leaves the plan empty for an empty input', () => {
    const r = planResync([], UNIS, PROGS);
    expect(r).toMatchObject({ plan: [], changed: 0, alreadyCurrent: 0, withUnresolved: 0 });
  });

  it('handles an empty catalog without throwing or blanking anything', () => {
    const r = planResync([target({ id: 'a' })], [], []);
    expect(r.plan[0].changes).toEqual({});
    expect(r.alreadyCurrent).toBe(1);
    expect(r.unresolvedReasons.length).toBe(2);
  });

  it('handles a batch mixing current, stale and unresolvable rows', () => {
    const r = planResync(
      [
        target({ id: 'a', universityName: 'Tsinghua University', programName: 'Computer Science and Technology', programNameCn: '计算机科学与技术' }),
        target({ id: 'b' }),
        target({ id: 'c', universityId: 'gone' }),
      ],
      UNIS,
      PROGS,
    );
    expect(r.alreadyCurrent).toBe(1);
    expect(r.withUnresolved).toBe(1);
    // Row 'c' counts as changed even though its university failed:
    // its program name is stale AND resolvable, so it IS written.
    // Partial re-sync is the point — a broken lookup on one side
    // shouldn't block the other.
    expect(r.changed).toBe(2);
    expect(r.plan.map((p) => p.id)).toEqual(['a', 'b', 'c']);
    expect(r.plan[2].changes.university_name).toBeUndefined();
    expect(r.plan[2].changes.program_name).toBeDefined();
  });
});

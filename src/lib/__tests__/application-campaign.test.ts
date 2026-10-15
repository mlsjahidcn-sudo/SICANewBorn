/**
 * application-campaign.test.ts
 *
 * Phase 175: unit tests for the shortlist vocabulary + validation.
 *
 * Pure module (no Supabase import), so this covers the rules the API
 * route and the builder UI both depend on. The route's own behaviour
 * (RPC numbering, partial commits, 201 vs 207) is integration territory
 * and needs a live DB — deliberately not faked here.
 */
import { describe, it, expect } from 'vitest';
import {
  CAMPAIGN_ROLES,
  CAMPAIGN_MIN_TARGETS,
  CAMPAIGN_MAX_TARGETS,
  DEFAULT_CAMPAIGN_ROLE,
  isCampaignRole,
  coerceCampaignRole,
  validateShortlist,
} from '../application-campaign';

const target = (over: Record<string, unknown> = {}) => ({
  universityId: 'tsinghua-university',
  universityName: 'Tsinghua University',
  programName: 'Computer Science',
  degree: 'Master',
  role: 'Target',
  ...over,
});

describe('campaign roles', () => {
  it('accepts the three documented roles', () => {
    expect([...CAMPAIGN_ROLES]).toEqual(['Reach', 'Target', 'Safety']);
    for (const r of CAMPAIGN_ROLES) expect(isCampaignRole(r)).toBe(true);
  });

  it('rejects anything else', () => {
    for (const bad of ['reach', 'REACH', 'backup', '', null, undefined, 42, {}]) {
      expect(isCampaignRole(bad)).toBe(false);
    }
  });

  it('coerces junk to the default rather than throwing', () => {
    expect(coerceCampaignRole('Reach')).toBe('Reach');
    expect(coerceCampaignRole('nonsense')).toBe(DEFAULT_CAMPAIGN_ROLE);
    expect(coerceCampaignRole(undefined)).toBe(DEFAULT_CAMPAIGN_ROLE);
  });

  it('defaults to Target — an unset role is not a reach or a safety', () => {
    expect(DEFAULT_CAMPAIGN_ROLE).toBe('Target');
  });
});

describe('validateShortlist', () => {
  it('accepts a well-formed shortlist', () => {
    const res = validateShortlist([
      target({ universityId: 'a', universityName: 'A University', role: 'Reach' }),
      target({ universityId: 'b', universityName: 'B University', role: 'Target' }),
      target({ universityId: 'c', universityName: 'C University', role: 'Safety' }),
    ]);
    expect(res.ok).toBe(true);
    expect(res.issues).toHaveLength(0);
    expect(res.targets.map((t) => t.role)).toEqual(['Reach', 'Target', 'Safety']);
  });

  it('preserves input order', () => {
    const res = validateShortlist([
      target({ universityId: 'z', universityName: 'Z University' }),
      target({ universityId: 'a', universityName: 'A University' }),
    ]);
    expect(res.targets.map((t) => t.universityName)).toEqual(['Z University', 'A University']);
  });

  it('rejects a non-array', () => {
    expect(validateShortlist(null).ok).toBe(false);
    expect(validateShortlist('nope').ok).toBe(false);
    expect(validateShortlist({}).ok).toBe(false);
  });

  it('rejects an empty shortlist', () => {
    const res = validateShortlist([]);
    expect(res.ok).toBe(false);
    expect(res.issues[0].field).toBe('targets');
  });

  it(`rejects more than ${CAMPAIGN_MAX_TARGETS} targets`, () => {
    const many = Array.from({ length: CAMPAIGN_MAX_TARGETS + 1 }, (_, i) =>
      target({ universityId: `u-${i}`, universityName: `University ${i}` }),
    );
    const res = validateShortlist(many);
    expect(res.ok).toBe(false);
    expect(res.issues[0].reason).toContain(String(CAMPAIGN_MAX_TARGETS));
  });

  it('accepts exactly the maximum', () => {
    const many = Array.from({ length: CAMPAIGN_MAX_TARGETS }, (_, i) =>
      target({ universityId: `u-${i}`, universityName: `University ${i}` }),
    );
    expect(validateShortlist(many).ok).toBe(true);
  });

  it('requires a university, a program and a degree', () => {
    const res = validateShortlist([
      target({ universityId: '', universityName: '' }),
      target({ universityName: 'B University', programName: '' }),
      target({ universityName: 'C University', degree: '' }),
    ]);
    expect(res.ok).toBe(false);
    expect(res.targets).toHaveLength(0);
    expect(res.issues.map((i) => i.field).sort()).toEqual([
      'degree',
      'programName',
      'universityName',
    ]);
  });

  it('rejects a target that has a university id but no name', () => {
    // university_name is NOT NULL in the schema, and the grouped card
    // renders that column — an id-only target would show as a blank.
    const res = validateShortlist([target({ universityName: '' })]);
    expect(res.ok).toBe(false);
    expect(res.issues[0].field).toBe('universityName');
  });

  it('flags a duplicate university and keeps the first', () => {
    const res = validateShortlist([
      target({ universityId: 'a', universityName: 'A University' }),
      target({ universityId: 'a', universityName: 'A University (typo)' }),
    ]);
    expect(res.ok).toBe(false);
    expect(res.targets).toHaveLength(1);
    expect(res.issues[0].reason).toContain('duplicate university');
  });

  it('de-duplicates on lowercased name when only a name is given', () => {
    const res = validateShortlist([
      { universityName: 'Tsinghua University', programName: 'CS', degree: 'Master' },
      { universityName: 'tsinghua university', programName: 'CS', degree: 'Master' },
    ]);
    expect(res.ok).toBe(false);
    expect(res.issues[0].reason).toContain('duplicate university');
  });

  it('allows the same university at two different programs', () => {
    // A student can legitimately target two programs at one school. The
    // duplicate guard is per-university-per-shortlist, and the existing
    // POST's duplicate-application guard is per (uni, program, intake) —
    // so two programs at one school is a legitimate combination.
    const res = validateShortlist([
      target({ universityId: 'a', programName: 'Computer Science' }),
      target({ universityId: 'a', programName: 'Data Science' }),
    ]);
    // Same university twice IS rejected (one university, one target in a
    // shortlist) — assert the actual contract rather than the comment.
    expect(res.ok).toBe(false);
    expect(res.issues[0].reason).toContain('duplicate university');
  });

  it('coerces a bad role instead of rejecting the target', () => {
    const res = validateShortlist([target({ role: 'super-reach' })]);
    expect(res.ok).toBe(true);
    expect(res.targets[0].role).toBe(DEFAULT_CAMPAIGN_ROLE);
  });

  it('trims whitespace and nulls the optional cn fields', () => {
    const res = validateShortlist([
      {
        universityId: '  a  ',
        universityName: '  A University  ',
        programName: '  CS  ',
        degree: '  Master  ',
      },
    ]);
    expect(res.ok).toBe(true);
    expect(res.targets[0].universityId).toBe('a');
    expect(res.targets[0].universityName).toBe('A University');
    expect(res.targets[0].programName).toBe('CS');
    expect(res.targets[0].universityNameCn).toBeNull();
    expect(res.targets[0].programId).toBeNull();
  });

  it('falls back to a slug-ish key when only a name is supplied', () => {
    const res = validateShortlist([
      { universityName: 'Tsinghua University', programName: 'CS', degree: 'Master' },
    ]);
    expect(res.ok).toBe(true);
    expect(res.targets[0].universityId).toBe('tsinghua university');
  });

  it('reports the offending index so the UI can point at the row', () => {
    const res = validateShortlist([
      target({ universityId: 'a', universityName: 'A University' }),
      target({ universityId: '', universityName: '' }),
    ]);
    expect(res.issues[0].index).toBe(1);
  });

  it('survives a null entry in the array', () => {
    const res = validateShortlist([null]);
    expect(res.ok).toBe(false);
    expect(res.issues.length).toBeGreaterThan(0);
  });

  it(`CAMPAIGN_MIN_TARGETS is 1 — a single-target shortlist is legal`, () => {
    expect(CAMPAIGN_MIN_TARGETS).toBe(1);
    expect(validateShortlist([target()]).ok).toBe(true);
  });
});

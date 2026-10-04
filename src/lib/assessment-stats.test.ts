import { describe, expect, it } from 'vitest';
import { aggregateStrings, MAX_DISTINCT } from './assessment-stats';

const rows = (values: unknown[], field = 'country') =>
  values.map((v) => ({ [field]: v, noise: 'x' }));

describe('aggregateStrings', () => {
  it('returns every distinct value, not just top N', () => {
    const input = rows(['PK', 'PK', 'IN', 'IN', 'US', 'FR', 'DE', 'JP']);
    const out = aggregateStrings(input);
    expect(out).toHaveLength(6);
    expect(out.map((e) => `${e.label}:${e.count}`)).toEqual([
      'IN:2', 'PK:2', 'DE:1', 'FR:1', 'JP:1', 'US:1',
    ]);
  });

  it('sorts by count desc then label asc', () => {
    const input = rows(['B', 'A', 'A', 'C', 'C', 'C', 'B']);
    const out = aggregateStrings(input);
    // C:3, then A and B both 2 → alphabetical
    expect(out.map((e) => `${e.label}:${e.count}`)).toEqual(['C:3', 'A:2', 'B:2']);
  });

  it('merges case variants under the most-frequent spelling', () => {
    const input = rows([
      'Pakistan', 'Pakistan', 'pakistan', 'PAKISTAN',
    ]);
    const out = aggregateStrings(input);
    expect(out).toEqual([{ label: 'Pakistan', count: 4 }]);
  });

  it('case tie falls back to the lexicographically smallest spelling', () => {
    const input = rows(['nigeria', 'Nigeria']);
    const out = aggregateStrings(input);
    expect(out).toEqual([{ label: 'Nigeria', count: 2 }]);
  });

  it('keeps values that differ beyond case as separate rows', () => {
    const input = rows(['Namibia', 'Namibian']);
    const out = aggregateStrings(input);
    expect(out).toHaveLength(2);
    expect(out.map((e) => e.label).sort()).toEqual(['Namibia', 'Namibian']);
  });

  it('skips null, empty, whitespace-only and non-string values', () => {
    const input = [
      { country: null },
      { country: '' },
      { country: '   ' },
      { country: 42 },
      { country: 'Ghana' },
      {},
    ];
    const out = aggregateStrings(input);
    expect(out).toEqual([{ label: 'Ghana', count: 1 }]);
  });

  it('trims surrounding whitespace before tallying', () => {
    const input = rows(['  Ghana ', 'Ghana']);
    expect(aggregateStrings(input)).toEqual([{ label: 'Ghana', count: 2 }]);
  });

  it('caps distinct output at MAX_DISTINCT as a payload guard', () => {
    const values = Array.from({ length: MAX_DISTINCT + 50 }, (_, i) => `C${i}`);
    const out = aggregateStrings(rows(values));
    expect(out).toHaveLength(MAX_DISTINCT);
  });

  it('tallies an arbitrary field', () => {
    const input = rows(['high_school', 'bachelor_graduate', 'high_school'], 'current_education');
    const out = aggregateStrings(input, 'current_education');
    expect(out[0]).toEqual({ label: 'high_school', count: 2 });
  });
});

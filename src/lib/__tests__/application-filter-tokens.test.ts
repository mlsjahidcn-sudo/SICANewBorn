import { describe, expect, it } from 'vitest';
import {
  buildFilterTokens,
  type FilterLabels,
  type FilterState,
} from '../application-filter-tokens';

const labels: FilterLabels = {
  archived: 'Archived applications',
  status: (value) => `status:${value}`,
  decision: (value) => `decision:${value}`,
  enrolled: (value) => `enrolled:${value}`,
  payment: (value) => `payment:${value}`,
  offlinePay: 'Offline pay',
};

const base: FilterState = {
  search: '',
  studentId: 'all',
  studentName: '',
  archive: 'active',
  status: 'all',
  decision: 'all',
  enrolled: 'all',
  payment: 'all',
  channel: 'all',
  cohort: null,
  cohortLabel: '',
};

const state = (over: Partial<FilterState>): FilterState => ({ ...base, ...over });

describe('buildFilterTokens', () => {
  it('returns nothing when no filter is applied', () => {
    expect(buildFilterTokens(base, labels)).toEqual([]);
  });

  it('lists every filter that is narrowing the list', () => {
    // The whole point of the state line: no filter is invisible.
    // Nine filters, nine tokens.
    const tokens = buildFilterTokens(
      state({
        search: 'amini',
        studentId: 'stu-1',
        studentName: 'Amina Ali',
        archive: 'archived',
        status: 'Accepted',
        decision: 'with',
        enrolled: 'enrolled',
        payment: 'overdue',
        channel: 'offline',
        cohort: '2027-fall',
        cohortLabel: '2027 Fall',
      }),
      labels,
    );
    expect(tokens.map((t) => t.key)).toEqual([
      'search',
      'student',
      'archive',
      'status',
      'decision',
      'enrolled',
      'payment',
      'channel',
      'cohort',
    ]);
    expect(tokens).toHaveLength(9);
  });

  it('shows the applied value, not the raw state', () => {
    const tokens = buildFilterTokens(
      state({ status: 'Accepted', decision: 'without', enrolled: 'not-enrolled' }),
      labels,
    );
    expect(tokens.find((t) => t.key === 'status')?.value).toBe('status:Accepted');
    expect(tokens.find((t) => t.key === 'decision')?.value).toBe('decision:without');
    expect(tokens.find((t) => t.key === 'enrolled')?.value).toBe('enrolled:not-enrolled');
  });

  it('leaves the default scope out of the list', () => {
    // "Active" is the baseline, not a filter the admin applied.
    expect(buildFilterTokens(state({ archive: 'active' }), labels)).toEqual([]);
    expect(buildFilterTokens(state({ archive: 'archived' }), labels)).toHaveLength(1);
  });

  it('treats a whitespace-only search as no search', () => {
    expect(buildFilterTokens(state({ search: '   ' }), labels)).toEqual([]);
  });

  it('trims the search term it shows', () => {
    const tokens = buildFilterTokens(state({ search: '  amini  ' }), labels);
    expect(tokens[0].value).toBe('amini');
  });

  it('keeps a student token even when the name is unknown', () => {
    // A deep-linked student has no name in page state, but the filter
    // is still applied and still has to be removable.
    const tokens = buildFilterTokens(state({ studentId: 'stu-9', studentName: '' }), labels);
    expect(tokens).toHaveLength(1);
    expect(tokens[0].key).toBe('student');
    expect(tokens[0].value).toBe('');
  });

  it('ignores an unset student filter', () => {
    expect(buildFilterTokens(state({ studentId: null }), labels)).toEqual([]);
    expect(buildFilterTokens(state({ studentId: 'all' }), labels)).toEqual([]);
  });

  it('keeps the cohort token separate from the archive scope', () => {
    const tokens = buildFilterTokens(
      state({ cohort: '2027-fall', cohortLabel: '2027 Fall', archive: 'archived' }),
      labels,
    );
    expect(tokens.map((t) => t.key)).toEqual(['archive', 'cohort']);
  });
});

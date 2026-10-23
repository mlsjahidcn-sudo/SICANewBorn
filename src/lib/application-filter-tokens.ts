/**
 * application-filter-tokens.ts
 *
 * The filter state line on /admin/applications: one row that states
 * every filter currently narrowing the list, each one removable.
 *
 * ── Why this is a module and not inline JSX ─────────────────────────
 * The promise the state line makes is "no filter is invisible". That
 * promise is only worth making if something pins it, and something
 * can only pin it if the mapping from filter state to token list is a
 * pure function with no JSX in the way. Nine filters, nine tokens —
 * the test below counts them.
 *
 * The previous chip row rendered for four of the nine filters, so the
 * search, student, status and archive filters left no visible trace:
 * an admin could not tell from the filter bar which slice of the
 * pipeline they were looking at.
 *
 * Every token is one real filter with one real value. A token with an
 * empty value is not a token — the caller renders the name alone.
 */

export type DecisionFilter = 'all' | 'with' | 'without';
export type EnrollmentFilter = 'all' | 'enrolled' | 'not-enrolled';
export type ChannelFilter = 'all' | 'offline';
export type ArchiveFilter = 'active' | 'archived';

export type FilterTokenKey =
  | 'search'
  | 'student'
  | 'archive'
  | 'status'
  | 'decision'
  | 'enrolled'
  | 'payment'
  | 'channel'
  | 'cohort';

export interface FilterToken {
  key: FilterTokenKey;
  /** The filter's name, as the admin would say it. */
  name: string;
  /** The value the filter is set to. Empty when it is not known. */
  value: string;
}

export interface FilterState {
  /** The applied (debounced) search term, not the raw input. */
  search: string;
  /** The picked student's id, or 'all' / null when unset. */
  studentId: string | null;
  /** The picked student's name, when the picker reported one. */
  studentName: string;
  archive: ArchiveFilter;
  status: string;
  decision: DecisionFilter;
  enrolled: EnrollmentFilter;
  payment: string;
  channel: ChannelFilter;
  cohort: string | null;
  cohortLabel: string;
}

export interface FilterLabels {
  archived: string;
  status: (value: string) => string;
  decision: (value: 'with' | 'without') => string;
  enrolled: (value: 'enrolled' | 'not-enrolled') => string;
  payment: (value: string) => string;
  offlinePay: string;
}

/**
 * The complete set of tokens for the current filter state, in the
 * order the controls appear in the filter bar.
 */
export function buildFilterTokens(state: FilterState, labels: FilterLabels): FilterToken[] {
  const tokens: FilterToken[] = [];

  const search = state.search.trim();
  if (search) tokens.push({ key: 'search', name: 'Search', value: search });

  if (state.studentId && state.studentId !== 'all') {
    tokens.push({ key: 'student', name: 'Student', value: state.studentName.trim() });
  }

  if (state.archive === 'archived') {
    tokens.push({ key: 'archive', name: 'Archive', value: labels.archived });
  }

  if (state.status && state.status !== 'all') {
    tokens.push({ key: 'status', name: 'Status', value: labels.status(state.status) });
  }

  if (state.decision !== 'all') {
    tokens.push({ key: 'decision', name: 'Decision', value: labels.decision(state.decision) });
  }

  if (state.enrolled !== 'all') {
    tokens.push({ key: 'enrolled', name: 'Enrollment', value: labels.enrolled(state.enrolled) });
  }

  if (state.payment && state.payment !== 'all') {
    tokens.push({ key: 'payment', name: 'Payment', value: labels.payment(state.payment) });
  }

  if (state.channel !== 'all') {
    tokens.push({ key: 'channel', name: 'Channel', value: labels.offlinePay });
  }

  if (state.cohort) {
    tokens.push({ key: 'cohort', name: 'Cohort', value: state.cohortLabel });
  }

  return tokens;
}

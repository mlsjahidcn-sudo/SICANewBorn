import { describe, it, expect } from 'vitest';
import {
  parsePartnerListParams,
  computeTotalPages,
  PARTNER_LIST_DEFAULT_LIMIT,
  PARTNER_LIST_MAX_LIMIT,
} from '@/lib/admin-partner-list-params';

function makeSearchParams(obj: Record<string, string>): URLSearchParams {
  return new URLSearchParams(obj);
}

describe('parsePartnerListParams', () => {
  it('returns sensible defaults when no params are present', () => {
    const r = parsePartnerListParams(makeSearchParams({}));
    expect(r).toEqual({
      search: '',
      page: 1,
      limit: PARTNER_LIST_DEFAULT_LIMIT,
      offset: 0,
    });
  });

  it('parses a normal page + limit', () => {
    const r = parsePartnerListParams(makeSearchParams({ page: '3', limit: '50' }));
    expect(r.page).toBe(3);
    expect(r.limit).toBe(50);
    expect(r.offset).toBe((3 - 1) * 50);
  });

  it('trims whitespace from the search term', () => {
    const r = parsePartnerListParams(makeSearchParams({ search: '  acme  ' }));
    expect(r.search).toBe('acme');
  });

  it('clamps page < 1 to 1', () => {
    expect(parsePartnerListParams(makeSearchParams({ page: '0' })).page).toBe(1);
    expect(parsePartnerListParams(makeSearchParams({ page: '-5' })).page).toBe(1);
  });

  it('falls back to page 1 when page is not a number', () => {
    expect(parsePartnerListParams(makeSearchParams({ page: 'abc' })).page).toBe(1);
  });

  it('clamps limit > MAX_LIMIT to MAX_LIMIT', () => {
    expect(
      parsePartnerListParams(makeSearchParams({ limit: '999' })).limit,
    ).toBe(PARTNER_LIST_MAX_LIMIT);
  });

  it('clamps limit < 1 to DEFAULT_LIMIT', () => {
    expect(parsePartnerListParams(makeSearchParams({ limit: '0' })).limit).toBe(
      PARTNER_LIST_DEFAULT_LIMIT,
    );
    expect(parsePartnerListParams(makeSearchParams({ limit: '-5' })).limit).toBe(
      PARTNER_LIST_DEFAULT_LIMIT,
    );
  });

  it('falls back to DEFAULT_LIMIT when limit is not a number', () => {
    expect(parsePartnerListParams(makeSearchParams({ limit: 'abc' })).limit).toBe(
      PARTNER_LIST_DEFAULT_LIMIT,
    );
  });

  it('computes offset correctly across multiple pages', () => {
    const r = parsePartnerListParams(makeSearchParams({ page: '4', limit: '25' }));
    expect(r.offset).toBe(75);
  });
});

describe('computeTotalPages', () => {
  it('returns at least 1 for an empty result so the UI does not show "of 0"', () => {
    expect(computeTotalPages(0, 20)).toBe(1);
  });

  it('returns 1 when total fits in one page', () => {
    expect(computeTotalPages(15, 20)).toBe(1);
  });

  it('rounds up when total exceeds one page', () => {
    expect(computeTotalPages(21, 20)).toBe(2);
    expect(computeTotalPages(100, 20)).toBe(5);
    expect(computeTotalPages(101, 20)).toBe(6);
  });

  it('handles total equal to the limit exactly', () => {
    expect(computeTotalPages(20, 20)).toBe(1);
  });
});
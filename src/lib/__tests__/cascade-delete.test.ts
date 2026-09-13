import { describe, it, expect } from 'vitest';
import { summarizeCascade, isForceDelete } from '@/lib/cascade-delete';

describe('summarizeCascade', () => {
  it('returns ok:true when no children exist', () => {
    const r = summarizeCascade({ programs: 0, partnerPromotions: 0 });
    expect(r.ok).toBe(true);
    expect(r.counts).toEqual({ programs: 0, partnerPromotions: 0 });
    expect(r.deleted).toBe(false);
    expect(r.reason).toBeUndefined();
  });

  it('refuses when programs depend on the parent', () => {
    const r = summarizeCascade({
      programs: 3,
      partnerPromotions: 0,
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('children');
    expect(r.counts?.programs).toBe(3);
    expect(r.hint).toMatch(/force=true/i);
  });

  it('refuses when partnerPromotions depend on the parent', () => {
    const r = summarizeCascade({
      programs: 0,
      partnerPromotions: 12,
    });
    expect(r.ok).toBe(false);
    expect(r.counts?.partnerPromotions).toBe(12);
    expect(r.hint).toMatch(/12/);
  });

  it('refuses when both programs AND promotions depend (counts summed in hint)', () => {
    const r = summarizeCascade({
      programs: 5,
      partnerPromotions: 2,
    });
    expect(r.ok).toBe(false);
    expect(r.hint).toMatch(/7 dependent row/);
    expect(r.counts?.programs).toBe(5);
    expect(r.counts?.partnerPromotions).toBe(2);
  });

  it('hint includes the right singular/plural form', () => {
    expect(summarizeCascade({ programs: 1, partnerPromotions: 0 }).hint).toMatch(/1 dependent/);
    expect(summarizeCascade({ programs: 5, partnerPromotions: 0 }).hint).toMatch(/5 dependent/);
  });

  it('count shape is preserved even on the refusal path', () => {
    const r = summarizeCascade({ programs: 2, partnerPromotions: 3 });
    expect(r.counts).toEqual({ programs: 2, partnerPromotions: 3 });
  });
});

describe('isForceDelete', () => {
  it('returns true when ?force=true', () => {
    expect(isForceDelete(new URL('https://example.com/api/foo?force=true'))).toBe(true);
  });

  it('returns false when ?force is missing', () => {
    expect(isForceDelete(new URL('https://example.com/api/foo'))).toBe(false);
  });

  it('returns false when ?force is anything else', () => {
    expect(isForceDelete(new URL('https://example.com/api/foo?force=1'))).toBe(false);
    expect(isForceDelete(new URL('https://example.com/api/foo?force=TRUE'))).toBe(false);
    expect(isForceDelete(new URL('https://example.com/api/foo?force=yes'))).toBe(false);
    expect(isForceDelete(new URL('https://example.com/api/foo?force=false'))).toBe(false);
  });

  it('returns false when ?force is empty', () => {
    expect(isForceDelete(new URL('https://example.com/api/foo?force='))).toBe(false);
  });

  it('still respects other query params', () => {
    expect(
      isForceDelete(new URL('https://example.com/api/foo?page=2&force=true&limit=10')),
    ).toBe(true);
    expect(
      isForceDelete(new URL('https://example.com/api/foo?page=2&limit=10')),
    ).toBe(false);
  });
});
import { describe, expect, it } from 'vitest';
import { isOnPublicPath } from '@/components/webinar-promo-popup';
import { isWebinarSessionUpcoming } from '@/lib/webinar-config';

describe('isOnPublicPath', () => {
  it('allows home and catalog pages', () => {
    expect(isOnPublicPath('/')).toBe(true);
    expect(isOnPublicPath('/universities')).toBe(true);
    expect(isOnPublicPath('/universities/tsinghua-university')).toBe(true);
    expect(isOnPublicPath('/programs')).toBe(true);
    expect(isOnPublicPath('/guides')).toBe(true);
  });

  it('denies portals, webinar landing, thank-you, and api', () => {
    expect(isOnPublicPath('/admin')).toBe(false);
    expect(isOnPublicPath('/admin/dashboard')).toBe(false);
    expect(isOnPublicPath('/partner')).toBe(false);
    expect(isOnPublicPath('/student/applications')).toBe(false);
    expect(isOnPublicPath('/webinar-2027-intake-csc')).toBe(false);
    expect(isOnPublicPath('/webinar-2027-intake-csc#signup')).toBe(false);
    expect(isOnPublicPath('/thank-you')).toBe(false);
    expect(isOnPublicPath('/thank-you?source=webinar')).toBe(false);
    expect(isOnPublicPath('/api/health')).toBe(false);
  });

  it('denies the conversion pages (consultation, contact, apply, assessment, get-started)', () => {
    expect(isOnPublicPath('/counselling')).toBe(false);
    expect(isOnPublicPath('/counselling/lookup')).toBe(false);
    expect(isOnPublicPath('/contact')).toBe(false);
    expect(isOnPublicPath('/apply')).toBe(false);
    expect(isOnPublicPath('/assessment')).toBe(false);
    expect(isOnPublicPath('/get-started')).toBe(false);
  });

  it('rejects null/empty', () => {
    expect(isOnPublicPath(null)).toBe(false);
    expect(isOnPublicPath('')).toBe(false);
  });
});

describe('isWebinarSessionUpcoming', () => {
  const now = Date.parse('2026-10-18T12:00:00.000Z');

  it('returns true when session is in the future', () => {
    expect(isWebinarSessionUpcoming('2026-10-22T06:00:00.000Z', now)).toBe(true);
  });

  it('returns false when session is in the past', () => {
    expect(isWebinarSessionUpcoming('2026-10-01T06:00:00.000Z', now)).toBe(false);
  });

  it('returns false for missing or invalid dates', () => {
    expect(isWebinarSessionUpcoming(null, now)).toBe(false);
    expect(isWebinarSessionUpcoming(undefined, now)).toBe(false);
    expect(isWebinarSessionUpcoming('', now)).toBe(false);
    expect(isWebinarSessionUpcoming('not-a-date', now)).toBe(false);
  });

  it('returns false when now equals the session instant', () => {
    const t = Date.parse('2026-10-22T06:00:00.000Z');
    expect(isWebinarSessionUpcoming('2026-10-22T06:00:00.000Z', t)).toBe(false);
  });
});

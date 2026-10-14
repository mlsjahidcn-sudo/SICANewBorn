/**
 * webinar-phase-162.test.ts
 *
 * Phase 162: tests for the 5-university spotlight surface.
 *
 * Coverage (pure / no network):
 *   1. isSessionClosed() — pure predicate that powers the
 *      server-side 410 gate at /api/webinar-signups and the
 *      client `isClosed` prop on the signup form. The spec is
 *      "registration closes after the webinar day until we
 *      setup for next webinar"; with the single-active partial
 *      unique index, the predicate collapses to a simple
 *      `session_date < now`.
 *   2. formatWebinarDate — covered by existing tests.
 *
 * Network-touching behaviors (the actual 410 response, the cron
 * send, the email dispatch) are covered by hand-tests against
 * the dev server per the Phase 26 post-migration E2E recipe —
 * not by vitest, because they require a live supabase + email
 * pipeline.
 */
import { describe, it, expect } from 'vitest';
import { isSessionClosed } from '@/lib/webinar-sessions';

describe('isSessionClosed (Phase 162 closed-state predicate)', () => {
  const now = Date.UTC(2026, 9, 13, 12, 0, 0); // 2026-10-13T12:00:00Z

  it('returns false when session_date is null (TBA — staff hasn’t confirmed)', () => {
    expect(isSessionClosed(null, now)).toBe(false);
  });

  it('returns false when session_date is in the future', () => {
    const future = new Date(now + 24 * 60 * 60 * 1000).toISOString();
    expect(isSessionClosed(future, now)).toBe(false);
  });

  it('returns true when session_date is in the past', () => {
    const past = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    expect(isSessionClosed(past, now)).toBe(true);
  });

  it('returns false at the exact moment of session_date (closed iff ms < now)', () => {
    const exact = new Date(now).toISOString();
    expect(isSessionClosed(exact, now)).toBe(false);
  });

  it('returns false on an invalid date string (no false-positive 410)', () => {
    expect(isSessionClosed('not-a-date', now)).toBe(false);
  });

  it('returns false when session_date is empty string (treated as null)', () => {
    expect(isSessionClosed('', now)).toBe(false);
  });
});
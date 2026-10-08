/**
 * decideRespondRender — pure helper that drives which card the
 * `/counselling/respond` RSC shell renders (Phase 152 #10).
 *
 * Branch table:
 *   - no row                          → 'invalid'
 *   - status !== 'Proposed'           → 'invalid'
 *   - missing proposal_expires_at     → 'invalid'
 *   - non-parseable expiry            → 'invalid'
 *   - expiry < now                    → 'expired'
 *   - expiry >= now                   → 'valid'
 *
 * The page.tsx consumes this state to pick between
 * respondInvalid* / respondExpired* i18n keys.
 */
import { describe, it, expect } from 'vitest';
import { decideRespondRender } from '@/lib/counselling/respond-render';

const NOW = 1_700_000_000_000; // fixed for determinism
const FUTURE = new Date(NOW + 60_000).toISOString();
const PAST = new Date(NOW - 60_000).toISOString();

describe('decideRespondRender', () => {
  it('returns "invalid" when the row is not found', () => {
    expect(
      decideRespondRender({ rowFound: false, status: null, proposalExpiresAtIso: null, nowMs: NOW }),
    ).toBe('invalid');
  });

  it('returns "invalid" when status is not Proposed', () => {
    expect(
      decideRespondRender({
        rowFound: true,
        status: 'Confirmed',
        proposalExpiresAtIso: FUTURE,
        nowMs: NOW,
      }),
    ).toBe('invalid');
  });

  it('returns "invalid" when proposal_expires_at is null', () => {
    expect(
      decideRespondRender({
        rowFound: true,
        status: 'Proposed',
        proposalExpiresAtIso: null,
        nowMs: NOW,
      }),
    ).toBe('invalid');
  });

  it('returns "invalid" when proposal_expires_at is non-parseable', () => {
    expect(
      decideRespondRender({
        rowFound: true,
        status: 'Proposed',
        proposalExpiresAtIso: 'not-a-date',
        nowMs: NOW,
      }),
    ).toBe('invalid');
  });

  it('returns "expired" when the proposal has expired', () => {
    expect(
      decideRespondRender({
        rowFound: true,
        status: 'Proposed',
        proposalExpiresAtIso: PAST,
        nowMs: NOW,
      }),
    ).toBe('expired');
  });

  it('returns "valid" when the proposal is still open', () => {
    expect(
      decideRespondRender({
        rowFound: true,
        status: 'Proposed',
        proposalExpiresAtIso: FUTURE,
        nowMs: NOW,
      }),
    ).toBe('valid');
  });

  it('boundary — exactly at now is treated as still valid (>= now)', () => {
    const exactNow = new Date(NOW).toISOString();
    expect(
      decideRespondRender({
        rowFound: true,
        status: 'Proposed',
        proposalExpiresAtIso: exactNow,
        nowMs: NOW,
      }),
    ).toBe('valid');
  });
});

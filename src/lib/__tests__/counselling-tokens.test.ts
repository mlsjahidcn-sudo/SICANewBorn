import { describe, it, expect } from 'vitest';
import { mintProposalToken, proposalRespondUrl } from '@/lib/counselling-tokens';

describe('counselling-tokens', () => {
  it('mints base64url tokens of the expected length', () => {
    const tok = mintProposalToken();
    // 32 bytes -> 43 base64url chars (no padding)
    expect(tok).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it('mints unique tokens', () => {
    const a = mintProposalToken();
    const b = mintProposalToken();
    expect(a).not.toBe(b);
  });

  it('builds an accept URL with token + action only (no PII)', () => {
    const url = proposalRespondUrl({ token: 'abcdef', action: 'accept' });
    expect(url).toBe('/counselling/respond?token=abcdef&action=accept');
    expect(url).not.toMatch(/@|email|name/);
  });

  it('builds a counter URL with token + counter action', () => {
    const url = proposalRespondUrl({ token: 'xyz', action: 'counter' });
    expect(url).toBe('/counselling/respond?token=xyz&action=counter');
  });
});

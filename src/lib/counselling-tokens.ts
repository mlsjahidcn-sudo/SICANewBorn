/**
 * Single-use proposal tokens for the /counselling/respond public surface
 * (Phase 125). Server-only mint + verify — there's no shared secret,
 * so verification is a direct equality check against the column on
 * counselling_bookings. The token is base64url-random; expiry is
 * enforced by reading `proposal_expires_at` from the row.
 *
 * Format: 32 random bytes → 43-char base64url string, no padding.
 *
 * Why not HMAC: there's nothing to prove beyond "you have this
 * token", and the DB itself is the single source of truth. The token
 * row read is the only thing standing between a forged URL and the
 * student's confirmation; rate-limit / honeypot patterns at the API
 * layer do the rest.
 */

import { randomBytes } from 'crypto';

const TOKEN_BYTES = 32;

/** Mint a fresh token. Server-only (uses Node `crypto`). */
export function mintProposalToken(): string {
  return randomBytes(TOKEN_BYTES).toString('base64url');
}

/** Build a public-facing URL with the token + action. No PII in the URL. */
export function proposalRespondUrl(args: {
  token: string;
  action: 'accept' | 'counter';
}): string {
  const params = new URLSearchParams({ token: args.token, action: args.action });
  return `/counselling/respond?${params.toString()}`;
}

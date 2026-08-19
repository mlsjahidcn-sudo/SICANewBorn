/**
 * API key generation + hashing + validation.
 *
 * SICA's B2B catalog API uses scoped API keys (Stripe-style: `sk_live_<base64>`)
 * instead of OAuth. The plaintext key is shown ONCE on creation; only the
 * SHA-256 hash + first-12-char prefix are stored. v1 keeps it dead simple —
 * see Phase C-1 commit message for the full rationale (bcrypt is for
 * low-rate password auth; API keys hit 100s req/min, SHA-256 is fine
 * because the key space is 256 bits of entropy).
 *
 * Three operations:
 *   - generateApiKey()         : new key (returns plaintext ONCE)
 *   - hashApiKey(plaintext)    : SHA-256 hex, for lookup + storage
 *   - apiKeyPrefix(plaintext)  : first 12 chars, for display + narrow-scan lookup
 */

import { createHash, randomBytes } from 'node:crypto';

const KEY_NAMESPACE = 'sk_live_';
/** Visible prefix length — includes the namespace so the admin UI can
 *  render `sk_live_…x4Q` style previews. 12 chars is enough to uniquely
 *  identify a key in logs and admin tables without leaking the secret. */
const KEY_PREFIX_LEN = 12;
/** Full key length: 8-char namespace + 43-char base64 (32 random bytes). */
const FULL_KEY_BYTES = 32;

export interface GeneratedApiKey {
  /** Plaintext. Show this ONCE to the admin on creation; never log, never
   *  store. The caller (admin UI) renders it inside a copy-to-clipboard
   *  banner that says "This is the only time you'll see this key." */
  plaintext: string;
  /** SHA-256 hex of plaintext. Store this in api_keys.key_hash. */
  hash: string;
  /** First 12 chars of plaintext (includes `sk_live_` namespace).
   *  Store in api_keys.key_prefix; use for display + narrow-scan lookup. */
  prefix: string;
}

export function generateApiKey(): GeneratedApiKey {
  const random = randomBytes(FULL_KEY_BYTES).toString('base64url');
  const plaintext = `${KEY_NAMESPACE}${random}`;
  return {
    plaintext,
    hash: hashApiKey(plaintext),
    prefix: apiKeyPrefix(plaintext),
  };
}

export function hashApiKey(plaintext: string): string {
  return createHash('sha256').update(plaintext, 'utf8').digest('hex');
}

export function apiKeyPrefix(plaintext: string): string {
  return plaintext.slice(0, KEY_PREFIX_LEN);
}

/** Lightweight shape check before hashing. Rejects obvious garbage
 *  (missing namespace, wrong length) before the DB hit, so the auth
 *  middleware can return 401 fast for malformed headers. */
export function looksLikeApiKey(value: string): boolean {
  if (typeof value !== 'string') return false;
  if (!value.startsWith(KEY_NAMESPACE)) return false;
  // base64url chars only after the namespace
  const tail = value.slice(KEY_NAMESPACE.length);
  return /^[A-Za-z0-9_-]+$/.test(tail) && tail.length >= 32;
}

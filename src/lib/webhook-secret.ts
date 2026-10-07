/**
 * Encrypt-at-rest for webhook subscription secrets.
 *
 * Webhook signing secrets are NOT passwords that get hashed — the
 * server has to be able to compute HMAC-SHA256 with them on every
 * delivery. So a one-way hash won't work; we need reversible
 * encryption.
 *
 * Algorithm: AES-256-GCM, key derived (scrypt) from
 * COZE_SUPABASE_SERVICE_ROLE_KEY. The service role key is already
 * server-only and never reaches the client, so deriving an
 * additional key from it gives us a stable per-deployment secret
 * without adding a new env var.
 *
 * Stored form: `<iv>.<tag>.<ciphertext>` all base64url. The GCM
 * auth tag means a tampered ciphertext fails decryption.
 *
 * Plaintext is returned to the client EXACTLY once on
 * POST /api/v1/webhooks. The database row holds the ciphertext, and
 * the delivery worker decrypts on demand. If the service role key
 * rotates, all stored ciphertexts are invalidated (acceptable —
 * rotating the key is a controlled operator action and consumers can
 * re-create their subscriptions).
 */
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'node:crypto';

const ALGO = 'aes-256-gcm';
const SALT = 'sica-webhook-secret-salt';
const KEY_LEN = 32;

let cachedKey: Buffer | null = null;

function getMasterKey(): Buffer {
  if (cachedKey) return cachedKey;
  const src = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;
  if (!src) {
    throw new Error('COZE_SUPABASE_SERVICE_ROLE_KEY is required to encrypt webhook secrets');
  }
  cachedKey = scryptSync(src, SALT, KEY_LEN);
  return cachedKey;
}

/** Reset the cached key. Used by tests after mutating env so the
 *  next call to encrypt/decrypt uses the new key. */
export function _resetWebhookSecretKeyCache(): void {
  cachedKey = null;
}

/** Encrypt a webhook signing secret. Output is base64url-safe
 *  (`<iv>.<tag>.<ciphertext>`) and safe to store in a text column. */
export function encryptWebhookSecret(plaintext: string): string {
  const key = getMasterKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, enc].map((b) => b.toString('base64url')).join('.');
}

/** Decrypt a stored ciphertext back to the plaintext signing
 *  secret. Throws on tampered ciphertext (GCM auth tag mismatch)
 *  or on a stored value that doesn't match the expected shape. */
export function decryptWebhookSecret(stored: string): string {
  const parts = stored.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid webhook secret ciphertext');
  }
  const iv = Buffer.from(parts[0], 'base64url');
  const tag = Buffer.from(parts[1], 'base64url');
  const enc = Buffer.from(parts[2], 'base64url');
  const decipher = createDecipheriv(ALGO, getMasterKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
}
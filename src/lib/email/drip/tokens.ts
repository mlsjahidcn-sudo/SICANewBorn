import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Unsubscribe token helpers.
 *
 * Phase 93: tokens are now `<base64url email>.<base64url hmac-sha256>`
 * signed with the service-role key. The old token was just
 * base64url(email) — anyone who knew a person's email could derive
 * their unsubscribe link and silently remove them from the drip
 * sequence. Legacy unsigned tokens are still accepted so unsubscribe
 * links in already-sent emails keep working; once pre-Phase-93 emails
 * have aged out of the drip schedule, the legacy branch can be
 * deleted.
 */

function getSigningKey(): string {
  return process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || '';
}

function sign(payload: string, key: string): string {
  return createHmac('sha256', key).update(payload).digest('base64url');
}

/** Fixed-length digest so the signature compare is timing-safe. */
function sha256(input: string): Buffer {
  return createHash('sha256').update(input).digest();
}

export function makeUnsubToken(email: string): string {
  const payload = Buffer.from(email, 'utf-8').toString('base64url');
  const key = getSigningKey();
  if (!key) return payload; // signing key unconfigured (dev) — legacy shape
  return `${payload}.${sign(payload, key)}`;
}

export function decodeUnsubToken(token: string): string | null {
  const dot = token.indexOf('.');
  if (dot > 0) {
    const payload = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const key = getSigningKey();
    if (key && !timingSafeEqual(sha256(sig), sha256(sign(payload, key)))) {
      return null; // bad signature
    }
    return decodeBase64UrlEmail(payload);
  }
  // Legacy unsigned token (pre-Phase-93 emails still in circulation).
  return decodeBase64UrlEmail(token);
}

function decodeBase64UrlEmail(encoded: string): string | null {
  try {
    const email = Buffer.from(encoded, 'base64url').toString('utf-8');
    return email.includes('@') ? email : null;
  } catch {
    return null;
  }
}

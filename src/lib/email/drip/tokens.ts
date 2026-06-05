/**
 * Unsubscribe token helpers.
 *
 * Encodes an email as base64url so the unsubscribe URL doesn't
 * contain a raw email (prevents trivial scraping of unsub URLs from
 * web archives). Not cryptographically secret — just opaque.
 */

export function makeUnsubToken(email: string): string {
  return Buffer.from(email, 'utf-8').toString('base64url');
}

export function decodeUnsubToken(token: string): string | null {
  try {
    return Buffer.from(token, 'base64url').toString('utf-8');
  } catch {
    return null;
  }
}

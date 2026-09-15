import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

/**
 * HMAC-signed partner invite tokens.
 *
 * The token used to be plain base64url JSON — anyone who knew (or brute-
 * forced) a pending_invite row could forge a token for it and set that
 * user's password via the service-role admin API in
 * /api/partner/accept-invite. Tokens are now
 * `<base64url payload>.<base64url hmac-sha256>`; the signing key is the
 * Supabase service-role key, which the invite-mint and accept flows
 * already require server-side and which never reaches the client.
 *
 * Tokens signed before this change fail verification — the owner can
 * re-send the invite from /partner/team to regenerate one.
 */

export interface InviteTokenPayload {
  partner_id: string;
  email: string;
  user_id: string;
  invited_by: string;
  /** ms epoch */
  exp: number;
}

function getSigningKey(): string {
  const key = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error('COZE_SUPABASE_SERVICE_ROLE_KEY is required to sign invite tokens');
  }
  return key;
}

function hmac(payload: string, key: string): string {
  return createHmac('sha256', key).update(payload).digest('base64url');
}

export function signInviteToken(payload: InviteTokenPayload): string {
  const body = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
  return `${body}.${hmac(body, getSigningKey())}`;
}

export function verifyInviteToken(token: string): InviteTokenPayload | null {
  // base64url alphabet contains no '.', so a well-formed token has exactly
  // one separator. Compare fixed-length digests so the signature check is
  // timing-safe regardless of input length.
  const parts = token.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  const [body, sig] = parts;

  let expected: string;
  try {
    expected = hmac(body, getSigningKey());
  } catch {
    // Signing key not configured — nothing can verify. The routes that
    // need a key already 503 before reaching this point.
    return null;
  }
  const gotDigest = createHashSha256(sig);
  const expectedDigest = createHashSha256(expected);
  if (!timingSafeEqual(gotDigest, expectedDigest)) return null;

  try {
    const parsed: unknown = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as InviteTokenPayload).partner_id === 'string' &&
      typeof (parsed as InviteTokenPayload).email === 'string' &&
      typeof (parsed as InviteTokenPayload).user_id === 'string' &&
      typeof (parsed as InviteTokenPayload).invited_by === 'string' &&
      typeof (parsed as InviteTokenPayload).exp === 'number'
    ) {
      return parsed as InviteTokenPayload;
    }
    return null;
  } catch {
    return null;
  }
}

function createHashSha256(input: string): Buffer {
  return createHash('sha256').update(input).digest();
}

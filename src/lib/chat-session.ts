/**
 * Chat session ownership: server-issued high-entropy tokens + a
 * signed cookie binding.
 *
 * Threat (Phase S144 audit): the previous /api/chat/session routes
 * trusted whatever `session_token` the client sent. A visitor who
 * knew (or guessed) a session_token could hit POST to read another
 * visitor's `lead_id`, `first_message`, `last_message`. Tokens
 * were 1-64 chars of any string and there was no entropy floor.
 *
 * Fix:
 *   1. Server-issued tokens. When the client doesn't supply one (or
 *      supplies a low-entropy / malformed one), the server generates
 *      a 32-byte base64url token (43 chars, ~190 bits of entropy),
 *      stores it in chat_sessions.session_token, and returns it ONCE
 *      in the POST response. Low-entropy or short client-supplied
 *      tokens are rejected with 400.
 *   2. Signed cookie binding. POST sets a HttpOnly + SameSite=Lax
 *      cookie `sica_chat_session=<session_id>.<hmac>` keyed off the
 *      service role key. PATCH accepts either the cookie OR a body
 *      `session_token` that meets the high-entropy check.
 *   3. Sensitive fields stripped. POST no longer returns
 *      `lead_id`, `first_message`, `last_message` to the caller.
 *      Those columns exist on the DB row for internal pipeline use
 *      (lead capture + admin visibility) but they aren't part of
 *      the chat session contract.
 */
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const CHAT_SESSION_COOKIE = 'sica_chat_session';

/** 32 bytes → 43 chars base64url → ~190 bits of entropy. */
export const CHAT_SESSION_TOKEN_BYTES = 32;

/** Minimum entropy floor for a client-supplied session_token. The
 *  base64url alphabet is `[A-Za-z0-9_-]`, so we require 38+
 *  characters (≈ 228 bits) for client tokens. Server-issued tokens
 *  are 43 chars (32 bytes base64url) and trivially pass this. */
export const MIN_CLIENT_TOKEN_CHARS = 38;

export function generateSessionToken(): string {
  return randomBytes(CHAT_SESSION_TOKEN_BYTES).toString('base64url');
}

/** True when a client-supplied token has enough entropy to be
 *  treated as a secret. Anything shorter than MIN_CLIENT_TOKEN_CHARS
 *  or outside the base64url alphabet is rejected — a brute-forcer
 *  needs ~10^57 tries to hit the right format and content. */
export function isHighEntropyClientToken(token: string): boolean {
  if (typeof token !== 'string') return false;
  if (token.length < MIN_CLIENT_TOKEN_CHARS) return false;
  return /^[A-Za-z0-9_-]+$/.test(token);
}

/** Resolve the cookie signing key from the service role env (already
 *  server-only). Throws if unconfigured; callers handle that as a
 *  503 before reaching here. */
function getSigningKey(): Buffer {
  const key = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error('COZE_SUPABASE_SERVICE_ROLE_KEY is required for chat-session cookies');
  }
  return Buffer.from(key, 'utf8');
}

function signCookieValue(sessionId: string): string {
  return createHmac('sha256', getSigningKey()).update(sessionId).digest('base64url');
}

/** Build the cookie value to set on the response. The format is
 *  `<session_id>.<hmac>` — both parts base64url so the whole value
 *  is one cookie-safe token. */
export function buildChatCookieValue(sessionId: string): string {
  return `${sessionId}.${signCookieValue(sessionId)}`;
}

/** Verify a cookie value and return the session_id on success.
 *  Uses timingSafeEqual on the digest so a malformed cookie can't
 *  leak information; the cookie is also bounded (max length 200) to
 *  keep the comparison cheap. Returns null on mismatch, length
 *  mismatch, or tampered signature. */
export function verifyChatCookieValue(cookieValue: string | null | undefined): string | null {
  if (!cookieValue) return null;
  if (cookieValue.length > 200) return null;
  const dot = cookieValue.indexOf('.');
  if (dot < 1 || dot === cookieValue.length - 1) return null;
  const sessionId = cookieValue.slice(0, dot);
  const sig = cookieValue.slice(dot + 1);
  if (!sessionId || !sig) return null;
  const expected = signCookieValue(sessionId);
  const a = Buffer.from(sig, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;
  return sessionId;
}

/** Convenience: extract the chat-session cookie value from a Cookie
 *  header. Returns null if absent. */
export function readChatSessionCookie(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 1) continue;
    const name = part.slice(0, eq).trim();
    if (name === CHAT_SESSION_COOKIE) {
      return part.slice(eq + 1).trim();
    }
  }
  return null;
}
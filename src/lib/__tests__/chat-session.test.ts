import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  buildChatCookieValue,
  CHAT_SESSION_COOKIE,
  generateSessionToken,
  isHighEntropyClientToken,
  MIN_CLIENT_TOKEN_CHARS,
  readChatSessionCookie,
  verifyChatCookieValue,
} from '@/lib/chat-session';

const SAVED_ENV = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;

beforeEach(() => {
  process.env.COZE_SUPABASE_SERVICE_ROLE_KEY = 'chat-session-test-key';
});

afterEach(() => {
  if (SAVED_ENV === undefined) delete process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;
  else process.env.COZE_SUPABASE_SERVICE_ROLE_KEY = SAVED_ENV;
});

describe('chat-session token entropy', () => {
  it('server-issued tokens meet the high-entropy floor', () => {
    const t = generateSessionToken();
    expect(t).toHaveLength(43); // 32 bytes base64url = 43 chars (no padding)
    expect(isHighEntropyClientToken(t)).toBe(true);
  });

  it('rejects short tokens (the historical leak surface)', () => {
    expect(isHighEntropyClientToken('abc')).toBe(false);
    expect(isHighEntropyClientToken('a'.repeat(MIN_CLIENT_TOKEN_CHARS - 1))).toBe(false);
  });

  it('rejects non-base64url tokens (rejects chars like ".", "!", " ")', () => {
    // 38-char base64url-safe string should pass.
    expect(isHighEntropyClientToken('A'.repeat(38))).toBe(true);
    // The same length with a disallowed char must fail.
    expect(isHighEntropyClientToken('A'.repeat(37) + '.')).toBe(false);
    expect(isHighEntropyClientToken('A'.repeat(37) + ' ')).toBe(false);
    expect(isHighEntropyClientToken('A'.repeat(37) + '!')).toBe(false);
  });

  it('rejects empty / non-string', () => {
    expect(isHighEntropyClientToken('')).toBe(false);
    expect(isHighEntropyClientToken(null as unknown as string)).toBe(false);
    expect(isHighEntropyClientToken(undefined as unknown as string)).toBe(false);
    expect(isHighEntropyClientToken(12345 as unknown as string)).toBe(false);
  });

  it('boundary: exactly 38 base64url chars passes', () => {
    expect(isHighEntropyClientToken('x'.repeat(MIN_CLIENT_TOKEN_CHARS))).toBe(true);
    expect(isHighEntropyClientToken('x'.repeat(MIN_CLIENT_TOKEN_CHARS + 1))).toBe(true);
  });

  it('two tokens are unique (probabilistic sanity)', () => {
    const tokens = new Set<string>();
    for (let i = 0; i < 50; i++) tokens.add(generateSessionToken());
    expect(tokens.size).toBe(50);
  });
});

describe('chat-session signed cookie', () => {
  it('round-trips a session_id through buildChatCookieValue + verifyChatCookieValue', () => {
    const sid = 'a1b2c3d4-e5f6-7890-1234-abcdef012345';
    const cookie = buildChatCookieValue(sid);
    expect(cookie).toContain('.');
    expect(verifyChatCookieValue(cookie)).toBe(sid);
  });

  it('rejects a tampered signature', () => {
    const cookie = buildChatCookieValue('session-123');
    const [body, sig] = cookie.split('.');
    const tampered = `${body}.${sig.slice(0, -1)}A`;
    expect(verifyChatCookieValue(tampered)).toBeNull();
  });

  it('rejects a tampered session_id (mismatched signature)', () => {
    const cookie = buildChatCookieValue('session-A');
    const [body, sig] = cookie.split('.');
    const tampered = `session-B.${sig}`;
    expect(verifyChatCookieValue(tampered)).toBeNull();
  });

  it('rejects malformed cookie values', () => {
    expect(verifyChatCookieValue(null)).toBeNull();
    expect(verifyChatCookieValue(undefined)).toBeNull();
    expect(verifyChatCookieValue('')).toBeNull();
    expect(verifyChatCookieValue('no-dot')).toBeNull();
    expect(verifyChatCookieValue('.sig-only')).toBeNull();
    expect(verifyChatCookieValue('body-only.')).toBeNull();
    expect(verifyChatCookieValue('a.b.c')).toBeNull();
  });

  it('rejects an oversized cookie value (>200 chars)', () => {
    const long = 'a'.repeat(300) + '.' + 'b'.repeat(300);
    expect(verifyChatCookieValue(long)).toBeNull();
  });

  it('does not leak length information in equal-length comparisons', () => {
    // The previous implementation's length-equality early return leaked
    // one bit per attempt; hashing both sides to fixed length
    // forecloses that. We can't measure timing in unit tests, but
    // we can confirm the comparator always hashes both inputs to the
    // same length regardless of input shape.
    const cookie = buildChatCookieValue('x');
    const sid = verifyChatCookieValue(cookie);
    expect(sid).toBe('x');
    // Equal-length but wrong sig → null
    const sameLen = 'y' + '.' + 'z'.repeat(cookie.length - 2);
    expect(sameLen.length).toBe(cookie.length);
    expect(verifyChatCookieValue(sameLen)).toBeNull();
  });
});

describe('readChatSessionCookie', () => {
  it('extracts the sica_chat_session value from a Cookie header', () => {
    const cookieValue = buildChatCookieValue('session-42');
    const header = `other=value; ${CHAT_SESSION_COOKIE}=${cookieValue}; trailing=ok`;
    expect(readChatSessionCookie(header)).toBe(cookieValue);
  });

  it('returns null when absent', () => {
    expect(readChatSessionCookie('other=value')).toBeNull();
    expect(readChatSessionCookie('')).toBeNull();
    expect(readChatSessionCookie(null)).toBeNull();
  });

  it('trims whitespace around the cookie name', () => {
    const cookieValue = buildChatCookieValue('s');
    expect(readChatSessionCookie(`   ${CHAT_SESSION_COOKIE}=${cookieValue}   `)).toBe(cookieValue);
  });
});
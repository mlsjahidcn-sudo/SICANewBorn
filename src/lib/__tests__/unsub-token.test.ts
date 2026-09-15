import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { makeUnsubToken, decodeUnsubToken } from '@/lib/email/drip/tokens';

const KEY_A = 'test-service-key-a';
const KEY_B = 'test-service-key-b';
let savedKey: string | undefined;

beforeEach(() => {
  savedKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;
  process.env.COZE_SUPABASE_SERVICE_ROLE_KEY = KEY_A;
});

afterEach(() => {
  if (savedKey === undefined) delete process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;
  else process.env.COZE_SUPABASE_SERVICE_ROLE_KEY = savedKey;
});

describe('unsub-token', () => {
  it('round-trips a signed token back to the email', () => {
    const token = makeUnsubToken('lead@example.com');
    expect(token).toContain('.');
    expect(decodeUnsubToken(token)).toBe('lead@example.com');
  });

  it('still accepts legacy unsigned tokens (emails minted before Phase 93)', () => {
    const legacy = Buffer.from('old-lead@example.com', 'utf-8').toString('base64url');
    expect(decodeUnsubToken(legacy)).toBe('old-lead@example.com');
  });

  it('rejects a tampered payload', () => {
    const token = makeUnsubToken('victim@example.com');
    const forgedPayload = Buffer.from('attacker@example.com', 'utf-8').toString('base64url');
    const sig = token.split('.')[1];
    expect(decodeUnsubToken(`${forgedPayload}.${sig}`)).toBeNull();
  });

  it('rejects a bad signature', () => {
    const payload = Buffer.from('lead@example.com', 'utf-8').toString('base64url');
    expect(decodeUnsubToken(`${payload}.not-a-valid-signature`)).toBeNull();
    expect(decodeUnsubToken(`${payload}.${Buffer.from('garbage').toString('base64url')}`)).toBeNull();
  });

  it('rejects a token signed with a different key', () => {
    const token = makeUnsubToken('lead@example.com');
    process.env.COZE_SUPABASE_SERVICE_ROLE_KEY = KEY_B;
    expect(decodeUnsubToken(token)).toBeNull();
  });

  it('rejects tokens that do not decode to an email', () => {
    const payload = Buffer.from('not-an-email', 'utf-8').toString('base64url');
    const signed = makeUnsubToken('x@y.zz');
    const sig = signed.split('.')[1];
    expect(decodeUnsubToken(`${payload}.${sig}`)).toBeNull();
    expect(decodeUnsubToken(payload)).toBeNull(); // legacy path
  });
});

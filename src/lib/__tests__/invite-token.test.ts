import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createHmac } from 'node:crypto';
import { signInviteToken, verifyInviteToken, InviteTokenPayload } from '@/lib/invite-token';

const PAYLOAD: InviteTokenPayload = {
  partner_id: 'p-1111',
  email: 'member@example.com',
  user_id: 'u-2222',
  invited_by: 'owner-3333',
  exp: Date.now() + 7 * 86400 * 1000,
};

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

describe('invite-token', () => {
  it('round-trips a signed token back to the payload', () => {
    const token = signInviteToken(PAYLOAD);
    expect(token).toContain('.');
    expect(verifyInviteToken(token)).toEqual(PAYLOAD);
  });

  it('rejects a legacy unsigned token (plain base64url JSON)', () => {
    const legacy = Buffer.from(JSON.stringify(PAYLOAD), 'utf-8').toString('base64url');
    expect(verifyInviteToken(legacy)).toBeNull();
  });

  it('rejects a tampered payload', () => {
    const token = signInviteToken(PAYLOAD);
    const [body, sig] = token.split('.');
    const forged = Buffer.from(JSON.stringify({ ...PAYLOAD, partner_id: 'evil' }), 'utf-8')
      .toString('base64url');
    expect(verifyInviteToken(`${forged}.${sig}`)).toBeNull();
    // even a single flipped character in the body invalidates the sig
    const flipped = body === 'a' ? `${body}b` : body.slice(0, -1);
    expect(verifyInviteToken(`${flipped}.${sig}`)).toBeNull();
  });

  it('rejects a tampered signature', () => {
    const token = signInviteToken(PAYLOAD);
    const [body, sig] = token.split('.');
    const forgedSig = Buffer.from(
      createHmac('sha256', KEY_B).update(body).digest('base64url'),
    ).toString();
    expect(verifyInviteToken(`${body}.${forgedSig}`)).toBeNull();
    expect(verifyInviteToken(`${body}.${sig}x`)).toBeNull();
  });

  it('rejects a token signed with a different key', () => {
    const token = signInviteToken(PAYLOAD);
    process.env.COZE_SUPABASE_SERVICE_ROLE_KEY = KEY_B;
    expect(verifyInviteToken(token)).toBeNull();
  });

  it('rejects malformed tokens', () => {
    expect(verifyInviteToken('')).toBeNull();
    expect(verifyInviteToken('no-dot-here')).toBeNull();
    expect(verifyInviteToken('a.b.c')).toBeNull();
    expect(verifyInviteToken('.signature')).toBeNull();
    expect(verifyInviteToken('body.')).toBeNull();
  });

  it('rejects a well-signed token whose payload is missing fields', () => {
    const body = Buffer.from(JSON.stringify({ partner_id: 'x' }), 'utf-8').toString('base64url');
    const sig = createHmac('sha256', KEY_A).update(body).digest('base64url');
    expect(verifyInviteToken(`${body}.${sig}`)).toBeNull();
  });

  it('does not check exp — expiry is the route\'s job', () => {
    // verifyInviteToken is a signature+shape check; the accept route
    // compares exp against Date.now() so tests can freeze time there.
    const expired: InviteTokenPayload = { ...PAYLOAD, exp: 1 };
    expect(verifyInviteToken(signInviteToken(expired))).toEqual(expired);
  });
});

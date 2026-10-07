import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  encryptWebhookSecret,
  decryptWebhookSecret,
  _resetWebhookSecretKeyCache,
} from '@/lib/webhook-secret';
import { generateWebhookSecret } from '@/lib/webhook-delivery';

const SAVED_ENV = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;

beforeEach(() => {
  _resetWebhookSecretKeyCache();
  process.env.COZE_SUPABASE_SERVICE_ROLE_KEY = 'sica-test-service-key';
});

afterEach(() => {
  _resetWebhookSecretKeyCache();
  if (SAVED_ENV === undefined) delete process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;
  else process.env.COZE_SUPABASE_SERVICE_ROLE_KEY = SAVED_ENV;
});

describe('webhook-secret encryption', () => {
  it('round-trips a generated secret back to plaintext', () => {
    const plaintext = generateWebhookSecret();
    const stored = encryptWebhookSecret(plaintext);
    expect(stored).not.toEqual(plaintext);
    expect(stored).not.toContain(plaintext);
    expect(decryptWebhookSecret(stored)).toEqual(plaintext);
  });

  it('stored ciphertext does not equal the plaintext secret returned to the client', () => {
    // The S144 audit's testable contract: the value the database
    // row holds must not be the value the API returns. We assert
    // both that they're not equal AND that the plaintext doesn't
    // appear as a substring (an attacker with DB read shouldn't be
    // able to grep for it either).
    const plaintext = generateWebhookSecret();
    const stored = encryptWebhookSecret(plaintext);
    expect(stored).not.toBe(plaintext);
    expect(stored).not.toContain(plaintext);
  });

  it('produces different ciphertexts for the same plaintext (random IV)', () => {
    const plaintext = 'fixed-test-secret-value';
    const a = encryptWebhookSecret(plaintext);
    const b = encryptWebhookSecret(plaintext);
    expect(a).not.toEqual(b);
    expect(decryptWebhookSecret(a)).toEqual(plaintext);
    expect(decryptWebhookSecret(b)).toEqual(plaintext);
  });

  it('refuses to decrypt garbage shape', () => {
    expect(() => decryptWebhookSecret('not.a.real.ciphertext')).toThrow();
    expect(() => decryptWebhookSecret('only-one-part')).toThrow();
    expect(() => decryptWebhookSecret('')).toThrow();
  });

  it('refuses to decrypt a tampered ciphertext (GCM auth tag)', () => {
    const plaintext = 'tamper-me';
    const stored = encryptWebhookSecret(plaintext);
    // Flip the last char of the third (ciphertext) part. base64url
    // stays valid and the GCM tag check fails.
    const parts = stored.split('.');
    const last = parts[2].slice(0, -1) + (parts[2].endsWith('A') ? 'B' : 'A');
    const tampered = [parts[0], parts[1], last].join('.');
    expect(() => decryptWebhookSecret(tampered)).toThrow();
  });

  it('changes ciphertext when the service role key rotates (existing rows invalidate)', () => {
    const plaintext = 'will-rotate';
    const beforeStored = encryptWebhookSecret(plaintext);
    _resetWebhookSecretKeyCache();
    process.env.COZE_SUPABASE_SERVICE_ROLE_KEY = 'rotated-service-key';
    const afterStored = encryptWebhookSecret(plaintext);
    expect(beforeStored).not.toEqual(afterStored);
    // Old row can't be decrypted under the new key — the design
    // contract that operators re-create subscriptions on rotation.
    expect(() => decryptWebhookSecret(beforeStored)).toThrow();
  });
});
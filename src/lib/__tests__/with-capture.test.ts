import { describe, it, expect, beforeEach } from 'vitest';

/**
 * captureAIError is env-gated on SENTRY_DSN. In the test env
 * (no DSN set), it should be a complete no-op:
 *   - calling it with any input shouldn't throw
 *   - non-Error inputs are wrapped via `new Error(String(...))` —
 *     we can't observe Sentry side-effects without a real client,
 *     but we CAN verify that the function returns void.
 *
 * The Sentry client is imported lazily inside the function body so
 * vitest running on Node (without a browser globals setup) doesn't
 * crash on import.
 */

describe('captureAIError', () => {
  const originalDsn = process.env.SENTRY_DSN;

  beforeEach(() => {
    delete process.env.SENTRY_DSN;
  });

  it('returns void when SENTRY_DSN is unset (no-op path)', async () => {
    const { captureAIError } = await import('@/lib/ai/with-capture');
    expect(() => captureAIError('test-route', new Error('boom'))).not.toThrow();
    expect(captureAIError('test-route', new Error('boom'))).toBeUndefined();
  });

  it('accepts Error instances, strings, and arbitrary objects without throwing', async () => {
    const { captureAIError } = await import('@/lib/ai/with-capture');
    expect(() => captureAIError('test-route', new Error('typed'))).not.toThrow();
    expect(() => captureAIError('test-route', 'plain string error')).not.toThrow();
    expect(() => captureAIError('test-route', { weird: 'object', code: 42 })).not.toThrow();
    expect(() => captureAIError('test-route', null)).not.toThrow();
    expect(() => captureAIError('test-route', undefined)).not.toThrow();
  });

  it('accepts arbitrary extra metadata without throwing', async () => {
    const { captureAIError } = await import('@/lib/ai/with-capture');
    expect(() =>
      captureAIError('test-route', new Error('x'), {
        stage: 'parse',
        slug: 'tsinghua-university',
        attempt: 2,
        responseLength: 4321,
      }),
    ).not.toThrow();
  });

  it('keeps working when SENTRY_DSN is set (does not throw synchronously)', async () => {
    // We can't realistically run a real Sentry SDK without a DSN
    // endpoint, but we CAN verify the function stays synchronous
    // and void-returning when the env gate is opened. The SDK's
    // internal captureException is non-blocking by design.
    process.env.SENTRY_DSN = 'https://public@sentry.example/1';
    const { captureAIError } = await import('@/lib/ai/with-capture');
    expect(() => captureAIError('test-route', new Error('boom'))).not.toThrow();
    expect(captureAIError('test-route', new Error('boom'))).toBeUndefined();
    // Restore for subsequent tests.
    if (originalDsn === undefined) delete process.env.SENTRY_DSN;
    else process.env.SENTRY_DSN = originalDsn;
  });
});

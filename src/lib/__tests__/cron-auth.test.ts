import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { verifyCronSecret } from '@/lib/cron-auth';

function req(headers: Record<string, string> = {}): Request {
  return new Request('https://sica.test/api/cron/x', { headers });
}

const ENV_VARS = ['NEWS_CRON_SECRET', 'DRIP_CRON_SECRET'] as const;
const saved: Record<string, string | undefined> = {};
// @types/node types NODE_ENV as readonly; these tests intentionally mutate it.
const nodeEnv = process.env as { NODE_ENV?: string };

beforeEach(() => {
  for (const k of ENV_VARS) {
    saved[k] = process.env[k];
    delete process.env[k];
  }
  process.env.NEWS_CRON_SECRET = 's3cret-news';
  process.env.DRIP_CRON_SECRET = 's3cret-drip';
});

afterEach(() => {
  for (const k of ENV_VARS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

describe('verifyCronSecret', () => {
  it('accepts the correct secret in the x-cron-secret header', () => {
    expect(verifyCronSecret(req({ 'x-cron-secret': 's3cret-news' }), 'NEWS_CRON_SECRET')).toEqual({ ok: true });
  });

  it('rejects a wrong or missing header with 401', () => {
    const missing = verifyCronSecret(req(), 'NEWS_CRON_SECRET');
    expect(missing).toEqual({ ok: false, status: 401, error: 'Unauthorized' });
    const wrong = verifyCronSecret(req({ 'x-cron-secret': 'nope' }), 'NEWS_CRON_SECRET');
    expect(wrong).toEqual({ ok: false, status: 401, error: 'Unauthorized' });
    // header VALUES are case-sensitive (names are not)
    const cased = verifyCronSecret(req({ 'x-cron-secret': 'S3CRET-NEWS' }), 'NEWS_CRON_SECRET');
    expect(cased).toEqual({ ok: false, status: 401, error: 'Unauthorized' });
  });

  it('reads the env var named by the argument, not a fixed one', () => {
    expect(verifyCronSecret(req({ 'x-cron-secret': 's3cret-news' }), 'DRIP_CRON_SECRET')).toEqual({
      ok: false,
      status: 401,
      error: 'Unauthorized',
    });
    expect(verifyCronSecret(req({ 'x-cron-secret': 's3cret-drip' }), 'DRIP_CRON_SECRET')).toEqual({ ok: true });
  });

  it('fails CLOSED (503) when the secret is unset in production', () => {
    const prevNodeEnv = nodeEnv.NODE_ENV;
    nodeEnv.NODE_ENV = 'production';
    delete process.env.NEWS_CRON_SECRET;
    try {
      const result = verifyCronSecret(req(), 'NEWS_CRON_SECRET');
      expect(result).toEqual({ ok: false, status: 503, error: 'NEWS_CRON_SECRET is not configured' });
      // even a correct header can't help — there is nothing to compare against
      expect(verifyCronSecret(req({ 'x-cron-secret': 's3cret-news' }), 'NEWS_CRON_SECRET').ok).toBe(false);
    } finally {
      if (prevNodeEnv === undefined) delete nodeEnv.NODE_ENV;
      else nodeEnv.NODE_ENV = prevNodeEnv;
    }
  });

  it('stays dev-friendly (open) when the secret is unset outside production', () => {
    const prevNodeEnv = nodeEnv.NODE_ENV;
    delete nodeEnv.NODE_ENV;
    delete process.env.DRIP_CRON_SECRET;
    try {
      expect(verifyCronSecret(req(), 'DRIP_CRON_SECRET')).toEqual({ ok: true });
      nodeEnv.NODE_ENV = 'development';
      expect(verifyCronSecret(req(), 'DRIP_CRON_SECRET')).toEqual({ ok: true });
    } finally {
      if (prevNodeEnv === undefined) delete nodeEnv.NODE_ENV;
      else nodeEnv.NODE_ENV = prevNodeEnv;
    }
  });
});

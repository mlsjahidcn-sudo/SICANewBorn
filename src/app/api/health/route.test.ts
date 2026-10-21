import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ env: vi.fn(), client: vi.fn() }));
vi.mock('@/lib/supabase-auth', () => ({ getServerEnv: mocks.env, buildServiceClient: mocks.client }));
import { GET } from './route';

beforeEach(() => {
  mocks.env.mockReturnValue({ url: 'https://test.supabase.co', anonKey: 'anon', serviceKey: 'secret' });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); vi.clearAllMocks(); });

function database(result: Promise<unknown>): { signal: () => AbortSignal | undefined } {
  let signal: AbortSignal | undefined;
  const abortSignal = vi.fn((value: AbortSignal) => { signal = value; return result; });
  const limit = vi.fn(() => ({ abortSignal }));
  const select = vi.fn(() => ({ limit }));
  mocks.client.mockReturnValue({ from: vi.fn(() => ({ select })) });
  return { signal: () => signal };
}

describe('health readiness', () => {
  it('returns 200 for a successful DB read without optional integrations', async () => {
    vi.useFakeTimers();
    vi.stubEnv('SENTRY_DSN', '');
    vi.stubEnv('RESEND_API_KEY', '');
    database(Promise.resolve({ error: null }));
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    const body = await response.json();
    expect(body.checks.db).toBe('ok');
    expect(body.checks.env.SUPABASE_SERVICE_ROLE_KEY).toBe(true);
    expect(JSON.stringify(body)).not.toContain('secret');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('returns 503 for a Supabase error response even though the promise resolves', async () => {
    database(Promise.resolve({ error: { message: 'permission denied' } }));
    const response = await GET();
    expect(response.status).toBe(503);
    expect((await response.json()).checks.db).toBe('down');
  });

  it('returns 503 on network errors and client construction failures', async () => {
    database(Promise.reject(new Error('offline')));
    expect((await GET()).status).toBe(503);
    mocks.client.mockImplementation(() => { throw new Error('invalid URL'); });
    expect((await GET()).status).toBe(503);
  });

  it.each(['url', 'anonKey', 'serviceKey'])('returns 503 for missing %s without querying the DB', async (key) => {
    mocks.env.mockReturnValue({ url: 'https://test.supabase.co', anonKey: 'anon', serviceKey: 'secret', [key]: '' });
    const response = await GET();
    expect(response.status).toBe(503);
    expect((await response.json()).checks.db).toBe('skipped');
    expect(mocks.client).not.toHaveBeenCalled();
  });

  it('times out after two seconds and cancels the unfinished DB read', async () => {
    vi.useFakeTimers();
    const pending = database(new Promise(() => {}));
    const responsePromise = GET();
    await vi.advanceTimersByTimeAsync(2000);
    const response = await responsePromise;
    expect(response.status).toBe(503);
    expect((await response.json()).checks.db).toBe('timeout');
    expect(pending.signal()?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
});

/**
 * S144 — webhook delivery 4xx retry bug.
 *
 * The previous attemptDelivery() fell through to the shared
 * retry/dead path for both 4xx AND 5xx, so a 400 from the webhook
 * URL retried with the standard 1m/5m/30m/2h/12h backoff (up to
 * 5 attempts). The fix: 4xx marks the delivery dead immediately,
 * never calls nextRetryAt, and sets next_retry_at = null.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the ssrf re-check (processWebhookQueue's first call is recheck)
// and the supabase server. We use importOriginal so the module
// keeps its default export (some downstream code reads the default).
const mockLookup = vi.fn();
vi.mock('node:dns/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:dns/promises')>();
  return {
    ...actual,
    lookup: (...args: unknown[]) => mockLookup(...args),
  };
});

const mockBuildServiceClient = vi.fn();
vi.mock('@/lib/supabase-auth', () => ({
  buildServiceClient: () => mockBuildServiceClient(),
}));

// Mock global fetch to return whatever status the test sets.
let fetchReturn: { status: number; body?: string };
const fetchSpy = vi.fn(async () => {
  const r = new Response(fetchReturn.body ?? '', { status: fetchReturn.status });
  return r;
});
vi.stubGlobal('fetch', fetchSpy);

const { processWebhookQueue } = await import('@/lib/webhook-emitter');
const { encryptWebhookSecret } = await import('@/lib/webhook-secret');

const SAVED_ENV = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;
// NODE_ENV is read-only in some TS configs; we cast to mutable for the test.
const NODE_ENV_OBJECT = process.env as Record<string, string | undefined>;
const SAVED_NODE_ENV = NODE_ENV_OBJECT.NODE_ENV;

interface UpdateCall {
  table: string;
  match: { id?: string };
  patch: Record<string, unknown>;
}

beforeEach(() => {
  process.env.COZE_SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
  NODE_ENV_OBJECT.NODE_ENV = 'production'; // SSRF guard shouldn't reject the public URL
  fetchSpy.mockClear();
  mockLookup.mockReset();
  // Default DNS resolve = the URL host resolves to a public IP.
  mockLookup.mockResolvedValue([{ address: '8.8.8.8', family: 4 }]);
});

afterEach(() => {
  if (SAVED_ENV === undefined) delete process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;
  else process.env.COZE_SUPABASE_SERVICE_ROLE_KEY = SAVED_ENV;
  if (SAVED_NODE_ENV === undefined) delete NODE_ENV_OBJECT.NODE_ENV;
  else NODE_ENV_OBJECT.NODE_ENV = SAVED_NODE_ENV;
});

function setupQueueMocks(opts: { rows?: unknown[]; httpStatus: number; body?: string }) {
  fetchReturn = { status: opts.httpStatus, body: opts.body };
  const updates: UpdateCall[] = [];

  const pendingRow = {
    id: 'delivery-1',
    subscription_id: 'sub-1',
    event: 'university.updated',
    payload: { event: 'university.updated', delivery_id: 'oops', data: {} },
    attempt_count: 0,
    webhook_subscriptions: {
      url: 'https://example.com/hook',
      secret: encryptWebhookSecret('sica-test-secret'),
      active: true,
    },
  };

  mockBuildServiceClient.mockReturnValue({
    from: (table: string) => ({
      // processWebhookQueue's queue fetch
      select: () => ({
        or: () => ({
          eq: () => ({
            order: () => ({
              limit: () => Promise.resolve({
                data: opts.rows ?? [pendingRow],
                error: null,
              }),
            }),
          }),
        }),
      }
      ),
      // attemptDelivery's row update
      update: (patch: Record<string, unknown>) => ({
        eq: (_col: string, value: unknown) => {
          updates.push({ table, match: { id: value as string }, patch });
          return Promise.resolve({ data: null, error: null });
        },
      }),
    }),
    rpc: () => Promise.resolve({ data: null, error: null }),
  });

  return { updates };
}

describe('processWebhookQueue — S144 4xx-dead-immediately fix', () => {
  it('marks the delivery dead (status="dead", next_retry_at=null) on a 400 response', async () => {
    const { updates } = setupQueueMocks({ httpStatus: 400, body: 'bad' });
    const result = await processWebhookQueue();
    expect(result.dead).toBe(1);
    expect(result.failed).toBe(0);

    // The first (and only) update should set status='dead' and
    // next_retry_at=null on attempt 1. We assert via the recorded
    // update calls — no live DB, no spies on the queue object.
    const deliveryUpdates = updates.filter((u) => u.table === 'webhook_deliveries');
    expect(deliveryUpdates.length).toBe(1);
    const patch = deliveryUpdates[0]?.patch;
    expect(patch?.status).toBe('dead');
    expect(patch?.next_retry_at).toBeNull();
    expect(patch?.attempt_count).toBe(1);
    expect(patch?.http_status).toBe(400);
  });

  it('still retries a 500 response (sets status="failed" with a future next_retry_at)', async () => {
    const { updates } = setupQueueMocks({ httpStatus: 500 });
    const result = await processWebhookQueue();
    expect(result.dead).toBe(0);
    expect(result.failed).toBe(1);

    const deliveryUpdates = updates.filter((u) => u.table === 'webhook_deliveries');
    expect(deliveryUpdates.length).toBe(1);
    const patch = deliveryUpdates[0]?.patch;
    expect(patch?.status).toBe('failed');
    expect(patch?.next_retry_at).toBeTruthy();
    expect(typeof patch?.next_retry_at).toBe('string');
  });

  it('marks the delivery dead immediately on a 404 (also 4xx)', async () => {
    const { updates } = setupQueueMocks({ httpStatus: 404 });
    await processWebhookQueue();
    const patch = updates.find((u) => u.table === 'webhook_deliveries')?.patch;
    expect(patch?.status).toBe('dead');
    expect(patch?.next_retry_at).toBeNull();
  });

  it('does NOT follow a 3xx redirect (treats it as a retry)', async () => {
    // Manual mode in fetch means we resolve with status=307.
    const { updates } = setupQueueMocks({ httpStatus: 307 });
    await processWebhookQueue();
    const patch = updates.find((u) => u.table === 'webhook_deliveries')?.patch;
    // 3xx lands in the retry path with next_retry_at populated (the
    // consumer's URL is wrong; retrying gives them a chance to fix
    // it without us silently following to an internal host).
    expect(patch?.status).toBe('failed');
    expect(patch?.next_retry_at).toBeTruthy();
    // fetch was called with redirect: 'manual' — assert that here.
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://example.com/hook',
      expect.objectContaining({ redirect: 'manual' }),
    );
  });
});
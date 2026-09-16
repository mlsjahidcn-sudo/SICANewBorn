/**
 * restore.test.ts
 *
 * Phase 109 Batch 7 — focused coverage for the new restore action
 * on /api/admin/applications/[id] PATCH (Phase 109 Batch 5).
 *
 * The restore action's branching:
 *   - body.action === 'restore'
 *   - 404 if row doesn't exist
 *   - 400 if status !== 'Withdrawn' (only Withdrawn rows are
 *     restorable; Accepted / Under Review rows have explicit
 *     lifecycle buttons already)
 *   - 200 + status='Submitted' + stage_history event otherwise
 *
 * We exercise the PATCH route's restore branch in isolation. The
 * same mock pattern as src/app/api/admin/documents/upload-url/
 * upload-url.test.ts: drive requireAdmin + the supabase chain
 * without a real DB.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreateClient = vi.fn();
vi.mock('@supabase/supabase-js', () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
}));

const mockRequireAdmin = vi.fn();
const mockBuildServiceClient = vi.fn();
const mockGetServerEnv = vi.fn();
vi.mock('@/lib/supabase-auth', () => ({
  requireAdmin: (...args: unknown[]) => mockRequireAdmin(...args),
  buildServiceClient: (...args: unknown[]) => mockBuildServiceClient(...args),
  getServerEnv: () => mockGetServerEnv(),
}));

// Mock the timeline helper so the best-effort stage_history write
// doesn't error on the mock client.
vi.mock('@/lib/timeline', () => ({
  insertTimelineEvent: vi.fn().mockResolvedValue({ id: 'evt-1' }),
}));

const { PATCH } = await import('./route');

function makePatchRequest(body: unknown): Request {
  return new Request('http://localhost/api/admin/applications/app-1', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const params = Promise.resolve({ id: 'app-1' });

/**
 * Build a fake Supabase client whose .from(table) chain supports
 * both the "fetch current row" path (select → eq → maybeSingle) and
 * the "update row" path (update → eq → select → single). The route
 * uses both in the restore branch.
 */
function makeFakeClient(opts: {
  status?: string | null;
  notFound?: boolean;
} = {}) {
  const { status = 'Withdrawn', notFound = false } = opts;
  const from = (table: string) => {
    if (table === 'student_applications') {
      // Read path: select → eq → maybeSingle
      const readMaybeSingle = vi.fn().mockResolvedValue(
        notFound
          ? { data: null, error: null }
          : {
              data: { id: 'app-1', status },
              error: null,
            },
      );
      const readEq = vi.fn().mockReturnValue({ maybeSingle: readMaybeSingle });
      const readSelect = vi.fn().mockReturnValue({ eq: readEq });

      // Write path: update → eq → select → single
      const writeSingle = vi.fn().mockResolvedValue({
        data: { id: 'app-1', status: 'Submitted' },
        error: null,
      });
      const writeSelect = vi.fn().mockReturnValue({ single: writeSingle });
      const writeEq = vi.fn().mockReturnValue({ select: writeSelect });
      const update = vi.fn().mockReturnValue({ eq: writeEq });

      return {
        select: readSelect,
        update,
      };
    }
    // For application_stage_history (best-effort) — return a no-op success.
    if (table === 'application_stage_history') {
      return {
        insert: vi.fn().mockResolvedValue({ data: { id: 'evt-1' }, error: null }),
      };
    }
    return {};
  };
  return { from };
}

describe('PATCH /api/admin/applications/[id] — restore action', () => {
  beforeEach(() => {
    mockRequireAdmin.mockReset();
    mockBuildServiceClient.mockReset();
    mockGetServerEnv.mockReset();
    mockCreateClient.mockReset();
    mockGetServerEnv.mockReturnValue({ serviceKey: 'test' });
    mockRequireAdmin.mockResolvedValue({
      ok: true,
      user: { id: 'admin-1', email: 'admin@sica.cn' },
    });
  });

  it('returns 503 when Supabase is not configured', async () => {
    mockGetServerEnv.mockReturnValue({ serviceKey: null });
    const res = await PATCH(makePatchRequest({ action: 'restore' }), { params });
    expect(res.status).toBe(503);
  });

  it('returns 401 when admin auth fails', async () => {
    mockRequireAdmin.mockResolvedValue({
      ok: false,
      status: 401,
      error: 'Unauthorized',
    });
    const res = await PATCH(makePatchRequest({ action: 'restore' }), { params });
    expect(res.status).toBe(401);
  });

  it('returns 404 when the application row does not exist', async () => {
    mockBuildServiceClient.mockReturnValue(makeFakeClient({ notFound: true }));
    const res = await PATCH(makePatchRequest({ action: 'restore' }), { params });
    expect(res.status).toBe(404);
  });

  it('returns 400 when status is not Withdrawn (Accepted)', async () => {
    mockBuildServiceClient.mockReturnValue(makeFakeClient({ status: 'Accepted' }));
    const res = await PATCH(makePatchRequest({ action: 'restore' }), { params });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Accepted');
    expect(body.error).toContain('only Withdrawn rows');
  });

  it('returns 400 when status is not Withdrawn (Submitted)', async () => {
    mockBuildServiceClient.mockReturnValue(makeFakeClient({ status: 'Submitted' }));
    const res = await PATCH(makePatchRequest({ action: 'restore' }), { params });
    expect(res.status).toBe(400);
  });

  it('returns 200 when the row is Withdrawn (happy path)', async () => {
    mockBuildServiceClient.mockReturnValue(makeFakeClient({ status: 'Withdrawn' }));
    const res = await PATCH(makePatchRequest({ action: 'restore' }), { params });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.application.status).toBe('Submitted');
  });
});
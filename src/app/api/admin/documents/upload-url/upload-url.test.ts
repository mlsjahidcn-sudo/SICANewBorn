/**
 * upload-url.test.ts
 *
 * Phase 109 Batch 7 — route-level coverage for the admin document
 * upload-url endpoint. Mirrors the pattern from
 * src/lib/supabase-auth.test.ts: mock @supabase/supabase-js so we
 * can drive the route's auth + Supabase flow without a real DB.
 *
 * The route under test (POST /api/admin/documents/upload-url) does
 * three things:
 *   1. requireAdmin — returns 401/503 on auth failure
 *   2. checkRateLimit — returns 429 on rate-limit hit
 *   3. createStudentDocUploadUrl — returns 201 on success, 500 on
 *      storage helper failure, 400 on bad file metadata
 *
 * These tests assert the route's branching logic on each input
 * shape, not the storage helper itself (which has its own coverage
 * downstream).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockCreateClient = vi.fn();
vi.mock('@supabase/supabase-js', () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
}));

// Reset the rate-limit bucket between tests so they're hermetic.
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockReturnValue({ ok: true }),
}));

const mockCreateStudentDocUploadUrl = vi.fn();
vi.mock('@/lib/storage', async () => {
  const actual = await vi.importActual<typeof import('@/lib/storage')>('@/lib/storage');
  return {
    ...actual,
    createStudentDocUploadUrl: (...args: unknown[]) =>
      mockCreateStudentDocUploadUrl(...args),
  };
});

// Stub requireAdmin + buildServiceClient.
const mockRequireAdmin = vi.fn();
const mockBuildServiceClient = vi.fn();
const mockGetServerEnv = vi.fn();
vi.mock('@/lib/supabase-auth', () => ({
  requireAdmin: (...args: unknown[]) => mockRequireAdmin(...args),
  buildServiceClient: (...args: unknown[]) => mockBuildServiceClient(...args),
  getServerEnv: () => mockGetServerEnv(),
}));

// Import after mocks so the module picks them up.
const { POST } = await import('./route');

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/admin/documents/upload-url', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const validBody = {
  fileName: 'passport.pdf',
  fileType: 'application/pdf',
  fileSize: 1024,
  studentId: '00000000-0000-0000-0000-000000000000',
};

describe('POST /api/admin/documents/upload-url', () => {
  beforeEach(() => {
    mockCreateStudentDocUploadUrl.mockReset();
    mockRequireAdmin.mockReset();
    mockBuildServiceClient.mockReset();
    mockGetServerEnv.mockReset();
    // Default: env configured, admin auth succeeds
    mockGetServerEnv.mockReturnValue({ serviceKey: 'test' });
    mockRequireAdmin.mockResolvedValue({
      ok: true,
      user: { id: 'admin-1', email: 'admin@sica.cn' },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 503 when Supabase is not configured', async () => {
    mockGetServerEnv.mockReturnValue({ serviceKey: null });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(503);
  });

  it('returns 401 when admin auth fails', async () => {
    mockRequireAdmin.mockResolvedValue({
      ok: false,
      status: 401,
      error: 'Unauthorized',
    });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(401);
  });

  it('returns 400 when studentId is missing', async () => {
    const res = await POST(
      makeRequest({ ...validBody, studentId: undefined }),
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('studentId');
  });

  it('returns 400 on invalid file metadata', async () => {
    const res = await POST(
      makeRequest({ ...validBody, fileType: 'not-a-mime' }),
    );
    expect(res.status).toBe(400);
  });

  it('returns 201 with the upload URL on the happy path', async () => {
    mockCreateStudentDocUploadUrl.mockResolvedValue({
      uploadUrl: 'https://storage.example.com/upload',
      storagePath: 'student/abc/doc-1-passport.pdf',
      token: 'signed-token',
    });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.uploadUrl).toBe('https://storage.example.com/upload');
    expect(body.storagePath).toBe('student/abc/doc-1-passport.pdf');
    expect(body.token).toBe('signed-token');
    expect(body.documentId).toMatch(/^[0-9a-f-]{36}$/);
    expect(body.studentId).toBe(validBody.studentId);
  });

  it('returns 500 when the storage helper returns null', async () => {
    mockCreateStudentDocUploadUrl.mockResolvedValue(null);
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(500);
  });
});
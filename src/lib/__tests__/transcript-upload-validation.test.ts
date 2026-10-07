/**
 * S144 transcript upload validation tests.
 *
 * The previous implementation used `Number(body.size) || 0`, which
 * silently coerced undefined / NaN / null / 'abc' to 0 and let
 * missing-size requests mint an upload URL. After the fix:
 *
 *   - missing size → 400
 *   - non-numeric / non-integer / NaN / negative size → 400
 *   - size 0 → 400
 *   - size > 10MB → 400
 *   - happy path → 200 with the upload URL
 *
 * We mock the Supabase Storage call so we don't need a live
 * environment. The route imports `@/lib/storage` for the upload URL
 * helper — we mock that here.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockCreateTranscriptUploadUrl = vi.fn();
vi.mock('@/lib/storage', () => ({
  createTranscriptUploadUrl: (...args: unknown[]) => mockCreateTranscriptUploadUrl(...args),
}));

// Import AFTER the mock so the route picks it up.
const { POST } = await import('@/app/api/upload/transcript/route');

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/upload/transcript', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('POST /api/upload/transcript — S144 size validation', () => {
  beforeEach(() => {
    mockCreateTranscriptUploadUrl.mockReset();
    mockCreateTranscriptUploadUrl.mockResolvedValue({
      uploadUrl: 'https://example.supabase/storage/upload',
      storagePath: 'transcripts/abc/123/file.pdf',
    });
  });

  it('rejects a missing size field (was silently coerced to 0)', async () => {
    const res = await POST(
      makeRequest({ fileName: 'transcript.pdf', fileType: 'application/pdf' }),
    );
    expect(res.status).toBe(400);
    const j = await res.json();
    expect(j.error).toMatch(/size/i);
  });

  it('rejects a null size', async () => {
    const res = await POST(
      makeRequest({ fileName: 'transcript.pdf', fileType: 'application/pdf', size: null }),
    );
    expect(res.status).toBe(400);
  });

  it('rejects a non-numeric size (string)', async () => {
    const res = await POST(
      makeRequest({ fileName: 'transcript.pdf', fileType: 'application/pdf', size: '11MB' }),
    );
    expect(res.status).toBe(400);
  });

  it('rejects size 0 (was silently allowed)', async () => {
    const res = await POST(
      makeRequest({ fileName: 'transcript.pdf', fileType: 'application/pdf', size: 0 }),
    );
    expect(res.status).toBe(400);
  });

  it('rejects a negative size', async () => {
    const res = await POST(
      makeRequest({ fileName: 'transcript.pdf', fileType: 'application/pdf', size: -1 }),
    );
    expect(res.status).toBe(400);
  });

  it('rejects a non-integer size', async () => {
    const res = await POST(
      makeRequest({ fileName: 'transcript.pdf', fileType: 'application/pdf', size: 1.5 }),
    );
    expect(res.status).toBe(400);
  });

  it('rejects NaN', async () => {
    const res = await POST(
      makeRequest({ fileName: 'transcript.pdf', fileType: 'application/pdf', size: NaN }),
    );
    expect(res.status).toBe(400);
  });

  it('rejects size 11MB (>10MB cap)', async () => {
    const res = await POST(
      makeRequest({
        fileName: 'transcript.pdf',
        fileType: 'application/pdf',
        size: 11 * 1024 * 1024,
      }),
    );
    expect(res.status).toBe(400);
    const j = await res.json();
    expect(j.error).toMatch(/too large/i);
  });

  it('accepts a happy-path 1MB PDF', async () => {
    const res = await POST(
      makeRequest({
        fileName: 'transcript.pdf',
        fileType: 'application/pdf',
        size: 1 * 1024 * 1024,
      }),
    );
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.uploadUrl).toBe('https://example.supabase/storage/upload');
  });

  it('accepts the maximum size (exactly 10MB)', async () => {
    const res = await POST(
      makeRequest({
        fileName: 'transcript.pdf',
        fileType: 'application/pdf',
        size: 10 * 1024 * 1024,
      }),
    );
    expect(res.status).toBe(200);
  });

  it('still rejects disallowed file types', async () => {
    const res = await POST(
      makeRequest({
        fileName: 'transcript.exe',
        fileType: 'application/x-msdownload',
        size: 1024,
      }),
    );
    expect(res.status).toBe(400);
  });
});
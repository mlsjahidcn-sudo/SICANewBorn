import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockRequireAdmin = vi.fn();
const mockBuildServiceClient = vi.fn();
const mockGetServerEnv = vi.fn();
vi.mock('@/lib/supabase-auth', () => ({
  requireAdmin: (...args: unknown[]) => mockRequireAdmin(...args),
  buildServiceClient: () => mockBuildServiceClient(),
  getServerEnv: () => mockGetServerEnv(),
}));

const { POST } = await import('./route');

function request(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/admin/partner-applications', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const validBody = {
  studentId: 'student-1',
  university: 'Tsinghua University',
  program: 'Computer Science',
  programSlug: 'computer-science',
  degree: 'Bachelor',
  intake: '2026 Fall',
};

function terminal(result: { data: unknown; error: unknown }) {
  const api: Record<string, unknown> = {};
  const pass = () => api;
  for (const method of ['select', 'eq', 'is', 'not', 'limit', 'order']) api[method] = pass;
  api.maybeSingle = async () => result;
  api.single = async () => result;
  return api;
}

function client(opts: {
  student?: Record<string, unknown> | null;
  duplicate?: Record<string, unknown> | null;
  inserted?: Record<string, unknown>;
}) {
  const inserted: { row?: Record<string, unknown> } = {};
  return {
    inserted,
    from(table: string) {
      if (table === 'partner_students') {
        return { select: () => terminal({ data: opts.student ?? null, error: null }) };
      }
      return {
        select: () => terminal({ data: opts.duplicate ?? null, error: null }),
        insert: (row: Record<string, unknown>) => {
          inserted.row = row;
          return terminal({
            data: opts.inserted ?? { ...row, id: 'app-new' },
            error: null,
          });
        },
      };
    },
    rpc: async () => ({ data: 'PA-2026-0007', error: null }),
  };
}

const student = {
  id: 'student-1',
  partner_id: 'partner-1',
  student_name: 'Amina Ali',
  student_email: 'amina@example.test',
  student_phone: '123',
  nationality: 'Ghana',
  linked_student_profile_id: 'profile-1',
  archived_at: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockGetServerEnv.mockReturnValue({ serviceKey: 'test-key' });
  mockRequireAdmin.mockResolvedValue({ ok: true, user: { id: 'admin-1' } });
});

describe('POST /api/admin/partner-applications', () => {
  it('creates a second application for the same student without copying notes', async () => {
    const db = client({ student });
    mockBuildServiceClient.mockReturnValue(db);
    const res = await POST(request(validBody));
    expect(res.status).toBe(201);
    expect(db.inserted.row).toMatchObject({
      partner_id: 'partner-1',
      student_id: 'student-1',
      student_name: 'Amina Ali',
      student_email: 'amina@example.test',
      nationality: 'Ghana',
      linked_student_profile_id: 'profile-1',
      university: 'Tsinghua University',
      program: 'Computer Science',
      program_slug: 'computer-science',
      degree: 'Bachelor',
      intake: '2026 Fall',
      status: 'Draft',
      decision: 'Pending',
      source: 'admin_manual',
      application_number: 'PA-2026-0007',
      created_by_user_id: 'admin-1',
    });
    expect(db.inserted.row).not.toHaveProperty('notes');
  });

  it('refuses the same open university, program, and intake', async () => {
    mockBuildServiceClient.mockReturnValue(client({
      student,
      duplicate: { id: 'app-old', application_number: 'PA-2026-0001', status: 'In Review' },
    }));
    const res = await POST(request(validBody));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.code).toBe('DUPLICATE_APPLICATION');
    expect(body.existingId).toBe('app-old');
  });

  it('returns 404 when the partner student does not exist', async () => {
    mockBuildServiceClient.mockReturnValue(client({ student: null }));
    const res = await POST(request(validBody));
    expect(res.status).toBe(404);
  });

  it('returns 400 when the program fields are missing', async () => {
    const res = await POST(request({ studentId: 'student-1' }));
    expect(res.status).toBe(400);
    expect(mockBuildServiceClient).not.toHaveBeenCalled();
  });
});

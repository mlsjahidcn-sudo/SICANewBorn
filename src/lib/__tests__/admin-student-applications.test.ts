import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const mocks = vi.hoisted(() => ({ auth: vi.fn(), env: vi.fn(), service: vi.fn() }));
vi.mock('@/lib/supabase-auth', () => ({ requireAdmin: mocks.auth, getServerEnv: mocks.env, buildServiceClient: mocks.service }));
import { GET } from '@/app/api/admin/students/[id]/applications/route';

function fixtureClient(failure = false): { from: ReturnType<typeof vi.fn>; partnerArchived: ReturnType<typeof vi.fn> } {
  const partnerArchived = vi.fn();
  const from = vi.fn((table: string) => {
    const query = { select: vi.fn(), eq: vi.fn(), is: partnerArchived, order: vi.fn(), maybeSingle: vi.fn() };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    partnerArchived.mockReturnValue(query);
    query.maybeSingle.mockResolvedValue({ data: { id: 's1', first_name: 'Amina', last_name: 'Ali' }, error: null });
    query.order.mockResolvedValue({ data: table === 'student_applications' ? [{
      id: 'direct', university_name: 'Direct University', program_name: 'Medicine',
      degree: 'Bachelor', intake: '2027 Fall', application_number: 'SA-1', created_at: '2026-10-01', status: 'Submitted',
    }] : [{ id: 'partner', university: 'Partner University', program: 'Physics',
      degree: 'Master', intake: '2027 Spring', application_number: 'PA-1', created_at: '2026-10-02', status: 'In Review',
    }], error: failure && table === 'partner_applications' ? { message: 'DB unavailable' } : null });
    return query;
  });
  return { from, partnerArchived };
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue({ ok: true });
  mocks.env.mockReturnValue({ serviceKey: 'service' });
});
describe('admin student applications tab response', () => {
  it('normalizes both database surfaces to the display fields and sorts together', async () => {
    const client = fixtureClient();
    mocks.service.mockReturnValue(client);
    const response = await GET(new NextRequest('http://localhost'), { params: Promise.resolve({ id: 's1' }) });
    expect(response.status).toBe(200);
    expect((await response.json()).applications).toEqual([
      { id: 'partner', university: 'Partner University', program: 'Physics', degree: 'Master', intake: '2027 Spring', applicationNumber: 'PA-1', createdAt: '2026-10-02', status: 'In Review', surface: 'partner', studentName: 'Amina Ali' },
      { id: 'direct', university: 'Direct University', program: 'Medicine', degree: 'Bachelor', intake: '2027 Fall', applicationNumber: 'SA-1', createdAt: '2026-10-01', status: 'Submitted', surface: 'student', studentName: 'Amina Ali' },
    ]);
    expect(client.partnerArchived).toHaveBeenCalledWith('archived_at', null);
  });
  it('returns a failure when either surface fails instead of an incomplete list', async () => {
    mocks.service.mockReturnValue(fixtureClient(true));
    const response = await GET(new NextRequest('http://localhost'), { params: Promise.resolve({ id: 's1' }) });
    expect(response.status).toBe(500);
  });
});

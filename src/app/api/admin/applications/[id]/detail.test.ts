import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ service: vi.fn(), auth: vi.fn() }));
vi.mock('@/lib/supabase-auth', () => ({ buildServiceClient: mocks.service, requireAdmin: mocks.auth, getServerEnv: () => ({ serviceKey: 'fixture' }) }));
vi.mock('@/lib/email', () => ({ notifyApplicantOnStatusChange: vi.fn() }));
import { GET } from './route';

beforeEach(() => { vi.clearAllMocks(); mocks.auth.mockResolvedValue({ ok: true, user: { id: 'admin-1' } }); });
function service(fees: { data: unknown[] | null; error: { message: string } | null }): { from: ReturnType<typeof vi.fn> } {
  return { from: vi.fn((table: string) => {
    if (table === 'student_fees') return { select: () => ({ eq: async () => fees }) };
    const result = table === 'student_applications'
      ? { id: 'a1', student_id: null, applicant_name: 'Amina', applicant_email: 'amina@example.test', status: 'Submitted', university_name: 'University', program_name: 'Medicine', created_at: '2026-10-23', archived_at: '2026-10-23' }
      : { content: 'Private note' };
    return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: result, error: null }) }) }) };
  }) };
}
const request = (): NextRequest => new NextRequest('http://localhost/api/admin/applications/a1');
const context = { params: Promise.resolve({ id: 'a1' }) };
describe('admin application detail data reliability', () => {
  it('keeps payment failure distinct from a successful zero-fee result', async () => {
    mocks.service.mockReturnValue(service({ data: null, error: { message: 'Database unavailable' } }));
    const response = await GET(request(), context);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ payment: null, paymentError: 'Payment summary could not be loaded', application: { id: 'a1', archivedAt: '2026-10-23', internalNotes: 'Private note' } });
  });
  it('returns a known no-fee state only after a successful database read', async () => {
    mocks.service.mockReturnValue(service({ data: [], error: null }));
    const body = await (await GET(request(), context)).json();
    expect(body.payment).toMatchObject({ status: 'none', feeCount: 0 });
    expect(body.paymentError).toBeNull();
  });
  it('authenticates before reading application, notes or payment data', async () => {
    mocks.auth.mockResolvedValue({ ok: false, status: 403, error: 'Admin required' });
    expect((await GET(request(), context)).status).toBe(403);
    expect(mocks.service).not.toHaveBeenCalled();
  });
});

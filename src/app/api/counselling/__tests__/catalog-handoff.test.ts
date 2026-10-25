import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import type { CatalogSelection } from '@/lib/catalog-selection';

const mocks = vi.hoisted(() => ({ insert: vi.fn(), select: vi.fn(), single: vi.fn(), resolve: vi.fn(), mail: vi.fn(), drip: vi.fn() }));
vi.mock('@/lib/supabase-server', () => ({
  isSupabaseServerConfigured: () => true,
  getSupabaseServer: () => ({ from: () => ({ insert: mocks.insert }) }),
}));
vi.mock('@/lib/rate-limit', () => ({ checkPublicRateLimit: () => ({ blocked: false }), isHoneypotFilled: () => false }));
vi.mock('@/lib/catalog-selection-server', () => ({
  resolveCatalogSelection: mocks.resolve,
  CatalogSelectionError: class extends Error { constructor(message: string, public status: number = 400) { super(message); } },
}));
vi.mock('@/lib/counselling/occupancy', () => ({ fetchOccupiedSlotInstants: async () => new Set() }));
vi.mock('@/lib/counselling-slots', () => ({ beijingTodayStr: () => '2026-10-25', formatBeijingLabel: () => '09:00', isCandidateSlot: () => true, isCounsellingEducationLevel: () => true, isSlotWithinLeadWindow: () => true, parseSlotInstant: (value: string) => new Date(value) }));
vi.mock('@/lib/email', () => ({ sendCounsellingAdminNotification: mocks.mail, sendCounsellingConfirmation: mocks.mail, sendAssessmentNotification: mocks.mail }));
vi.mock('@/lib/email/drip/scheduler', () => ({ scheduleDripSequence: mocks.drip }));
vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => undefined }), headers: async () => ({ get: () => null }) }));

import { POST as book } from '@/app/api/counselling/bookings/route';
import { POST as assess } from '@/app/api/assessments/route';
import { CatalogSelectionError } from '@/lib/catalog-selection-server';

const selection: CatalogSelection = { universitySlug: 'example-university', universityName: 'Example University', universityNameCn: '示例大学', programSlug: 'computer-science', programName: 'Computer Science', sourcePath: '/programs/computer-science' };
const request = (body: Record<string, unknown>): NextRequest => new NextRequest('https://sica.test/api', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

beforeEach(() => {
  vi.clearAllMocks();
  mocks.resolve.mockResolvedValue(selection);
  mocks.insert.mockReturnValue({ select: mocks.select });
  mocks.select.mockReturnValue({ single: mocks.single });
  mocks.single.mockResolvedValue({ data: { id: 'example', reference: 'CS-TEST', created_at: '2026-10-25T00:00:00Z' }, error: null });
  mocks.mail.mockResolvedValue(true);
  mocks.drip.mockResolvedValue(undefined);
});

describe('catalog context reaches existing staff-visible storage', () => {
  it('keeps canonical selection, user topic and UTM attribution in a booking and returns the selection for confirmation', async () => {
    const response = await book(request({ name: 'Test Student', email: 'student@example.test', phone: '+123456789', slotStart: '2026-10-26T01:00:00Z', university: 'example-university', program: 'computer-science', topic: 'Funding question', sourcePage: '/forged', utmSource: 'catalog' }));
    expect(response.status).toBe(201);
    expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ source_page: '/programs/computer-science', topic: 'Computer Science — Example University\nFunding question', utm_source: 'catalog' }));
    expect((await response.json()).booking.selection).toEqual(selection);
    expect(mocks.mail).toHaveBeenCalledWith(expect.objectContaining({ topic: 'Computer Science — Example University\nFunding question' }));
  });
  it('saves the canonical path and selected entry beside assessment notes and retains user preferences', async () => {
    const response = await assess(request({ firstName: 'Test', lastName: 'Student', email: 'student@example.test', whatsapp: '+123456789', country: 'Example', program: 'computer-science', university: 'example-university', notes: 'My question', intendedMajor: 'Computer Science', targetUniversities: 'Example University', utmCampaign: 'intake' }));
    expect(response.status).toBe(200);
    expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ source_page: selection.sourcePath, notes: expect.stringContaining('Computer Science — Example University (/programs/computer-science)'), intended_major: 'Computer Science', target_universities: 'Example University', utm_campaign: 'intake' }));
    expect((await response.json()).selection).toEqual(selection);
  });
  it.each([book, assess])('rejects mismatched selection before creating a record or sending email', async (handler) => {
    mocks.resolve.mockRejectedValue(new CatalogSelectionError('Mismatched selection'));
    const response = await handler(request({ firstName: 'Test', lastName: 'Student', name: 'Test Student', email: 'student@example.test', phone: '+123456789', whatsapp: '+123456789', country: 'Example', slotStart: '2026-10-26T01:00:00Z', program: 'computer-science', university: 'wrong' }));
    expect(response.status).toBe(400);
    expect(mocks.insert).not.toHaveBeenCalled();
    expect(mocks.mail).not.toHaveBeenCalled();
  });
});

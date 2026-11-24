import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  useParams: () => ({ id: '28672008-fabb-41d0-bcb0-cffa4e2da63a' }),
  usePathname: () => '/admin/partner-students/28672008-fabb-41d0-bcb0-cffa4e2da63a',
  useSearchParams: () => new URLSearchParams(),
}));

const api = vi.fn();
vi.mock('@/lib/api-client', () => ({ apiFetchJson: (...args: unknown[]) => api(...args) }));

import AdminPartnerStudentDetailPage from '@/app/admin/partner-students/[id]/page';
import { I18nProvider } from '@/lib/i18n';

afterEach(() => { cleanup(); api.mockReset(); });

const student = {
  id: '28672008-fabb-41d0-bcb0-cffa4e2da63a',
  partnerId: 'partner',
  studentName: 'Test Student',
  studentEmail: 'student@example.test',
  studentPhone: null,
  nationality: 'Bangladesh',
  targetUniversity: null,
  targetProgram: null,
  status: 'New',
  notes: null,
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-02T00:00:00.000Z',
  createdByUserId: null,
  createdByEmail: null,
  archivedAt: null,
  archivedByUserId: null,
  applicationCount: 0,
  linkedStudentProfileId: null,
  partnerName: 'Example Agency',
  documentCount: 0,
};

describe('admin partner student detail', () => {
  it('renders the loaded student instead of the error boundary', async () => {
    api.mockImplementation(async (url: string) => {
      if (String(url).includes('/applications')) return { applications: [] };
      if (String(url).includes('/documents')) return { documents: [] };
      if (String(url).includes('/notes')) return { notes: [] };
      return { student };
    });
    render(
      <I18nProvider>
        <AdminPartnerStudentDetailPage />
      </I18nProvider>,
    );
    expect(await screen.findByRole('heading', { name: 'Test Student' })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText(/Something went wrong/)).not.toBeInTheDocument();
    });
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { translations } from '@/lib/i18n-translations';

/**
 * The partner application detail page is the surface a partner agency
 * lives in. These tests cover the structural contract the Phase 177
 * restructure introduced:
 *
 *   - the four panes, with the active one bound to `?tab=`
 *   - a bogus `?tab=` value falling back to Overview instead of an
 *     empty pane
 *   - the linked-documents fetch being LAZY (it used to fire 100 rows
 *     on mount even when the partner never opened the card)
 *   - the admin document-request log being visible, with derived
 *     "documents uploaded since this request" evidence
 */

const mocks = vi.hoisted(() => ({
  api: vi.fn(),
  apiJson: vi.fn(),
  locale: { value: 'en' as 'en' | 'zh' },
  params: { id: 'app-1' },
  search: { value: '' },
  push: vi.fn(),
}));

vi.mock('@/lib/api-client', () => ({
  apiFetch: mocks.api,
  apiFetchJson: mocks.apiJson,
  ApiError: class extends Error {},
}));

vi.mock('@/lib/i18n', () => {
  const t = (key: string, params?: Record<string, string | number>): string => {
    let value = translations[mocks.locale.value][key] ?? key;
    for (const [name, replacement] of Object.entries(params ?? {})) {
      value = value.replaceAll(`{{${name}}}`, String(replacement));
    }
    return value;
  };
  return { useI18n: () => ({ t, locale: mocks.locale.value, setLocale: vi.fn() }) };
});

vi.mock('@/lib/analytics', () => ({ track: vi.fn(), trackServer: vi.fn() }));

vi.mock('next/navigation', () => ({
  useParams: () => mocks.params,
  useRouter: () => ({ push: mocks.push, replace: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(mocks.search.value),
}));

import PartnerApplicationDetailPage from '@/app/partner/applications/[id]/page';

const en = translations.en;

function application(overrides: Record<string, unknown> = {}) {
  return {
    id: 'app-1',
    partnerId: 'partner-1',
    studentId: 'student-1',
    studentName: 'Amara Diallo',
    studentEmail: 'amara@example.com',
    studentPhone: '+221770000000',
    university: 'Tsinghua University',
    program: 'Computer Science',
    programSlug: 'tsinghua-university-computer-science',
    intake: '2027 Fall',
    degree: 'Bachelor',
    nationality: 'Senegal',
    priority: 'Normal',
    applicationNumber: 'PA-2026-0042',
    status: 'In Review',
    decision: 'Pending',
    notes: '',
    source: 'partner_portal',
    documentsRequested: [],
    createdAt: '2026-10-01T09:00:00Z',
    updatedAt: '2026-10-02T09:00:00Z',
    ...overrides,
  };
}

function fixtures(appOverrides: Record<string, unknown> = {}): void {
  mocks.apiJson.mockImplementation(async (url: string) => {
    if (url === '/api/partner/applications/app-1') {
      return { application: application(appOverrides) };
    }
    if (url === '/api/partner/applications/app-1/reviewer') {
      return { reviewer: { email: 'admin@sica.com.cn', at: '2026-10-20T09:00:00Z' } };
    }
    if (url === '/api/partner/applications/app-1/timeline') {
      return { timeline: [] };
    }
    if (url.startsWith('/api/partner/documents?')) {
      return {
        documents: [
          {
            id: 'doc-1',
            name: 'Passport scan',
            category: 'Identity',
            status: 'Pending',
            fileSize: 2048,
            uploadedAt: '2026-10-20T12:00:00Z',
            rejectionReason: null,
          },
        ],
        total: 1,
      };
    }
    throw new Error(`Unexpected request: ${url}`);
  });
}

function documentsTabName(count: number): string {
  return en['partnerAppDetail.tabDocumentsOpen'].replace('{{count}}', String(count));
}

function documentsFetchCount(): number {
  return mocks.apiJson.mock.calls.filter(([url]) =>
    String(url).startsWith('/api/partner/documents?'),
  ).length;
}

beforeEach(() => {
  mocks.api.mockReset();
  mocks.apiJson.mockReset();
  mocks.locale.value = 'en';
  mocks.params.id = 'app-1';
  mocks.search.value = '';
});

describe('partner application detail — tab shell', () => {
  it('opens on the Overview pane and keeps the other panes unmounted', async () => {
    fixtures();
    render(<PartnerApplicationDetailPage />);

    const overview = await screen.findByRole('tab', { name: en['partnerAppDetail.tabOverview'] });
    expect(overview).toHaveAttribute('data-state', 'active');
    expect(screen.getByRole('tab', { name: en['partnerAppDetail.tabFile'] })).toHaveAttribute(
      'data-state',
      'inactive',
    );

    // The linked-student card lives on Overview.
    expect(
      screen.getByText(en['partnerAppDetail.sectionLinkedStudent']),
    ).toBeInTheDocument();
    // The student-file pane is NOT rendered yet.
    expect(
      screen.queryByText(en['partnerAppDetail.sectionPassport']),
    ).not.toBeInTheDocument();
  });

  it('does not fetch the linked documents until the Documents pane is opened', async () => {
    fixtures();
    render(<PartnerApplicationDetailPage />);

    await screen.findByRole('tab', { name: en['partnerAppDetail.tabOverview'] });
    expect(documentsFetchCount()).toBe(0);

    const user = userEvent.setup();
    await user.click(screen.getByRole('tab', { name: en['partnerAppDetail.tabDocuments'] }));

    await waitFor(() => expect(documentsFetchCount()).toBe(1));
    expect(await screen.findByText('Passport scan')).toBeInTheDocument();
  });

  it('switches to the Student file pane and shows every section, even the empty ones', async () => {
    fixtures();
    render(<PartnerApplicationDetailPage />);

    const user = userEvent.setup();
    await user.click(
      await screen.findByRole('tab', { name: en['partnerAppDetail.tabFile'] }),
    );

    // Every file section renders — none of them vanish when empty.
    expect(screen.getByText(en['partnerAppDetail.sectionIdentityAddress'])).toBeInTheDocument();
    expect(screen.getByText(en['partnerAppDetail.sectionPassport'])).toBeInTheDocument();
    expect(screen.getByText(en['partnerAppDetail.sectionEmergencyContact'])).toBeInTheDocument();
    expect(screen.getByText(en['partnerAppDetail.sectionAcademic'])).toBeInTheDocument();
    expect(screen.getByText(en['partnerAppDetail.sectionLanguage'])).toBeInTheDocument();
    expect(screen.getByText(en['partnerAppDetail.sectionContext'])).toBeInTheDocument();

    // Empty values read "Not recorded", not a bare em dash.
    expect(screen.getAllByText(en['partnerAppDetail.notRecorded']).length).toBeGreaterThan(0);
  });

  it('falls back to Overview when the tab query parameter is unknown', async () => {
    fixtures();
    mocks.search.value = 'tab=bogus';
    render(<PartnerApplicationDetailPage />);

    const overview = await screen.findByRole('tab', { name: en['partnerAppDetail.tabOverview'] });
    expect(overview).toHaveAttribute('data-state', 'active');
    expect(documentsFetchCount()).toBe(0);
  });
});

describe('partner application detail — document requests', () => {
  const request = {
    id: 'req-1',
    categories: ['passport' as const],
    message: 'Please upload a colour passport scan.',
    requested_at: '2026-10-15T00:00:00Z',
    requested_by: '11111111-2222-3333-4444-555555555555',
    fulfilled_at: null,
    fulfilled_by: null,
  };

  it('surfaces the admin document request with its categories and message', async () => {
    fixtures({ documentsRequested: [request] });
    render(<PartnerApplicationDetailPage />);

    const user = userEvent.setup();
    await user.click(
      await screen.findByRole('tab', { name: documentsTabName(1) }),
    );

    expect(await screen.findByText(en['partnerAppDetail.sectionRequestedDocuments'])).toBeInTheDocument();
    expect(screen.getByText(en['partnerAppDetail.requestCategoryPassport'])).toBeInTheDocument();
    expect(screen.getByText('Please upload a colour passport scan.')).toBeInTheDocument();
  });

  it('derives the uploaded-document evidence from the documents already linked', async () => {
    fixtures({ documentsRequested: [request] });
    render(<PartnerApplicationDetailPage />);

    const user = userEvent.setup();
    await user.click(
      await screen.findByRole('tab', { name: documentsTabName(1) }),
    );

    // The fixture links one Identity document uploaded AFTER the request.
    expect(
      await screen.findByText(en['partnerAppDetail.uploadedSinceRequestOne']),
    ).toBeInTheDocument();
  });

  it('says so when SICA has not asked for anything', async () => {
    fixtures({ documentsRequested: [] });
    render(<PartnerApplicationDetailPage />);

    const user = userEvent.setup();
    await user.click(
      await screen.findByRole('tab', { name: en['partnerAppDetail.tabDocuments'] }),
    );

    expect(await screen.findByText(en['partnerAppDetail.openRequestsNone'])).toBeInTheDocument();
  });
});

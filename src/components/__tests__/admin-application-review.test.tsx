import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ api: vi.fn(), raw: vi.fn(), push: vi.fn(), replace: vi.fn(), search: new URLSearchParams() }));
vi.mock('@/lib/api-client', () => ({ apiFetchJson: mocks.api, apiFetch: mocks.raw }));
vi.mock('@/components/admin/remote-search-select', () => ({ RemoteSearchSelect: () => null }));
vi.mock('next/navigation', () => ({ useParams: () => ({ id: 'a1' }), useRouter: () => ({ push: mocks.push, replace: mocks.replace }), useSearchParams: () => mocks.search }));
vi.mock('@/lib/i18n', async () => {
  const { translations } = await import('@/lib/i18n-translations');
  const t = (key: string): string => translations.en[key] || key;
  return { useI18n: () => ({ t, locale: 'en' }) };
});
vi.mock('@/app/admin/applications/_components/documents-tab', () => ({ DocumentsTab: () => <div>Application documents</div> }));
vi.mock('@/app/admin/applications/_components/enrollment-card', () => ({ EnrollmentCard: () => <button>Record enrollment</button> }));
import DetailPage from '@/app/admin/applications/[id]/page';
import { NotesTab } from '@/app/admin/applications/_components/notes-tab';
import { TimelineTab } from '@/app/admin/applications/_components/timeline-tab';

const application = {
  id: 'a1', studentId: 'student-1', studentName: 'Amina Ali', studentEmail: 'amina@example.test',
  university: 'Tsinghua University', program: 'Medicine', degree: 'Bachelor', intake: '2027 Fall',
  status: 'Submitted', source: 'Online', applicationNumber: 'APP-2026-001', createdAt: '2026-10-23T08:00:00Z',
  updatedAt: '2026-10-23T08:00:00Z', adminNotes: 'Please upload your transcript', internalNotes: 'Private team draft', additionalNotes: '',
};
const detail = { application, payment: { status: 'none', feeCount: 0, totalByCurrency: {}, paidByCurrency: {}, outstandingByCurrency: {} } };
beforeEach(() => {
  vi.clearAllMocks(); mocks.search = new URLSearchParams();
  mocks.api.mockImplementation(async (url: string) => url.endsWith('/enrollment') ? { enrollment: null } : detail);
});

describe('admin application review workflow', () => {
  it('keeps the status and note draft unchanged when a status request is rejected', async () => {
    mocks.api.mockImplementation(async (url: string, init?: RequestInit) => {
      if (init?.method === 'PATCH') throw new Error('Permission denied');
      return url.endsWith('/enrollment') ? { enrollment: null } : detail;
    });
    render(<DetailPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Start review' }));
    const dialog = await screen.findByRole('dialog', { name: 'Confirm status change' });
    fireEvent.change(within(dialog).getByLabelText('Team note (optional, internal)'), { target: { value: 'Check original transcript' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirm status change' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Permission denied');
    expect(within(dialog).getByLabelText('Team note (optional, internal)')).toHaveValue('Check original transcript');
    expect(within(screen.getByRole('banner', { hidden: true })).getByText('Submitted')).toBeInTheDocument();
    expect(screen.queryByText('Status updated.')).not.toBeInTheDocument();
    expect(mocks.raw).not.toHaveBeenCalled();
  });
  it('separates the team note from the applicant email and updates only after success', async () => {
    let status = 'Submitted';
    mocks.api.mockImplementation(async (url: string, init?: RequestInit) => {
      if (init?.method === 'PATCH') { status = 'Under Review'; return { application: { ...application, status } }; }
      return url.endsWith('/enrollment') ? { enrollment: null } : { ...detail, application: { ...application, status } };
    });
    render(<DetailPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Start review' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Team note (optional, internal)'), { target: { value: 'Internal verification' } });
    fireEvent.change(within(dialog).getByLabelText('Message included in the email (optional)'), { target: { value: 'We have started reviewing your documents.' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirm status change' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    const call = mocks.api.mock.calls.find(([, init]: unknown[]) => (init as RequestInit | undefined)?.method === 'PATCH');
    expect(JSON.parse(String((call?.[1] as RequestInit).body))).toEqual({ status: 'Under Review', notify_applicant: true, notes: 'Internal verification', applicant_note: 'We have started reviewing your documents.', internal: true });
    expect(within(screen.getByRole('banner')).getByText('Under Review')).toBeInTheDocument();
  });
  it('shows unknown payments and failed enrollment reads instead of empty records', async () => {
    mocks.api.mockImplementation(async (url: string) => {
      if (url.endsWith('/enrollment')) throw new Error('Enrollment read failed');
      return { application: { ...application, status: 'Accepted' }, payment: null, paymentError: 'Fee lookup failed' };
    });
    render(<DetailPage />);
    expect(await screen.findByText('Payment summary unavailable')).toBeInTheDocument();
    expect(screen.getByText('Enrollment record unavailable')).toBeInTheDocument();
    expect(screen.queryByText('No fees linked to this application.')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Record enrollment' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Retry' }).length).toBeGreaterThanOrEqual(2);
  });
  it('preserves an internal-note draft when switching tabs', async () => {
    const user = userEvent.setup();
    render(<DetailPage />);
    await screen.findByRole('heading', { name: 'Amina Ali' });
    await user.click(screen.getByRole('tab', { name: /Notes/ }));
    const note = await screen.findByLabelText('Internal team notes');
    fireEvent.change(note, { target: { value: 'Unsaved case review' } });
    await user.click(screen.getByRole('tab', { name: 'Overview' }));
    await user.click(screen.getByRole('tab', { name: /Notes/ }));
    expect(screen.getByLabelText('Internal team notes')).toHaveValue('Unsaved case review');
  });
  it('returns to the validated list context and carries it through edit', async () => {
    const returnTo = '/admin/applications?search=Amina&page=3&expanded=student%3As1';
    mocks.search = new URLSearchParams({ returnTo });
    render(<DetailPage />);
    await screen.findByRole('heading', { name: 'Amina Ali' });
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(mocks.push).toHaveBeenCalledWith(`/admin/applications/a1/edit?${new URLSearchParams({ returnTo })}`);
    fireEvent.click(screen.getByRole('button', { name: 'Back to applications' }));
    expect(mocks.push).toHaveBeenCalledWith(returnTo);
  });
});

describe('admin application tab reliability', () => {
  it('does not expose an editable empty notes form after a failed load', async () => {
    mocks.api.mockRejectedValueOnce(new Error('Notes unavailable')).mockResolvedValue(detail);
    render(<NotesTab applicationId="a1" />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Notes unavailable');
    expect(screen.queryByRole('button', { name: 'Save Notes' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByLabelText('Internal team notes')).toHaveValue('Private team draft');
  });
  it('renders API-normalized stage history without losing status, actor or timestamp', async () => {
    mocks.api.mockResolvedValue({ stageHistory: [{ id: 'stage-1', applicationId: 'a1', fromStatus: 'Submitted', toStatus: 'Under Review', actorId: 'admin-1', actorEmail: 'advisor@example.test', actorRole: 'admin', note: '[internal] Check transcript', createdAt: '2026-10-23T08:00:00Z' }], timelineNotes: [] });
    render(<TimelineTab applicationId="a1" />);
    expect(await screen.findByText(/Submitted/)).toBeInTheDocument();
    expect(screen.getByText(/Under Review/)).toBeInTheDocument();
    expect(screen.getByText('advisor@example.test')).toBeInTheDocument();
    expect(screen.queryByText('Invalid Date')).not.toBeInTheDocument();
  });
});

import ApplicationsPage from '@/app/admin/applications/page';

describe('admin application list context and confirmations', () => {
  it('restores page three and every active control without resetting to page one', async () => {
    window.history.replaceState({}, '', '/');
    mocks.search = new URLSearchParams('source=Online&page=3&search=Amina&status=Submitted&view=flat&expanded=student%3Astudent-1');
    mocks.api.mockImplementation(async (url: string) => url.includes('/counts')
      ? { total: 60, online: 60, partner: 0, partnerCrm: 0, offline: 0 }
      : { applications: [{ ...application, surface: 'student' }], total: 60, page: 3 });
    render(<ApplicationsPage />);
    await screen.findByText('Amina Ali');
    expect(screen.getByRole('textbox', { name: 'Search applications' })).toHaveValue('Amina');
    expect(screen.getByRole('button', { name: 'Flat' })).toHaveAttribute('aria-pressed', 'true');
    const calls = mocks.api.mock.calls.filter(([url]: unknown[]) => typeof url === 'string' && !url.includes('/counts'));
    expect(calls.every(([url]: unknown[]) => new URL(String(url), 'https://example.test').searchParams.get('page') === '3')).toBe(true);
    const href = Array.from(document.querySelectorAll('a')).find(link => link.href.includes('/admin/applications/a1?'))?.href;
    const back = new URL(String(href)).searchParams.get('returnTo');
    expect(back).toContain('page=3'); expect(back).toContain('expanded=student%3Astudent-1');
    fireEvent.click(screen.getByRole('button', { name: 'Clear status filter' }));
    await waitFor(() => expect(new URL(window.location.href).searchParams.has('status')).toBe(false));
  });
  it('confirms a partner status change before writing and uses its native status vocabulary', async () => {
    let saved = false;
    mocks.api.mockImplementation(async (url: string, init?: RequestInit) => {
      if (init?.method === 'PATCH') { saved = true; return {}; }
      if (url.includes('/counts')) return {};
      if (saved) throw new Error('List refresh unavailable');
      return { applications: [{ ...application, id: 'p1', studentId: null, partnerStudentId: 'ps1', surface: 'partner', source: 'Partner CRM', status: 'Draft' }], total: 1 };
    });
    render(<ApplicationsPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Expand partner for Amina Ali' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Status for Tsinghua University — Medicine' }), { target: { value: 'In Review' } });
    const dialog = await screen.findByRole('dialog', { name: 'Confirm status change' });
    expect(mocks.api.mock.calls.some(([, init]: unknown[]) => (init as RequestInit | undefined)?.method === 'PATCH')).toBe(false);
    expect(within(dialog).queryByRole('checkbox')).not.toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirm status change' }));
    await waitFor(() => expect(mocks.api).toHaveBeenCalledWith('/api/admin/partner-applications/p1', expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ status: 'In Review' }) })));
    expect(await screen.findByRole('alert')).toHaveTextContent('List refresh unavailable');
    expect(screen.getByRole('combobox', { name: 'Status for Tsinghua University — Medicine' })).toHaveValue('In Review');
  });
});

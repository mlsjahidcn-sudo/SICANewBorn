import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
const mocks = vi.hoisted(() => ({ api: vi.fn(), raw: vi.fn() }));
vi.mock('@/lib/api-client', () => ({ apiFetchJson: mocks.api, apiFetch: mocks.raw }));
vi.mock('@/components/admin/remote-search-select', () => ({ RemoteSearchSelect: () => null }));
vi.mock('@/lib/i18n', () => {
  const t = (key: string): string => key;
  return { useI18n: () => ({ t }) };
});
// Keep menu choices visible so these tests focus on the page's delete transaction.
vi.mock('@/components/ui/dropdown-menu', () => {
  const Wrapper = ({ children }: { children: ReactNode }): ReactNode => <div>{children}</div>;
  return { DropdownMenu: Wrapper, DropdownMenuContent: Wrapper, DropdownMenuTrigger: Wrapper,
    DropdownMenuItem: ({ children, onClick }: { children: ReactNode; onClick?: () => void }): ReactNode => <div onClick={onClick}>{children}</div> };
});
import ApplicationsPage from '@/app/admin/applications/page';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.api.mockImplementation(async (url: string) => {
    if (url.endsWith('/counts')) return { total: 1, online: 1, partner: 0, partnerCrm: 0, offline: 0, submitted: 1, inReview: 0, urgent: 0, byStatus: {}, byPriority: {}, perStatusCapped: false };
    return { applications: [{ id: 'a1', studentName: 'Amina', studentEmail: 'amina@example.test', university: 'University', program: 'Medicine', degree: 'Bachelor', intake: '2027 Fall', status: 'Submitted', source: 'Online', surface: 'student', createdAt: '2026-10-21' }], total: 21, page: 1, totalPages: 2 };
  });
});
async function openDelete(): Promise<HTMLElement> {
  render(<ApplicationsPage />);
  await screen.findByText('Amina');
  fireEvent.click(screen.getByRole('button', { name: 'Flat' }));
  await screen.findByText('Delete application', { exact: true });
  fireEvent.click(screen.getByText('Delete application', { exact: true }));
  return screen.findByRole('dialog');
}
describe('admin application delete', () => {
  it.each([
    [403, { error: 'Permission denied' }, 'Permission denied'],
    [500, null, 'Failed to delete application'],
  ])('retains the row and shows an actionable error for HTTP %s', async (status, body, message) => {
    mocks.raw.mockResolvedValue(new Response(body ? JSON.stringify(body) : 'not json', { status }));
    const dialog = await openDelete();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete application' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(message);
    expect(mocks.raw).toHaveBeenCalledWith('/api/admin/applications/a1', { method: 'DELETE' });
    expect(screen.getAllByText('Amina')).toHaveLength(2);
    expect(screen.getByText('Showing 1-20 of 21')).toBeInTheDocument();
  });
  it('removes the row only after a successful response, including HTTP 204', async () => {
    mocks.raw.mockImplementation(async () => {
      mocks.api.mockResolvedValue({ applications: [], total: 0, totalPages: 1 });
      return new Response(null, { status: 204 });
    });
    const dialog = await openDelete();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete application' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.queryByText('Amina')).not.toBeInTheDocument();
  });
  it('deletes one partner application without removing its student sibling with the same ID', async () => {
    const base = { id: 'shared', studentId: 'person', studentName: 'Amina', studentEmail: 'amina@example.test', program: 'Medicine', degree: 'Bachelor', intake: '2027 Fall', status: 'Draft', createdAt: '2026-10-23' };
    let rows = [
      { ...base, university: 'Student University', surface: 'student', source: 'Online' },
      { ...base, university: 'Partner University', surface: 'partner', source: 'Partner CRM' },
    ];
    mocks.api.mockImplementation(async () => ({ applications: rows, total: 1, totalPages: 1 }));
    mocks.raw.mockImplementation(async () => {
      rows = rows.filter(row => row.surface !== 'partner');
      return new Response(null, { status: 204 });
    });
    render(<ApplicationsPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Expand student for Amina' }));
    const deletePartner = (): HTMLElement => screen.getByRole('button', { name: /Delete application.*Partner University/ });
    fireEvent.click(deletePartner());
    let dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/You can restore it later/)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(mocks.raw).not.toHaveBeenCalled();
    fireEvent.click(deletePartner());
    dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete application' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(mocks.raw).toHaveBeenCalledWith('/api/admin/partner-applications/shared', { method: 'DELETE' });
    expect(await screen.findByRole('button', { name: 'Student University' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Partner University' })).not.toBeInTheDocument();
    expect(screen.getByText('1 group · 1 of 1 application grouped')).toBeInTheDocument();
  });
  it('returns to the previous valid page after deleting the last group on page two', async () => {
    let deleted = false;
    mocks.api.mockImplementation(async (url: string) => {
      if (url.includes('/counts')) return {};
      const pageTwo = new URL(url, 'http://localhost').searchParams.get('page') === '2';
      return {
        applications: [{ id: pageTwo ? 'last' : 'first', studentId: pageTwo ? 'last-person' : 'first-person', studentName: pageTwo ? 'Last Student' : 'First Student', university: 'University', program: 'Medicine', degree: 'Bachelor', intake: '2027 Fall', status: 'Draft', surface: 'student', source: 'Online', createdAt: '2026-10-23' }],
        total: deleted ? 20 : 21, totalPages: deleted ? 1 : 2,
      };
    });
    mocks.raw.mockImplementation(async () => { deleted = true; return new Response(null, { status: 204 }); });
    render(<ApplicationsPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Next' }));
    fireEvent.click(await screen.findByRole('button', { name: /Delete application for Last Student/ }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete application' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(await screen.findByRole('button', { name: 'First Student' })).toBeInTheDocument();
    const calls = mocks.api.mock.calls.filter(([url]: unknown[]) => typeof url === 'string' && !url.includes('/counts'));
    expect(new URL(String(calls.at(-1)?.[0]), 'http://localhost').searchParams.get('page')).toBe('1');
  });
  it('restores an archived application through its own surface endpoint', async () => {
    mocks.api.mockResolvedValue({ applications: [{ id: 'p1', studentId: null, partnerStudentId: 'ps1', studentName: 'Amina', university: 'University', program: 'Medicine', degree: 'Bachelor', intake: '2027 Fall', status: 'Draft', surface: 'partner', source: 'Partner CRM', archivedAt: '2026-10-23', createdAt: '2026-10-23' }], total: 1 });
    mocks.raw.mockImplementation(async () => {
      mocks.api.mockResolvedValue({ applications: [], total: 0 });
      return new Response(null, { status: 204 });
    });
    render(<ApplicationsPage />);
    fireEvent.click(await screen.findByRole('button', { name: /^Restore application for Amina/ }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Restore application' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(mocks.raw).toHaveBeenCalledWith('/api/admin/partner-applications/p1', { method: 'PATCH', body: JSON.stringify({ action: 'restoreArchive' }) });
  });
});

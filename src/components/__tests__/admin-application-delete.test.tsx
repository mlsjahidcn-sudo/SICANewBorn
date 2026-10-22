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
  fireEvent.click(screen.getByText('adminManagement.archive', { exact: true }));
  return screen.findByRole('dialog');
}
describe('admin application delete', () => {
  it.each([
    [403, { error: 'Permission denied' }, 'Permission denied'],
    [500, null, 'Failed to delete application'],
  ])('retains the row and shows an actionable error for HTTP %s', async (status, body, message) => {
    mocks.raw.mockResolvedValue(new Response(body ? JSON.stringify(body) : 'not json', { status }));
    const dialog = await openDelete();
    fireEvent.click(within(dialog).getByRole('button', { name: 'adminManagement.archive' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(message);
    expect(mocks.raw).toHaveBeenCalledWith('/api/admin/applications/a1', { method: 'DELETE' });
    expect(screen.getByText('Amina')).toBeInTheDocument();
    expect(screen.getByText('Showing 1-20 of 21')).toBeInTheDocument();
  });
  it('removes the row only after a successful response, including HTTP 204', async () => {
    mocks.raw.mockResolvedValue(new Response(null, { status: 204 }));
    const dialog = await openDelete();
    fireEvent.click(within(dialog).getByRole('button', { name: 'adminManagement.archive' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.queryByText('Amina')).not.toBeInTheDocument();
  });
});

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ api: vi.fn(), raw: vi.fn() }));
vi.mock('@/lib/api-client', () => ({ apiFetchJson: mocks.api, apiFetch: mocks.raw }));
vi.mock('@/components/admin/SendEmailDialog', () => ({ SendEmailDialog: () => null }));
vi.mock('@/lib/i18n', () => { const t = (key: string): string => key; return { useI18n: () => ({ t }) }; });
import StudentsPage from '@/app/admin/students/page';
import StudentEditPage from '@/app/admin/students/[id]/edit/page';
import { NotesTab } from '@/app/admin/applications/_components/notes-tab';
import { RemoteSearchSelect } from '@/components/admin/remote-search-select';

beforeEach(() => { cleanup(); vi.clearAllMocks(); });
describe('admin management controls', () => {
  it('selects the current asynchronously loaded student rows, then clears all', async () => {
    mocks.api.mockImplementation(async (url: string) => url.includes('/stats') ? { total: 1, active: 1 } : { students: [{ id: 's1', firstName: 'Amina', lastName: 'Ali', email: 'amina@example.test', source: 'Online', status: 'Active', createdAt: '2026-10-21', preferredUniversities: [] }], total: 1 });
    render(<StudentsPage />); await screen.findByText('Amina Ali');
    const header = screen.getByRole('checkbox', { name: 'adminStudents.selectAllVisible' });
    fireEvent.click(header); expect(header).toBeChecked();
    expect(screen.getAllByRole('checkbox').every(el => el.getAttribute('data-state') === 'checked')).toBe(true);
    fireEvent.click(header); expect(header).not.toBeChecked();
  });
  it('preserves note drafts and reports failure instead of success on HTTP rejection', async () => {
    mocks.api.mockImplementation(async (_url: string, init?: RequestInit) => {
      if (init?.method === 'PATCH') throw new Error('Database unavailable');
      return { application: { id: 's1', additionalNotes: '', adminNotes: 'Public message', internalNotes: 'Private note' } };
    });
    render(<NotesTab applicationId="s1" />);
    const input = await screen.findByLabelText('adminManagement.internalNotes');
    fireEvent.change(input, { target: { value: 'Updated private draft' } });
    fireEvent.click(screen.getByRole('button', { name: 'adminAppDetail.notesSave' }));
    expect(await screen.findByText('Database unavailable')).toBeInTheDocument();
    expect(screen.queryByText(/adminAppDetail.notesSaved/)).not.toBeInTheDocument();
    expect(input).toHaveValue('Updated private draft');
    expect(mocks.api).toHaveBeenLastCalledWith('/api/admin/applications/s1', expect.objectContaining({ method: 'PATCH', body: expect.stringContaining('"internal_notes":"Updated private draft"') }));
  });
  it('only shows note-save confirmation after the checked request succeeds', async () => {
    mocks.api.mockResolvedValue({ application: { id: 's1' } }); render(<NotesTab applicationId="s1" />);
    fireEvent.click(await screen.findByRole('button', { name: 'adminAppDetail.notesSave' }));
    expect(await screen.findByText(/adminAppDetail.notesSaved/)).toBeInTheDocument(); expect(mocks.raw).not.toHaveBeenCalled();
  });
  it('includes an explicit cleared field and its original version in a student edit', async () => {
    mocks.api.mockImplementation(async (_url: string, init?: RequestInit) => init?.method === 'PATCH' ? {} : { student: { id: 's1', firstName: 'Amina', lastName: 'Ali', email: 'amina@example.test', phone: '12345', source: 'Online', status: 'Active', updatedAt: '2026-10-21T00:00:00Z', extra: {} } });
    render(<StudentEditPage />);
    const phone = await screen.findByDisplayValue('12345'); fireEvent.change(phone, { target: { value: '' } });
    // Advance through the existing four-step editor without losing the clear.
    for (let step = 0; step < 3; step++) fireEvent.click(screen.getByRole('button', { name: 'adminStudentForm.buttonNext' }));
    fireEvent.click(screen.getByRole('button', { name: /adminStudentForm.*[Ss]ave|adminStudentForm.*[Uu]pdate/ }));
    await waitFor(() => expect(mocks.api).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ method: 'PATCH', body: expect.stringContaining('"phone":""') })));
    const init = mocks.api.mock.calls.find((call: unknown[]) => (call[1] as RequestInit | undefined)?.method === 'PATCH')?.[1] as RequestInit;
    expect(JSON.parse(String(init.body))).toMatchObject({ phone: '', expectedUpdatedAt: '2026-10-21T00:00:00Z' });
  });
  it('loads more remote picker options without a fixed global record cap', async () => {
    mocks.api.mockImplementation(async (url: string) => ({ options: [{ value: url.includes('page=2') ? 'after-100' : 'first', label: url.includes('page=2') ? 'Beyond first page' : 'First record', record: { id: 'fixture' } }], hasMore: !url.includes('page=2') }));
    const onChange = vi.fn(); render(<RemoteSearchSelect url="/api/admin/application-options?kind=student" value="" placeholder="Select" onChange={onChange} />);
    fireEvent.click(await screen.findByRole('button', { name: 'adminManagement.moreOptions' }));
    await waitFor(() => expect(mocks.api).toHaveBeenCalledWith(expect.stringContaining('page=2'), expect.anything()));
  });
  it('displays a remote picker error with retry', async () => {
    mocks.api.mockRejectedValueOnce(new Error('Options unavailable')).mockResolvedValue({ options: [], hasMore: false });
    render(<RemoteSearchSelect url="/api/admin/application-options?kind=student" value="" placeholder="Select" onChange={() => {}} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Options unavailable'); fireEvent.click(screen.getByRole('button', { name: 'common.retry' }));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });
});

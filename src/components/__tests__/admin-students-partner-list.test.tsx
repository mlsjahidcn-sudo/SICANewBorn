import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock('@/lib/api-client', () => ({ apiFetchJson: mocks.api, apiFetch: vi.fn() }));
vi.mock('@/components/admin/SendEmailDialog', () => ({ SendEmailDialog: () => null }));
vi.mock('@/lib/i18n', () => { const t = (key: string): string => key; return { useI18n: () => ({ t }) }; });
import StudentsPage from '@/app/admin/students/page';

beforeEach(() => {
  cleanup(); vi.clearAllMocks();
  mocks.api.mockImplementation(async (url: string) => url.includes('/stats') ? { total: 2, active: 1 } : {
    students: [
      { id: 's1', surface: 'student', firstName: 'Amina', lastName: 'Ali', email: 'amina@example.test', source: 'Online', status: 'Active', createdAt: '2026-10-21', preferredUniversities: [] },
      { id: 'p1', surface: 'partner', firstName: 'Bashir', lastName: 'Khan', email: 'bashir@example.test', source: 'Partner', status: 'New', createdAt: '2026-10-21', preferredUniversities: [], applicationCount: 2 },
    ], total: 2,
  });
});
describe('partner students in the admin students module', () => {
  it('renders the native CRM status, routes applications correctly, and excludes CRM rows from bulk selection', async () => {
    render(<StudentsPage />);
    const row = (await screen.findByText('Bashir Khan')).closest('tr')!;
    expect(within(row).getByText('New')).toBeInTheDocument();
    expect(within(row).getByText('Partner')).toBeInTheDocument();
    expect(within(row).getByRole('link', { name: '2' })).toHaveAttribute('href', '/admin/partner-students/p1?tab=applications');
    expect(within(row).getByRole('checkbox')).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox', { name: 'adminStudents.selectAllVisible' }));
    expect(within(row).getByRole('checkbox')).not.toBeChecked();
    const profileRow = screen.getByText('Amina Ali').closest('tr')!;
    expect(within(profileRow).getByRole('checkbox')).toBeChecked();
  });
  it('opens the CRM details and only offers CRM-safe actions', async () => {
    render(<StudentsPage />);
    const row = (await screen.findByText('Bashir Khan')).closest('tr')!;
    await userEvent.setup().click(within(row).getByRole('button'));
    expect(await screen.findByRole('menuitem', { name: 'adminStudents.actionView' })).toHaveAttribute('href', '/admin/partner-students/p1');
    expect(screen.queryByRole('menuitem', { name: 'adminStudents.actionEdit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'adminStudents.actionDelete' })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'adminSendEmail.sendEmail' })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'adminStudents.actionMarkPaid' })).not.toBeInTheDocument();
  });
});

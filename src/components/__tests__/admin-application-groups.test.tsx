import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ApplicationGroups from '@/app/admin/applications/_components/application-groups';
afterEach(cleanup);
const applications = [
  { id: 's1', surface: 'student' as const, studentId: 'person', studentName: 'Amina', university: 'Student University', program: 'Medicine', degree: 'Bachelor', intake: '2027 Fall', status: 'Under Review', createdAt: '2026-10-21' },
  { id: 'p1', surface: 'partner' as const, studentId: 'person', studentName: 'Amina', university: 'Partner University', program: 'Physics', degree: 'Bachelor', intake: '2027 Fall', status: 'In Review', createdAt: '2026-10-21' },
];
describe('grouped application actions', () => {
  it('passes the partner surface and offers its native status vocabulary', () => {
    const onSetStatus = vi.fn();
    render(<ApplicationGroups applications={applications} onOpenRow={vi.fn()} onSetStatus={onSetStatus} settingStatusFor={null} onAddTarget={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Expand shortlist' }));
    const select = screen.getByRole('combobox', { name: 'Status for Partner University — Physics' });
    expect(select).toHaveValue('In Review');
    expect(Array.from(select.querySelectorAll('option')).map(o => o.value)).not.toContain('Under Review');
    fireEvent.change(select, { target: { value: 'Accepted' } });
    expect(onSetStatus).toHaveBeenCalledWith('p1', 'Accepted', 'partner');
  });
  it('does not offer a campaign append action for a legacy student group', () => {
    render(<ApplicationGroups applications={applications} onOpenRow={vi.fn()} onSetStatus={vi.fn()} settingStatusFor={null} onAddTarget={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Expand shortlist' }));
    expect(screen.queryByRole('button', { name: /Add another target/ })).not.toBeInTheDocument();
  });
});

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ApplicationGroups from '@/app/admin/applications/_components/application-groups';
afterEach(cleanup);
const applications = [
  { id: 's1', surface: 'student' as const, studentId: 'person', studentName: 'Amina', university: 'Student University', program: 'Medicine', degree: 'Bachelor', intake: '2027 Fall', status: 'Under Review', createdAt: '2026-10-21' },
  { id: 'p1', surface: 'partner' as const, studentId: 'person', studentName: 'Amina', university: 'Partner University', program: 'Physics', degree: 'Bachelor', intake: '2027 Fall', status: 'In Review', createdAt: '2026-10-21' },
];
// Two partner applications for the SAME partner_students row, with no
// campaign and no link to an admin student profile. This is the case
// that used to render as two "SINGLE" cards.
const partnerApplications = [
  { id: 'p1', surface: 'partner' as const, studentId: null, partnerStudentId: 'ps1', studentName: 'Amuni Temitope Zainab', university: 'Partner University', program: 'Physics', degree: 'Bachelor', intake: '2027 Fall', status: 'In Review', createdAt: '2026-10-21' },
  { id: 'p2', surface: 'partner' as const, studentId: null, partnerStudentId: 'ps1', studentName: 'Amuni Temitope Zainab', university: 'Partner University', program: 'Chemistry', degree: 'Bachelor', intake: '2027 Spring', status: 'In Review', createdAt: '2026-10-21' },
];
const renderGroups = (props: Partial<React.ComponentProps<typeof ApplicationGroups>> = {}) =>
  render(
    <ApplicationGroups
      applications={applications}
      onOpenRow={vi.fn()}
      onSetStatus={vi.fn()}
      settingStatusFor={null}
      onResetFilters={vi.fn()}
      hasActiveFilters={false}
      onAddTarget={vi.fn()}
      {...props}
    />,
  );

describe('grouped application actions', () => {
  it('passes the partner surface and offers its native status vocabulary', () => {
    const onSetStatus = vi.fn();
    renderGroups({ onSetStatus });
    fireEvent.click(screen.getByRole('button', { name: 'Expand student for Amina' }));
    const select = screen.getByRole('combobox', { name: 'Status for Partner University — Physics' });
    expect(select).toHaveValue('In Review');
    expect(Array.from(select.querySelectorAll('option')).map(o => o.value)).not.toContain('Under Review');
    fireEvent.change(select, { target: { value: 'Accepted' } });
    expect(onSetStatus).toHaveBeenCalledWith('p1', 'Accepted', 'partner');
  });
  it('does not offer a campaign append action for a legacy student group', () => {
    renderGroups();
    fireEvent.click(screen.getByRole('button', { name: 'Expand student for Amina' }));
    expect(screen.queryByRole('button', { name: /Add another target/ })).not.toBeInTheDocument();
  });
  it('groups one partner student’s applications under a single parent row', () => {
    renderGroups({ applications: partnerApplications });
    // One group, not two standalone cards.
    expect(screen.getByRole('button', { name: 'Expand partner for Amuni Temitope Zainab' })).toBeInTheDocument();
    expect(screen.queryByText('Single')).not.toBeInTheDocument();
    expect(screen.getByText('1 group · 2 of 2 applications grouped')).toBeInTheDocument();
  });
  it('names the rows inside a partner group by their application, not their target', () => {
    renderGroups({ applications: partnerApplications });
    expect(screen.getByText('2 intakes')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Amuni Temitope Zainab' }));
    expect(screen.getByText('Physics • Bachelor')).toBeInTheDocument();
    expect(screen.getByText('Chemistry • Bachelor')).toBeInTheDocument();
    expect(screen.getByText('2027 Fall')).toBeInTheDocument();
    expect(screen.getByText('2027 Spring')).toBeInTheDocument();
  });
  it('offers a reset when the list is empty and filters are applied', () => {
    const onResetFilters = vi.fn();
    renderGroups({ applications: [], onResetFilters, hasActiveFilters: true });
    fireEvent.click(screen.getByRole('button', { name: /Reset filters/ }));
    expect(onResetFilters).toHaveBeenCalled();
  });
});

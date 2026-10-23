import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ api: vi.fn(), raw: vi.fn() }));
vi.mock('@/lib/api-client', () => ({ apiFetchJson: mocks.api, apiFetch: mocks.raw }));
vi.mock('@/components/admin/remote-search-select', () => ({ RemoteSearchSelect: () => <button role="combobox">Select student</button> }));
vi.mock('@/lib/i18n', () => {
  const t = (key: string): string => key;
  return { useI18n: () => ({ t }) };
});
import ApplicationsPage from '@/app/admin/applications/page';

beforeEach(() => {
  vi.clearAllMocks();
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  mocks.api.mockImplementation(async (url: string) => {
    if (url.includes('/counts')) return { total: 2, online: 0, partner: 2, partnerCrm: 2, offline: 0, submitted: 0, inReview: 0, urgent: 0 };
    return {
      applications: ['2027 Fall', '2027 Spring'].map((intake, i) => ({
        id: `p${i}`, studentId: null, partnerStudentId: 'ps1', studentName: 'Amuni Temitope Zainab',
        university: 'University', program: 'Medicine', degree: 'Bachelor', intake, status: 'Draft',
        source: 'Partner CRM', surface: 'partner', createdAt: '2026-10-21',
      })), total: 1, page: 1, totalPages: 1,
    };
  });
});

describe('admin application filter workflow', () => {
  it('starts grouped with only search, status and the more-filters control visible', async () => {
    render(<ApplicationsPage />);
    await screen.findByText('Amuni Temitope Zainab');
    expect(screen.getByRole('button', { name: 'Grouped' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByRole('combobox')).toHaveLength(1);
    expect(screen.getByRole('combobox', { name: 'Application status' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Search applications' })).toBeInTheDocument();
    expect(screen.queryByText('Single')).not.toBeInTheDocument();
    expect(mocks.api).toHaveBeenCalledWith(expect.stringContaining('grouped=true'), expect.anything());
    const more = screen.getByRole('button', { name: /More filters/ });
    expect(more).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(more);
    expect(screen.getByRole('combobox', { name: 'Archive' })).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'Payment' })).toBeVisible();
    expect(screen.getAllByRole('combobox')).toHaveLength(7);
  });

  it('keeps a secondary filter visible and clearable after closing the panel', async () => {
    const user = userEvent.setup();
    render(<ApplicationsPage />);
    await screen.findByText('Amuni Temitope Zainab');
    await user.click(screen.getByRole('button', { name: /More filters/ }));
    await user.click(screen.getByRole('combobox', { name: 'Decision' }));
    await user.click(screen.getByRole('option', { name: 'Has decision' }));
    await waitFor(() => expect(mocks.api).toHaveBeenCalledWith(expect.stringContaining('hasDecision=true'), expect.anything()));
    await user.click(screen.getByRole('button', { name: /More filters/ }));
    expect(screen.queryByRole('combobox', { name: 'Decision' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /More filters/ })).toHaveTextContent('1');
    expect(screen.getByText('1 filter applied')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Clear decision filter' }));
    await waitFor(() => {
      const listCalls = mocks.api.mock.calls.filter(([url]: unknown[]) => typeof url === 'string' && !url.includes('/counts'));
      expect(listCalls.at(-1)?.[0]).not.toContain('hasDecision');
    });
    expect(screen.queryByText('1 filter applied')).not.toBeInTheDocument();
  });
});

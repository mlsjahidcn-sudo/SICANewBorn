import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/lib/i18n';
import { CatalogVerificationFields } from '@/components/admin/catalog-verification-fields';

const mockApi = vi.hoisted(() => vi.fn());
vi.mock('@/lib/api-client', () => ({ apiFetch: mockApi }));
beforeEach(() => { mockApi.mockReset(); mockApi.mockResolvedValue({ ok: true }); });

describe('staff can verify incomplete catalog entries', () => {
  it('saves only evidence without submitting the surrounding required catalog fields', async () => {
    const submit = vi.fn();
    const evidence = { sourceUrl: 'https://university.edu.cn/admissions', verifiedAt: '2026-01-01' };
    render(<I18nProvider initialLocale="en"><form onSubmit={submit}><input required aria-label="Missing description" value="" readOnly /><CatalogVerificationFields value={evidence} onChange={() => {}} record={{ kind: 'programs', slug: 'language-program' }} /></form></I18nProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Save verification only' }));
    await waitFor(() => expect(mockApi).toHaveBeenCalledWith('/api/programs/language-program', expect.objectContaining({ method: 'PUT', body: JSON.stringify({ detailVerification: evidence }) })));
    expect(submit).not.toHaveBeenCalled();
    expect(await screen.findByRole('status')).toHaveTextContent('Verification details saved.');
  });
  it('does not submit an availability assertion without evidence', () => {
    render(<I18nProvider initialLocale="en"><CatalogVerificationFields value={{ intakeStatus: 'open' }} onChange={() => {}} record={{ kind: 'programs', slug: 'language-program' }} /></I18nProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Save verification only' }));
    expect(mockApi).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('A source and verification date are required');
  });
});

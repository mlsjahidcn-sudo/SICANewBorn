import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PartnerApplicationFormProps } from '@/components/partner/PartnerApplicationForm';
const mocks = vi.hoisted(() => ({ api: vi.fn(), push: vi.fn() }));
vi.mock('next/navigation', () => ({ useParams: () => ({ id: 'a1' }), useRouter: () => ({ push: mocks.push }) }));
vi.mock('@/lib/api-client', () => ({ apiFetchJson: mocks.api }));
vi.mock('@/lib/i18n', () => {
  const t = (key: string): string => key;
  return { useI18n: () => ({ t }) };
});
vi.mock('@/components/partner/PartnerApplicationForm', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/components/partner/PartnerApplicationForm')>();
  return { ...original, PartnerApplicationForm: ({ formData, setFormData, onSubmit }: PartnerApplicationFormProps) => (
    <form onSubmit={onSubmit}>
      <span>{formData.programSlug}</span>
      <button type="button" onClick={() => setFormData({ ...formData, program: 'New program', programSlug: 'new-program' })}>Choose new program</button>
      <button type="button" onClick={() => setFormData({ ...formData, notInCatalog: true, notes: 'Please find a suitable program' })}>Choose manual entry</button>
      <button type="submit">Save</button>
    </form>
  ) };
});
import EditPage from '@/app/partner/applications/[id]/edit/page';
beforeEach(() => {
  vi.clearAllMocks();
  mocks.api.mockImplementation(async (url: string, options?: RequestInit) => {
    if (options?.method === 'PATCH') return { application: {} };
    if (url.startsWith('/api/universities')) return { universities: [] };
    if (url.startsWith('/api/programs')) return { programs: [{ slug: 'old-program', name: 'Old program' }, { slug: 'new-program', name: 'New program' }] };
    return { application: { studentName: 'Amina', university: 'University', program: 'Old program', programSlug: 'old-program', priority: 'Normal' } };
  });
});
describe('partner application edit program persistence', () => {
  it.each([false, true])('saves the selected slug or clears it for manual entry (manual=%s)', async (manual) => {
    render(<EditPage />);
    expect(await screen.findByText('old-program')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: manual ? 'Choose manual entry' : 'Choose new program' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith('/partner/applications/a1'));
    const patch = mocks.api.mock.calls.find(([, options]) => options?.method === 'PATCH');
    expect(patch).toBeDefined();
    expect(JSON.parse(patch![1].body)).toMatchObject({ programSlug: manual ? '' : 'new-program' });
  });
});

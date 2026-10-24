import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ api: vi.fn(), push: vi.fn(), t: (key: string) => key }));
vi.mock('@/lib/api-client', () => ({ apiFetchJson: mocks.api }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }), useParams: () => ({ id: 'student-1' }) }));
vi.mock('@/lib/i18n', () => ({ useI18n: () => ({ locale: 'en', t: mocks.t }) }));
vi.mock('@/components/admin/ocr-upload-modal', () => ({ OcrUploadModal: () => null }));
vi.mock('@/components/ui/searchable-select', () => ({ SearchableSelect: () => null }));
import AdminNew from '@/app/admin/students/new/page';
import AdminEdit from '@/app/admin/students/[id]/edit/page';
import PartnerNew from '@/app/partner/students/new/page';
import PartnerEdit from '@/app/partner/students/[id]/edit/page';

const inputs = [
  ['Place of birth (must match passport)', 'Dhaka'], ['Native language', 'Bangla'], ['Religion', 'Islam'],
  ['Years of living in your home country', '0'], ['Financial sponsor’s email (father’s email)', 'father@example.com'],
  ['Guarantor name', 'Parent'], ['Relationship to student', 'Father'], ['Guarantor phone', '+88012345'], ['Guarantor email', 'parent@example.com'],
] as const;
const details = { placeOfBirth: 'Dhaka', nativeLanguage: 'Bangla', religion: 'Islam', yearsInHomeCountry: '0', sponsorEmail: 'father@example.com', guarantorName: 'Parent', guarantorRelationship: 'Father', guarantorPhone: '+88012345', guarantorEmail: 'parent@example.com' };
const existing = { id: 'student-1', studentName: 'Test Student', firstName: 'Test', lastName: 'Student', studentEmail: 'student@example.com', email: 'student@example.com', status: 'New', updatedAt: '2026-10-24', ...details, yearsInHomeCountry: 0 };
beforeEach(() => {
  vi.clearAllMocks();
  mocks.api.mockImplementation(async (_url: string, options?: RequestInit) => options?.method
    ? { student: { ...existing } } : { student: { ...existing }, universities: [], programs: [] });
});
function fill(): void {
  for (const [label, value] of inputs) {
    const control = screen.getByLabelText(label);
    expect(control).toHaveAttribute('id');
    fireEvent.change(control, { target: { value } });
  }
  expect(screen.getByRole('combobox', { name: 'Marital status' })).toBeInTheDocument();
  expect(screen.getByText('Enter exactly as shown on your passport.')).toBeInTheDocument();
}
function payload(): Record<string, unknown> {
  const call = mocks.api.mock.calls.find(([, options]) => options?.method);
  expect(call).toBeDefined();
  return JSON.parse(call?.[1].body);
}
describe('student university details in real create/edit forms', () => {
  it('includes all requested fields in the admin create payload', async () => {
    render(<AdminNew />); fill();
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByRole('button', { name: 'adminStudentForm.buttonNext' }));
    fireEvent.click(screen.getByRole('button', { name: 'adminStudentForm.buttonSaveNew' }));
    await waitFor(() => expect(mocks.api).toHaveBeenCalled());
    expect(payload()).toMatchObject({ placeOfBirth: 'Dhaka', sponsorEmail: 'father@example.com', extra: { nativeLanguage: 'Bangla', yearsInHomeCountry: '0', guarantorEmail: 'parent@example.com' } });
  });
  it('prefills admin details from the mapped profile and persists explicit clears via a versioned patch', async () => {
    render(<AdminEdit />);
    expect(await screen.findByLabelText('Native language')).toHaveValue('Bangla');
    expect(screen.getByLabelText('Years of living in your home country')).toHaveValue(0);
    fireEvent.change(screen.getByLabelText('Place of birth (must match passport)'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Guarantor email'), { target: { value: '' } });
    for (let i = 0; i < 3; i++) fireEvent.click(screen.getByRole('button', { name: 'adminStudentForm.buttonNext' }));
    fireEvent.click(screen.getByRole('button', { name: 'adminStudentForm.buttonUpdateEdit' }));
    await waitFor(() => expect(mocks.push).toHaveBeenCalled());
    expect(payload()).toEqual({ placeOfBirth: '', extra: { guarantorEmail: '' }, expectedUpdatedAt: '2026-10-24' });
  });
  it('includes the new details in the partner create payload', async () => {
    render(<PartnerNew />); fill();
    fireEvent.change(screen.getByLabelText(/partnerStudentNew.fieldStudentName/), { target: { value: 'Test Student' } });
    fireEvent.click(screen.getByRole('button', { name: 'partnerStudentNew.saveStudent' }));
    await waitFor(() => expect(mocks.api.mock.calls.some(([, options]) => options?.method === 'POST')).toBe(true));
    expect(payload()).toMatchObject(details);
  });
  it('prefills partner values including zero, saves changes and clears optional fields', async () => {
    render(<PartnerEdit />);
    expect(await screen.findByLabelText('Native language')).toHaveValue('Bangla');
    expect(screen.getByLabelText('Years of living in your home country')).toHaveValue(0);
    fireEvent.change(screen.getByLabelText('Guarantor email'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'partnerStudentEdit.saveChanges' }));
    await waitFor(() => expect(mocks.push).toHaveBeenCalled());
    expect(payload()).toMatchObject({ ...details, guarantorEmail: '' });
  });
});

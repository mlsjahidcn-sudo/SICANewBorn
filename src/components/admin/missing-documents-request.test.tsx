import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MissingDocumentsRequest } from './missing-documents-request';
import { translations } from '@/lib/i18n-translations';

vi.mock('@/lib/i18n', () => ({
  useI18n: () => ({ locale: 'en', t: (key: string) => translations.en[key] ?? key }),
}));

describe('missing-document request dialog', () => {
  it('generates an editable message from selected and custom documents, then copies it', async () => {
    const user = userEvent.setup();
    const clipboard = vi.spyOn(navigator.clipboard, 'writeText');
    render(<MissingDocumentsRequest studentName="Amina" studentEmail="amina@example.com" />);
    await user.click(screen.getByRole('button', { name: 'Request missing documents' }));
    expect(screen.getByRole('button', { name: 'Copy message' })).toBeDisabled();
    await user.click(screen.getByRole('checkbox', { name: 'Passport photo page' }));
    await user.type(screen.getByLabelText('Other documents (one per line)'), 'Certified translation');
    const preview = screen.getByLabelText<HTMLTextAreaElement>('Generated message — editable');
    expect(preview.value).toContain('1. Passport photo page\n2. Certified translation');
    await user.clear(preview);
    await user.type(preview, 'Hi Amina, please send your passport and certified translation.');
    await user.click(screen.getByRole('button', { name: 'Copy message' }));
    expect(clipboard).toHaveBeenCalledWith('Hi Amina, please send your passport and certified translation.');
    expect(await screen.findByRole('status')).toHaveTextContent('Message copied.');
    expect(new URL(screen.getByRole('link', { name: 'Email draft' }).getAttribute('href')!).searchParams.get('body')).toBe('Hi Amina, please send your passport and certified translation.');
  });

  it('never addresses a partner draft to the student and regenerates in the selected language', async () => {
    const user = userEvent.setup();
    render(<MissingDocumentsRequest studentName="Amina" studentEmail="amina@example.com" studentPhone="+8801712345678" allowPartner defaultRecipient="partner" />);
    await user.click(screen.getByRole('button', { name: 'Request missing documents' }));
    await user.click(screen.getByRole('checkbox', { name: 'Academic transcripts' }));
    expect(screen.getByLabelText<HTMLTextAreaElement>('Generated message — editable').value).toContain("Amina's SICA application");
    expect(new URL(screen.getByRole('link', { name: 'Email draft' }).getAttribute('href')!).pathname).toBe('');
    expect(new URL(screen.getByRole('link', { name: 'WhatsApp draft' }).getAttribute('href')!).pathname).toBe('/');
    await user.click(screen.getByRole('radio', { name: 'Student' }));
    expect(decodeURIComponent(new URL(screen.getByRole('link', { name: 'Email draft' }).getAttribute('href')!).pathname)).toBe('amina@example.com');
    await user.selectOptions(screen.getByLabelText('Message language'), 'zh');
    expect(screen.getByLabelText<HTMLTextAreaElement>('Generated message — editable').value).toContain('1. 成绩单');
    await user.click(screen.getByRole('checkbox', { name: '成绩单' }));
    expect(screen.getByRole('button', { name: 'Copy message' })).toBeDisabled();
    expect(screen.queryByRole('link', { name: 'Email draft' })).not.toBeInTheDocument();
  });

  it('only saves when explicitly asked, preserves the exact message and prevents duplicate saves', async () => {
    const user = userEvent.setup();
    const save = vi.fn().mockResolvedValue(undefined);
    render(<MissingDocumentsRequest studentName="Amina" onSave={save} />);
    await user.click(screen.getByRole('button', { name: 'Request missing documents' }));
    await user.click(screen.getByRole('checkbox', { name: 'Graduation diploma / degree certificate' }));
    expect(save).not.toHaveBeenCalled();
    const preview = screen.getByLabelText<HTMLTextAreaElement>('Generated message — editable').value;
    await user.click(screen.getByRole('button', { name: 'Save request to application' }));
    await waitFor(() => expect(save).toHaveBeenCalledWith({ categories: ['other'], message: preview }));
    expect(await screen.findByRole('status')).toHaveTextContent('Request saved to the application');
    expect(screen.getByRole('button', { name: 'Save request to application' })).toBeDisabled();
  });

  it('keeps the message available when clipboard access is denied', async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'));
    render(<MissingDocumentsRequest studentName="Amina" />);
    await user.click(screen.getByRole('button', { name: 'Request missing documents' }));
    await user.click(screen.getByRole('checkbox', { name: 'Passport photo page' }));
    await user.click(screen.getByRole('button', { name: 'Copy message' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Select the message text and copy it manually');
    expect(screen.getByLabelText<HTMLTextAreaElement>('Generated message — editable').value).toContain('Passport photo page');
  });
});

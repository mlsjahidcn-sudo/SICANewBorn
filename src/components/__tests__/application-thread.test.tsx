import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({ apiFetchJson: vi.fn() }));
vi.mock('@/lib/api-client', () => ({
  apiFetchJson: api.apiFetchJson,
  ApiError: class ApiError extends Error {
    constructor(message: string, public status: number) {
      super(message);
    }
  },
}));
const i18n = vi.hoisted(() => ({ t: (key: string) => key, locale: 'en' }));
vi.mock('@/lib/i18n', () => ({ useI18n: () => i18n }));

import { ApplicationThread } from '@/components/messages/application-thread';

const ENDPOINT = '/api/student/applications/app-1/messages';
const adminMessage = {
  id: 'm1',
  senderRole: 'admin',
  senderName: 'SICA team',
  body: 'Please upload your passport.',
  readAt: null,
  createdAt: '2026-11-26T10:00:00Z',
};

beforeEach(() => {
  api.apiFetchJson.mockReset();
});

describe('ApplicationThread', () => {
  it('loads with markRead=1 and labels the other side', async () => {
    api.apiFetchJson.mockResolvedValueOnce({ messages: [adminMessage], canSend: true, disabledReason: null });
    const onLoaded = vi.fn();
    render(<ApplicationThread endpoint={ENDPOINT} viewerRole="student" onLoaded={onLoaded} />);
    expect(await screen.findByText('Please upload your passport.')).toBeTruthy();
    expect(api.apiFetchJson).toHaveBeenCalledWith(`${ENDPOINT}?markRead=1`);
    expect(screen.getByText('appMessages.sicaTeam')).toBeTruthy();
    expect(onLoaded).toHaveBeenCalledWith([adminMessage]);
  });

  it('sends a message and shows the saved copy', async () => {
    api.apiFetchJson
      .mockResolvedValueOnce({ messages: [], canSend: true, disabledReason: null })
      .mockResolvedValueOnce({
        message: { ...adminMessage, id: 'm2', senderRole: 'student', body: 'Uploaded it now.' },
      });
    render(<ApplicationThread endpoint={ENDPOINT} viewerRole="student" />);
    await screen.findByText('appMessages.empty');
    fireEvent.change(screen.getByPlaceholderText('appMessages.placeholder'), { target: { value: 'Uploaded it now.' } });
    fireEvent.click(screen.getByRole('button', { name: /appMessages.send/ }));
    expect(await screen.findByText('Uploaded it now.')).toBeTruthy();
    expect(api.apiFetchJson).toHaveBeenLastCalledWith(ENDPOINT, expect.objectContaining({ method: 'POST' }));
    await waitFor(() => expect(screen.getByText('appMessages.you')).toBeTruthy());
  });

  it('rolls back a failed send and puts the text back', async () => {
    api.apiFetchJson
      .mockResolvedValueOnce({ messages: [], canSend: true, disabledReason: null })
      .mockRejectedValueOnce(new Error('network'));
    render(<ApplicationThread endpoint={ENDPOINT} viewerRole="student" />);
    await screen.findByText('appMessages.empty');
    const box = screen.getByPlaceholderText('appMessages.placeholder') as HTMLTextAreaElement;
    fireEvent.change(box, { target: { value: 'Will this arrive?' } });
    fireEvent.keyDown(box, { key: 'Enter', ctrlKey: true });
    expect(await screen.findByText('appMessages.errorSend')).toBeTruthy();
    expect(box.value).toBe('Will this arrive?');
    expect(screen.getByText('appMessages.empty')).toBeTruthy();
  });

  it('explains why sending is disabled for applicants without an account', async () => {
    api.apiFetchJson.mockResolvedValueOnce({ messages: [], canSend: false, disabledReason: 'no_portal_account' });
    render(<ApplicationThread endpoint="/api/admin/applications/app-1/messages" viewerRole="admin" />);
    expect(await screen.findByText('appMessages.noPortalAccount')).toBeTruthy();
    expect(screen.queryByPlaceholderText('appMessages.placeholder')).toBeNull();
  });
});

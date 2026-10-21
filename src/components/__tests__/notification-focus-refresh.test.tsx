import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock('@/lib/api-client', () => ({ apiFetchJson: mocks.api }));
vi.mock('@/lib/i18n', () => {
  const t = (key: string): string => key;
  return { useI18n: () => ({ t, locale: 'en' }) };
});
import StudentNotifications from '@/app/student/notifications/page';
import PartnerNotifications from '@/app/partner/notifications/page';

beforeEach(() => { vi.clearAllMocks(); });
afterEach(() => { vi.useRealTimers(); });

describe.each([
  { surface: 'student', Page: StudentNotifications, unreadKey: 'studentNotif.unread' },
  { surface: 'partner', Page: PartnerNotifications, unreadKey: 'partnerNotif.filterUnread' },
])('$surface inbox background refresh', ({ surface, Page, unreadKey }) => {
  const response = { notifications: [], unreadCount: 0, total: 0, totalPages: 1, page: 1 };
  it('keeps the loaded empty inbox visible during a pending focus refresh', async () => {
    mocks.api.mockResolvedValueOnce(response).mockReturnValue(new Promise(() => {}));
    render(<Page />);
    const empty = await screen.findByText(`${surface}Notif.emptyAll`);
    expect(mocks.api).toHaveBeenCalledTimes(1);
    fireEvent(window, new Event('focus'));
    expect(mocks.api).toHaveBeenCalledTimes(2);
    expect(empty).toBeInTheDocument();
    expect(screen.queryByText(`${surface}Notif.loading`)).not.toBeInTheDocument();
  });
  it('still loads a new filter instead of treating it as a silent refresh', async () => {
    mocks.api.mockResolvedValueOnce(response).mockReturnValue(new Promise(() => {}));
    render(<Page />);
    await screen.findByText(`${surface}Notif.emptyAll`);
    fireEvent.click(screen.getByRole('button', { name: unreadKey }));
    expect(screen.getByText(`${surface}Notif.loading`)).toBeInTheDocument();
    expect(mocks.api.mock.calls[1][0]).toContain('unread=true');
  });
  it('polls quietly after 30 seconds', async () => {
    vi.useFakeTimers();
    mocks.api.mockResolvedValueOnce(response).mockReturnValue(new Promise(() => {}));
    await act(async () => { render(<Page />); });
    expect(screen.getByText(`${surface}Notif.emptyAll`)).toBeInTheDocument();
    await act(async () => { vi.advanceTimersByTime(30_000); });
    expect(mocks.api).toHaveBeenCalledTimes(2);
    expect(screen.getByText(`${surface}Notif.emptyAll`)).toBeInTheDocument();
    expect(screen.queryByText(`${surface}Notif.loading`)).not.toBeInTheDocument();
  });
});

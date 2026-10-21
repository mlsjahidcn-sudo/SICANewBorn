import { useEffect } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import type { ReactNode } from 'react';

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(), onAuthStateChange: vi.fn(), unsubscribe: vi.fn(),
  signOut: vi.fn(), api: vi.fn(), mounted: vi.fn(), userChanged: vi.fn(),
  router: { push: vi.fn() },
}));
vi.mock('@/lib/supabase-browser', () => ({ isSupabaseConfigured: true, supabase: { auth: {
  getSession: mocks.getSession, onAuthStateChange: mocks.onAuthStateChange, signOut: mocks.signOut,
} } }));
vi.mock('@/lib/api-client', () => ({ apiFetch: mocks.api }));
vi.mock('next/navigation', () => ({
  useRouter: () => mocks.router, usePathname: () => '/admin/students',
}));
vi.mock('@/lib/i18n', () => {
  const t = (key: string): string => key;
  return { I18nProvider: ({ children }: { children: ReactNode }): ReactNode => children, useI18n: () => ({ t }) };
});
import AdminLayout from '@/app/admin/layout';
import { AuthProvider, useAuth } from '@/lib/auth-context';

const user: User = { id: 'admin-1', email: 'admin@example.test', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '2026-01-01' };
const session: Session = { user, access_token: 'initial-token', refresh_token: 'refresh-token', token_type: 'bearer', expires_in: 3600 };
let notify: (event: AuthChangeEvent, value: Session | null) => void;

function Editor(): ReactNode {
  const auth = useAuth();
  useEffect(() => { mocks.mounted(); }, []);
  useEffect(() => { mocks.userChanged(auth.user); }, [auth.user]);
  return <><input aria-label="Unsaved notes" defaultValue="" /><span data-testid="token">{auth.session?.access_token}</span><span data-testid="user-email">{auth.user?.email ?? 'signed out'}</span></>;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getSession.mockResolvedValue({ data: { session: structuredClone(session) } });
  mocks.onAuthStateChange.mockImplementation((callback: typeof notify) => {
    notify = callback;
    return { data: { subscription: { unsubscribe: mocks.unsubscribe } } };
  });
  mocks.api.mockResolvedValue(new Response('{}', { status: 200 }));
  mocks.signOut.mockResolvedValue({ error: null });
});

describe('portal session recovery on tab focus', () => {
  it('keeps admin content, edits and user-dependent effects intact when focus re-emits SIGNED_IN', async () => {
    render(<AdminLayout><Editor /></AdminLayout>);
    const input = await screen.findByRole('textbox', { name: 'Unsaved notes' });
    fireEvent.change(input, { target: { value: 'Do not lose this draft' } });
    await act(async () => {
      notify('SIGNED_IN', structuredClone(session));
      notify('SIGNED_IN', structuredClone(session));
    });
    expect(screen.getByRole('textbox')).toBe(input);
    expect(input).toHaveValue('Do not lose this draft');
    expect(mocks.api).toHaveBeenCalledTimes(1);
    expect(mocks.mounted).toHaveBeenCalledTimes(1);
    expect(mocks.userChanged).toHaveBeenCalledTimes(1);
  });

  it('publishes refreshed tokens and real profile changes without restarting the admin access gate', async () => {
    render(<AdminLayout><Editor /></AdminLayout>);
    const input = await screen.findByRole('textbox');
    await act(async () => { notify('TOKEN_REFRESHED', { ...structuredClone(session), access_token: 'refreshed-token' }); });
    expect(screen.getByTestId('token')).toHaveTextContent('refreshed-token');
    expect(mocks.userChanged).toHaveBeenCalledTimes(1);
    await act(async () => { notify('USER_UPDATED', { ...session, user: { ...user, email: 'updated@example.test', user_metadata: { full_name: 'Updated name' } } }); });
    expect(screen.getByTestId('user-email')).toHaveTextContent('updated@example.test');
    expect(screen.getByRole('textbox')).toBe(input);
    expect(mocks.api).toHaveBeenCalledTimes(1);
    expect(mocks.mounted).toHaveBeenCalledTimes(1);
    expect(mocks.userChanged).toHaveBeenCalledTimes(2);
  });

  it('still rechecks access for a different account and blocks it while the check is pending', async () => {
    render(<AdminLayout><Editor /></AdminLayout>);
    await screen.findByRole('textbox');
    let resolveCheck!: (value: Response) => void;
    mocks.api.mockReturnValue(new Promise<Response>((resolve) => { resolveCheck = resolve; }));
    await act(async () => { notify('SIGNED_IN', { ...session, user: { ...user, id: 'other-account' } }); });
    expect(mocks.api).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    await act(async () => { resolveCheck(new Response('{}', { status: 403 })); });
    expect(mocks.signOut).toHaveBeenCalledTimes(1);
    expect(mocks.router.push).toHaveBeenCalledWith('/admin/login');
  });

  it('still removes protected content and redirects when the session ends', async () => {
    render(<AdminLayout><Editor /></AdminLayout>);
    await screen.findByRole('textbox');
    await act(async () => { notify('SIGNED_OUT', null); });
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(mocks.router.push).toHaveBeenCalledWith('/admin/login');
  });

  it('does not let a delayed initial session read undo a newer sign-out', async () => {
    let resolveInitial!: (value: { data: { session: Session } }) => void;
    mocks.getSession.mockReturnValue(new Promise((resolve) => { resolveInitial = resolve; }));
    render(<AuthProvider><Editor /></AuthProvider>);
    await act(async () => { notify('SIGNED_OUT', null); });
    await act(async () => { resolveInitial({ data: { session } }); });
    expect(screen.getByText('signed out')).toBeInTheDocument();
    expect(screen.getByTestId('token')).toBeEmptyDOMElement();
  });

  it('unsubscribes and ignores late bootstrap work after unmount', async () => {
    let resolveInitial!: (value: { data: { session: Session } }) => void;
    mocks.getSession.mockReturnValue(new Promise((resolve) => { resolveInitial = resolve; }));
    const view = render(<AuthProvider><Editor /></AuthProvider>);
    view.unmount();
    expect(mocks.unsubscribe).toHaveBeenCalledTimes(1);
    await act(async () => { resolveInitial({ data: { session } }); });
    await waitFor(() => expect(mocks.mounted).toHaveBeenCalledTimes(1));
  });
});

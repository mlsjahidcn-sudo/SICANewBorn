import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { translations } from '@/lib/i18n-translations';
import { SITE_URL } from '@/lib/site-url';

const mocks = vi.hoisted(() => ({
  auth: vi.fn(), reset: vi.fn(), update: vi.fn(), signOut: vi.fn(), signIn: vi.fn(), back: vi.fn(),
  router: { push: vi.fn(), replace: vi.fn() }, search: '', locale: 'en' as 'en' | 'zh',
}));
vi.mock('@/lib/auth-context', () => ({ useAuth: mocks.auth }));
vi.mock('@/lib/supabase-browser', () => ({ supabase: { auth: {
  resetPasswordForEmail: mocks.reset, updateUser: mocks.update, signOut: mocks.signOut,
} } }));
vi.mock('next/navigation', () => ({ useRouter: () => mocks.router, useSearchParams: () => new URLSearchParams(mocks.search) }));
vi.mock('@/lib/i18n', () => {
  const t = (key: string, params?: Record<string, string | number>): string => {
    let text = translations[mocks.locale][key] ?? key;
    for (const [name, value] of Object.entries(params ?? {})) text = text.replaceAll(`{{${name}}}`, String(value));
    return text;
  };
  return { useI18n: () => ({ t, locale: mocks.locale }) };
});
import { PasswordRecoveryForm } from '@/components/auth/password-recovery-form';
import AdminLogin from '@/app/admin/login/page';
import PartnerLogin from '@/app/partner/login/page';
import StudentLogin from '@/app/student/login/page';

const user = { id: 'recovery-user', email: 'account@example.test', user_metadata: { role: 'partner' } };
const configuredAuth = { user: null, loading: false, isConfigured: true, signIn: mocks.signIn };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.search = '';
  mocks.locale = 'en';
  window.history.replaceState({}, '', '/');
  mocks.auth.mockReturnValue(configuredAuth);
  mocks.reset.mockResolvedValue({ error: null });
  mocks.update.mockResolvedValue({ error: null });
  mocks.signOut.mockResolvedValue({ error: null });
});

function enterNewPassword(password = 'New-password-123', confirmation = password): void {
  fireEvent.change(screen.getByLabelText('New password'), { target: { value: password } });
  fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: confirmation } });
  const form = screen.getByLabelText('New password').closest('form');
  if (!form) throw new Error('Password recovery form is missing');
  fireEvent.submit(form);
}

describe.each([
  { portal: 'admin' as const, Page: AdminLogin },
  { portal: 'partner' as const, Page: PartnerLogin },
  { portal: 'student' as const, Page: StudentLogin },
])('$portal password recovery', ({ portal, Page }) => {
  it('offers anonymous recovery, retains the entered email, and requests the correct portal callback', async () => {
    render(<Page />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Account@Example.Test' } });
    fireEvent.click(screen.getByRole('button', { name: 'Forgot password?' }));
    expect(screen.getByLabelText('Email address')).toHaveValue('Account@Example.Test');
    fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
    expect(await screen.findByText(/If an account exists for account@example.test/)).toBeInTheDocument();
    expect(mocks.reset).toHaveBeenCalledWith('account@example.test', { redirectTo: `${SITE_URL}/${portal}/login?reset=1` });
    expect(mocks.signIn).not.toHaveBeenCalled();
  });

  it('keeps a recovery session on the new-password form, updates the password, and returns to its login', async () => {
    mocks.search = 'reset=1';
    mocks.auth.mockReturnValue({ ...configuredAuth, user });
    render(<Page />);
    await screen.findByLabelText('New password');
    expect(mocks.router.push).not.toHaveBeenCalled();
    expect(mocks.router.replace).not.toHaveBeenCalled();
    enterNewPassword();
    expect(await screen.findByText(/Your password has been updated/)).toBeInTheDocument();
    await waitFor(() => expect(mocks.signOut).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: 'Back to sign in' }));
    expect(mocks.update).toHaveBeenCalledWith({ password: 'New-password-123' });
    expect(mocks.router.replace).toHaveBeenCalledWith(`/${portal}/login`);
  });
});

describe('shared password recovery validation and errors', () => {
  it.each([
    ['short', 'short', 'Password must be at least 8 characters.'],
    ['Long-password-123', 'Different-password-456', 'Passwords do not match.'],
  ])('rejects invalid password input before contacting Supabase', async (password, confirmation, message) => {
    mocks.auth.mockReturnValue({ ...configuredAuth, user });
    render(<PasswordRecoveryForm portal="admin" mode="reset" onBack={mocks.back} />);
    await screen.findByLabelText('New password');
    enterNewPassword(password, confirmation);
    expect(screen.getByRole('alert')).toHaveTextContent(message);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('shows an expired-link state without a session and lets the user request another link', async () => {
    render(<PasswordRecoveryForm portal="partner" mode="reset" onBack={mocks.back} />);
    await screen.findByText('This reset link is invalid or has expired');
    expect(mocks.update).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Request a new link' }));
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.queryByLabelText('New password')).not.toBeInTheDocument();
  });

  it('rejects an expired callback even when another account is already signed in', async () => {
    window.history.replaceState({}, '', '/admin/login?reset=1#error=access_denied&error_code=otp_expired');
    mocks.auth.mockReturnValue({ ...configuredAuth, user });
    render(<PasswordRecoveryForm portal="admin" mode="reset" onBack={mocks.back} />);
    expect(await screen.findByText('This reset link is invalid or has expired')).toBeInTheDocument();
    expect(screen.queryByLabelText('New password')).not.toBeInTheDocument();
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('waits for the recovery session before showing a form or an expired message', () => {
    mocks.auth.mockReturnValue({ ...configuredAuth, loading: true });
    render(<PasswordRecoveryForm portal="student" mode="reset" onBack={mocks.back} />);
    expect(screen.getByText('Verifying your reset link…')).toBeInTheDocument();
    expect(screen.queryByText('This reset link is invalid or has expired')).not.toBeInTheDocument();
  });

  it('shows request errors and allows a retry without falsely reporting success', async () => {
    mocks.reset.mockRejectedValueOnce(new Error('Network unavailable'));
    render(<PasswordRecoveryForm portal="admin" mode="request" initialEmail="account@example.test" onBack={mocks.back} />);
    fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Network unavailable');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
    expect(await screen.findByText(/If an account exists/)).toBeInTheDocument();
  });

  it('returns the same confirmation for an unknown account', async () => {
    mocks.reset.mockResolvedValue({ error: { code: 'user_not_found' } });
    render(<PasswordRecoveryForm portal="admin" mode="request" initialEmail="unknown@example.test" onBack={mocks.back} />);
    fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
    expect(await screen.findByText(/If an account exists for unknown@example.test/)).toBeInTheDocument();
  });

  it('keeps the reset form available when Supabase rejects the new password', async () => {
    mocks.auth.mockReturnValue({ ...configuredAuth, user });
    mocks.update.mockResolvedValue({ error: new Error('Use a different password') });
    render(<PasswordRecoveryForm portal="student" mode="reset" onBack={mocks.back} />);
    await screen.findByLabelText('New password');
    enterNewPassword();
    expect(await screen.findByRole('alert')).toHaveTextContent('Use a different password');
    expect(mocks.signOut).not.toHaveBeenCalled();
    expect(screen.getByLabelText('New password')).toBeInTheDocument();
  });

  it('distinguishes a successful password update from a failed sign-out and retries the latter', async () => {
    mocks.auth.mockReturnValue({ ...configuredAuth, user });
    mocks.signOut.mockResolvedValueOnce({ error: new Error('Network unavailable') }).mockResolvedValue({ error: null });
    render(<PasswordRecoveryForm portal="admin" mode="reset" onBack={mocks.back} />);
    await screen.findByLabelText('New password');
    enterNewPassword();
    expect(await screen.findByText(/Your password has been updated/)).toBeInTheDocument();
    expect(await screen.findByRole('alert')).toHaveTextContent('could not close your recovery session');
    fireEvent.click(screen.getByRole('button', { name: 'Back to sign in' }));
    await waitFor(() => expect(mocks.back).toHaveBeenCalledTimes(1));
    expect(mocks.update).toHaveBeenCalledTimes(1);
    expect(mocks.signOut).toHaveBeenCalledTimes(2);
  });

  it('prevents duplicate email requests while a request is pending', async () => {
    let resolve!: (value: { error: null }) => void;
    mocks.reset.mockReturnValue(new Promise((done) => { resolve = done; }));
    render(<PasswordRecoveryForm portal="partner" mode="request" initialEmail="account@example.test" onBack={mocks.back} />);
    const send = screen.getByRole('button', { name: 'Send reset link' });
    fireEvent.click(send);
    expect(send).toBeDisabled();
    fireEvent.click(send);
    expect(mocks.reset).toHaveBeenCalledTimes(1);
    await act(async () => { resolve({ error: null }); });
  });

  it('translates recovery messages into Chinese', () => {
    mocks.locale = 'zh';
    render(<PasswordRecoveryForm portal="student" mode="request" onBack={mocks.back} />);
    expect(screen.getByRole('button', { name: '发送重置链接' })).toBeInTheDocument();
    expect(screen.getByLabelText('电子邮箱')).toBeInTheDocument();
  });
});

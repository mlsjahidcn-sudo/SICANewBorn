'use client';

import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react';
import { Eye, EyeOff, KeyRound, Mail } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/lib/supabase-browser';
import { SITE_URL } from '@/lib/site-url';

export interface PasswordRecoveryFormProps {
  portal: 'admin' | 'partner' | 'student';
  mode: 'request' | 'reset';
  initialEmail?: string;
  onBack: () => void;
}

const inputClass = 'w-full rounded-none border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30]';
const buttonClass = 'w-full rounded-none bg-[#9B1B30] text-white py-2.5 font-medium text-sm hover:bg-[#7A1526] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

/** Shared anonymous email request and authenticated recovery-link completion. */
export function PasswordRecoveryForm({ portal, mode, initialEmail = '', onBack }: PasswordRecoveryFormProps): ReactNode {
  const { user, loading: authLoading, isConfigured } = useAuth();
  const { t } = useI18n();
  const id = useId();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestNew, setRequestNew] = useState(false);
  const [callbackChecked, setCallbackChecked] = useState(false);
  const [callbackInvalid, setCallbackInvalid] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [signedOut, setSignedOut] = useState(false);

  useEffect(() => {
    // An expired/used link must not reuse an unrelated existing login session.
    const query = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.slice(1));
    setCallbackInvalid([query, hash].some((params) => params.has('error') || params.has('error_code')));
    setCallbackChecked(true);
  }, []);

  const sendLink = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);
    const address = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      setError(t('passwordRecovery.invalidEmail'));
      return;
    }
    if (!supabase || !isConfigured) {
      setError(t('passwordRecovery.configMissing'));
      return;
    }
    setBusy(true);
    try {
      const { error: sendError } = await supabase.auth.resetPasswordForEmail(address, {
        redirectTo: `${SITE_URL}/${portal}/login?reset=1`,
      });
      // Keep the confirmation identical for existing and unknown accounts.
      if (sendError && sendError.code !== 'user_not_found') throw sendError;
      setEmail(address);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('passwordRecovery.sendError'));
    } finally {
      setBusy(false);
    }
  };

  const endRecoverySession = async (): Promise<boolean> => {
    if (!supabase) return false;
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      setSignedOut(true);
      setError(null);
      return true;
    } catch {
      setError(t('passwordRecovery.signOutError'));
      return false;
    }
  };

  const updatePassword = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError(null);
    if (!supabase || !isConfigured || !user || callbackInvalid) {
      setError(t('passwordRecovery.expiredBody'));
      return;
    }
    if (password.length < 8) {
      setError(t('passwordRecovery.tooShort'));
      return;
    }
    if (password !== confirmation) {
      setError(t('passwordRecovery.mismatch'));
      return;
    }
    setBusy(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setPasswordUpdated(true);
      setPassword('');
      setConfirmation('');
      await endRecoverySession();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('passwordRecovery.updateError'));
    } finally {
      setBusy(false);
    }
  };

  const backButton = <button type="button" onClick={onBack} disabled={busy} className="w-full py-2 text-sm text-[#1B2A4A] hover:underline disabled:opacity-50">{t('passwordRecovery.back')}</button>;
  const errorBanner = error && <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;

  if (passwordUpdated) {
    return <div className="space-y-5">
      <div role="status" className="border border-green-200 bg-green-50 p-4 text-sm text-green-800">{t('passwordRecovery.updated')}</div>
      {errorBanner}
      <button type="button" disabled={busy} className={buttonClass} onClick={async () => {
        if (signedOut) { onBack(); return; }
        setBusy(true);
        if (await endRecoverySession()) onBack();
        setBusy(false);
      }}>{busy ? <Spinner size="sm" /> : t('passwordRecovery.back')}</button>
    </div>;
  }

  if (mode === 'reset' && !requestNew) {
    if (authLoading || !callbackChecked) {
      return <div role="status" className="flex items-center justify-center gap-2 py-6 text-sm text-[#1B2A4A]"><Spinner size="sm" />{t('passwordRecovery.verifying')}</div>;
    }
    if (!user || callbackInvalid) {
      return <div className="space-y-5">
        <h2 className="text-lg font-semibold text-[#1B2A4A]">{t('passwordRecovery.expiredTitle')}</h2>
        <p className="text-sm text-[#4B5563]">{t('passwordRecovery.expiredBody')}</p>
        <button type="button" className={buttonClass} onClick={() => { setRequestNew(true); setError(null); }}>{t('passwordRecovery.requestNew')}</button>
        {backButton}
      </div>;
    }
    return <form onSubmit={updatePassword} className="space-y-5">
      <h2 className="text-lg font-semibold text-[#1B2A4A]">{t('passwordRecovery.newTitle')}</h2>
      <p className="text-sm text-[#4B5563]">{t('passwordRecovery.account', { email: user.email ?? '' })}</p>
      {errorBanner}
      <div>
        <label htmlFor={`${id}-password`} className="mb-1.5 block text-sm font-medium text-[#1B2A4A]">{t('passwordRecovery.newPassword')}</label>
        <div className="relative">
          <input id={`${id}-password`} type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} disabled={busy} className={`${inputClass} pr-12`} />
          <button type="button" aria-label={t(showPassword ? 'passwordRecovery.hidePassword' : 'passwordRecovery.showPassword')} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1B2A4A]">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div>
        <p className="mt-1 text-xs text-[#4B5563]">{t('passwordRecovery.passwordHint')}</p>
      </div>
      <div>
        <label htmlFor={`${id}-confirmation`} className="mb-1.5 block text-sm font-medium text-[#1B2A4A]">{t('passwordRecovery.confirmPassword')}</label>
        <input id={`${id}-confirmation`} type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} disabled={busy} className={inputClass} />
      </div>
      <button type="submit" disabled={busy} className={buttonClass}>{busy ? <Spinner size="sm" /> : t('passwordRecovery.save')}</button>
      {backButton}
    </form>;
  }

  return <form onSubmit={sendLink} className="space-y-5">
    <div className="flex items-center gap-2 text-[#1B2A4A]"><KeyRound size={20} /><h2 className="text-lg font-semibold">{t('passwordRecovery.title')}</h2></div>
    {sent ? <p role="status" className="border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{t('passwordRecovery.sent', { email })}</p> : <>
      <p className="text-sm text-[#4B5563]">{t('passwordRecovery.body')}</p>
      {errorBanner}
      <div>
        <label htmlFor={`${id}-email`} className="mb-1.5 block text-sm font-medium text-[#1B2A4A]">{t('passwordRecovery.email')}</label>
        <input id={`${id}-email`} type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} disabled={busy} className={inputClass} />
      </div>
      <button type="submit" disabled={busy || !isConfigured} className={buttonClass}>{busy ? <Spinner size="sm" /> : <><Mail size={16} />{t('passwordRecovery.send')}</>}</button>
    </>}
    {backButton}
  </form>;
}

'use client';

import React, { useState, useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  LogIn,
  KeyRound,
  Mail,
  AlertCircle,
  CheckCircle,
  Lock,
} from 'lucide-react';
import { getPostLoginRedirectPath } from '@/lib/auth-redirect';
import { SicaLogo } from '@/components/sica-logo';
import { supabase } from '@/lib/supabase-browser';
import { SITE_URL } from '@/lib/site-url';

// Three top-level modes the page can render:
//   - login (default)
//   - forgot (anonymous forgot-password request)
//   - recovery (user clicked the link in the reset email; we detected
//     a recovery session via the URL fragment and show the set-new-
//     password form)
//
// Recovery detection: Supabase's browser client has `detectSessionInUrl`
// enabled by default, so when the user lands on /student/login?reset=1
// from the email link, the URL fragment carries
// `#access_token=...&refresh_token=...&type=recovery...`. The client
// parses that automatically and `useAuth().session` becomes the
// recovery session. We check `searchParams.get('reset') === '1'` to
// know we're on that path (we don't rely on parsing the fragment
// ourselves — the auth context does that work).
export default function StudentLoginPage() {
  const { signIn, user, isConfigured, loading: authLoading } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isResetFlow = searchParams.get('reset') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Phase 100: pre-login forgot-password view (anonymous).
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotBusy, setForgotBusy] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // Phase 100: post-email-link set-new-password view. Shows when the
  // URL is /student/login?reset=1 AND Supabase has hydrated a recovery
  // session (authLoading=false and user is set).
  const [recoveryBusy, setRecoveryBusy] = useState(false);
  const [recoveryDone, setRecoveryDone] = useState(false);

  // Once the recovery password has been set, sign out so the student
  // lands back at the fresh login form (their recovery session is one-
  // shot, the next page-load should be a normal sign-in).
  useEffect(() => {
    if (!recoveryDone) return;
    let cancelled = false;
    (async () => {
      if (!supabase) return;
      await supabase.auth.signOut();
      if (cancelled) return;
      // Clear the ?reset=1 from the URL so a back-button doesn't
      // re-trigger the form on a stale fragment.
      router.replace('/student/login');
    })();
    return () => {
      cancelled = true;
    };
  }, [recoveryDone, router]);

  // Existing signed-in redirect — skip during the recovery flow so we
  // don't yank the user away from the set-new-password form while
  // their recovery session is being used.
  useEffect(() => {
    if (isResetFlow) return;
    if (user && !redirecting) {
      setRedirecting(true);
      router.replace(getPostLoginRedirectPath(user));
    }
  }, [user, router, redirecting, isResetFlow]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);
    if (error) {
      setError(error);
      setLoading(false);
      return;
    }
    // Redirect handled by useEffect above when user state updates
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !email.includes('@')) {
      setError(t('studentLogin.forgotError'));
      return;
    }
    setForgotBusy(true);
    try {
      if (!supabase) {
        setError(t('studentLogin.configMissing'));
        return;
      }
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: `${SITE_URL}/student/login?reset=1` },
      );
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setForgotSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('studentLogin.forgotError'));
    } finally {
      setForgotBusy(false);
    }
  };

  const cancelForgot = () => {
    setForgotMode(false);
    setForgotSent(false);
    setError('');
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError(t('studentLogin.recoveryErrorLength'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('studentLogin.recoveryErrorMismatch'));
      return;
    }
    if (!supabase) {
      setError(t('studentLogin.configMissing'));
      return;
    }

    setRecoveryBusy(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setRecoveryDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('studentLogin.recoveryErrorGeneric'));
    } finally {
      setRecoveryBusy(false);
    }
  };

  // Decide what to render. Order matters: recovery takes precedence
  // when the URL is /student/login?reset=1 AND Supabase has hydrated
  // a session from the email link. While auth is still loading, show
  // a spinner so we don't flash the login form for one frame.
  const showRecovery = isResetFlow && (!!user || (!authLoading && !user));

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <SicaLogo className="h-10 w-auto mx-auto" />
          </div>
          <h1 className="text-[#1B2A4A] text-2xl font-bold">{t('studentLogin.title')}</h1>
          <p className="text-[#4B5563] mt-1 text-sm">{t('studentLogin.subtitle')}</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-gray-200 p-8">
          {!isConfigured && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 text-sm mb-5">
              {t('studentLogin.configMissing')}
            </div>
          )}

          {authLoading && isResetFlow ? (
            <div className="flex items-center justify-center gap-2 py-6 text-[#4B5563] text-sm">
              <Spinner size="sm" />
              {t('studentLogin.recoveryLoading')}
            </div>
          ) : showRecovery ? (
            // Phase 100: set-new-password view, after the user clicks
            // the email link. Their recovery session has hydrated
            // either as a real user (success — we updateUser) or as
            // null (the link is expired/invalid — show an error and
            // a "request a new link" path).
            <form onSubmit={handleRecoverySubmit} className="space-y-5">
              {!user ? (
                <>
                  <div className="flex items-center gap-2 text-[#1B2A4A]">
                    <AlertCircle size={20} className="text-[#9B1B30]" />
                    <h2 className="text-base font-semibold">
                      {t('studentLogin.recoveryExpiredTitle')}
                    </h2>
                  </div>
                  <p className="text-sm text-[#4B5563] -mt-2">
                    {t('studentLogin.recoveryExpiredBody')}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotMode(true);
                      // Strip ?reset=1 so the user isn't bounced back
                      // here on every render.
                      router.replace('/student/login');
                    }}
                    className="w-full bg-[#9B1B30] text-white py-2.5 font-medium hover:bg-[#7a1525] transition-colors flex items-center justify-center gap-2"
                  >
                    <Mail size={18} />
                    {t('studentLogin.recoveryRequestNew')}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-[#1B2A4A]">
                    <Lock size={20} className="text-[#9B1B30]" />
                    <h2 className="text-base font-semibold">
                      {t('studentLogin.recoveryTitle')}
                    </h2>
                  </div>
                  <p className="text-sm text-[#4B5563] -mt-2">
                    {t('studentLogin.recoveryBody', { email: user.email ?? '' })}
                  </p>
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
                      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                      {t('studentLogin.recoveryNewPassword')}
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                        autoFocus
                        autoComplete="new-password"
                        placeholder={t('studentLogin.recoveryNewPasswordPlaceholder')}
                        className="w-full px-4 py-2.5 border border-gray-300 text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30] text-sm pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1B2A4A]"
                        aria-label={t('studentLogin.password')}
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                      {t('studentLogin.recoveryConfirmPassword')}
                    </label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      placeholder={t('studentLogin.recoveryConfirmPasswordPlaceholder')}
                      className="w-full px-4 py-2.5 border border-gray-300 text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30] text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={recoveryBusy}
                    className="w-full bg-[#9B1B30] text-white py-2.5 font-medium hover:bg-[#7a1525] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {recoveryBusy ? (
                      <Spinner size="sm" className="text-white" />
                    ) : (
                      <>
                        <Lock size={18} />
                        {t('studentLogin.recoverySubmit')}
                      </>
                    )}
                  </button>
                </>
              )}
            </form>
          ) : forgotMode ? (
            <form onSubmit={handleForgotSubmit} className="space-y-5">
              {!forgotSent ? (
                <>
                  <div className="flex items-center gap-2 text-[#1B2A4A]">
                    <KeyRound size={20} className="text-[#9B1B30]" />
                    <h2 className="text-base font-semibold">
                      {t('studentLogin.forgotTitle')}
                    </h2>
                  </div>
                  <p className="text-sm text-[#4B5563] -mt-2">
                    {t('studentLogin.forgotBody')}
                  </p>
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
                      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                      {t('studentLogin.email')}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder={t('studentLogin.emailPlaceholder')}
                      className="w-full px-4 py-2.5 border border-gray-300 text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30] text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={forgotBusy}
                    className="w-full bg-[#9B1B30] text-white py-2.5 font-medium hover:bg-[#7a1525] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {forgotBusy ? (
                      <Spinner size="sm" className="text-white" />
                    ) : (
                      <>
                        <Mail size={18} />
                        {t('studentLogin.forgotSubmit')}
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 text-sm flex items-start gap-2">
                    <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <p>{t('studentLogin.forgotSent', { email })}</p>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={cancelForgot}
                disabled={forgotBusy}
                className="w-full text-sm text-gray-500 hover:text-[#1B2A4A] py-2"
              >
                {t('studentLogin.forgotBack')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                  {t('studentLogin.email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={t('studentLogin.emailPlaceholder')}
                  className="w-full px-4 py-2.5 border border-gray-300 text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                  {t('studentLogin.password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder={t('studentLogin.passwordPlaceholder')}
                    className="w-full px-4 py-2.5 border border-gray-300 text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30] text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1B2A4A]"
                    aria-label={t('studentLogin.password')}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setForgotMode(true);
                    setError('');
                  }}
                  className="text-sm text-[#9B1B30] hover:text-[#7a1525] font-medium"
                >
                  {t('studentLogin.forgotLink')}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#9B1B30] text-white py-2.5 font-semibold text-sm hover:bg-[#7A1526] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="text-white" />
                    {t('studentLogin.signingIn')}
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    {t('studentLogin.signIn')}
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {!showRecovery && (
          <div className="mt-6 text-center text-sm text-[#4B5563]">
            {t('studentLogin.noAccount')}{' '}
            <Link href="/student/register" className="text-[#9B1B30] font-medium hover:underline">
              {t('studentLogin.createAccount')}
            </Link>
          </div>
        )}

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-[#4B5563] text-sm hover:text-[#1B2A4A] transition-colors">
            {t('studentLogin.backToSite')}
          </Link>
        </div>
      </div>
    </div>
  );
}
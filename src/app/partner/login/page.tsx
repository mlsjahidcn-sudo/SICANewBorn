'use client';

import React, { useState, useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, LogIn, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { getPostLoginRedirectPath } from '@/lib/auth-redirect';

export default function PartnerLoginPage() {
  const router = useRouter();
  const { signIn, user, isConfigured } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already signed in, check whether they're a partner.
  useEffect(() => {
    if (!user) return;
    // Quick role check first: if they're not a partner, don't even try
    // the partner API — send them to the right portal via the shared helper.
    const role = (user.user_metadata?.role as string | undefined) ?? 'student';
    if (role !== 'partner') {
      router.replace(getPostLoginRedirectPath(user));
      return;
    }

    let cancelled = false;
    (async () => {
      const { supabase } = await import('@/lib/supabase-browser');
      if (!supabase) {
        if (!cancelled) router.push('/partner/login');
        return;
      }
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        if (!cancelled) router.push('/partner/login');
        return;
      }
      const res = await fetch('/api/partner/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (cancelled) return;
      if (res.ok) {
        router.push('/partner');
      } else {
        setError(t('partnerLogin.notLinkedError'));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, router, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError(signInError);
      setLoading(false);
      return;
    }

    // Auth succeeded — verify the user has a partner record before letting them in.
    const { supabase } = await import('@/lib/supabase-browser');
    if (!supabase) {
      setError(t('partnerLogin.supabaseNotConfigured'));
      setLoading(false);
      return;
    }
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setError(t('partnerLogin.sessionNoToken'));
      setLoading(false);
      return;
    }
    const res = await fetch('/api/partner/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      router.push('/partner');
    } else {
      const body = await res.json().catch(() => ({}));
      setError(
        body.error || t('partnerLogin.notLinkedFallback'),
      );
      // Sign out so they don't have a half-authenticated state.
      await supabase.auth.signOut();
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#9B1B30] mb-4">
            <Users className="text-white" size={28} />
          </div>
          <h1 className="text-[#1B2A4A] text-2xl font-bold">{t('partnerLogin.title')}</h1>
          <p className="text-[#4B5563] mt-1 text-sm">{t('partnerLogin.subtitle')}</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-gray-200 p-8">
          {!isConfigured && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 text-sm mb-5">
              {t('partnerLogin.configMissing')}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                {t('partnerLogin.emailLabel')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t('partnerLogin.emailPlaceholder')}
                className="w-full px-4 py-2.5 border border-gray-300 text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                {t('partnerLogin.passwordLabel')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={t('partnerLogin.passwordPlaceholder')}
                  className="w-full px-4 py-2.5 border border-gray-300 text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30] text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1B2A4A]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#9B1B30] text-white py-2.5 font-medium hover:bg-[#7a1525] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Spinner size="sm" className="text-white" />
              ) : (
                <>
                  <LogIn size={18} />
                  {t('partnerLogin.signIn')}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm">
              {t('partnerLogin.becomePartner')}{' '}
              <Link href="/partner/register" className="text-[#9B1B30] hover:text-[#7a1525] font-medium">
                {t('partnerLogin.applyHere')}
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-gray-500 hover:text-[#1B2A4A] text-sm flex items-center justify-center gap-1">
              {t('partnerLogin.backToPublicSite')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

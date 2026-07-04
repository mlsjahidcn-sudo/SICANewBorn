'use client';

import React, { useState, useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/lib/auth-context';
import { SicaLogo } from '@/components/sica-logo';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { getPostLoginRedirectPath } from '@/lib/auth-redirect';
import { useI18n } from '@/lib/i18n';

export default function AdminLoginPage() {
  const { signIn, user, isConfigured } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (user && !redirecting) {
      setRedirecting(true);
      // Use the shared role-based redirect so a partner or student who
      // happened to land on the admin login form still goes to the right
      // portal instead of getting an auth wall.
      router.replace(getPostLoginRedirectPath(user));
    }
  }, [user, router, redirecting]);

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

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <SicaLogo className="h-10 w-auto mx-auto" />
          </div>
          <h1 className="text-[#1B2A4A] text-2xl font-bold">{t('adminAuth.loginTitle')}</h1>
          <p className="text-[#4B5563] mt-1 text-sm">{t('adminAuth.loginSubtitle')}</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-gray-200 p-8">
          {!isConfigured && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 text-sm mb-5">
              {t('adminAuth.configMissing')}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                {t('adminAuth.emailLabel')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t('adminAuth.emailPlaceholder')}
                className="w-full px-4 py-2.5 border border-gray-300 text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                {t('adminAuth.passwordLabel')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={t('adminAuth.passwordPlaceholderLogin')}
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
              className="w-full bg-[#9B1B30] text-white py-2.5 font-semibold text-sm hover:bg-[#7A1526] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Spinner size="sm" className="text-white" />
              ) : (
                <>
                  <LogIn size={16} />
                  {t('adminAuth.signIn')}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[#4B5563]">
            {t('adminAuth.noAccount')}{' '}
            <Link href="/admin/register" className="text-[#9B1B30] font-medium hover:underline">
              {t('adminAuth.createAccount')}
            </Link>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-[#4B5563] text-sm hover:text-[#1B2A4A] transition-colors">
            {t('adminAuth.backToSite')}
          </Link>
        </div>
      </div>
    </div>
  );
}

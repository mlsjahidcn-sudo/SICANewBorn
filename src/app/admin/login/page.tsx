'use client';

import React, { useState, useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/lib/auth-context';
import { SicaLogo } from '@/components/sica-logo';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { getPostLoginRedirectPath } from '@/lib/auth-redirect';

export default function AdminLoginPage() {
  const { signIn, user, isConfigured } = useAuth();
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
    <div className="min-h-screen bg-[#1B2A4A] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <SicaLogo className="h-10 w-auto mx-auto" />
          </div>
          <h1 className="text-white text-2xl font-bold">SICA Admin</h1>
          <p className="text-white/50 mt-1 text-sm">Sign in to your admin account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8">
          {!isConfigured && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 text-sm mb-5">
              Supabase is not configured. Please set COZE_SUPABASE_URL and COZE_SUPABASE_ANON_KEY environment variables to enable authentication.
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
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@sica.edu"
                className="w-full px-4 py-2.5 border border-gray-300 text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
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
                  SIGN IN
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[#4B5563]">
            Don&apos;t have an account?{' '}
            <Link href="/admin/register" className="text-[#9B1B30] font-medium hover:underline">
              Create Account
            </Link>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-white/40 text-sm hover:text-white/70 transition-colors">
            &larr; Back to SICA Website
          </Link>
        </div>
      </div>
    </div>
  );
}

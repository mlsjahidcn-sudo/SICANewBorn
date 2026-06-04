'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus, ShieldOff } from 'lucide-react';
import { SicaLogo } from '@/components/sica-logo';

function AdminRegisterForm() {
  const { signUp, user, isConfigured } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('token');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteValid, setInviteValid] = useState<null | boolean>(null);

  const [redirecting, setRedirecting] = useState(false);

  // Validate the invite token on mount (and when token changes).
  useEffect(() => {
    if (!inviteToken) {
      setInviteValid(false);
      return;
    }
    let cancelled = false;
    fetch(`/api/admin/check-invite?token=${encodeURIComponent(inviteToken)}`)
      .then((r) => (cancelled ? null : r.json().then((j) => ({ ok: r.ok, j }))))
      .then((result) => {
        if (cancelled || !result) return;
        setInviteValid(result.ok && result.j?.valid === true);
      })
      .catch(() => {
        if (!cancelled) setInviteValid(false);
      });
    return () => {
      cancelled = true;
    };
  }, [inviteToken]);

  useEffect(() => {
    if (user && !redirecting) {
      setRedirecting(true);
      router.replace('/admin/dashboard');
    }
  }, [user, router, redirecting]);

  if (inviteValid === null) {
    return (
      <div className="min-h-screen bg-[#1B2A4A] flex items-center justify-center px-4">
        <div className="text-white/60 text-sm">Checking invite...</div>
      </div>
    );
  }

  if (inviteValid === false) {
    return (
      <div className="min-h-screen bg-[#1B2A4A] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#9B1B30] mb-4">
              <ShieldOff className="text-white" size={28} />
            </div>
            <h1 className="text-white text-2xl font-bold">Invite Required</h1>
            <p className="text-white/60 mt-2 text-sm">
              Admin registration is by invitation only. Ask an existing administrator to send you an invite link.
            </p>
          </div>
          <div className="bg-white p-8 text-center">
            <Link
              href="/admin/login"
              className="inline-block text-[#9B1B30] hover:text-[#7A1526] font-medium"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, fullName, 'admin');
    if (error) {
      setError(error);
      setLoading(false);
      return;
    }
  };

  return (
    <div className="min-h-screen bg-[#1B2A4A] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mb-4">
            <SicaLogo className="h-10 w-auto mx-auto" />
          </div>
          <h1 className="text-white text-2xl font-bold">Create Admin Account</h1>
          <p className="text-white/50 mt-1 text-sm">Register a new administrator account</p>
        </div>

        <div className="bg-white p-8">
          {!isConfigured && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 text-sm mb-5">
              Supabase is not configured. Please set COZE_SUPABASE_URL and COZE_SUPABASE_ANON_KEY environment variables to enable authentication.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="John Smith"
                className="w-full px-4 py-2.5 border border-gray-300 text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30] text-sm"
              />
            </div>

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
                  placeholder="At least 6 characters"
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

            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repeat your password"
                className="w-full px-4 py-2.5 border border-gray-300 text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30] text-sm"
              />
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
                  <UserPlus size={16} />
                  CREATE ACCOUNT
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[#4B5563]">
            Already have an account?{' '}
            <Link href="/admin/login" className="text-[#9B1B30] font-medium hover:underline">
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-white/40 text-sm hover:text-white/70 transition-colors">
            &larr; Back to SICA Website
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1B2A4A]" />}>
      <AdminRegisterForm />
    </Suspense>
  );
}

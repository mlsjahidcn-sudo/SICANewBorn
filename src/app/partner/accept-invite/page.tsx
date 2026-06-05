'use client';

/**
 * Partner: accept team invite.
 *
 * Public (no auth required) page reached from the email link. Flow:
 *  1. The URL has ?token=...  (and ?setup=1 if the invitee is a new user)
 *  2. We validate the token client-side (just shape; the server
 *     re-validates on POST)
 *  3. If setup=1, show a "set your password" form, then call
 *     POST /api/partner/accept-invite with the new password
 *  4. If the invitee is an existing user, show a "sign in" form
 *     and then call POST /api/partner/accept-invite after sign-in
 *  5. On success, redirect to /partner
 */
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Loader2, AlertCircle, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';

function AcceptInviteInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, isConfigured } = useAuth();
  const token = searchParams.get('token') || '';
  const setupMode = searchParams.get('setup') === '1';

  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Pre-fill email from token (base64url JSON)
  useEffect(() => {
    try {
      const json = atob(token.replace(/-/g, '+').replace(/_/g, '/'));
      const parsed = JSON.parse(json);
      if (typeof parsed.email === 'string') {
        setEmail(parsed.email);
      }
    } catch {
      // ignore — will surface the error on submit
    }
  }, [token]);

  // Step 1: setup the password (for new users)
  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/partner/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || 'Failed to accept invite');
      }
      setDone(true);
      // After 1.5s, redirect to login so they can sign in with their new password
      setTimeout(() => router.push('/partner/login'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: existing user signs in + we accept the invite on their behalf
  const handleSignInAndAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isConfigured) {
      setError('Authentication not configured');
      return;
    }
    setLoading(true);
    try {
      const { error: signInErr } = await signIn(email, signInPassword);
      if (signInErr) {
        setError(signInErr);
        return;
      }
      const res = await fetch('/api/partner/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || 'Failed to accept invite');
      }
      setDone(true);
      setTimeout(() => router.push('/partner'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Accept failed');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-gray-200 p-8 text-center space-y-3">
          <AlertCircle className="h-10 w-10 text-red-600 mx-auto" />
          <h1 className="text-[#1B2A4A] text-xl font-bold">Invalid invite link</h1>
          <p className="text-sm text-gray-600">This link is missing a token. Ask your partner admin for a new invite.</p>
          <Link href="/partner/login" className="text-[#9B1B30] hover:underline text-sm font-medium">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-gray-200 p-8 text-center space-y-3">
          <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" />
          <h1 className="text-[#1B2A4A] text-xl font-bold">You&apos;re in!</h1>
          <p className="text-sm text-gray-600">Redirecting you to the partner portal…</p>
        </div>
      </div>
    );
  }

  if (setupMode) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#9B1B30] mb-4">
              <User className="text-white" size={28} />
            </div>
            <h1 className="text-[#1B2A4A] text-2xl font-bold">Welcome to SICA</h1>
            <p className="text-[#4B5563] mt-1 text-sm">
              Set your password to accept the team invitation.
            </p>
          </div>
          <div className="bg-white border border-gray-200 p-8">
            <form onSubmit={handleSetup} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                  Email
                </label>
                <Input value={email} disabled className="bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                  Password (min 8 chars)
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                  autoComplete="new-password"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#9B1B30] hover:bg-[#7a1525]"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4 mr-2" />}
                Set password &amp; continue
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#9B1B30] mb-4">
            <User className="text-white" size={28} />
          </div>
          <h1 className="text-[#1B2A4A] text-2xl font-bold">Join your team</h1>
          <p className="text-[#4B5563] mt-1 text-sm">
            Sign in to accept the team invitation.
          </p>
        </div>
        <div className="bg-white border border-gray-200 p-8">
          <form onSubmit={handleSignInAndAccept} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1.5">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                Password
              </label>
              <Input
                type="password"
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#9B1B30] hover:bg-[#7a1525]"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4 mr-2" />}
              Sign in &amp; accept
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function PartnerAcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Spinner size="md" className="text-[#1B2A4A]" />
        </div>
      }
    >
      <AcceptInviteInner />
    </Suspense>
  );
}

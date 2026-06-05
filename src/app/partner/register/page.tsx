'use client';

/**
 * Partner self-signup (Phase 3, partner portal v2).
 *
 * Real email + password signup — same shape as /student/register and
 * /admin/register. After successful signUp we call /api/partner/signup
 * to create the partners row + partner_team_members row, both with
 * status='pending'. The admin must approve before the partner can use
 * the portal.
 */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, CheckCircle2, Send, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/lib/auth-context';

export default function PartnerRegisterPage() {
  const router = useRouter();
  const { signUp, isConfigured } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    password: '',
    phone: '',
    country: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // If user is already signed in, prefill the email field.
  useEffect(() => {
    // no-op — we let them sign up with a new email
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!isConfigured) {
      setError('Authentication not configured. Please contact SICA support.');
      return;
    }

    setLoading(true);
    try {
      // 1. Sign up via Supabase auth
      const { error: authErr } = await signUp(
        formData.email.trim(),
        formData.password,
        formData.fullName.trim(),
        'partner',
      );
      if (authErr) {
        setError(authErr);
        return;
      }

      // 2. Create the partner record via our API
      //    We need the user_id from the auth response. signUp()
      //    in our auth-context doesn't return it — fetch the
      //    current user instead.
      const { supabase } = await import('@/lib/supabase-browser');
      if (!supabase) {
        setError('Supabase client not available');
        return;
      }
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) {
        setError(
          'Signup succeeded but we couldn\'t read the user. Please try signing in directly — your application is on file.',
        );
        return;
      }

      const res = await fetch('/api/partner/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_user_id: userData.user.id,
          company_name: formData.companyName.trim(),
          contact_person: formData.fullName.trim(),
          phone: formData.phone.trim(),
          country: formData.country.trim(),
          notes: formData.notes.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to create partner record');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-600 mb-4">
              <CheckCircle2 className="text-white" size={28} />
            </div>
            <h1 className="text-[#1B2A4A] text-2xl font-bold">Application Received</h1>
            <p className="text-[#4B5563] mt-2 text-sm">
              Thanks for applying to become a SICA partner. Our partnerships team
              will review your application and email you at{' '}
              <span className="font-medium">{formData.email}</span> within 2 business
              days.
            </p>
          </div>
          <div className="bg-white border border-gray-200 p-8 text-center space-y-3">
            <Link
              href="/partner/login"
              className="block text-[#9B1B30] hover:text-[#7a1525] font-medium"
            >
              Already approved? Sign in
            </Link>
            <Link
              href="/"
              className="block text-gray-500 hover:text-[#1B2A4A] text-sm"
            >
              ← Back to SICA Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#9B1B30] mb-4">
            <Users className="text-white" size={28} />
          </div>
          <h1 className="text-[#1B2A4A] text-2xl font-bold">Become a SICA Partner</h1>
          <p className="text-[#4B5563] mt-1 text-sm">
            Create your account. We&apos;ll review and approve within 2 business days.
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                Your full name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Jane Doe"
                autoComplete="name"
                className="w-full px-4 py-2.5 border border-gray-300 text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                Company / Organization Name *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                placeholder="Your company name"
                className="w-full px-4 py-2.5 border border-gray-300 text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                Email * <span className="text-xs text-gray-500">(you&apos;ll use this to sign in)</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="contact@example.com"
                autoComplete="email"
                className="w-full px-4 py-2.5 border border-gray-300 text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                Password * <span className="text-xs text-gray-500">(min 8 chars)</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                placeholder="Choose a password"
                autoComplete="new-password"
                className="w-full px-4 py-2.5 border border-gray-300 text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30] text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+1 234 567 890"
                  autoComplete="tel"
                  className="w-full px-4 py-2.5 border border-gray-300 text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                  Country *
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  placeholder="Your country"
                  autoComplete="country-name"
                  className="w-full px-4 py-2.5 border border-gray-300 text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                Tell us about your organization
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Your student base, markets, and what you hope to do with SICA."
                className="w-full px-4 py-2.5 border border-gray-300 text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30] text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#9B1B30] text-white py-2.5 font-medium hover:bg-[#7a1525] flex items-center justify-center gap-2"
            >
              {loading ? (
                <Spinner size="sm" className="text-white" />
              ) : (
                <>
                  <Send size={18} />
                  Create account
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200 text-center space-y-2">
            <p className="text-gray-600 text-sm">
              Already approved?{' '}
              <Link href="/partner/login" className="text-[#9B1B30] hover:text-[#7a1525] font-medium">
                Sign in
              </Link>
            </p>
            <Link href="/" className="text-gray-500 hover:text-[#1B2A4A] text-sm flex items-center justify-center gap-1">
              <ArrowLeft size={14} /> Back to Public Site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

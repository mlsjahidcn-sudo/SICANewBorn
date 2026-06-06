'use client';

import { useState, useEffect } from 'react';
import { User, Bell, Lock, Globe, Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { supabase, isSupabaseConfigured as isSupabaseBrowserConfigured } from '@/lib/supabase-browser';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';

type Status =
  | { kind: 'idle' }
  | { kind: 'pending' }
  | { kind: 'ok'; message: string }
  | { kind: 'err'; message: string };

export default function StudentSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { locale, setLocale, t } = useI18n();
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [showDelete, setShowDelete] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Clear success/error banner after a few seconds so the user
  // doesn't stare at stale messages on every action.
  useEffect(() => {
    if (status.kind === 'ok' || status.kind === 'err') {
      const timer = setTimeout(() => setStatus({ kind: 'idle' }), 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleChangePassword = async () => {
    if (!user?.email) return;
    setStatus({ kind: 'pending' });
    if (!isSupabaseBrowserConfigured || !supabase) {
      setStatus({ kind: 'err', message: 'Auth not configured' });
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/student/login?reset=1`,
    });
    if (error) {
      setStatus({ kind: 'err', message: error.message });
    } else {
      setResetSent(true);
      setStatus({ kind: 'ok', message: 'Password reset email sent — check your inbox.' });
    }
  };

  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 animate-pulse rounded-none w-48" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-gray-200 animate-pulse rounded-none" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Layout redirects on missing user
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">{t('settings.title') || 'Settings'}</h1>
        <p className="text-[#4B5563] mt-1">{t('settings.subtitle') || 'Manage your account preferences'}</p>
      </div>

      {status.kind !== 'idle' && (
        <div
          className={[
            'px-4 py-3 text-sm flex items-start gap-2 border',
            status.kind === 'ok' ? 'bg-green-50 border-green-200 text-green-800' : '',
            status.kind === 'err' ? 'bg-red-50 border-red-200 text-red-700' : '',
            status.kind === 'pending' ? 'bg-blue-50 border-blue-200 text-blue-800' : '',
          ].join(' ')}
        >
          {status.kind === 'pending' ? (
            <Loader2 size={16} className="mt-0.5 flex-shrink-0 animate-spin" />
          ) : status.kind === 'ok' ? (
            <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          )}
          <span>
            {status.kind === 'pending' ? 'Working…' : status.message}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account */}
        <Card className="rounded-none">
          <CardHeader>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-[#1B2A4A]" />
              <div>
                <CardTitle>{t('settings.account') || 'Account'}</CardTitle>
                <CardDescription>Your sign-in details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-[#1B2A4A]">Email Address</p>
                <p className="text-sm text-[#4B5563] truncate" title={user.email ?? ''}>
                  {user.email ?? '—'}
                </p>
              </div>
              <span className="text-xs text-gray-500 flex-shrink-0">Read-only</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-[#1B2A4A]">Password</p>
                <p className="text-sm text-[#4B5563]">
                  {resetSent ? 'Reset link sent to your email' : 'Send a reset link to your email'}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-none"
                onClick={handleChangePassword}
                disabled={status.kind === 'pending'}
              >
                {status.kind === 'pending' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  'Send reset link'
                )}
              </Button>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-[#4B5563]">
                Need to close your account? Email{' '}
                <a
                  href="mailto:support@sica.com.cn"
                  className="text-[#9B1B30] font-semibold hover:underline"
                >
                  support@sica.com.cn
                </a>{' '}
                — we'll process deletion within 7 business days.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications — kept as a "managed by your account" hint until
            we build the real preferences table. We don't show fake
            switches anymore. */}
        <Card className="rounded-none">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-[#1B2A4A]" />
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>When SICA reaches out to you</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[#4B5563]">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#1B2A4A]" />
              <span>
                Status changes, document requests, and decisions are sent to{' '}
                <span className="font-semibold text-[#1B2A4A]">{user.email}</span>.
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Fine-grained per-channel preferences (in-app vs. email, per status type) are
              coming soon. Until then you'll receive every notification by email and in your{' '}
              <a href="/student/notifications" className="text-[#9B1B30] hover:underline font-semibold">
                in-app inbox
              </a>
              .
            </p>
          </CardContent>
        </Card>

        {/* Language & Region — actually wired to the i18n context */}
        <Card className="rounded-none">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-[#1B2A4A]" />
              <div>
                <CardTitle>Language & Region</CardTitle>
                <CardDescription>Choose your language</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="font-medium text-[#1B2A4A]">Language</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={locale === 'en' ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-none"
                  onClick={() => setLocale('en')}
                >
                  English
                </Button>
                <Button
                  variant={locale === 'zh' ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-none"
                  onClick={() => setLocale('zh')}
                >
                  中文
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This sets your preferred language across the SICA site. Some admin-authored
                content (guides, news) only ships in English at this time.
              </p>
            </div>
            <div>
              <Label className="font-medium text-[#1B2A4A]">Timezone</Label>
              <p className="text-sm text-[#4B5563] mt-1">
                {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Detected from your browser. Dates in the portal are shown in your local time.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security — Supabase-managed. We don't fake 2FA / active sessions. */}
        <Card className="rounded-none">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-[#1B2A4A]" />
              <div>
                <CardTitle>Security</CardTitle>
                <CardDescription>Authentication is managed by our auth provider</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[#4B5563]">
            <p>
              Two-factor authentication, active session management, and account recovery are
              handled by our authentication provider. Use the password reset link above to
              change your password, or contact{' '}
              <a
                href="mailto:support@sica.com.cn"
                className="text-[#9B1B30] font-semibold hover:underline"
              >
                support@sica.com.cn
              </a>{' '}
              for help locking your account.
            </p>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Close account?"
        message="Account deletion is irreversible and must be requested via support. We'll email you a confirmation link."
        confirmText="Got it"
        onConfirm={() => setShowDelete(false)}
        onCancel={() => setShowDelete(false)}
        variant="info"
      />
    </div>
  );
}

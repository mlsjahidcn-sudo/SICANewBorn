'use client';

/**
 * Partner: team management (owner only).
 *
 * Shows the team list, lets the owner invite a new member, suspend /
 * reactivate / remove a member. Members are read-only and can't
 * reach this page (server-side gate).
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserPlus,
  UserCog,
  Mail,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Clock,
  KeyRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiFetchJson, ApiError } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';

interface TeamMember {
  id: string;
  user_id: string;
  email: string | null;
  role: 'owner' | 'member';
  status: string;
  invited_by: string | null;
  invited_at: string | null;
  joined_at: string | null;
  suspended_at: string | null;
  suspension_reason: string | null;
  created_at: string;
  // Phase 12: hydrated from auth.users via the partner-user-lookup
  // helper. null when the user has never signed in (pending invite,
  // just-created, or hard-deleted auth.users row). The team page
  // shows "Last seen: 3 days ago" in the row meta line.
  lastSignInAt: string | null;
}

// Map a DB status enum to the display string (DB enum stays raw;
// we only translate the visible badge text).
const STATUS_COLOR: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  pending_invite: 'bg-blue-100 text-blue-800',
  suspended: 'bg-orange-100 text-orange-800',
};

export default function PartnerTeamPage() {
  const router = useRouter();
  const { t } = useI18n();
  // Phase 11: need the current user's id to (a) detect "is this
  // owner-row mine?" for the Transfer Ownership button, and (b)
  // derive the list of valid transfer targets (everyone except
  // me, and only if they're active). user.id is on the Supabase
  // User object from useAuth().
  const { user } = useAuth();
  const myUserId = user?.id ?? null;
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Org identifier for the page header. Pulled from /api/partner/me
  // so the team page reads "Team · Ednex" instead of a bare "Team" —
  // lets an owner with multiple org tabs (or a member visiting the
  // page) immediately see which org's team they're looking at. The
  // sidebar already shows this, but repeating it in the page header
  // is the convention used by admin/portals. Fails soft: null = use
  // the bare "Team" label.
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [now, setNow] = useState<number>(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetchJson<{ partner: { company_name?: string | null } }>(
          '/api/partner/me',
        );
        if (!cancelled) {
          setCompanyName(res?.partner?.company_name ?? null);
        }
      } catch {
        // Soft fail — header just falls back to bare "Team".
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  // Phase 5: tabbed invite modal. 'email' = send a Resend invite
  // email with an accept-link (existing flow). 'password' =
  // create the auth user with an owner-chosen password and skip
  // the email round-trip entirely (new flow). Default to 'email'
  // so existing behavior is unchanged when the user just opens
  // the modal.
  const [inviteMode, setInviteMode] = useState<'email' | 'password'>('email');
  const [passwordEmail, setPasswordEmail] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [passwordFullName, setPasswordFullName] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);
  // After a successful direct-create, show the email + password
  // once so the owner can copy them and hand them to the new
  // member. Cleared when they close the modal.
  const [createdCreds, setCreatedCreds] = useState<{ email: string; password: string } | null>(null);
  const [copiedField, setCopiedField] = useState<'email' | 'password' | null>(null);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  // Phase 1.7: per-row resend feedback. We track the last successful
  // resend so the row can show "Invite resent" briefly after a
  // click. Auto-clears after a few seconds.
  const [resendSuccess, setResendSuccess] = useState<{ id: string; at: number } | null>(null);
  useEffect(() => {
    if (!resendSuccess) return;
    const timer = setTimeout(() => setResendSuccess(null), 4000);
    return () => clearTimeout(timer);
  }, [resendSuccess]);
  const [removeConfirmId, setRemoveConfirmId] = useState<string | null>(null);
  // Phase 8: reset-password flow. The owner clicks the button,
  // a modal asks for a new password (with a "generate" helper),
  // on success the modal shows the email + new password once
  // for the owner to copy. Cleared on close.
  const [resetTargetId, setResetTargetId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetBusy, setResetBusy] = useState(false);
  const [resetResult, setResetResult] = useState<{ email: string; password: string } | null>(null);
  // Phase 11: suspend flow. Soft-removes a member by flipping
  // status='suspended' + stamping suspended_at + suspension_reason.
  // The member can't sign in anymore (requireTeamMember refuses
  // status !== 'active') and their data writes fail at the RLS
  // layer (is_partner_team_member filters on status='active').
  // Preferred over Remove when the owner might want to re-activate
  // the member later.
  const [suspendTargetId, setSuspendTargetId] = useState<string | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendBusy, setSuspendBusy] = useState(false);
  // Phase 11: reactivate flow. Un-suspends a member by clearing
  // status='suspended' + suspended_at + suspension_reason.
  const [reactivateTargetId, setReactivateTargetId] = useState<string | null>(null);
  const [reactivateBusy, setReactivateBusy] = useState(false);
  // Phase 11: ownership-transfer flow. The owner picks an active
  // member, the API demotes the current owner to member and
  // promotes the target. After success, the current owner's
  // session still works but the layout's role check will hide
  // the team sidebar item — we just re-fetch to refresh the
  // page state.
  const [transferTargetId, setTransferTargetId] = useState<string | null>(null);
  const [transferBusy, setTransferBusy] = useState(false);
  // transferOpen is true when the owner clicks "Transfer
  // Ownership" — the modal lists every active member except
  // the caller as a pickable target. Set false on close or
  // on successful transfer.
  const [transferOpen, setTransferOpen] = useState(false);
  // Per-row inline feedback for suspend/reactivate success, so the
  // row can show a short "Suspended" / "Reactivated" badge. Mirrors
  // the resendSuccess pattern above.
  const [suspendSuccess, setSuspendSuccess] = useState<{ id: string; at: number } | null>(null);
  useEffect(() => {
    if (!suspendSuccess) return;
    const timer = setTimeout(() => setSuspendSuccess(null), 4000);
    return () => clearTimeout(timer);
  }, [suspendSuccess]);
  const [reactivateSuccess, setReactivateSuccess] = useState<{ id: string; at: number } | null>(null);
  useEffect(() => {
    if (!reactivateSuccess) return;
    const timer = setTimeout(() => setReactivateSuccess(null), 4000);
    return () => clearTimeout(timer);
  }, [reactivateSuccess]);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);
  useEffect(() => {
    if (!transferSuccess) return;
    const timer = setTimeout(() => setTransferSuccess(null), 5000);
    return () => clearTimeout(timer);
  }, [transferSuccess]);

  // Phase 11: derive the list of valid transfer targets. We can
  // only transfer to (a) an active member, (b) who isn't us.
  // Re-derives on every team refresh so the modal stays in sync
  // after a re-fetch.
  const activeMembersExceptMe = team.filter(
    (m) => m.status === 'active' && m.user_id !== myUserId,
  );

  // Status enum → display label
  const STATUS_DISPLAY: Record<string, string> = {
    active: t('partnerTeam.statusActive'),
    pending_approval: t('partnerTeam.statusPendingApproval'),
    pending_invite: t('partnerTeam.statusPendingInvite'),
    suspended: t('partnerTeam.statusSuspended'),
  };

  // Role enum → display label
  const ROLE_DISPLAY: Record<string, string> = {
    owner: t('partnerTeam.roleOwner'),
    member: t('partnerTeam.roleMember'),
  };

  // Phase 12: relative time helper for "Last seen: 3 days ago".
  // Mirrors the pattern used on the notifications page (Phase 1.11).
  // Buckets:
  //   < 60s         → "just now"
  //   < 60m         → "Nm ago" (e.g. "12m ago")
  //   < 24h         → "Nh ago"  (e.g. "3h ago")
  //   < 7d          → "Nd ago"  (e.g. "2d ago")
  //   older         → absolute date
  const formatRelativeTime = (iso: string): string => {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return iso;
    const diffSec = Math.floor((now - then) / 1000);
    if (diffSec < 60) return t('partnerTeam.relativeJustNow');
    if (diffSec < 3600) return t('partnerTeam.relativeMinutesAgo', { count: Math.floor(diffSec / 60) });
    if (diffSec < 86_400) return t('partnerTeam.relativeHoursAgo', { count: Math.floor(diffSec / 3600) });
    if (diffSec < 604_800) return t('partnerTeam.relativeDaysAgo', { count: Math.floor(diffSec / 86_400) });
    return new Date(iso).toLocaleDateString();
  };

  // Phase 9: detect "non-owner landed on the team page directly"
  // before the API call fires. /api/partner/team is owner-only —
  // a team member who navigates here by URL would otherwise see
  // a 403 JSON error rendered as a red banner before the page
  // redirects them. We check the role via /api/partner/login-status
  // (which DOES support team members after the Phase 5b fix)
  // and render a friendly owner-only view instead.
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [notOwnerMessage, setNotOwnerMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await apiFetchJson<{ team: TeamMember[] }>('/api/partner/team');
      setTeam(res.team || []);
    } catch (err) {
      // For 403 (non-owner) and 401 (unauthenticated), don't
      // set the load error — we render the dedicated owner-only
      // view instead and let the auth-context redirect handle
      // unauthenticated users. Other errors get the normal banner.
      if (err instanceof ApiError && err.status === 403) {
        setNotOwnerMessage(t('partnerTeam.ownerOnlyMessage'));
      } else {
        setLoadError(err instanceof ApiError ? err.message : t('partnerTeam.errorLoad'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    // Pre-check the role so we can render the owner-only view
    // without flashing the load error on first render.
    let cancelled = false;
    (async () => {
      try {
        const status = await apiFetchJson<{
          partner: { id: string; status: string };
          teamMember: { role: 'owner' | 'member' } | null;
        }>('/api/partner/login-status');
        if (cancelled) return;
        setIsOwner(status.teamMember?.role === 'owner');
      } catch {
        // Fall through — the load() call below will surface the
        // error in the right place.
      }
      if (!cancelled) load();
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const sendInvite = async () => {
    setInviteBusy(true);
    setLoadError(null);
    try {
      const res = await apiFetchJson<{ inviteSentTo: string; isNewUser: boolean }>(
        '/api/partner/team',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: inviteEmail, role: 'member' }),
        },
      );
      setInviteSuccess(
        res.isNewUser
          ? t('partnerTeam.inviteSuccessNew', { email: res.inviteSentTo })
          : t('partnerTeam.inviteSuccessExisting', { email: res.inviteSentTo }),
      );
      closeInviteModal();
      load();
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : t('partnerTeam.errorInvite'));
    } finally {
      setInviteBusy(false);
      setTimeout(() => setInviteSuccess(null), 4000);
    }
  };

  // Phase 5: direct-create with password. Bypasses the invite
  // email entirely — the owner types the email + password, we
  // create the auth.users row with that password + insert a
  // partner_team_members row with status='active' immediately.
  // The new member can log in right away.
  const sendPasswordInvite = async () => {
    setPasswordBusy(true);
    setLoadError(null);
    try {
      const res = await apiFetchJson<{ email: string; password: string; member: { id: string } }>(
        '/api/partner/team/create-with-password',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: passwordEmail,
            password: passwordValue,
            fullName: passwordFullName,
            role: 'member',
          }),
        },
      );
      // Show the email + password once so the owner can copy
      // them and hand them to the new member. Don't auto-close
      // the modal — they need to see the password first.
      setCreatedCreds({ email: res.email, password: res.password });
      setInviteSuccess(
        t('partnerTeam.passwordCreateSuccess', { email: res.email }),
      );
      setPasswordEmail('');
      setPasswordValue('');
      setPasswordFullName('');
      load();
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : t('partnerTeam.errorInvite'));
    } finally {
      setPasswordBusy(false);
    }
  };

  // Copy a string to clipboard with a brief "Copied" indicator
  // on the matching field. Falls back to a textarea hack if
  // navigator.clipboard isn't available (older browsers / some
  // iframes).
  const copyToClipboard = async (text: string, field: 'email' | 'password') => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // ignore — the user can still read the field manually
    }
  };

  // Reset the modal state when closing so reopening it shows
  // a fresh form, not the creds from the last create.
  const closeInviteModal = () => {
    setInviteOpen(false);
    setInviteMode('email');
    setPasswordEmail('');
    setPasswordValue('');
    setPasswordFullName('');
    setCreatedCreds(null);
    setCopiedField(null);
  };

  // Phase 8: reset a team member's password. The owner types
  // (or generates) a new one; we POST to
  // /api/partner/team/[id]/reset-password which uses
  // Supabase's auth.admin.updateUserById to apply it. The new
  // password comes back so the UI can show it once for the
  // owner to copy + hand to the member.
  const handleResetPassword = async () => {
    if (!resetTargetId) return;
    if (resetPassword.length < 8) {
      setLoadError(t('partnerTeam.errorPasswordTooShort'));
      return;
    }
    setResetBusy(true);
    setLoadError(null);
    try {
      const res = await apiFetchJson<{ email: string; password: string }>(
        `/api/partner/team/${resetTargetId}/reset-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: resetPassword }),
        },
      );
      setResetResult({ email: res.email, password: res.password });
      setResetPassword('');
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : t('partnerTeam.errorResetPassword'));
    } finally {
      setResetBusy(false);
    }
  };

  const closeResetModal = () => {
    setResetTargetId(null);
    setResetPassword('');
    setResetResult(null);
  };

  // Tiny client-side password generator. Not cryptographically
  // strong (Math.random isn't), but good enough for a human-
  // shareable starting password — the member can change it
  // after signing in. We mix upper + lower + digits + a
  // symbol so the password satisfies typical strength meters.
  const generatePassword = () => {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghjkmnpqrstuvwxyz';
    const digits = '23456789';
    const symbols = '!@#$%^&*';
    const all = upper + lower + digits + symbols;
    // 14 chars total — comfortably above the 8-char minimum
    const len = 14;
    const arr = new Uint32Array(len);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(arr);
    } else {
      for (let i = 0; i < len; i++) arr[i] = Math.floor(Math.random() * 0xffffffff);
    }
    let out = '';
    // Guarantee one of each category
    out += upper[arr[0] % upper.length];
    out += lower[arr[1] % lower.length];
    out += digits[arr[2] % digits.length];
    out += symbols[arr[3] % symbols.length];
    for (let i = 4; i < len; i++) {
      out += all[arr[i] % all.length];
    }
    setResetPassword(out);
  };

  const removeMember = async (id: string) => {
    setActionBusyId(id);
    try {
      await apiFetchJson(`/api/partner/team/${id}`, { method: 'DELETE' });
      setRemoveConfirmId(null);
      load();
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : t('partnerTeam.errorRemove'));
    } finally {
      setActionBusyId(null);
    }
  };

  // Phase 1.7: resend a pending invite. Re-fires the accept-invite
  // email with a fresh token. The server route regenerates the token
  // (the old one may have expired after 7 days) and refreshes
  // invited_at so the team table shows the resend.
  const handleResendInvite = async (id: string) => {
    setActionBusyId(id);
    setResendSuccess(null);
    setLoadError(null);
    try {
      await apiFetchJson(`/api/partner/team/${id}/resend`, { method: 'POST' });
      setResendSuccess({ id, at: new Date().getTime() });
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : t('partnerTeam.errorResend'));
    } finally {
      setActionBusyId(null);
    }
  };

  // Phase 11: suspend a member. Soft-deletes their access without
  // destroying the row. Modal collects an optional reason (shown
  // on the row so the owner remembers why).
  const handleSuspend = async () => {
    if (!suspendTargetId) return;
    setSuspendBusy(true);
    setLoadError(null);
    try {
      await apiFetchJson(`/api/partner/team/${suspendTargetId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: suspendReason.trim() || undefined }),
      });
      setSuspendSuccess({ id: suspendTargetId, at: Date.now() });
      setSuspendTargetId(null);
      setSuspendReason('');
      load();
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : t('partnerTeam.errorSuspend'));
    } finally {
      setSuspendBusy(false);
    }
  };

  // Phase 11: reactivate a suspended member. Confirms via the
  // reactivation confirm modal (no reason collected — just a
  // "are you sure" double-check).
  const handleReactivate = async (id: string) => {
    setActionBusyId(id);
    setLoadError(null);
    try {
      await apiFetchJson(`/api/partner/team/${id}/reactivate`, { method: 'POST' });
      setReactivateSuccess({ id, at: Date.now() });
      setReactivateTargetId(null);
      load();
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : t('partnerTeam.errorReactivate'));
    } finally {
      setActionBusyId(null);
    }
  };

  // Phase 11: transfer ownership. The modal pre-fills the target
  // (the [id] from the click), warns the current owner that they'll
  // be demoted to a regular member, and on success reloads the
  // page so the role check in the layout hides the team sidebar
  // for the (now demoted) caller.
  const handleTransferOwnership = async () => {
    if (!transferTargetId) return;
    setTransferBusy(true);
    setLoadError(null);
    try {
      const res = await apiFetchJson<{ newOwner: { email: string | null } }>(
        `/api/partner/team/${transferTargetId}/transfer-ownership`,
        { method: 'POST' },
      );
      setTransferSuccess(
        res.newOwner.email || t('partnerTeam.transferSuccessNoEmail'),
      );
      setTransferTargetId(null);
      // Reload to refresh state. The layout's role check will
      // re-run on next render and may hide the team nav item
      // since the caller is now a member, not the owner.
      await load();
      // Force the layout to re-check the role by triggering a
      // router refresh. (Next 16 App Router: router.refresh()
      // re-fetches the current route's RSC tree + client
      // component state. The partner layout's useEffect
      // depends on pathname, so a navigation re-mounts it.)
      router.refresh();
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : t('partnerTeam.errorTransfer'));
    } finally {
      setTransferBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          {/* Org-scoped page header: "{Team} · {company name}" so
              the page is immediately identifiable when the owner
              has multiple partner orgs in different tabs, and a
              team member lands on the page and can see which org
              they're a member of. Falls back to bare "Team" when
              /api/partner/me fails (transient error) or the org
              has no company_name set. */}
          <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2 flex-wrap">
            <Users className="h-6 w-6" />
            {t('partnerTeam.title')}
            {companyName && (
              <>
                <span className="text-[#9B1B30] font-normal">·</span>
                <span className="text-[#1B2A4A]">{companyName}</span>
              </>
            )}
          </h1>
          <p className="text-gray-500 mt-1">
            {t('partnerTeam.subtitle')}
          </p>
        </div>
        <Button
          onClick={() => setInviteOpen(true)}
          className="bg-[#9B1B30] hover:bg-[#7a1525]"
        >
          <UserPlus className="h-4 w-4 mr-2" /> {t('partnerTeam.inviteMember')}
        </Button>
      </div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{loadError}</span>
        </div>
      )}
      {inviteSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm flex items-center gap-2">
          <CheckCircle size={16} />
          <span>{inviteSuccess}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('partnerTeam.membersCount', { count: team.length })}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Phase 9: owner-only gate. A non-owner who lands here
              directly (via URL) sees a friendly explanation instead
              of a 403 JSON error. We wait for the role check to
              finish (isOwner !== null) before showing the gate so
              we don't flash it for owners. */}
          {isOwner === false ? (
            <div className="py-8 text-center">
              <UserCog className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-[#1B2A4A] font-medium">{t('partnerTeam.ownerOnlyTitle')}</p>
              <p className="text-sm text-[#4B5563] mt-1 max-w-sm mx-auto">
                {notOwnerMessage || t('partnerTeam.ownerOnlyMessage')}
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="md" className="text-[#1B2A4A]" />
            </div>
          ) : team.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">
              {t('partnerTeam.emptyTeam')}
            </p>
          ) : (
            <div className="space-y-2">
              {team.map((m) => (
                <div
                  key={m.id}
                  className="border border-gray-200 p-3 flex items-start gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-[#1B2A4A]">
                        {m.email || m.user_id.slice(0, 8)}
                      </span>
                      <Badge
                        className={
                          m.role === 'owner'
                            ? 'bg-[#1B2A4A] text-white'
                            : 'bg-gray-200 text-gray-700'
                        }
                      >
                        {ROLE_DISPLAY[m.role] ?? m.role}
                      </Badge>
                      <Badge className={STATUS_COLOR[m.status] || 'bg-gray-100 text-gray-800'}>
                        {m.status === 'pending_invite' && <Clock className="h-3 w-3 mr-1" />}
                        {STATUS_DISPLAY[m.status] ?? m.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {m.joined_at
                        ? t('partnerTeam.joinedOn', { date: new Date(m.joined_at).toLocaleDateString() })
                        : m.invited_at
                          ? t('partnerTeam.invitedOn', { date: new Date(m.invited_at).toLocaleDateString() })
                          : t('partnerTeam.createdOn', { date: new Date(m.created_at).toLocaleDateString() })}
                      {m.suspended_at && t('partnerTeam.suspendedOn', { date: new Date(m.suspended_at).toLocaleDateString() })}
                      {m.suspension_reason && t('partnerTeam.suspensionReason', { reason: m.suspension_reason })}
                      {/* Phase 12: Last seen — only for active members
                          who have actually signed in at least once.
                          Pending invites have null lastSignInAt so we
                          hide the line. Suspended members keep the
                          timestamp so the owner can see "they
                          signed in once on June 5, then went
                          silent". */}
                      {m.status === 'active' && m.lastSignInAt && (
                        <span className="block mt-0.5">
                          {t('partnerTeam.lastSeen', { when: formatRelativeTime(m.lastSignInAt) })}
                        </span>
                      )}
                    </p>
                  </div>
                  {m.role !== 'owner' && (
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      {m.status === 'active' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setResetTargetId(m.id)}
                            disabled={actionBusyId === m.id}
                            className="text-[#1B2A4A] border-[#1B2A4A]/20"
                          >
                            <KeyRound className="h-3 w-3 mr-1" /> {t('partnerTeam.resetPassword')}
                          </Button>
                          {/* Phase 11: Suspend — soft-removes access
                              without destroying the row. Preferred
                              over Remove when the owner might want
                              to re-activate the member later. */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSuspendTargetId(m.id)}
                            disabled={actionBusyId === m.id}
                            className="text-orange-600 border-orange-200"
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" /> {t('partnerTeam.suspend')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRemoveConfirmId(m.id)}
                            disabled={actionBusyId === m.id}
                            className="text-red-600 border-red-200"
                          >
                            <Trash2 className="h-3 w-3 mr-1" /> {t('partnerTeam.remove')}
                          </Button>
                          {suspendSuccess?.id === m.id && (
                            <span className="text-[10px] font-semibold text-orange-700">
                              ✓ {t('partnerTeam.suspendSuccess')}
                            </span>
                          )}
                        </>
                      )}
                      {/* Phase 11: Suspended member — show Reactivate
                          + Remove. Reactivate restores status='active'
                          and clears the suspension metadata. Remove
                          hard-deletes (preserves the ex-member's
                          ability to re-register). */}
                      {m.status === 'suspended' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setReactivateTargetId(m.id)}
                            disabled={actionBusyId === m.id}
                            className="text-green-700 border-green-200"
                          >
                            <RotateCcw className="h-3 w-3 mr-1" /> {t('partnerTeam.reactivate')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRemoveConfirmId(m.id)}
                            disabled={actionBusyId === m.id}
                            className="text-red-600 border-red-200"
                          >
                            <Trash2 className="h-3 w-3 mr-1" /> {t('partnerTeam.remove')}
                          </Button>
                          {reactivateSuccess?.id === m.id && (
                            <span className="text-[10px] font-semibold text-green-700">
                              ✓ {t('partnerTeam.reactivateSuccess')}
                            </span>
                          )}
                        </>
                      )}
                      {/* Phase 1.7: resend + cancel on pending_invite.
                          A typo in the email means the original invite
                          never landed; resend regenerates the token and
                          fires the email again. Cancel just removes the
                          row, same as Remove. */}
                      {m.status === 'pending_invite' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResendInvite(m.id)}
                            disabled={actionBusyId === m.id}
                          >
                            <Mail className="h-3 w-3 mr-1" /> {t('partnerTeam.resendInvite')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRemoveConfirmId(m.id)}
                            disabled={actionBusyId === m.id}
                            className="text-red-600 border-red-200"
                          >
                            <Trash2 className="h-3 w-3 mr-1" /> {t('partnerTeam.cancelInvite')}
                          </Button>
                          {resendSuccess?.id === m.id && (
                            <span className="text-[10px] font-semibold text-green-700">
                              ✓ {t('partnerTeam.resendSuccess')}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  {/* Phase 11: Transfer Ownership — the current
                      owner picks a target member and the API
                      demotes the caller to member while promoting
                      the target to owner. Shown only on the
                      caller's own row (matched by user_id), and
                      only when at least one other active member
                      exists to transfer to. */}
                  {m.role === 'owner' && m.user_id === myUserId && activeMembersExceptMe.length > 0 && (
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setTransferOpen(true)}
                        className="text-[#1B2A4A] border-[#1B2A4A]/20"
                      >
                        <UserCog className="h-3 w-3 mr-1" /> {t('partnerTeam.transferOwnership')}
                      </Button>
                      {transferSuccess && (
                        <span className="text-[10px] font-semibold text-green-700">
                          ✓ {t('partnerTeam.transferSuccess', { email: transferSuccess })}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phase 5: tabbed invite modal. Tab 1 (Email) keeps the
          original Resend-invite flow. Tab 2 (Password) creates
          the auth user with an owner-chosen password and skips
          the email round-trip — the new member is active
          immediately and can log in at /partner/login. */}
      {inviteOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle>{t('partnerTeam.inviteModalTitle')}</CardTitle>
              <Button variant="ghost" size="sm" onClick={closeInviteModal}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Tab strip */}
              <div className="flex border-b border-gray-200 -mx-6 px-6">
                <button
                  type="button"
                  onClick={() => setInviteMode('email')}
                  className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
                    inviteMode === 'email'
                      ? 'border-[#9B1B30] text-[#1B2A4A]'
                      : 'border-transparent text-gray-500 hover:text-[#1B2A4A]'
                  }`}
                >
                  <Mail className="h-4 w-4 inline-block mr-1.5 -mt-0.5" />
                  {t('partnerTeam.tabEmail')}
                </button>
                <button
                  type="button"
                  onClick={() => setInviteMode('password')}
                  className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
                    inviteMode === 'password'
                      ? 'border-[#9B1B30] text-[#1B2A4A]'
                      : 'border-transparent text-gray-500 hover:text-[#1B2A4A]'
                  }`}
                >
                  <UserPlus className="h-4 w-4 inline-block mr-1.5 -mt-0.5" />
                  {t('partnerTeam.tabPassword')}
                </button>
              </div>

              {inviteMode === 'email' && (
                <>
                  <p className="text-sm text-gray-600">
                    {t('partnerTeam.inviteModalBody')}
                  </p>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      {t('partnerTeam.inviteEmailLabel')}
                    </label>
                    <Input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder={t('partnerTeam.inviteEmailPlaceholder')}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button variant="ghost" onClick={closeInviteModal}>
                      {t('partnerTeam.cancel')}
                    </Button>
                    <Button
                      onClick={sendInvite}
                      disabled={inviteBusy || !inviteEmail.includes('@')}
                      className="bg-[#9B1B30] hover:bg-[#7a1525]"
                    >
                      {inviteBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
                      {t('partnerTeam.sendInvite')}
                    </Button>
                  </div>
                </>
              )}

              {inviteMode === 'password' && !createdCreds && (
                <>
                  <p className="text-sm text-gray-600">
                    {t('partnerTeam.passwordModalBody')}
                  </p>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      {t('partnerTeam.fieldEmail')}
                    </label>
                    <Input
                      type="email"
                      value={passwordEmail}
                      onChange={(e) => setPasswordEmail(e.target.value)}
                      placeholder={t('partnerTeam.inviteEmailPlaceholder')}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      {t('partnerTeam.fieldPassword')}
                    </label>
                    <Input
                      type="text"
                      value={passwordValue}
                      onChange={(e) => setPasswordValue(e.target.value)}
                      placeholder={t('partnerTeam.passwordPlaceholder')}
                      autoComplete="new-password"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t('partnerTeam.passwordHint')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      {t('partnerTeam.fieldFullName')}
                    </label>
                    <Input
                      type="text"
                      value={passwordFullName}
                      onChange={(e) => setPasswordFullName(e.target.value)}
                      placeholder={t('partnerTeam.fieldFullNamePlaceholder')}
                      autoComplete="off"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t('partnerTeam.fieldFullNameHint')}
                    </p>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button variant="ghost" onClick={closeInviteModal}>
                      {t('partnerTeam.cancel')}
                    </Button>
                    <Button
                      onClick={sendPasswordInvite}
                      disabled={
                        passwordBusy ||
                        !passwordEmail.includes('@') ||
                        passwordValue.length < 8
                      }
                      className="bg-[#9B1B30] hover:bg-[#7a1525]"
                    >
                      {passwordBusy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}
                      {t('partnerTeam.createWithPassword')}
                    </Button>
                  </div>
                </>
              )}

              {inviteMode === 'password' && createdCreds && (
                <>
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 text-sm flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">
                        {t('partnerTeam.createdSuccessTitle')}
                      </p>
                      <p className="text-xs mt-1">
                        {t('partnerTeam.createdSuccessBody')}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      {t('partnerTeam.fieldEmail')}
                    </label>
                    <div className="flex items-center gap-2">
                      <Input value={createdCreds.email} readOnly className="bg-gray-50" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(createdCreds.email, 'email')}
                        className="flex-shrink-0"
                      >
                        {copiedField === 'email' ? (
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                        ) : (
                          t('partnerTeam.copy')
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      {t('partnerTeam.fieldPassword')}
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={createdCreds.password}
                        readOnly
                        className="bg-gray-50 font-mono"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(createdCreds.password, 'password')}
                        className="flex-shrink-0"
                      >
                        {copiedField === 'password' ? (
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                        ) : (
                          t('partnerTeam.copy')
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button onClick={closeInviteModal} className="bg-[#1B2A4A] hover:bg-[#15233d]">
                      {t('partnerTeam.done')}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Remove confirm */}
      {removeConfirmId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>{t('partnerTeam.removeModalTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                {t('partnerTeam.removeModalBody')}
              </p>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="ghost" onClick={() => setRemoveConfirmId(null)}>
                  {t('partnerTeam.cancel')}
                </Button>
                <Button
                  onClick={() => removeMember(removeConfirmId)}
                  disabled={actionBusyId !== null}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {actionBusyId === removeConfirmId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  {t('partnerTeam.remove')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Phase 8: reset-password modal. Owner-only by API
          (enforced server-side). Two views:
            - Form: pick a new password (or click Generate)
            - Result: show the new password once for copy
          Same "show once, can't see again" pattern as the
          create-with-password success view. */}
      {resetTargetId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle>{t('partnerTeam.resetModalTitle')}</CardTitle>
              <Button variant="ghost" size="sm" onClick={closeResetModal}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {!resetResult ? (
                <>
                  <p className="text-sm text-gray-600">
                    {t('partnerTeam.resetModalBody')}
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                      {t('partnerTeam.fieldNewPassword')}
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={resetPassword}
                        onChange={(e) => setResetPassword(e.target.value)}
                        placeholder={t('partnerTeam.passwordPlaceholder')}
                        autoComplete="new-password"
                        className="flex-1 font-mono"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generatePassword}
                        className="flex-shrink-0"
                        title={t('partnerTeam.generatePasswordHint')}
                      >
                        {t('partnerTeam.generatePassword')}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('partnerTeam.passwordHint')}
                    </p>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button variant="ghost" onClick={closeResetModal} disabled={resetBusy}>
                      {t('partnerTeam.cancel')}
                    </Button>
                    <Button
                      onClick={handleResetPassword}
                      disabled={resetBusy || resetPassword.length < 8}
                      className="bg-[#1B2A4A] hover:bg-[#15233d]"
                    >
                      {resetBusy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <KeyRound className="h-4 w-4 mr-2" />
                      )}
                      {t('partnerTeam.resetSubmit')}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 text-sm flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">
                        {t('partnerTeam.resetSuccessTitle')}
                      </p>
                      <p className="text-xs mt-1">
                        {t('partnerTeam.createdSuccessBody')}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                      {t('partnerTeam.fieldEmail')}
                    </label>
                    <div className="flex items-center gap-2">
                      <Input value={resetResult.email} readOnly className="bg-gray-50" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(resetResult.email, 'email')}
                        className="flex-shrink-0"
                      >
                        {copiedField === 'email' ? (
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                        ) : (
                          t('partnerTeam.copy')
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                      {t('partnerTeam.fieldNewPassword')}
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={resetResult.password}
                        readOnly
                        className="bg-gray-50 font-mono"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(resetResult.password, 'password')}
                        className="flex-shrink-0"
                      >
                        {copiedField === 'password' ? (
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                        ) : (
                          t('partnerTeam.copy')
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button onClick={closeResetModal} className="bg-[#1B2A4A] hover:bg-[#15233d]">
                      {t('partnerTeam.done')}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Phase 11: suspend modal. Soft-removes the member's
          access. Optional reason is stored on the row so the
          owner can remember why later. The member is locked
          out immediately on success (status flips to 'suspended',
          requireTeamMember refuses them, RLS data writes fail). */}
      {suspendTargetId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>{t('partnerTeam.suspendModalTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 text-sm flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>{t('partnerTeam.suspendModalBody')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                  {t('partnerTeam.suspendReasonLabel')}
                </label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder={t('partnerTeam.suspendReasonPlaceholder')}
                  className="w-full px-4 py-2.5 border border-gray-300 text-[#1F2937] placeholder:text-gray-400 focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30] text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('partnerTeam.suspendReasonHint')}
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSuspendTargetId(null);
                    setSuspendReason('');
                  }}
                  disabled={suspendBusy}
                >
                  {t('partnerTeam.cancel')}
                </Button>
                <Button
                  onClick={handleSuspend}
                  disabled={suspendBusy}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {suspendBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 mr-2" />
                  )}
                  {t('partnerTeam.suspendSubmit')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Phase 11: reactivate confirm modal. Simple "are you
          sure" — no fields. On success the member is unlocked
          and the team list refreshes. */}
      {reactivateTargetId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>{t('partnerTeam.reactivateModalTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                {t('partnerTeam.reactivateModalBody')}
              </p>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  variant="ghost"
                  onClick={() => setReactivateTargetId(null)}
                  disabled={actionBusyId !== null}
                >
                  {t('partnerTeam.cancel')}
                </Button>
                <Button
                  onClick={() => handleReactivate(reactivateTargetId)}
                  disabled={actionBusyId !== null}
                  className="bg-green-700 hover:bg-green-800"
                >
                  {actionBusyId === reactivateTargetId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4 mr-2" />
                  )}
                  {t('partnerTeam.reactivateSubmit')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Phase 11: transfer-ownership modal. The owner picks a
          target from the list of active members (excluding
          themselves). The modal warns them that they will lose
          owner powers — this is permanent (the new owner can
          re-promote them, but won't necessarily). */}
      {transferOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle>{t('partnerTeam.transferModalTitle')}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTransferOpen(false);
                  setTransferTargetId(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 text-sm flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">{t('partnerTeam.transferWarningTitle')}</p>
                  <p className="text-xs mt-1">{t('partnerTeam.transferWarningBody')}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
                  {t('partnerTeam.transferTargetLabel')}
                </label>
                <select
                  value={transferTargetId ?? ''}
                  onChange={(e) => setTransferTargetId(e.target.value || null)}
                  className="w-full px-4 py-2.5 border border-gray-300 text-[#1F2937] focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30] text-sm bg-white"
                >
                  <option value="">{t('partnerTeam.transferTargetPlaceholder')}</option>
                  {activeMembersExceptMe.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.email || m.user_id.slice(0, 8)}
                    </option>
                  ))}
                </select>
                {activeMembersExceptMe.length === 0 && (
                  <p className="text-xs text-amber-700 mt-1">
                    {t('partnerTeam.transferNoTargets')}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setTransferOpen(false);
                    setTransferTargetId(null);
                  }}
                  disabled={transferBusy}
                >
                  {t('partnerTeam.cancel')}
                </Button>
                <Button
                  onClick={handleTransferOwnership}
                  disabled={transferBusy || !transferTargetId}
                  className="bg-[#1B2A4A] hover:bg-[#15233d]"
                >
                  {transferBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserCog className="h-4 w-4 mr-2" />
                  )}
                  {t('partnerTeam.transferSubmit')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

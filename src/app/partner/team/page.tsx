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
  Mail,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiFetchJson, ApiError } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';

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
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [removeConfirmId, setRemoveConfirmId] = useState<string | null>(null);

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

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await apiFetchJson<{ team: TeamMember[] }>('/api/partner/team');
      setTeam(res.team || []);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : t('partnerTeam.errorLoad'));
      if (err instanceof ApiError && (err.status === 403 || err.status === 401)) {
        // Not authorized (member trying to view team) — bounce
        router.push('/partner');
      }
    } finally {
      setIsLoading(false);
    }
  }, [router, t]);

  useEffect(() => {
    load();
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
      setInviteOpen(false);
      setInviteEmail('');
      load();
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : t('partnerTeam.errorInvite'));
    } finally {
      setInviteBusy(false);
      setTimeout(() => setInviteSuccess(null), 4000);
    }
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
            <Users className="h-6 w-6" /> {t('partnerTeam.title')}
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
          {isLoading ? (
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
                    </p>
                  </div>
                  {m.role !== 'owner' && (
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      {m.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRemoveConfirmId(m.id)}
                          disabled={actionBusyId === m.id}
                          className="text-red-600 border-red-200"
                        >
                          <Trash2 className="h-3 w-3 mr-1" /> {t('partnerTeam.remove')}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite modal */}
      {inviteOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle>{t('partnerTeam.inviteModalTitle')}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setInviteOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
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
                <Button variant="ghost" onClick={() => setInviteOpen(false)}>
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
    </div>
  );
}

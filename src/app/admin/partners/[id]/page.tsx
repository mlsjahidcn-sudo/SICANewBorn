'use client';

/**
 * Admin: partner detail page.
 *
 * Shows full partner info + team list + Approve/Reject/Suspend
 * actions depending on current status.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Mail,
  Phone,
  Globe,
  Calendar,
  Users,
  Loader2,
  AlertCircle,
  X,
  Check,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiFetchJson, ApiError } from '@/lib/api-client';

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

interface PartnerDetail {
  partner: {
    id: string;
    user_id: string | null;
    email: string;
    company_name: string;
    contact_person: string;
    phone: string;
    country: string;
    status: string;
    commission_rate: number | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
  };
  team: TeamMember[];
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-[#D4A853] text-[#1B2A4A]',
  active: 'bg-green-100 text-green-800',
  suspended: 'bg-orange-100 text-orange-800',
  rejected: 'bg-red-100 text-red-800',
};

const MEMBER_STATUS_COLOR: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  pending_invite: 'bg-blue-100 text-blue-800',
  suspended: 'bg-orange-100 text-orange-800',
};

export default function PartnerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<PartnerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);

  // Reject dialog
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  // Suspend dialog
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  // Suspend member dialog
  const [suspendMemberId, setSuspendMemberId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await apiFetchJson<PartnerDetail>(`/api/admin/partners/${params.id}`);
      setData(res);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Failed to load partner');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  const runAction = async (action: string, payload: Record<string, unknown> = {}) => {
    setActionBusy(action);
    setLoadError(null);
    try {
      await apiFetchJson(`/api/admin/partners/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });
      await load();
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : `Action ${action} failed`);
    } finally {
      setActionBusy(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="md" className="text-[#1B2A4A]" />
      </div>
    );
  }
  if (loadError && !data) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push('/admin/partners')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Partners
        </Button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{loadError}</span>
        </div>
      </div>
    );
  }
  if (!data) return null;

  const { partner, team } = data;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push('/admin/partners')}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Partners
      </Button>

      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
            <Building2 size={22} />
            {partner.company_name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {partner.contact_person} · signed up {new Date(partner.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={STATUS_COLOR[partner.status] || 'bg-gray-100 text-gray-800'}>
            {partner.status}
          </Badge>
          {partner.status === 'pending' && (
            <>
              <Button
                onClick={() => runAction('approve')}
                disabled={actionBusy !== null}
                className="bg-green-600 hover:bg-green-700"
              >
                {actionBusy === 'approve' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Approve
              </Button>
              <Button
                onClick={() => setRejectOpen(true)}
                disabled={actionBusy !== null}
                variant="outline"
                className="border-red-300 text-red-700"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </>
          )}
          {partner.status === 'active' && (
            <Button
              onClick={() => setSuspendOpen(true)}
              disabled={actionBusy !== null}
              variant="outline"
              className="border-orange-300 text-orange-700"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Suspend
            </Button>
          )}
          {(partner.status === 'suspended' || partner.status === 'rejected') && (
            <Button
              onClick={() => runAction('reactivate')}
              disabled={actionBusy !== null}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionBusy === 'reactivate' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Reactivate
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Partner details */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-base">Partner info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <a
                href={`mailto:${partner.email}`}
                className="flex items-center gap-2 text-[#1B2A4A] hover:underline"
              >
                <Mail className="h-3.5 w-3.5" />
                {partner.email}
              </a>
            </div>
            {partner.phone && (
              <a
                href={`tel:${partner.phone}`}
                className="flex items-center gap-2 text-[#1B2A4A] hover:underline"
              >
                <Phone className="h-3.5 w-3.5" />
                {partner.phone}
              </a>
            )}
            {partner.country && (
              <div className="flex items-center gap-2 text-gray-700">
                <Globe className="h-3.5 w-3.5" />
                {partner.country}
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(partner.created_at).toLocaleDateString()}
            </div>
            {partner.commission_rate != null && (
              <div className="pt-2 border-t">
                <span className="text-gray-500">Commission rate:</span>{' '}
                <span className="font-semibold">{partner.commission_rate}%</span>
              </div>
            )}
            {partner.notes && (
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500 mb-1">Notes</p>
                <p className="text-sm whitespace-pre-wrap">{partner.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> Team ({team.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {team.length === 0 ? (
              <p className="text-sm text-gray-500">No team members yet.</p>
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
                          {m.role}
                        </Badge>
                        <Badge className={MEMBER_STATUS_COLOR[m.status] || 'bg-gray-100 text-gray-800'}>
                          {m.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {m.joined_at
                          ? `Joined ${new Date(m.joined_at).toLocaleDateString()}`
                          : m.invited_at
                            ? `Invited ${new Date(m.invited_at).toLocaleDateString()}`
                            : `Created ${new Date(m.created_at).toLocaleDateString()}`}
                        {m.suspended_at &&
                          ` · suspended ${new Date(m.suspended_at).toLocaleDateString()}`}
                        {m.suspension_reason && ` (${m.suspension_reason})`}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      {m.status === 'active' && m.role !== 'owner' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSuspendMemberId(m.id)}
                          disabled={actionBusy !== null}
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Suspend
                        </Button>
                      )}
                      {m.status === 'suspended' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            runAction('reactivate_member', { member_id: m.id })
                          }
                          disabled={actionBusy !== null}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reject dialog */}
      {rejectOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle>Reject partner application</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setRejectOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                This will set <strong>{partner.company_name}</strong> to status
                &quot;rejected&quot;. The partner will see a rejected page on their
                next sign-in.
              </p>
              <div>
                <label className="text-sm text-gray-700 block mb-1">
                  Reason (optional, shown to the partner)
                </label>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. We don&apos;t currently work with agents in your region."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="ghost" onClick={() => setRejectOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={async () => {
                    await runAction('reject', { reason: rejectReason || undefined });
                    setRejectOpen(false);
                    setRejectReason('');
                  }}
                  disabled={actionBusy !== null}
                >
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Suspend dialog */}
      {suspendOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle>Suspend partner</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSuspendOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                This will suspend <strong>{partner.company_name}</strong> and
                every active team member. They won&apos;t be able to sign in
                until reactivated.
              </p>
              <div>
                <label className="text-sm text-gray-700 block mb-1">
                  Reason (optional, internal)
                </label>
                <Textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="ghost" onClick={() => setSuspendOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={async () => {
                    await runAction('suspend', { reason: suspendReason || undefined });
                    setSuspendOpen(false);
                    setSuspendReason('');
                  }}
                  disabled={actionBusy !== null}
                >
                  Suspend
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Suspend member dialog */}
      {suspendMemberId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle>Suspend team member</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSuspendMemberId(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                They won&apos;t be able to sign in until reactivated.
              </p>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="ghost" onClick={() => setSuspendMemberId(null)}>
                  Cancel
                </Button>
                <Button
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={async () => {
                    await runAction('suspend_member', {
                      member_id: suspendMemberId,
                      reason: 'Suspended by admin',
                    });
                    setSuspendMemberId(null);
                  }}
                  disabled={actionBusy !== null}
                >
                  Suspend
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

'use client';

/**
 * Admin: partner detail page.
 *
 * Shows full partner info + team list + Approve/Reject/Suspend
 * actions depending on current status.
 *
 * Phase 85: inline edit section for the Partner info card
 * (company_name / contact_person / phone / country / commission_rate /
 * notes). Uses PATCH action='update'.
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
  Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface EditForm {
  company_name: string;
  contact_person: string;
  phone: string;
  country: string;
  commission_rate: string; // string in the form (number input), null → ''
  notes: string;
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
  const { t, locale } = useI18n();
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

  // Phase 85: inline edit form state.
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({
    company_name: '',
    contact_person: '',
    phone: '',
    country: '',
    commission_rate: '',
    notes: '',
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editFieldError, setEditFieldError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await apiFetchJson<PartnerDetail>(`/api/admin/partners/${params.id}`);
      setData(res);
      // Hydrate edit form from the freshly-loaded row so cancelling
      // an edit reverts to canonical state.
      const p = res.partner;
      setEditForm({
        company_name: p.company_name ?? '',
        contact_person: p.contact_person ?? '',
        phone: p.phone ?? '',
        country: p.country ?? '',
        commission_rate: p.commission_rate == null ? '' : String(p.commission_rate),
        notes: p.notes ?? '',
      });
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

  // Phase 85: save the inline edit. Only sends fields that actually
  // changed (dirty check) so PATCH stays minimal and avoids touching
  // rows unnecessarily.
  const saveEdit = async () => {
    if (!data) return;
    // Client-side commission_rate validation (server has its own
    // whitelist but doesn't range-check — defense in depth).
    const cr = editForm.commission_rate.trim();
    if (cr !== '') {
      const parsed = Number(cr);
      if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
        setEditFieldError(t('adminPartners.errorCommissionRateRange'));
        return;
      }
    }
    setEditFieldError(null);
    setEditSaving(true);
    try {
      const p = data.partner;
      const updates: Record<string, unknown> = {};
      const trimmedName = editForm.company_name.trim();
      if (trimmedName !== p.company_name) updates.company_name = trimmedName;
      const trimmedContact = editForm.contact_person.trim();
      if (trimmedContact !== p.contact_person) updates.contact_person = trimmedContact;
      const trimmedPhone = editForm.phone.trim();
      if (trimmedPhone !== (p.phone ?? '')) updates.phone = trimmedPhone;
      const trimmedCountry = editForm.country.trim();
      if (trimmedCountry !== (p.country ?? '')) updates.country = trimmedCountry;
      const trimmedNotes = editForm.notes.trim();
      if (trimmedNotes !== (p.notes ?? '')) updates.notes = trimmedNotes;
      // commission_rate: null when blank string, number when valid input.
      const originalRate = p.commission_rate == null ? '' : String(p.commission_rate);
      if (cr !== originalRate) {
        updates.commission_rate = cr === '' ? null : Number(cr);
      }
      if (Object.keys(updates).length === 0) {
        // Nothing changed — just close.
        setEditOpen(false);
        return;
      }
      await apiFetchJson(`/api/admin/partners/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', ...updates }),
      });
      await load();
      setEditOpen(false);
    } catch (err) {
      setEditFieldError(
        err instanceof ApiError ? err.message : t('adminPartners.errorSaveFailed'),
      );
    } finally {
      setEditSaving(false);
    }
  };

  // Locale-aware date formatter (mirrors Phase 52 partner detail pattern)
  const localeTag = locale === 'zh' ? 'zh-CN' : 'en-US';
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(localeTag);

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
          <ArrowLeft className="h-4 w-4 mr-2" /> {t('adminPartners.backToList')}
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
        <ArrowLeft className="h-4 w-4 mr-2" /> {t('adminPartners.backToList')}
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
            {partner.contact_person} ·{' '}
            {t('adminPartners.signedUpOn', { date: fmtDate(partner.created_at) })}
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
                {t('adminPartners.buttonApprove')}
              </Button>
              <Button
                onClick={() => setRejectOpen(true)}
                disabled={actionBusy !== null}
                variant="outline"
                className="border-red-300 text-red-700"
              >
                <XCircle className="h-4 w-4 mr-2" />
                {t('adminPartners.buttonReject')}
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">
              {t('adminPartners.partnerInfoCardTitle')}
            </CardTitle>
            {!editOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditOpen(true)}
                aria-label={t('adminPartners.buttonEditInfo')}
              >
                <Pencil className="h-3.5 w-3.5 mr-1" />
                {t('adminPartners.buttonEditInfo')}
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {editOpen ? (
              <div className="space-y-4">
                {editFieldError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-xs">
                    {editFieldError}
                  </div>
                )}
                {/* Company section */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {t('adminPartners.editSectionCompany')}
                  </div>
                  <div>
                    <Label
                      htmlFor="edit-company-name"
                      className="text-xs text-gray-600"
                    >
                      {t('adminPartners.fieldCompanyName')}
                    </Label>
                    <Input
                      id="edit-company-name"
                      value={editForm.company_name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, company_name: e.target.value })
                      }
                      maxLength={255}
                    />
                  </div>
                </div>
                {/* Contact section */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {t('adminPartners.editSectionContact')}
                  </div>
                  <div>
                    <Label
                      htmlFor="edit-contact-person"
                      className="text-xs text-gray-600"
                    >
                      {t('adminPartners.fieldContactPerson')}
                    </Label>
                    <Input
                      id="edit-contact-person"
                      value={editForm.contact_person}
                      onChange={(e) =>
                        setEditForm({ ...editForm, contact_person: e.target.value })
                      }
                      maxLength={255}
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="edit-phone"
                      className="text-xs text-gray-600"
                    >
                      {t('adminPartners.fieldPhone')}
                    </Label>
                    <Input
                      id="edit-phone"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="edit-country"
                      className="text-xs text-gray-600"
                    >
                      {t('adminPartners.fieldCountry')}
                    </Label>
                    <Input
                      id="edit-country"
                      value={editForm.country}
                      onChange={(e) =>
                        setEditForm({ ...editForm, country: e.target.value })
                      }
                      maxLength={100}
                    />
                  </div>
                </div>
                {/* Commission section */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {t('adminPartners.editSectionCommission')}
                  </div>
                  <p className="text-xs text-gray-500">
                    {t('adminPartners.editSectionCommissionHint')}
                  </p>
                  <div>
                    <Label
                      htmlFor="edit-commission-rate"
                      className="text-xs text-gray-600"
                    >
                      {t('adminPartners.fieldCommissionRate')}
                    </Label>
                    <Input
                      id="edit-commission-rate"
                      type="number"
                      step="0.01"
                      min={0}
                      max={100}
                      value={editForm.commission_rate}
                      onChange={(e) =>
                        setEditForm({ ...editForm, commission_rate: e.target.value })
                      }
                      placeholder="0–100"
                    />
                  </div>
                </div>
                {/* Notes */}
                <div className="space-y-2 pt-2 border-t">
                  <Label
                    htmlFor="edit-notes"
                    className="text-xs text-gray-600"
                  >
                    {t('adminPartners.fieldNotes')}
                  </Label>
                  <Textarea
                    id="edit-notes"
                    value={editForm.notes}
                    onChange={(e) =>
                      setEditForm({ ...editForm, notes: e.target.value })
                    }
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditOpen(false);
                      setEditFieldError(null);
                    }}
                    disabled={editSaving}
                  >
                    {t('adminPartners.buttonCancel')}
                  </Button>
                  <Button
                    onClick={saveEdit}
                    disabled={editSaving}
                    className="bg-[#1B2A4A] hover:bg-[#243560]"
                  >
                    {editSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {editSaving
                      ? t('adminPartners.buttonSaving')
                      : t('adminPartners.buttonSave')}
                  </Button>
                </div>
              </div>
            ) : (
              <>
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
                  {fmtDate(partner.created_at)}
                </div>
                <div className="pt-2 border-t">
                  <span className="text-gray-500">
                    {t('adminPartners.partnerInfoCommissionLabel')}
                  </span>{' '}
                  <span className="font-semibold">
                    {partner.commission_rate == null ? '—' : `${partner.commission_rate}%`}
                  </span>
                </div>
                {partner.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500 mb-1">
                      {t('adminPartners.partnerInfoNotesLabel')}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{partner.notes}</p>
                  </div>
                )}
              </>
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
                          ? `Joined ${fmtDate(m.joined_at)}`
                          : m.invited_at
                            ? `Invited ${fmtDate(m.invited_at)}`
                            : `Created ${fmtDate(m.created_at)}`}
                        {m.suspended_at &&
                          ` · suspended ${fmtDate(m.suspended_at)}`}
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
                  {t('adminPartners.buttonCancel')}
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
                  {t('adminPartners.buttonCancel')}
                </Button>
                <Button
                  className="bg-orange-600 hover:bg-orange-600"
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
                  {t('adminPartners.buttonCancel')}
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

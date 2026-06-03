'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, Mail, Phone, Calendar, Save, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { apiFetchJson } from '@/lib/api-client';
import type { PartnerLead, PartnerLeadStatus } from '@/lib/partner-lead-mapper';
import { PARTNER_LEAD_STATUSES } from '@/lib/partner-lead-mapper';

const STATUS_VARIANTS: Record<PartnerLeadStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'New': 'secondary',
  'Contacted': 'outline',
  'Qualified': 'outline',
  'Converted': 'default',
  'Lost': 'destructive',
};

export default function PartnerLeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [lead, setLead] = useState<PartnerLead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit form state
  const [editData, setEditData] = useState({
    leadName: '',
    leadEmail: '',
    leadPhone: '',
    interestedProgram: '',
    status: 'New' as PartnerLeadStatus,
    notes: '',
  });

  const load = useCallback(async () => {
    if (!leadId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetchJson<{ lead: PartnerLead }>(`/api/partner/leads/${leadId}`);
      setLead(res.lead);
      setEditData({
        leadName: res.lead.leadName,
        leadEmail: res.lead.leadEmail ?? '',
        leadPhone: res.lead.leadPhone ?? '',
        interestedProgram: res.lead.interestedProgram ?? '',
        status: res.lead.status,
        notes: res.lead.notes ?? '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lead.');
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    if (!editData.leadName.trim()) {
      setError('Lead name is required.');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        leadName: editData.leadName.trim(),
        leadEmail: editData.leadEmail.trim() || null,
        leadPhone: editData.leadPhone.trim() || null,
        interestedProgram: editData.interestedProgram.trim() || null,
        status: editData.status,
        notes: editData.notes.trim() || null,
      };
      await apiFetchJson(`/api/partner/leads/${leadId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      await load();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/partner/leads/${leadId}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Delete failed (HTTP ${res.status})`);
      }
      router.push('/partner/lead-sharing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.');
      setIsDeleting(false);
      setShowDelete(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 animate-pulse w-48" />
        <div className="h-64 bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (error && !lead) {
    return (
      <div className="space-y-4">
        <Link href="/partner/lead-sharing" className="inline-flex items-center gap-2 text-[#1B2A4A]">
          <ArrowLeft className="w-4 h-4" /> Back to leads
        </Link>
        <Card className="rounded-none border-red-200 bg-red-50">
          <CardContent className="p-6 text-red-700 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <p className="font-medium">Couldn't load lead</p>
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!lead) return null;

  return (
    <div className="space-y-6">
      {showDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full mx-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-[#1B2A4A] mb-4">Delete Lead</h3>
            <p className="text-[#4B5563] mb-6">
              Delete lead <strong>{lead.leadName}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDelete(false)}
                disabled={isDeleting}
                className="rounded-none"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Link href="/partner/lead-sharing" className="p-2 hover:bg-gray-100 inline-flex">
          <ArrowLeft className="w-5 h-5 text-[#1B2A4A]" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1B2A4A]">{lead.leadName}</h1>
            <Badge variant={STATUS_VARIANTS[lead.status]} className="rounded-none">
              {lead.status}
            </Badge>
          </div>
          {lead.interestedProgram && (
            <p className="text-[#4B5563] mt-1 text-sm">Interested in {lead.interestedProgram}</p>
          )}
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)} className="rounded-none">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {isEditing && (
            <>
              <Button variant="outline" onClick={() => { setIsEditing(false); void load(); }} disabled={isSaving} className="rounded-none">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]">
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving…' : 'Save'}
              </Button>
            </>
          )}
          <Button
            variant="outline"
            onClick={() => setShowDelete(true)}
            className="rounded-none border-red-300 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {error && (
        <Card className="rounded-none border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A]">Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {isEditing ? (
              <>
                <FieldRow label="Name">
                  <Input value={editData.leadName} onChange={(e) => setEditData((p) => ({ ...p, leadName: e.target.value }))} className="rounded-none" />
                </FieldRow>
                <FieldRow label="Email">
                  <Input value={editData.leadEmail} onChange={(e) => setEditData((p) => ({ ...p, leadEmail: e.target.value }))} className="rounded-none" />
                </FieldRow>
                <FieldRow label="Phone">
                  <Input value={editData.leadPhone} onChange={(e) => setEditData((p) => ({ ...p, leadPhone: e.target.value }))} className="rounded-none" />
                </FieldRow>
              </>
            ) : (
              <>
                <Field label="Email" value={lead.leadEmail} icon={Mail} />
                <Field label="Phone" value={lead.leadPhone} icon={Phone} />
              </>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A]">Interest & Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {isEditing ? (
              <>
                <FieldRow label="Program">
                  <Input value={editData.interestedProgram} onChange={(e) => setEditData((p) => ({ ...p, interestedProgram: e.target.value }))} className="rounded-none" />
                </FieldRow>
                <FieldRow label="Status">
                  <Select
                    value={editData.status}
                    onValueChange={(value) =>
                      setEditData((p) => ({ ...p, status: value as PartnerLeadStatus }))
                    }
                  >
                    <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PARTNER_LEAD_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldRow>
              </>
            ) : (
              <>
                <Field label="Program" value={lead.interestedProgram} />
                <div className="flex items-center gap-2">
                  <span className="text-[#4B5563] min-w-24">Status:</span>
                  <Badge variant={STATUS_VARIANTS[lead.status]} className="rounded-none">
                    {lead.status}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="text-[#1B2A4A]">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={editData.notes}
              onChange={(e) => setEditData((p) => ({ ...p, notes: e.target.value }))}
              rows={4}
              className="rounded-none"
            />
          ) : lead.notes ? (
            <p className="text-sm text-[#1F2937] whitespace-pre-wrap">{lead.notes}</p>
          ) : (
            <p className="text-sm text-[#4B5563] italic">No notes recorded yet.</p>
          )}
          <p className="text-xs text-[#4B5563] mt-4 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Created {lead.createdAt ? new Date(lead.createdAt).toLocaleString() : '—'}
            {lead.updatedAt && lead.updatedAt !== lead.createdAt && (
              <> · Updated {new Date(lead.updatedAt).toLocaleString()}</>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value, icon: Icon }: { label: string; value: string | null | undefined; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center gap-2">
      {Icon && <Icon className="h-4 w-4 text-[#4B5563]" />}
      <span className="text-[#4B5563] min-w-24">{label}:</span>
      <span className="font-medium text-[#1F2937]">{value || '—'}</span>
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-[#4B5563] text-xs uppercase tracking-wide">{label}</Label>
      {children}
    </div>
  );
}

'use client';

/**
 * Admin: partner organizations list.
 *
 * Phase 3: pending partners bubble to the top with a yellow badge
 * and a one-click "Approve" action.
 */
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Building2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Users,
  Search,
  Filter,
  Loader2,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiFetchJson, ApiError } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';

interface AdminPartner {
  id: string;
  user_id: string | null;
  email: string;
  company_name: string;
  contact_person: string;
  country: string;
  status: string;
  commission_rate: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  team_count: number;
  team_active: number;
  team_pending: number;
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-[#D4A853] text-[#1B2A4A]',
  active: 'bg-green-100 text-green-800',
  suspended: 'bg-orange-100 text-orange-800',
  rejected: 'bg-red-100 text-red-800',
};
const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  active: 'Active',
  suspended: 'Suspended',
  rejected: 'Rejected',
};

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<AdminPartner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await apiFetchJson<{ partners: AdminPartner[] }>(
        `/api/admin/partners${params.toString() ? `?${params}` : ''}`,
      );
      setPartners(res.partners || []);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Failed to load partners');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = partners.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.company_name.toLowerCase().includes(q) ||
      p.contact_person.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.country?.toLowerCase().includes(q)
    );
  });

  const counts = {
    pending: partners.filter((p) => p.status === 'pending').length,
    active: partners.filter((p) => p.status === 'active').length,
    suspended: partners.filter((p) => p.status === 'suspended').length,
    rejected: partners.filter((p) => p.status === 'rejected').length,
  };

  const quickApprove = async (p: AdminPartner) => {
    if (!confirm(`Approve ${p.company_name}? They will be able to sign in immediately.`)) {
      return;
    }
    setApprovingId(p.id);
    try {
      await apiFetchJson(`/api/admin/partners/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      load();
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Approve failed');
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Partners</h1>
        <p className="text-gray-500 mt-1">
          Partner organizations. Approve new signups, manage teams, suspend bad actors.
        </p>
      </div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      {/* Status pills */}
      <div className="flex flex-wrap gap-2 text-sm">
        {(['all', 'pending', 'active', 'suspended', 'rejected'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 border ${
              statusFilter === s
                ? 'border-[#1B2A4A] bg-[#1B2A4A] text-white'
                : 'border-gray-200 bg-white text-gray-700 hover:border-[#1B2A4A]'
            }`}
          >
            {s === 'all'
              ? `All (${partners.length})`
              : `${STATUS_LABEL[s] || s} (${counts[s as keyof typeof counts] || 0})`}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white p-4 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search by company, contact, email, country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="md" className="text-[#1B2A4A]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 px-6 py-12 text-center text-gray-500">
          {partners.length === 0
            ? 'No partner applications yet. They will appear here when someone signs up at /partner/register.'
            : 'No partners match your filters.'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <div
              key={p.id}
              className={`bg-white border p-4 ${
                p.status === 'pending'
                  ? 'border-[#D4A853] bg-[#D4A853]/5'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-start gap-1 flex-shrink-0">
                  <Building2 size={20} className="text-[#1B2A4A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-[#1B2A4A] truncate">
                      {p.company_name}
                    </h3>
                    <Badge className={STATUS_COLOR[p.status] || 'bg-gray-100 text-gray-800'}>
                      {STATUS_LABEL[p.status] || p.status}
                    </Badge>
                    {p.team_count > 0 && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Users size={12} /> {p.team_count} member
                        {p.team_count === 1 ? '' : 's'}
                        {p.team_pending > 0 && ` (${p.team_pending} pending)`}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {p.contact_person} ·{' '}
                    <a
                      href={`mailto:${p.email}`}
                      className="text-[#1B2A4A] hover:underline inline-flex items-center gap-1"
                    >
                      <Mail size={12} />
                      {p.email}
                    </a>
                    {p.country && ` · ${p.country}`}
                  </p>
                  {p.notes && (
                    <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                      <span className="font-medium text-gray-500">Notes:</span> {p.notes}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Signed up {new Date(p.created_at).toLocaleDateString()}
                    {p.commission_rate != null && ` · ${p.commission_rate}% commission`}
                  </p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {p.status === 'pending' && (
                    <Button
                      onClick={() => quickApprove(p)}
                      disabled={approvingId === p.id}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      {approvingId === p.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      )}
                      Approve
                    </Button>
                  )}
                  <Link href={`/admin/partners/${p.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Details <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

/**
 * Admin: partner organizations list.
 *
 * Phase 3: pending partners bubble to the top with a yellow badge
 * and a one-click "Approve" action.
 * Phase 85: server-side pagination + search + i18n.
 */
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Building2,
  CheckCircle,
  Loader2,
  Search,
  Plus,
  Users,
  Mail,
  ArrowRight,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { apiFetchJson, ApiError } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n';

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

interface PartnersListResponse {
  partners: AdminPartner[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

const PAGE_SIZE = 20;

export default function AdminPartnersPage() {
  const { t, locale } = useI18n();
  const [partners, setPartners] = useState<AdminPartner[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Debounced search (300ms after the last keystroke, matching /admin/students)
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset to page 1 whenever a filter changes (otherwise the user can
  // land on a page that no longer exists after a filter narrows the
  // result set).
  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchQuery]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      const res = await apiFetchJson<PartnersListResponse>(
        `/api/admin/partners?${params.toString()}`,
      );
      setPartners(res.partners || []);
      setTotal(res.total || 0);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Failed to load partners');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, searchQuery]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasActiveFilter = statusFilter !== 'all' || searchQuery.trim().length > 0;

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

  // Locale-aware date formatter (mirrors Phase 52 partner detail pattern)
  const localeTag = locale === 'zh' ? 'zh-CN' : 'en-US';
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(localeTag);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">{t('adminPartners.title')}</h1>
          <p className="text-gray-500 mt-1">{t('adminPartners.subtitle')}</p>
        </div>
        <Button asChild className="bg-[#9B1B30] hover:bg-[#7A1526]">
          <Link href="/admin/partners/new">
            <Plus className="w-4 h-4 mr-2" />
            {t('adminPartners.buttonAddPartner')}
          </Link>
        </Button>
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
              ? `${t('adminPartners.allLabel')} (${total})`
              : `${STATUS_LABEL[s] || s} (${
                  partners.filter((p) => p.status === s).length
                })`}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white p-4 border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder={t('adminPartners.searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="md" className="text-[#1B2A4A]" />
        </div>
      ) : partners.length === 0 ? (
        <div className="bg-white border border-gray-200 px-6 py-12 text-center text-gray-500">
          {hasActiveFilter
            ? t('adminPartners.emptyFiltered')
            : t('adminPartners.emptyNone')}
        </div>
      ) : (
        <div className="space-y-2">
          {partners.map((p) => (
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
                        <Users size={12} /> {p.team_count}{' '}
                        {p.team_count === 1
                          ? t('adminPartners.members_one')
                          : t('adminPartners.members_other')}
                        {p.team_pending > 0 &&
                          ` ${t('adminPartners.pendingInline', { count: p.team_pending })}`}
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
                      <span className="font-medium text-gray-500">
                        {t('adminPartners.notesInline')}
                      </span>{' '}
                      {p.notes}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {t('adminPartners.signedUpOn', { date: fmtDate(p.created_at) })}
                    {p.commission_rate != null &&
                      ` ${t('adminPartners.commissionInline', { rate: p.commission_rate })}`}
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
                      {t('adminPartners.buttonApprove')}
                    </Button>
                  )}
                  <Link href={`/admin/partners/${p.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      {t('adminPartners.buttonDetails')}{' '}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination footer */}
      {!isLoading && total > 0 && (
        <div className="flex items-center justify-between pt-2 border-t">
          <p className="text-sm text-gray-500">
            {t('adminPartners.paginationShowing', {
              from: (page - 1) * PAGE_SIZE + 1,
              to: Math.min(page * PAGE_SIZE, total),
              total,
            })}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t('adminPartners.paginationPrev')}
            </Button>
            <span className="text-sm text-gray-600">
              {t('adminPartners.paginationPageOf', { page, total: totalPages })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              {t('adminPartners.paginationNext')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

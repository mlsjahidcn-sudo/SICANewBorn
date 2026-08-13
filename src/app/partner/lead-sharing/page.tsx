'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Eye, MoreHorizontal, Trash2, Download, Users, ArrowUpRight, CheckCircle2, XCircle, Clock, Flag } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import { PARTNER_LEAD_STATUSES, type PartnerLead, type PartnerLeadStatus } from '@/lib/partner-lead-mapper';

const STATUS_VARIANTS: Record<PartnerLeadStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'New': 'secondary',
  'Contacted': 'outline',
  'Qualified': 'outline',
  'Converted': 'default',
  'Lost': 'destructive',
};

const STATUS_ICONS: Record<PartnerLeadStatus, React.ComponentType<{ className?: string }>> = {
  'New': Clock,
  'Contacted': Users,
  'Qualified': CheckCircle2,
  'Converted': ArrowUpRight,
  'Lost': XCircle,
};

export default function PartnerLeadSharingPage() {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PartnerLeadStatus | 'all'>('all');

  const [leads, setLeads] = useState<PartnerLead[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Phase J: per-status counts for the chip badges.
  const [statusCounts, setStatusCounts] = useState<Record<PartnerLeadStatus | 'all', number>>({
    all: 0,
    'New': 0,
    'Contacted': 0,
    'Qualified': 0,
    'Converted': 0,
    'Lost': 0,
  });

  // Phase J: bulk-action selection.
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ ok: number; fail: number } | null>(null);
  const [showBulkDelete, setShowBulkDelete] = useState(false);

  useEffect(() => {
    const tm = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 250);
    return () => clearTimeout(tm);
  }, [searchTerm]);

  // Clear selection when filters change so the user doesn't act on
  // rows that just scrolled out of view.
  useEffect(() => {
    setSelectedIds(new Set());
    setBulkResult(null);
  }, [debouncedSearch, statusFilter]);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      params.set('limit', '50');
      const res = await apiFetchJson<{ leads: PartnerLead[]; total: number }>(
        `/api/partner/leads${params.toString() ? `?${params}` : ''}`,
      );
      setLeads(res.leads || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('partnerLeads.errorLoad'));
      setLeads([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter, t]);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  // Phase J: refresh status chip counts from an unfiltered sweep.
  const refreshStatusCounts = useCallback(async () => {
    try {
      const res = await apiFetchJson<{ leads: PartnerLead[]; total: number }>('/api/partner/leads?limit=100');
      const all = res.leads || [];
      const next: Record<PartnerLeadStatus | 'all', number> = {
        all: res.total || all.length,
        'New': 0,
        'Contacted': 0,
        'Qualified': 0,
        'Converted': 0,
        'Lost': 0,
      };
      for (const lead of all) {
        next[lead.status] = (next[lead.status] || 0) + 1;
      }
      setStatusCounts(next);
    } catch {
      // non-fatal
    }
  }, []);

  useEffect(() => {
    void refreshStatusCounts();
  }, [refreshStatusCounts]);

  const toggleSelected = (id: string, on: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setBulkResult(null);
  };

  const handleBulkAction = async (action: 'status' | 'delete', value?: PartnerLeadStatus) => {
    if (selectedIds.size === 0) return;
    setBulkBusy(true);
    setBulkResult(null);
    try {
      const res = await apiFetchJson<{
        updated: number;
        failed: Array<{ id: string; error: string }>;
      }>('/api/partner/leads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          action,
          value,
        }),
      });
      setBulkResult({ ok: res.updated, fail: res.failed.length });
      clearSelection();
      await fetchLeads();
      void refreshStatusCounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('partnerLeads.bulkFailed'));
    } finally {
      setBulkBusy(false);
    }
  };

  const handleDelete = (id: string) => {
    setLeadToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!leadToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/partner/leads/${leadToDelete}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || t('partnerLeads.errorDelete'));
      }
      setLeads((prev) => prev.filter((l) => l.id !== leadToDelete));
      setTotal((prev) => Math.max(0, prev - 1));
      setShowDeleteModal(false);
      setLeadToDelete(null);
      void refreshStatusCounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('partnerLeads.errorDelete'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Stats
  const [stats, setStats] = useState({ new: 0, qualified: 0, converted: 0, lost: 0 });
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetchJson<{ leads: PartnerLead[] }>('/api/partner/leads?limit=100');
        if (cancelled) return;
        const all = res.leads || [];
        setStats({
          new: all.filter((l) => l.status === 'New').length,
          qualified: all.filter((l) => l.status === 'Qualified').length,
          converted: all.filter((l) => l.status === 'Converted').length,
          lost: all.filter((l) => l.status === 'Lost').length,
        });
      } catch {
        // non-fatal
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasAnyFilter = debouncedSearch !== '' || statusFilter !== 'all';

  return (
    <>
      <div className="space-y-6">
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 max-w-md w-full mx-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-[#1B2A4A] mb-4">{t('partnerLeads.deleteTitle')}</h3>
              <p className="text-[#4B5563] mb-6">
                {t('partnerLeads.deleteBody')}
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="rounded-none"
                >
                  {t('partnerLeads.cancel')}
                </Button>
                <Button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
                >
                  {isDeleting ? t('partnerLeads.deleting') : t('partnerLeads.delete')}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1B2A4A]">{t('partnerLeads.title')}</h1>
              <p className="text-[#4B5563] mt-1">{t('partnerLeads.subtitle')}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-none" disabled>
                <Download className="mr-2 h-4 w-4" />
                {t('partnerLeads.export')}
              </Button>
              <Button asChild className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]">
                <Link href="/partner/lead-sharing/new" className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('partnerLeads.newLead')}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#4B5563]">{t('partnerLeads.statNew')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1B2A4A]">{stats.new}</div>
              <p className="text-sm text-[#4B5563] mt-1">{t('partnerLeads.statNewHint')}</p>
            </CardContent>
          </Card>
          <Card className="rounded-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#4B5563]">{t('partnerLeads.statQualified')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1B2A4A]">{stats.qualified}</div>
              <p className="text-sm text-[#4B5563] mt-1">{t('partnerLeads.statQualifiedHint')}</p>
            </CardContent>
          </Card>
          <Card className="rounded-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#4B5563]">{t('partnerLeads.statConverted')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1B2A4A]">{stats.converted}</div>
              <p className="text-sm text-[#4B5563] mt-1">{t('partnerLeads.statConvertedHint')}</p>
            </CardContent>
          </Card>
          <Card className="rounded-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#4B5563]">{t('partnerLeads.statLost')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1B2A4A]">{stats.lost}</div>
              <p className="text-sm text-[#4B5563] mt-1">{t('partnerLeads.statLostHint')}</p>
            </CardContent>
          </Card>
        </div>

        {error && (
          <Card className="rounded-none border-red-200 bg-red-50">
            <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
          </Card>
        )}

        {/* Phase J: status filter chips with per-status counts */}
        <div className="flex flex-wrap gap-2">
          {(['all', ...PARTNER_LEAD_STATUSES] as const).map((s) => {
            const active = statusFilter === s;
            const count = statusCounts[s] || 0;
            const labelKey =
              s === 'all' ? 'partnerLeads.filterAll' : `partnerLeads.statusBadge.${s.toLowerCase()}`;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors inline-flex items-center gap-1 ${
                  active
                    ? 'border-[#9B1B30] text-[#1B2A4A]'
                    : 'border-transparent text-gray-500 hover:text-[#1B2A4A] hover:border-gray-200'
                }`}
              >
                {t(labelKey)}
                <span className={`text-xs ${active ? 'text-[#1B2A4A]' : 'text-gray-400'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#4B5563]" />
              <Input
                type="text"
                placeholder={t('partnerLeads.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-none"
              />
            </div>
          </div>
        </div>

        {/* Phase J: active-filter summary */}
        {hasAnyFilter && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-[#4B5563]">
            <span className="text-xs uppercase tracking-wider font-semibold">
              {t('partnerLeads.filterActive')}:
            </span>
            {statusFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 text-xs font-medium rounded-none"
              >
                {t(`partnerLeads.statusBadge.${statusFilter.toLowerCase()}`)}
                <XCircle className="h-3 w-3" />
              </button>
            )}
            {debouncedSearch && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 text-xs font-medium rounded-none"
              >
                “{debouncedSearch}”
                <XCircle className="h-3 w-3" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setSearchTerm('');
              }}
              className="ml-1 text-[#9B1B30] hover:underline text-xs font-semibold"
            >
              {t('partnerLeads.clearFilters')}
            </button>
          </div>
        )}

        <Card className="rounded-none">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-4 w-10">
                      <Checkbox
                        checked={leads.length > 0 && leads.every((l) => selectedIds.has(l.id))}
                        onCheckedChange={(c) => {
                          if (c) {
                            setSelectedIds(new Set(leads.map((l) => l.id)));
                          } else {
                            setSelectedIds(new Set());
                          }
                        }}
                        aria-label={t('partnerLeads.selectAll')}
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">{t('partnerLeads.colLead')}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">{t('partnerLeads.colContact')}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">{t('partnerLeads.colInterestedIn')}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">{t('partnerLeads.colStatus')}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">{t('partnerLeads.colAdded')}</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">{t('partnerLeads.colActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leads.map((lead) => {
                    const Icon = STATUS_ICONS[lead.status];
                    const isSelected = selectedIds.has(lead.id);
                    return (
                      <tr
                        key={lead.id}
                        className={`hover:bg-gray-50 ${isSelected ? 'bg-amber-50' : ''}`}
                      >
                        <td className="px-2 py-4">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(c) => toggleSelected(lead.id, !!c)}
                            aria-label={t('partnerLeads.selectRow', { name: lead.leadName })}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/partner/lead-sharing/${lead.id}`}
                            className="font-medium text-[#1B2A4A] hover:underline"
                          >
                            {lead.leadName}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="text-[#1B2A4A]">{lead.leadEmail || t('partnerCommon.placeholderDash')}</p>
                            <p className="text-[#4B5563]">{lead.leadPhone || t('partnerCommon.placeholderDash')}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#4B5563]">
                          {lead.interestedProgram || t('partnerCommon.placeholderDash')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-[#4B5563]" />
                            <Badge variant={STATUS_VARIANTS[lead.status]} className="rounded-none">
                              {lead.status}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#4B5563]">
                          {lead.createdAt
                            ? new Date(lead.createdAt).toLocaleDateString()
                            : t('partnerCommon.placeholderDash')}
                        </td>
                        <td className="px-6 py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="rounded-none h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-none">
                              <DropdownMenuItem asChild>
                                <Link href={`/partner/lead-sharing/${lead.id}`} className="flex items-center cursor-pointer">
                                  <Eye className="mr-2 h-4 w-4" />
                                  {t('partnerLeads.view')}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(lead.id)}
                                className="text-red-600 cursor-pointer"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t('partnerLeads.delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {leads.length === 0 && !error && !isLoading && (
              <div className="p-12 text-center">
                <div className="text-[#4B5563]">
                  <p className="text-lg font-medium">{t('partnerLeads.emptyTitle')}</p>
                  <p className="mt-1">
                    {hasAnyFilter
                      ? t('partnerLeads.emptyFiltered')
                      : t('partnerLeads.emptyFresh')}
                  </p>
                  {hasAnyFilter && (
                    <Button
                      variant="outline"
                      className="rounded-none mt-4"
                      onClick={() => {
                        setStatusFilter('all');
                        setSearchTerm('');
                      }}
                    >
                      {t('partnerLeads.clearFilters')}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {isLoading && leads.length === 0 && (
              <div className="p-12 text-center text-[#4B5563]">{t('partnerApps.loading')}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Phase J: sticky bulk-action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t-2 border-[#9B1B30] bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-[#1B2A4A]">
              {t('partnerLeads.bulkSelected', { n: selectedIds.size })}
            </span>
            <div className="flex-1" />
            <Button
              size="sm"
              variant="outline"
              className="rounded-none"
              onClick={() => handleBulkAction('status', 'Contacted')}
              disabled={bulkBusy}
            >
              {t('partnerLeads.bulkSetContacted')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-none"
              onClick={() => handleBulkAction('status', 'Qualified')}
              disabled={bulkBusy}
            >
              <Flag className="h-3.5 w-3.5 mr-1" />
              {t('partnerLeads.bulkSetQualified')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-none"
              onClick={() => handleBulkAction('status', 'Lost')}
              disabled={bulkBusy}
            >
              {t('partnerLeads.bulkSetLost')}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="rounded-none"
              onClick={() => setShowBulkDelete(true)}
              disabled={bulkBusy}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              {t('partnerLeads.bulkDelete')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="rounded-none"
              onClick={clearSelection}
              disabled={bulkBusy}
            >
              {t('partnerLeads.bulkCancel')}
            </Button>
          </div>
          {bulkResult && (
            <div className="bg-[#FAFAF8] border-t border-gray-200 text-xs text-[#4B5563] px-4 sm:px-6 lg:px-8 py-1.5 text-center">
              {t('partnerLeads.bulkResult', { ok: bulkResult.ok, fail: bulkResult.fail })}
            </div>
          )}
        </div>
      )}

      {/* Phase J: bulk-delete confirmation dialog */}
      <AlertDialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('partnerLeads.bulkDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('partnerLeads.bulkDeleteConfirm', { n: selectedIds.size })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkBusy} className="rounded-none">
              {t('partnerLeads.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={bulkBusy}
              className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
              onClick={() => {
                setShowBulkDelete(false);
                void handleBulkAction('delete');
              }}
            >
              {t('partnerLeads.bulkDelete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

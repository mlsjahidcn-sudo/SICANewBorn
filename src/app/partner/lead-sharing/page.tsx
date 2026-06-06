'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Eye, Edit, MoreHorizontal, Trash2, Download, Users, ArrowUpRight, CheckCircle2, XCircle, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import type { PartnerLead, PartnerLeadStatus } from '@/lib/partner-lead-mapper';

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
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [leads, setLeads] = useState<PartnerLead[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const tm = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 250);
    return () => clearTimeout(tm);
  }, [searchTerm]);

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

  return (
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
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 rounded-none">
              <SelectValue placeholder={t('partnerLeads.allStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('partnerLeads.allStatus')}</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Contacted">Contacted</SelectItem>
              <SelectItem value="Qualified">Qualified</SelectItem>
              <SelectItem value="Converted">Converted</SelectItem>
              <SelectItem value="Lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="rounded-none">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
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
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50">
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
                  {debouncedSearch || statusFilter !== 'all'
                    ? t('partnerLeads.emptyFiltered')
                    : t('partnerLeads.emptyFresh')}
                </p>
              </div>
            </div>
          )}

          {isLoading && leads.length === 0 && (
            <div className="p-12 text-center text-[#4B5563]">{t('partnerApps.loading')}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

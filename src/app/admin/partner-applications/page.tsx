'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Building2, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiFetchJson } from '@/lib/api-client';
import {
  PARTNER_APPLICATION_STATUSES,
  PARTNER_APPLICATION_DECISIONS,
  PARTNER_APPLICATION_PRIORITIES,
  PartnerApplicationStatus,
  PartnerApplicationDecision,
  PartnerApplicationPriority,
} from '@/lib/partner-application-mapper';

// S27: partner applications are the CRM-style rows the partner
// creates on behalf of students. The partner can't change their
// status — only the admin can, from this page. Each row in the
// table links to /admin/partner-applications/[id] which has the
// status / decision controls.

interface PartnerAppListItem {
  id: string;
  studentName: string;
  studentEmail: string | null;
  studentPhone: string | null;
  university: string;
  program: string;
  intake: string | null;
  degree: string | null;
  nationality: string | null;
  priority: PartnerApplicationPriority;
  applicationNumber: string | null;
  status: PartnerApplicationStatus;
  decision: PartnerApplicationDecision;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  partnerName: string | null;
  createdByEmail: string | null;
}

const STATUS_COLOR: Record<PartnerApplicationStatus, string> = {
  Draft: 'bg-gray-100 text-gray-800',
  Submitted: 'bg-blue-100 text-blue-800',
  'In Review': 'bg-yellow-100 text-yellow-800',
  Accepted: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Withdrawn: 'bg-gray-100 text-gray-700',
};

const PRIORITY_COLOR: Record<PartnerApplicationPriority, string> = {
  Low: 'bg-gray-100 text-gray-700',
  Normal: 'bg-blue-50 text-blue-700',
  High: 'bg-orange-100 text-orange-800',
  Urgent: 'bg-[#9B1B30] text-white',
};

const PAGE_SIZE = 25;

export default function AdminPartnerApplicationsPage() {
  const router = useRouter();
  const [apps, setApps] = useState<PartnerAppListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters (kept in component state — no URL sync for now, this
  // page is admin-only and short-lived per session)
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [decisionFilter, setDecisionFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [partnerFilter, setPartnerFilter] = useState<string>('');

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (decisionFilter !== 'all') params.set('decision', decisionFilter);
      if (priorityFilter !== 'all') params.set('priority', priorityFilter);
      if (partnerFilter.trim()) params.set('partnerId', partnerFilter.trim());
      params.set('page', String(page));
      params.set('limit', String(PAGE_SIZE));
      const res = await apiFetchJson<{
        applications: PartnerAppListItem[];
        total: number;
      }>(`/api/admin/partner-applications?${params.toString()}`);
      setApps(res.applications);
      setTotal(res.total);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load partner applications.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, decisionFilter, priorityFilter, partnerFilter, page]);

  useEffect(() => {
    void load();
  }, [load]);

  // Reset to page 1 whenever a filter changes (avoids landing on an
  // empty page after narrowing the result set)
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, decisionFilter, priorityFilter, partnerFilter]);

  // Quick stats for the top cards
  const stats = useMemo(() => {
    return {
      total,
      submitted: apps.filter((a) => a.status === 'Submitted').length,
      inReview: apps.filter((a) => a.status === 'In Review').length,
      urgent: apps.filter(
        (a) => a.priority === 'Urgent' || a.priority === 'High',
      ).length,
    };
  }, [apps, total]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
            <Building2 className="w-5 h-5" /> Partner Pipeline
          </h1>
          <p className="text-sm text-[#4B5563] mt-1">
            Applications created by partner agencies. Only admins can change
            the status / decision.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/applications"
            className="text-sm text-[#1B2A4A] hover:underline"
          >
            ← Student applications
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="rounded-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-[#4B5563] font-normal">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B2A4A]">{total}</div>
            <p className="text-xs text-gray-500">Across all partners</p>
          </CardContent>
        </Card>
        <Card className="rounded-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-[#4B5563] font-normal">
              Awaiting Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.submitted}
            </div>
            <p className="text-xs text-gray-500">Status = Submitted</p>
          </CardContent>
        </Card>
        <Card className="rounded-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-[#4B5563] font-normal">
              In Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.inReview}
            </div>
            <p className="text-xs text-gray-500">Active evaluation</p>
          </CardContent>
        </Card>
        <Card className="rounded-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-[#4B5563] font-normal">
              Urgent / High
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#9B1B30]">
              {stats.urgent}
            </div>
            <p className="text-xs text-gray-500">Flagged by partner</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter bar */}
      <Card className="rounded-none">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search student, university, or program…"
                  className="pl-9 rounded-none"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="rounded-none">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {PARTNER_APPLICATION_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Select value={decisionFilter} onValueChange={setDecisionFilter}>
                <SelectTrigger className="rounded-none">
                  <SelectValue placeholder="Decision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All decisions</SelectItem>
                  {PARTNER_APPLICATION_DECISIONS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="rounded-none">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  {PARTNER_APPLICATION_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-1">
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setDecisionFilter('all');
                  setPriorityFilter('all');
                  setPartnerFilter('');
                }}
                className="rounded-none w-full"
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="rounded-none border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

      {/* Results table */}
      <Card className="rounded-none">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-[#4B5563]">
                <tr>
                  <th className="text-left px-4 py-3">Student</th>
                  <th className="text-left px-4 py-3">Partner</th>
                  <th className="text-left px-4 py-3">University · Program</th>
                  <th className="text-left px-4 py-3">Intake</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Priority</th>
                  <th className="text-left px-4 py-3">Decision</th>
                  <th className="text-left px-4 py-3">App #</th>
                  <th className="text-left px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-500">
                      Loading…
                    </td>
                  </tr>
                )}
                {!isLoading && apps.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-500">
                      No partner applications match these filters.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  apps.map((a) => (
                    <tr
                      key={a.id}
                      onClick={() =>
                        router.push(`/admin/partner-applications/${a.id}`)
                      }
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#1B2A4A]">
                          {a.studentName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {a.studentEmail || a.studentPhone || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#4B5563]">
                        {a.partnerName || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-[#1B2A4A]">{a.university}</div>
                        <div className="text-xs text-gray-500">{a.program}</div>
                      </td>
                      <td className="px-4 py-3 text-[#4B5563]">
                        {a.intake || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={`rounded-none border-0 ${STATUS_COLOR[a.status]}`}
                        >
                          {a.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-none ${PRIORITY_COLOR[a.priority]}`}
                        >
                          {a.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="rounded-none">
                          {a.decision}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">
                        {a.applicationNumber || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {a.createdAt
                          ? new Date(a.createdAt).toLocaleDateString()
                          : '—'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}{' '}
            of {total}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-none"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <span className="text-xs text-gray-500">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-none"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

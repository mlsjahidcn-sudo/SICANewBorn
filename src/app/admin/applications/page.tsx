'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Trash2, MoreHorizontal, ArrowUpRight, ArrowDownRight, Minus, RefreshCw, AlertCircle, Search, Users, Building2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { ListPageSkeleton } from '@/components/partner/skeletons';
import { useStudentList } from '@/hooks/use-student-list';
import { apiFetch, apiFetchJson } from '@/lib/api-client';
import { APPLICATION_STATUSES, ApplicationStatus } from '@/lib/application-mapper';

interface Application {
  id: string;
  studentId: string | null;
  studentName: string;
  studentEmail: string;
  university: string;
  program: string;
  degree: string;
  intake: string;
  status: string;
  // S28: 'Partner CRM' is the partner_applications table;
  // 'Partner' is a student_applications row whose student's
  // source='Partner'. They share the same "Partner" tab in
  // the UI but link to different detail pages.
  source: 'Online' | 'Admin' | 'Partner' | 'Partner CRM';
  surface: 'student' | 'partner';
  applicationNumber?: string;
  createdAt: string;
  notes?: string;
}

const PAGE_SIZE = 20;

/**
 * Single source of truth for how each application status is rendered:
 *   - key   = exact DB value (must match APPLICATION_STATUSES)
 *   - label = human-readable text (used in the filter dropdown + badge)
 *   - color = tailwind classes for the badge
 */
const STATUS_DISPLAY: Record<ApplicationStatus, { label: string; color: string }> = {
  Draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  Submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
  'Under Review': { label: 'In Review', color: 'bg-yellow-100 text-yellow-800' },
  'Documents Requested': { label: 'Documents Needed', color: 'bg-purple-100 text-purple-800' },
  'Decision Made': { label: 'Decision Made', color: 'bg-orange-100 text-orange-800' },
  Accepted: { label: 'Approved', color: 'bg-green-100 text-green-800' },
  Rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  Withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-800' },
};

const sourceColors: Record<string, string> = {
  'Online': 'bg-blue-100 text-blue-700',
  'Admin': 'bg-[#9B1B30] text-white',
  'Partner': 'bg-purple-100 text-purple-700',
  // S28: partner_applications rows. Visually distinct from the
  // purple 'Partner' (student source=Partner) so the admin can
  // tell at a glance which surface the row came from.
  'Partner CRM': 'bg-orange-100 text-orange-800',
};

/**
 * Tab definitions. Each tab maps to one of three sources (or "all" for
 * the unfiltered view). The page makes the same /api/admin/applications
 * call regardless of tab; only the `source` query param differs. This
 * keeps the API surface unchanged and the tab navigation near-instant
 * (just a refetch with a new filter).
 */
type SourceTab = 'all' | 'Online' | 'Partner' | 'Admin';
// S28: the Partner tab now covers BOTH surfaces — student
// applications with source='Partner' AND partner_applications
// rows (the partner's own pipeline). The breakdown shows in the
// helper text so the admin can see how many of each.
const SOURCE_TABS: { value: SourceTab; label: string; shortLabel: string; icon: React.ElementType; helper?: (counts: { partner: number; partnerCrm: number } | null) => string }[] = [
  { value: 'all',     label: 'All Applications', shortLabel: 'All',     icon: Users },
  { value: 'Online',  label: 'Student (Online)', shortLabel: 'Student', icon: Users },
  {
    value: 'Partner',
    label: 'Partner',
    shortLabel: 'Partner',
    icon: Building2,
    helper: (c) => c ? `${c.partnerCrm} CRM + ${c.partner - c.partnerCrm} student` : '',
  },
  { value: 'Admin',   label: 'Admin (Offline)',  shortLabel: 'Offline', icon: UserPlus },
];

export default function AdminApplicationsPage() {
  const router = useRouter();
  const { students } = useStudentList();

  // Tab state — defaults to "all" so the user sees everything on first load
  const [activeTab, setActiveTab] = useState<SourceTab>('all');

  // Retry counter — bumping it forces the main fetch useEffect to re-run
  // even if all other deps are unchanged. Used by the "Try again" button.
  const [retryNonce, setRetryNonce] = useState(0);

  // List state
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter state
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [studentFilter, setStudentFilter] = useState<string>('all');

  // Tab badge counts
  const [counts, setCounts] = useState<{ total: number; online: number; partner: number; partnerCrm: number; offline: number } | null>(null);
  const [countsError, setCountsError] = useState<string | null>(null);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<Application | null>(null);

  // -----------------------------------------------------------------
  // Fetch the per-source counts ONCE on mount so the tab badges can
  // show numbers. Independent of the main list fetch so a slow list
  // doesn't block the badges (or vice versa).
  // -----------------------------------------------------------------
  const fetchCounts = useCallback(async () => {
    try {
      const data = await apiFetchJson<{ total: number; online: number; partner: number; partnerCrm: number; offline: number }>(
        '/api/admin/applications/counts',
      );
      setCounts(data);
      setCountsError(null);
    } catch (err) {
      // Counts are non-critical — show a small warning, keep the page usable
      setCountsError(err instanceof Error ? err.message : 'Failed to load counts');
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // -----------------------------------------------------------------
  // Main list fetch. Re-runs on tab change, page change, or any filter
  // change. Source is taken from activeTab (not a dropdown filter).
  // -----------------------------------------------------------------
  useEffect(() => {
    const controller = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    });
    if (activeTab !== 'all') params.set('source', activeTab);
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (studentFilter !== 'all') params.set('student', studentFilter);

    // Safety timeout — never let the page hang on a stalled network call.
    timeoutId = setTimeout(() => controller.abort(), 15_000);

    (async () => {
      try {
        const data = await apiFetchJson<{ applications: Application[]; total: number; page: number; totalPages: number }>(
          `/api/admin/applications?${params.toString()}`,
          { signal: controller.signal },
        );
        if (!cancelled) {
          setApplications(data.applications);
          setTotal(data.total);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load applications';
          setError(message);
          setApplications([]);
          setTotal(0);
        }
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [page, searchQuery, statusFilter, studentFilter, activeTab, retryNonce]);

  // Debounce search — wait 300ms after the user stops typing before firing
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset to page 1 when tab or filters change
  useEffect(() => {
    setPage(1);
  }, [activeTab, statusFilter, studentFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const confirmDelete = async () => {
    if (!applicationToDelete) return;
    setIsDeleting(true);
    try {
      // S28: partner CRM rows live in a separate table and are
      // deleted via the partner admin endpoint, not the student-app
      // endpoint. Pick the right route based on surface.
      const deleteHref =
        applicationToDelete.surface === 'partner'
          ? `/api/admin/partner-applications/${applicationToDelete.id}`
          : `/api/admin/applications/${applicationToDelete.id}`;
      await apiFetch(deleteHref, { method: 'DELETE' });
      setApplications((prev) => prev.filter((a) => a.id !== applicationToDelete.id));
      setTotal((prev) => Math.max(0, prev - 1));
      setDeleteDialogOpen(false);
      setApplicationToDelete(null);
      // Refresh counts since one just got removed
      fetchCounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel application');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = (application: Application) => {
    setApplicationToDelete(application);
    setDeleteDialogOpen(true);
  };

  // Client-side safety filter: even after the API call, double-check the
  // active source matches the row. Cheap and makes tab switching feel
  // instant if the user navigates before the refetch lands.
  //
  // S28: the "Partner" tab covers BOTH source='Partner' and
  // source='Partner CRM' (the partner_applications rows). They're
  // unified in the UI but link to different detail pages.
  const filteredApplications = applications.filter((app) => {
    const matchesSource =
      activeTab === 'all' ||
      app.source === activeTab ||
      (activeTab === 'Partner' && app.source === 'Partner CRM');
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesStudent =
      studentFilter === 'all' ||
      // Partner CRM rows have no student_id — they don't match a
      // student filter.
      (app.studentId !== null && app.studentId === studentFilter);
    const matchesSearch =
      !searchQuery ||
      app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.university.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSource && matchesStatus && matchesStudent && matchesSearch;
  });

  // Count for the active tab — prefer the badge count from /counts,
  // fall back to `total` from the list (which the API already filtered).
  const getActiveCount = (): number => {
    if (!counts) return total;
    switch (activeTab) {
      case 'Online':  return counts.online;
      case 'Partner': return counts.partner; // includes partnerCrm
      case 'Admin':   return counts.offline;
      default:        return counts.total;
    }
  };

  // Empty-state on first load (no data fetched yet) — show skeleton
  if (isLoading && applications.length === 0 && !error) {
    return <ListPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Applications</h1>
          <p className="text-[#4B5563] mt-1">Manage all student applications by source</p>
        </div>
        <Button
          className="bg-[#9B1B30] hover:bg-[#7A1526] text-white"
          onClick={() => router.push('/admin/applications/new')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Application
        </Button>
      </div>

      {/* Source tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 overflow-x-auto" aria-label="Application source tabs">
          {SOURCE_TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            const Icon = tab.icon;
            const count =
              counts
                ? (tab.value === 'all' ? counts.total
                  : tab.value === 'Online' ? counts.online
                  // S28: the Partner tab badge now shows the
                  // combined count of student_source=Partner +
                  // partner_applications rows. The breakdown
                  // is shown in the tab label itself.
                  : tab.value === 'Partner'
                    ? counts.partner
                    : counts.offline)
                : null;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                title={tab.helper?.(counts) || tab.label}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-[#9B1B30] text-[#9B1B30]'
                    : 'border-transparent text-[#4B5563] hover:text-[#1B2A4A] hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                <span>{tab.shortLabel}</span>
                {count !== null && (
                  <span
                    className={`inline-flex items-center justify-center min-w-[24px] h-5 px-1.5 text-xs font-semibold ${
                      isActive
                        ? 'bg-[#9B1B30] text-white'
                        : 'bg-gray-100 text-[#4B5563]'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Counts error (non-fatal — tabs still work, just no badges) */}
      {countsError && (
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2">
          Could not load tab counts: {countsError}. Tab navigation still works.
        </div>
      )}

      {/* Error state (fatal — the list itself failed) */}
      {error && !isLoading && applications.length === 0 && (
        <div className="border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-red-900 mb-1">Failed to load applications</h3>
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <Button
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100"
            onClick={() => {
              setError(null);
              setRetryNonce((n) => n + 1);
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try again
          </Button>
        </div>
      )}

      {/* Filters + table (only when we have something to show or are loading) */}
      {!error || applications.length > 0 ? (
        <Card className="rounded-none border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by student name, email, or university..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="rounded-none pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Select value={studentFilter} onValueChange={setStudentFilter}>
                  <SelectTrigger className="w-[180px] rounded-none">
                    <SelectValue placeholder="All Students" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] rounded-none">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {APPLICATION_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_DISPLAY[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F3F4F6] border-b border-gray-200">
                    <th className="text-left px-6 py-3 font-semibold text-[#1B2A4A]">Student</th>
                    <th className="text-left px-6 py-3 font-semibold text-[#1B2A4A]">University & Program</th>
                    <th className="text-left px-6 py-3 font-semibold text-[#1B2A4A]">Status</th>
                    <th className="text-left px-6 py-3 font-semibold text-[#1B2A4A]">Source</th>
                    <th className="text-left px-6 py-3 font-semibold text-[#1B2A4A]">Created</th>
                    <th className="text-right px-6 py-3 font-semibold text-[#1B2A4A]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && applications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <Spinner size="md" className="text-[#1B2A4A] mx-auto" />
                      </td>
                    </tr>
                  ) : filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-[#4B5563]">
                        {applications.length === 0
                          ? `No applications yet in ${SOURCE_TABS.find((t) => t.value === activeTab)?.label.toLowerCase() ?? 'this view'}.`
                          : 'No applications match your filters.'}
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map((application) => {
                      // S28: pick the right detail URL based on the
                      // surface. Partner CRM rows go to the partner
                      // admin page (where status controls live);
                      // student application rows go to the existing
                      // student-app detail page.
                      const detailsHref =
                        application.surface === 'partner'
                          ? `/admin/partner-applications/${application.id}`
                          : `/admin/applications/${application.id}`;
                      return (
                        <tr key={application.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-[#1F2937]">
                                {application.studentName?.trim() ||
                                  (application.studentEmail ? application.studentEmail.split('@')[0] : '—')}
                              </div>
                              <div className="text-xs text-[#4B5563]">{application.studentEmail}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-[#1F2937]">{application.university}</div>
                              <div className="text-xs text-[#4B5563]">{application.program} • {application.degree}</div>
                              <div className="text-xs text-[#6B7280] mt-1">{application.intake}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              className={`${
                                STATUS_DISPLAY[application.status as ApplicationStatus]?.color ??
                                'bg-gray-100 text-gray-800'
                              } rounded-none border`}
                            >
                              {STATUS_DISPLAY[application.status as ApplicationStatus]?.label ??
                                application.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={`${sourceColors[application.source]} rounded-none`}>
                              {application.source === 'Admin' ? 'Offline' : application.source}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-[#4B5563]">
                            {new Date(application.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <Link href={detailsHref}>
                                <Button variant="ghost" size="sm" className="rounded-none text-[#1B2A4A]">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="rounded-none text-[#1B2A4A]">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-none">
                                  {/* S28: partner CRM rows have no
                                      studentId, so the "View Student"
                                      shortcut is hidden for them. */}
                                  {application.surface === 'student' && application.studentId && (
                                    <DropdownMenuItem asChild>
                                      <Link href={`/admin/students/${application.studentId}`}>
                                        View Student
                                      </Link>
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem asChild>
                                    <Link href={detailsHref}>
                                      View Details
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDelete(application)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-[#4B5563]">
            Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} of {total}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-none"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-none"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-none max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this application from {applicationToDelete?.studentName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              className="rounded-none"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-none bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <><Spinner size="sm" className="text-white mr-2" /> Deleting…</> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

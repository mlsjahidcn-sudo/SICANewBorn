'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Eye, Edit, MoreHorizontal, Trash2, X, Download, Flag, Mail } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { apiFetchJson } from '@/lib/api-client';
import type {
  PartnerApplication,
  PartnerApplicationStatus,
  PartnerApplicationPriority,
} from '@/lib/partner-application-mapper';

const STATUS_VARIANTS: Record<PartnerApplicationStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'Draft': 'secondary',
  'Submitted': 'outline',
  'In Review': 'outline',
  'Accepted': 'default',
  'Rejected': 'destructive',
  'Withdrawn': 'outline',
};

const PRIORITY_VARIANTS: Record<PartnerApplicationPriority, string> = {
  Low: 'bg-gray-100 text-gray-600',
  Normal: 'bg-blue-50 text-blue-700',
  High: 'bg-orange-100 text-orange-800',
  Urgent: 'bg-[#9B1B30] text-white',
};

export default function PartnerApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appToDelete, setAppToDelete] = useState<string | null>(null);

  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [stats, setStats] = useState({ inReview: 0, accepted: 0, submitted: 0, urgent: 0 });
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 250);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const fetchApps = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (priorityFilter !== 'all') params.set('priority', priorityFilter);
      params.set('limit', '50');
      const res = await apiFetchJson<{ applications: PartnerApplication[]; total: number }>(
        `/api/partner/applications${params.toString() ? `?${params}` : ''}`,
      );
      setApplications(res.applications || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications.');
      setApplications([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter, priorityFilter]);

  useEffect(() => {
    void fetchApps();
  }, [fetchApps]);

  // Lightweight stats: a single unfiltered fetch on first mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetchJson<{ applications: PartnerApplication[] }>(
          '/api/partner/applications?limit=100',
        );
        if (cancelled) return;
        const apps = res.applications || [];
        setStats({
          inReview: apps.filter((a) => a.status === 'In Review' || a.status === 'Submitted').length,
          accepted: apps.filter((a) => a.status === 'Accepted').length,
          submitted: apps.filter((a) => a.status === 'Submitted').length,
          urgent: apps.filter((a) => a.priority === 'High' || a.priority === 'Urgent').length,
        });
      } catch {
        // ignore — non-fatal
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDeleteApp = (id: string) => {
    setAppToDelete(id);
    setShowDeleteModal(true);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    try {
      // Fetch a wide filter (no pagination cap) so the partner gets
      // everything. The export endpoint enforces its own auth + scope.
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (priorityFilter !== 'all') params.set('priority', priorityFilter);
      const res = await fetch(
        `/api/partner/applications/export${params.toString() ? `?${params}` : ''}`,
        { headers: { Accept: 'text/csv' } },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Export failed (HTTP ${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Pull a sensible filename from the Content-Disposition header
      // if the server set one, otherwise fall back to a default.
      const cd = res.headers.get('Content-Disposition') || '';
      const match = /filename="?([^"]+)"?/i.exec(cd);
      a.download = match?.[1] || `sica-partner-applications-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  const confirmDelete = async () => {
    if (!appToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/partner/applications/${appToDelete}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Delete failed (HTTP ${res.status})`);
      }
      setApplications((prev) => prev.filter((a) => a.id !== appToDelete));
      setTotal((prev) => Math.max(0, prev - 1));
      setShowDeleteModal(false);
      setAppToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: PartnerApplicationStatus) => (
    <Badge variant={STATUS_VARIANTS[status]} className="rounded-none">{status}</Badge>
  );

  return (
    <div className="space-y-6">
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full mx-4 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#1B2A4A]">Delete Application</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="text-[#4B5563] hover:text-[#1B2A4A] disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[#4B5563] mb-6">
              Are you sure you want to delete this application? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="rounded-none"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">Applications</h1>
            <p className="text-[#4B5563] mt-1">Manage student university applications</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="rounded-none"
              onClick={handleExport}
              disabled={isExporting || applications.length === 0}
              title={
                applications.length === 0
                  ? 'No applications to export'
                  : `Download ${applications.length} row(s) as CSV`
              }
            >
              <Download className={`mr-2 h-4 w-4 ${isExporting ? 'animate-spin' : ''}`} />
              {isExporting ? 'Exporting…' : 'Export'}
            </Button>
            <Button asChild className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]">
              <Link href="/partner/applications/new" className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                New Application
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#4B5563]">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B2A4A]">{total}</div>
            <p className="text-sm text-[#4B5563] mt-1">All submissions</p>
          </CardContent>
        </Card>
        <Card className="rounded-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#4B5563]">In Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B2A4A]">{stats.inReview}</div>
            <p className="text-sm text-[#4B5563] mt-1">Pending decision</p>
          </CardContent>
        </Card>
        <Card className="rounded-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#4B5563] flex items-center gap-1">
              <Flag className="w-3 h-3" /> Urgent / High
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#9B1B30]">{stats.urgent}</div>
            <p className="text-sm text-[#4B5563] mt-1">Flagged for priority handling</p>
          </CardContent>
        </Card>
        <Card className="rounded-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#4B5563]">Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B2A4A]">{stats.accepted}</div>
            <p className="text-sm text-[#4B5563] mt-1">Successful admissions</p>
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
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-none"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 rounded-none">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Submitted">Submitted</SelectItem>
              <SelectItem value="In Review">In Review</SelectItem>
              <SelectItem value="Accepted">Accepted</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
              <SelectItem value="Withdrawn">Withdrawn</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40 rounded-none">
              <SelectValue placeholder="All Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="Urgent">Urgent</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Normal">Normal</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">Student</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">University</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">Program</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">Priority</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">Decision</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">Submitted by</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">Submitted</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <Link
                          href={`/partner/applications/${app.id}`}
                          className="font-medium text-[#1B2A4A] hover:underline"
                        >
                          {app.studentName}
                        </Link>
                        <div className="flex flex-col gap-0.5 mt-1 text-xs text-[#4B5563]">
                          {app.studentEmail && (
                            <a
                              href={`mailto:${app.studentEmail}`}
                              className="flex items-center gap-1 hover:text-[#9B1B30]"
                            >
                              <Mail className="w-3 h-3" />
                              <span className="truncate max-w-[180px]">{app.studentEmail}</span>
                            </a>
                          )}
                          {(app.intake || app.degree) && (
                            <span className="text-gray-500">
                              {app.intake || '—'}{app.degree ? ` · ${app.degree}` : ''}
                            </span>
                          )}
                          {app.applicationNumber && (
                            <span className="font-mono text-gray-400">{app.applicationNumber}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#1B2A4A]">{app.university}</td>
                    <td className="px-6 py-4 text-[#4B5563]">{app.program}</td>
                    <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                    <td className="px-6 py-4">
                      {app.priority && app.priority !== 'Normal' ? (
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-none ${PRIORITY_VARIANTS[app.priority]}`}
                        >
                          <Flag className="w-3 h-3" /> {app.priority}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Normal</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[#4B5563]">{app.decision}</td>
                    <td className="px-6 py-4 text-[#4B5563] text-sm">
                      {app.createdByEmail || '—'}
                    </td>
                    <td className="px-6 py-4 text-[#4B5563]">
                      {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : '—'}
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
                            <Link href={`/partner/applications/${app.id}`} className="flex items-center cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/partner/applications/${app.id}/edit`} className="flex items-center cursor-pointer">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteApp(app.id)}
                            className="text-red-600 cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {applications.length === 0 && !error && !isLoading && (
            <div className="p-12 text-center">
              <div className="text-[#4B5563]">
                <p className="text-lg font-medium">No applications found</p>
                <p className="mt-1">
                  {debouncedSearch || statusFilter !== 'all'
                    ? 'Try adjusting your filters.'
                    : 'Click "New Application" to create your first one.'}
                </p>
              </div>
            </div>
          )}

          {isLoading && applications.length === 0 && (
            <div className="p-12 text-center text-[#4B5563]">Loading…</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

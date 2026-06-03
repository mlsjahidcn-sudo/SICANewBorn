'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Trash2, Edit, MoreHorizontal, ArrowUpRight, ArrowDownRight, Minus, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  studentId: string;
  studentName: string;
  studentEmail: string;
  university: string;
  program: string;
  degree: string;
  intake: string;
  status: string;
  source: 'Online' | 'Admin' | 'Partner';
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
 *
 * IMPORTANT: the filter dropdown's `value` MUST be the DB value (not the
 * label) so the API can match. Both the badge and the filter use this
 * same map; the only difference is the filter shows the label and the
 * badge shows the label.
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
  'Partner': 'bg-purple-100 text-purple-700'
};

export default function AdminApplicationsPage() {
  const router = useRouter();
  const { students } = useStudentList();
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [studentFilter, setStudentFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<Application | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    });
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (sourceFilter !== 'all') params.set('source', sourceFilter);
    if (studentFilter !== 'all') params.set('student', studentFilter);

    apiFetchJson<{ applications: Application[]; total: number; page: number; totalPages: number }>(
      `/api/admin/applications?${params.toString()}`,
      { signal: controller.signal },
    )
      .then((data) => {
        setApplications(data.applications);
        setTotal(data.total);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load applications');
          setApplications([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [page, searchQuery, statusFilter, sourceFilter, studentFilter]);

  // Debounce search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, sourceFilter, studentFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const confirmDelete = async () => {
    if (!applicationToDelete) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/api/admin/applications/${applicationToDelete.id}`, { method: 'DELETE' });
      setApplications((prev) => prev.filter((a) => a.id !== applicationToDelete.id));
      setTotal((prev) => Math.max(0, prev - 1));
      setDeleteDialogOpen(false);
      setApplicationToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel application');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.university.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || app.source === sourceFilter;
    const matchesStudent = studentFilter === 'all' || app.studentId === studentFilter;
    return matchesSearch && matchesStatus && matchesSource && matchesStudent;
  });

  const handleDelete = (application: Application) => {
    setApplicationToDelete(application);
    setDeleteDialogOpen(true);
  };

  if (isLoading && applications.length === 0) {
    return <ListPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Applications</h1>
          <p className="text-[#4B5563] mt-1">Manage all student applications</p>
        </div>
        <Button
          className="bg-[#9B1B30] hover:bg-[#7A1526] text-white"
          onClick={() => router.push('/admin/applications/new')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Application
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-none border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#4B5563]">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B2A4A]">{applications.length}</div>
            <div className="flex items-center mt-1 text-xs text-green-600">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              <span>+12% from last month</span>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#4B5563]">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B2A4A]">
              {applications.filter(a => a.status === 'Pending').length}
            </div>
            <div className="flex items-center mt-1 text-xs text-yellow-600">
              <Minus className="w-3 h-3 mr-1" />
              <span>Requires attention</span>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#4B5563]">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B2A4A]">
              {applications.filter(a => a.status === 'Approved').length}
            </div>
            <div className="flex items-center mt-1 text-xs text-green-600">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              <span>+8 this month</span>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-none border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#4B5563]">Offline Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#9B1B30]">
              {applications.filter(a => a.source === 'Admin').length}
            </div>
            <div className="flex items-center mt-1 text-xs text-[#4B5563]">
              <Badge className="bg-[#9B1B30] text-white rounded-none text-xs px-1.5 py-0.5">Admin</Badge>
              <span className="ml-2">Offline applications</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-none border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by student name, email, or university..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-none"
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
                  {/* Use the canonical APPLICATION_STATUSES so the filter value
                      matches what the API actually returns. `STATUS_DISPLAY[s].label`
                      is the human-readable text shown to the user. */}
                  {APPLICATION_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_DISPLAY[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[150px] rounded-none">
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Admin">Admin (Offline)</SelectItem>
                  <SelectItem value="Partner">Partner</SelectItem>
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
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-[#1F2937]">
                          {/* Some students sign up without filling their name;
                              fall back to the email local-part so the row is
                              still readable instead of an em-dash placeholder. */}
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
                        <Link href={`/admin/applications/${application.id}`}>
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
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/students/${application.studentId}`}>
                                View Student
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/applications/${application.id}`}>
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
                ))}
                {filteredApplications.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#4B5563]">
                      {applications.length === 0 ? 'No applications yet' : 'No applications match your filters'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Eye, Edit, MoreHorizontal, Trash2, X, Download } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ListPageSkeleton } from '@/components/partner/skeletons';
import { apiFetchJson } from '@/lib/api-client';
import type { PartnerStudent, PartnerStudentStatus } from '@/lib/partner-student-mapper';

export default function PartnerStudentsPage() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

  const [students, setStudents] = useState<PartnerStudent[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce search input by 250ms so we don't fire one request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 250);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      params.set('limit', '50');
      const qs = params.toString();
      const res = await apiFetchJson<{
        students: PartnerStudent[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(`/api/partner/students${qs ? `?${qs}` : ''}`);
      setStudents(res.students || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('[partner/students] fetch failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to load students.');
      setStudents([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    void fetchStudents();
  }, [fetchStudents]);

  const handleDeleteStudent = (id: string) => {
    setStudentToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/partner/students/${studentToDelete}`, {
        method: 'DELETE',
      });
      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Delete failed (HTTP ${res.status})`);
      }
      // Optimistic local update — remove from the list immediately
      setStudents((prev) => prev.filter((s) => s.id !== studentToDelete));
      setTotal((prev) => Math.max(0, prev - 1));
      setShowDeleteModal(false);
      setStudentToDelete(null);
    } catch (err) {
      console.error('[partner/students] delete failed:', err);
      setError(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: PartnerStudentStatus) => {
    const variants: Record<PartnerStudentStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      'New': { variant: 'secondary', label: 'New' },
      'In Progress': { variant: 'outline', label: 'In Progress' },
      'Applied': { variant: 'outline', label: 'Applied' },
      'Accepted': { variant: 'default', label: 'Accepted' },
      'Rejected': { variant: 'destructive', label: 'Rejected' },
    };
    const config = variants[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant} className="rounded-none">{config.label}</Badge>;
  };

  // Stats are derived from the full unfiltered list. We don't have a
  // /stats endpoint, so we do a single unfiltered fetch on first
  // mount and tally from that. This keeps the cards cheap.
  const [stats, setStats] = useState({ new: 0, inProgress: 0, accepted: 0 });
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetchJson<{ students: PartnerStudent[] }>(
          '/api/partner/students?limit=100',
        );
        if (cancelled) return;
        const s = res.students || [];
        setStats({
          new: s.filter((x) => x.status === 'New').length,
          inProgress: s.filter((x) => x.status === 'In Progress').length,
          accepted: s.filter((x) => x.status === 'Accepted').length,
        });
      } catch {
        // Non-fatal: stats just stay at 0
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full mx-4 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#1B2A4A]">Delete Student</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="text-[#4B5563] hover:text-[#1B2A4A] disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[#4B5563] mb-6">
              Are you sure you want to delete this student? This action cannot be undone.
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

      {isLoading ? (
        <ListPageSkeleton />
      ) : (
        <div className="space-y-6">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#1B2A4A]">Students</h1>
                <p className="text-[#4B5563] mt-1">Manage your student applications</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="rounded-none" disabled>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button
                  asChild
                  className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
                >
                  <Link href="/partner/students/new" className="flex items-center">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Student
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="rounded-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#4B5563]">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#1B2A4A]">{total}</div>
                <p className="text-sm text-[#4B5563] mt-1">Registered students</p>
              </CardContent>
            </Card>
            <Card className="rounded-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#4B5563]">New</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#1B2A4A]">{stats.new}</div>
                <p className="text-sm text-[#4B5563] mt-1">Pending review</p>
              </CardContent>
            </Card>
            <Card className="rounded-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#4B5563]">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#1B2A4A]">{stats.inProgress}</div>
                <p className="text-sm text-[#4B5563] mt-1">Active applications</p>
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
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-none"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 rounded-none">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Applied">Applied</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
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
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">Contact</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">Nationality</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">Target</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">Added</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <Link
                            href={`/partner/students/${student.id}`}
                            className="font-medium text-[#1B2A4A] hover:underline"
                          >
                            {student.studentName}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="text-[#1B2A4A]">{student.studentEmail || '—'}</p>
                            <p className="text-[#4B5563]">{student.studentPhone || '—'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#4B5563]">{student.nationality || '—'}</td>
                        <td className="px-6 py-4 text-[#4B5563]">
                          {student.targetUniversity || student.targetProgram
                            ? `${student.targetUniversity ?? ''}${
                                student.targetProgram ? ' · ' + student.targetProgram : ''
                              }`
                            : '—'}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(student.status)}</td>
                        <td className="px-6 py-4 text-[#4B5563]">
                          {student.createdAt
                            ? new Date(student.createdAt).toLocaleDateString()
                            : '—'}
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
                                <Link
                                  href={`/partner/students/${student.id}`}
                                  className="flex items-center cursor-pointer"
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/partner/students/${student.id}/edit`}
                                  className="flex items-center cursor-pointer"
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteStudent(student.id)}
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

              {students.length === 0 && !error && (
                <div className="p-12 text-center">
                  <div className="text-[#4B5563]">
                    <p className="text-lg font-medium">No students found</p>
                    <p className="mt-1">
                      {debouncedSearch || statusFilter !== 'all'
                        ? 'Try adjusting your filters.'
                        : 'Click "Add Student" to create your first one.'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

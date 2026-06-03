'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Plus,
  ChevronRight,
  Calendar,
  MessageSquare,
  Bell,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { apiFetchJson, ApiError } from '@/lib/api-client';

interface PartnerStudent {
  id: string;
  student_name: string | null;
  student_email: string | null;
  student_phone?: string | null;
  nationality?: string | null;
  target_university?: string | null;
  target_program?: string | null;
  status?: string | null;
  created_at: string;
}

interface PartnerApplication {
  id: string;
  student_name: string | null;
  university: string | null;
  program: string | null;
  status: string | null;
  submitted_at?: string | null;
  created_at: string;
}

interface PartnerFee {
  id: string;
  student_name: string | null;
  amount: number | null;
  currency: string | null;
  status: string | null;
  due_date?: string | null;
  created_at: string;
}

const ACTIVE_APPLICATION_STATUSES = new Set([
  'Draft',
  'Submitted',
  'Under Review',
  'Documents Requested',
  'In Progress',
]);

export default function PartnerDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [students, setStudents] = useState<PartnerStudent[]>([]);
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [fees, setFees] = useState<PartnerFee[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // partner-students and partner-applications both return arrays directly
        // (not wrapped in { data }), per their route handlers.
        const [studentsRes, appsRes, feesRes] = await Promise.all([
          apiFetchJson<PartnerStudent[]>('/api/partner-students'),
          apiFetchJson<PartnerApplication[]>('/api/partner-applications'),
          apiFetchJson<PartnerFee[]>('/api/partner-fees'),
        ]);
        if (cancelled) return;
        setStudents(Array.isArray(studentsRes) ? studentsRes : []);
        setApplications(Array.isArray(appsRes) ? appsRes : []);
        setFees(Array.isArray(feesRes) ? feesRes : []);
      } catch (err) {
        if (cancelled) return;
        setLoadError(err instanceof ApiError ? err.message : 'Failed to load dashboard');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Derive stats from real data
  const totalStudents = students.length;
  const activeApplications = applications.filter((a) =>
    ACTIVE_APPLICATION_STATUSES.has(a.status || ''),
  ).length;
  const acceptedApplications = applications.filter((a) => a.status === 'Accepted').length;
  const pendingFees = fees
    .filter((f) => f.status === 'Pending')
    .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

  const recentStudents = students.slice(0, 3);
  const recentApplications = applications.slice(0, 3);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      New: { variant: 'secondary', label: 'New' },
      'In Progress': { variant: 'outline', label: 'In Progress' },
      Accepted: { variant: 'default', label: 'Accepted' },
      'Under Review': { variant: 'outline', label: 'Under Review' },
      'Documents Requested': { variant: 'outline', label: 'Documents Requested' },
      Submitted: { variant: 'outline', label: 'Submitted' },
      Draft: { variant: 'outline', label: 'Draft' },
      Rejected: { variant: 'destructive', label: 'Rejected' },
    };
    const config = variants[status] || { variant: 'outline' as const, label: status };
    return (
      <Badge variant={config.variant} className="rounded-none">
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency = 'CNY') => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `${currency} ${amount.toLocaleString()}`;
    }
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B2A4A]" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{loadError}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Dashboard</h1>
          <p className="text-[#4B5563] mt-1">Your partner overview.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="bg-[#9B1B30] hover:bg-[#7A1526] rounded-none">
            <Link href="/partner/students/new" className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-none">
            <Link href="/partner/applications/new" className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              New Application
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-none">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-medium text-[#4B5563]">Total Students</CardTitle>
              <CardDescription>All-time</CardDescription>
            </div>
            <div className="bg-[#9B1B30]/10 p-2 rounded-none">
              <Users className="h-5 w-5 text-[#9B1B30]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B2A4A]">{totalStudents}</div>
            <p className="text-sm text-[#4B5563] mt-1">Students you manage</p>
            <Button asChild variant="outline" size="sm" className="mt-4 w-full rounded-none">
              <Link href="/partner/students" className="flex items-center justify-center">
                View Students <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-medium text-[#4B5563]">Active Applications</CardTitle>
              <CardDescription>In process</CardDescription>
            </div>
            <div className="bg-[#1B2A4A]/10 p-2 rounded-none">
              <FileText className="h-5 w-5 text-[#1B2A4A]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B2A4A]">{activeApplications}</div>
            <p className="text-sm text-[#4B5563] mt-1">In progress</p>
            <Button asChild variant="outline" size="sm" className="mt-4 w-full rounded-none">
              <Link href="/partner/applications" className="flex items-center justify-center">
                View Applications <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-medium text-[#4B5563]">Pending Fees</CardTitle>
              <CardDescription>Awaiting payment</CardDescription>
            </div>
            <div className="bg-[#D4A853]/10 p-2 rounded-none">
              <DollarSign className="h-5 w-5 text-[#D4A853]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B2A4A]">
              {formatCurrency(pendingFees)}
            </div>
            <p className="text-sm text-[#4B5563] mt-1">From your students</p>
            <Button asChild variant="outline" size="sm" className="mt-4 w-full rounded-none">
              <Link href="/partner/fees" className="flex items-center justify-center">
                View Fees <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-medium text-[#4B5563]">Accepted</CardTitle>
              <CardDescription>Successful applications</CardDescription>
            </div>
            <div className="bg-green-100 p-2 rounded-none">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B2A4A]">{acceptedApplications}</div>
            <p className="text-sm text-[#4B5563] mt-1">Total accepted</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Students */}
          <Card className="rounded-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Students</CardTitle>
                <CardDescription>Newest students added</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="rounded-none">
                <Link href="/partner/students">
                  View all <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentStudents.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500">
                  <p className="mb-3">No students yet — add your first to get started.</p>
                  <Button asChild size="sm" className="bg-[#9B1B30] hover:bg-[#7A1526] rounded-none">
                    <Link href="/partner/students/new">Add Student</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentStudents.map((student) => (
                    <Link
                      key={student.id}
                      href={`/partner/students/${student.id}`}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 -mx-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 rounded-none bg-[#9B1B30]">
                          <span className="text-white font-medium">
                            {(student.student_name || '?').charAt(0).toUpperCase()}
                          </span>
                        </Avatar>
                        <div>
                          <p className="font-medium text-[#1B2A4A] group-hover:text-[#9B1B30]">
                            {student.student_name || 'Unnamed'}
                          </p>
                          <p className="text-sm text-[#4B5563]">{student.student_email}</p>
                          <p className="text-xs text-[#4B5563] flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(student.created_at)} • {student.nationality || '—'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {student.status && getStatusBadge(student.status)}
                        <ChevronRight className="h-4 w-4 text-[#4B5563] group-hover:text-[#9B1B30] opacity-0 group-hover:opacity-100" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card className="rounded-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Latest application updates</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="rounded-none">
                <Link href="/partner/applications">
                  View all <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentApplications.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500">
                  <p className="mb-3">No applications yet.</p>
                  <Button asChild size="sm" variant="outline" className="rounded-none">
                    <Link href="/partner/applications/new">Create Application</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentApplications.map((app) => (
                    <Link
                      key={app.id}
                      href={`/partner/applications/${app.id}`}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 -mx-3 group"
                    >
                      <div>
                        <p className="font-medium text-[#1B2A4A] group-hover:text-[#9B1B30]">
                          {app.student_name || 'Unnamed'}
                        </p>
                        <p className="text-sm text-[#4B5563]">
                          {app.program} • {app.university}
                        </p>
                        <p className="text-xs text-[#4B5563] flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(app.submitted_at || app.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {app.status && getStatusBadge(app.status)}
                        <ChevronRight className="h-4 w-4 text-[#4B5563] group-hover:text-[#9B1B30] opacity-0 group-hover:opacity-100" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-none">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="secondary" className="w-full justify-start rounded-none bg-white border border-[#1B2A4A] text-[#1B2A4A] hover:bg-gray-50">
                <Link href="/partner/students/new" className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Add New Student
                </Link>
              </Button>
              <Button asChild variant="secondary" className="w-full justify-start rounded-none bg-white border border-[#1B2A4A] text-[#1B2A4A] hover:bg-gray-50">
                <Link href="/partner/applications/new" className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Create Application
                </Link>
              </Button>
              <Button asChild variant="secondary" className="w-full justify-start rounded-none bg-white border border-[#1B2A4A] text-[#1B2A4A] hover:bg-gray-50">
                <Link href="/partner/lead-sharing" className="flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Share Lead
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  FileText,
  TrendingUp,
  Plus,
  ChevronRight,
  Calendar,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { apiFetchJson, ApiError } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';

interface PartnerStudent {
  id: string;
  studentName: string | null;
  studentEmail: string | null;
  studentPhone?: string | null;
  nationality?: string | null;
  targetUniversity?: string | null;
  targetProgram?: string | null;
  status?: string | null;
  createdAt: string;
}

interface PartnerApplication {
  id: string;
  studentName: string | null;
  university: string | null;
  program: string | null;
  status: string | null;
  submittedAt?: string | null;
  createdAt: string;
}

interface PaginatedStudents {
  students: PartnerStudent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PaginatedApplications {
  applications: PartnerApplication[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ACTIVE_APPLICATION_STATUSES = new Set([
  'Draft',
  'Submitted',
  'Under Review',
  'Documents Requested',
  'In Progress',
]);

export default function PartnerDashboard() {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [students, setStudents] = useState<PartnerStudent[]>([]);
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  // Server-side totals from `count: 'exact'` on the paginated endpoints.
  // The arrays above are capped at 100 rows (the API's hard limit), so
  // any dashboard stat that should reflect "the whole org" must use these
  // totals — never `students.length` / `applications.length`.
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalApplications, setTotalApplications] = useState(0);
  const [studentCountCapped, setStudentCountCapped] = useState(false);
  const [appCountCapped, setAppCountCapped] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Both endpoints return { ..., total, page, limit, totalPages }
        // where `total` is from Supabase's `count: 'exact'`. The response
        // arrays are capped at limit=100 (the API's hard max). Dashboard
        // cards use `total` so the counts stay correct past 100 rows; the
        // status breakdowns (active / accepted) and the "Recent" lists
        // work off the capped slice, which is fine — the active count is
        // a directional signal, and "Recent 3" is always the latest 3.
        const [studentsRes, appsRes] = await Promise.all([
          apiFetchJson<PaginatedStudents>('/api/partner/students?limit=100'),
          apiFetchJson<PaginatedApplications>('/api/partner/applications?limit=100'),
        ]);
        if (cancelled) return;
        const studentsList = Array.isArray(studentsRes?.students) ? studentsRes.students : [];
        const appsList = Array.isArray(appsRes?.applications) ? appsRes.applications : [];
        setStudents(studentsList);
        setApplications(appsList);
        setTotalStudents(studentsRes?.total ?? studentsList.length);
        setTotalApplications(appsRes?.total ?? appsList.length);
        // Flag the status breakdowns as lower-bound estimates when the
        // fetched slice doesn't cover the full org. The headline totals
        // stay exact because they come from the API's count.
        setStudentCountCapped((studentsRes?.total ?? studentsList.length) > studentsList.length);
        setAppCountCapped((appsRes?.total ?? appsList.length) > appsList.length);
      } catch (err) {
        if (cancelled) return;
        setLoadError(
          err instanceof ApiError ? err.message : t('partnerDashboard.failedToLoad'),
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  // Derive stats from real data. The headline counts use the server-side
  // `total` (exact count, not capped at 100). Status breakdowns still
  // come from the fetched slice — if the org has more than 100 rows the
  // hint text flags it as a lower-bound estimate.
  const activeApplications = applications.filter((a) =>
    ACTIVE_APPLICATION_STATUSES.has(a.status || ''),
  ).length;
  const acceptedApplications = applications.filter((a) => a.status === 'Accepted').length;

  const recentStudents = students.slice(0, 3);
  const recentApplications = applications.slice(0, 3);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      New: { variant: 'secondary', label: t('partnerStudents.statusNew') },
      'In Progress': { variant: 'outline', label: t('partnerStudents.statusInProgress') },
      Accepted: { variant: 'default', label: t('partnerStudents.statusAccepted') },
      'Under Review': { variant: 'outline', label: 'Under Review' },
      'Documents Requested': { variant: 'outline', label: 'Documents Requested' },
      Submitted: { variant: 'outline', label: 'Submitted' },
      Draft: { variant: 'outline', label: 'Draft' },
      Rejected: { variant: 'destructive', label: t('partnerStudents.statusRejected') },
    };
    const config = variants[status] || { variant: 'outline' as const, label: status };
    return (
      <Badge variant={config.variant} className="rounded-none">
        {config.label}
      </Badge>
    );
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return t('partnerCommon.placeholderDash');
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
        <Spinner size="lg" className="text-[#1B2A4A]" />
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
          <h1 className="text-2xl font-bold text-[#1B2A4A]">{t('partnerDashboard.title')}</h1>
          <p className="text-[#4B5563] mt-1">{t('partnerDashboard.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="bg-[#9B1B30] hover:bg-[#7A1526] rounded-none">
            <Link href="/partner/students/new" className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              {t('partnerDashboard.addStudent')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-none">
            <Link href="/partner/applications/new" className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              {t('partnerDashboard.newApplication')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-none">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-medium text-[#4B5563]">{t('partnerDashboard.totalStudents')}</CardTitle>
              <CardDescription>{t('partnerDashboard.totalStudentsDesc')}</CardDescription>
            </div>
            <div className="bg-[#9B1B30]/10 p-2 rounded-none">
              <Users className="h-5 w-5 text-[#9B1B30]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B2A4A]">{totalStudents}</div>
            <p className="text-sm text-[#4B5563] mt-1">{t('partnerDashboard.totalStudentsHint')}</p>
            <Button asChild variant="outline" size="sm" className="mt-4 w-full rounded-none">
              <Link href="/partner/students" className="flex items-center justify-center">
                {t('partnerDashboard.viewStudents')} <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-medium text-[#4B5563]">{t('partnerDashboard.activeApplications')}</CardTitle>
              <CardDescription>{t('partnerDashboard.activeApplicationsDesc')}</CardDescription>
            </div>
            <div className="bg-[#1B2A4A]/10 p-2 rounded-none">
              <FileText className="h-5 w-5 text-[#1B2A4A]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B2A4A]">{activeApplications}</div>
            <p className="text-sm text-[#4B5563] mt-1">{t('partnerDashboard.activeApplicationsHint')}</p>
            {appCountCapped && (
              <p className="text-xs text-amber-700 mt-1">
                {t('partnerDashboard.statusBreakdownCapped', {
                  shown: applications.length,
                  total: totalApplications,
                })}
              </p>
            )}
            <Button asChild variant="outline" size="sm" className="mt-4 w-full rounded-none">
              <Link href="/partner/applications" className="flex items-center justify-center">
                {t('partnerDashboard.viewApplications')} <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-medium text-[#4B5563]">{t('partnerDashboard.accepted')}</CardTitle>
              <CardDescription>{t('partnerDashboard.acceptedDesc')}</CardDescription>
            </div>
            <div className="bg-green-100 p-2 rounded-none">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B2A4A]">{acceptedApplications}</div>
            <p className="text-sm text-[#4B5563] mt-1">{t('partnerDashboard.acceptedHint')}</p>
            {appCountCapped && (
              <p className="text-xs text-amber-700 mt-1">
                {t('partnerDashboard.statusBreakdownCapped', {
                  shown: applications.length,
                  total: totalApplications,
                })}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Students */}
          <Card className="rounded-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('partnerDashboard.recentStudents')}</CardTitle>
                <CardDescription>{t('partnerDashboard.recentStudentsDesc')}</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="rounded-none">
                <Link href="/partner/students">
                  {t('partnerDashboard.viewAll')} <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentStudents.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500">
                  <p className="mb-3">{t('partnerDashboard.noStudentsYet')}</p>
                  <Button asChild size="sm" className="bg-[#9B1B30] hover:bg-[#7A1526] rounded-none">
                    <Link href="/partner/students/new">{t('partnerDashboard.addStudent')}</Link>
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
                            {(student.studentName || '?').charAt(0).toUpperCase()}
                          </span>
                        </Avatar>
                        <div>
                          <p className="font-medium text-[#1B2A4A] group-hover:text-[#9B1B30]">
                            {student.studentName || t('partnerDashboard.unnamed')}
                          </p>
                          <p className="text-sm text-[#4B5563]">{student.studentEmail}</p>
                          <p className="text-xs text-[#4B5563] flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(student.createdAt)} • {student.nationality || t('partnerCommon.placeholderDash')}
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
                <CardTitle>{t('partnerDashboard.recentApplications')}</CardTitle>
                <CardDescription>{t('partnerDashboard.recentApplicationsDesc')}</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="rounded-none">
                <Link href="/partner/applications">
                  {t('partnerDashboard.viewAll')} <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentApplications.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500">
                  <p className="mb-3">{t('partnerDashboard.noApplicationsYet')}</p>
                  <Button asChild size="sm" variant="outline" className="rounded-none">
                    <Link href="/partner/applications/new">{t('partnerDashboard.createApplication')}</Link>
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
                          {app.studentName || t('partnerDashboard.unnamed')}
                        </p>
                        <p className="text-sm text-[#4B5563]">
                          {app.program} • {app.university}
                        </p>
                        <p className="text-xs text-[#4B5563] flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(app.submittedAt || app.createdAt)}
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
              <CardTitle>{t('partnerDashboard.quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="secondary" className="w-full justify-start rounded-none bg-white border border-[#1B2A4A] text-[#1B2A4A] hover:bg-gray-50">
                <Link href="/partner/students/new" className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  {t('partnerDashboard.addNewStudent')}
                </Link>
              </Button>
              <Button asChild variant="secondary" className="w-full justify-start rounded-none bg-white border border-[#1B2A4A] text-[#1B2A4A] hover:bg-gray-50">
                <Link href="/partner/applications/new" className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  {t('partnerDashboard.createApplication')}
                </Link>
              </Button>
              <Button asChild variant="secondary" className="w-full justify-start rounded-none bg-white border border-[#1B2A4A] text-[#1B2A4A] hover:bg-gray-50">
                <Link href="/partner/lead-sharing" className="flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {t('partnerDashboard.shareLead')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

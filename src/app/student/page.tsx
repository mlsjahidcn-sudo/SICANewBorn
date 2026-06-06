'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { apiFetchJson, ApiError } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  FileText,
  GraduationCap,
  Bell,
  Plus,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { StudentDashboardSkeleton } from '@/components/student/skeletons';

// Real DB shapes (subset of fields we display)
interface StudentApplication {
  id: string;
  university_name: string;
  university_name_cn?: string | null;
  program_name: string;
  program_name_cn?: string | null;
  intake: string;
  status: string;
  created_at: string;
}

interface StudentDocument {
  id: string;
  name: string;
  name_cn?: string | null;
  category: string;
  file_size?: number | null;
  status: string;
  uploaded_at: string;
}

const STATUS_COLOR: Record<string, string> = {
  Accepted: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  'In Review': 'bg-blue-100 text-blue-800',
  Draft: 'bg-gray-100 text-gray-700',
  Submitted: 'bg-blue-100 text-blue-800',
  Pending: 'bg-yellow-100 text-yellow-800',
  Verified: 'bg-green-100 text-green-800',
};

const PENDING_STATUSES = new Set(['Submitted', 'In Review', 'Pending']);

export default function StudentDashboardPage() {
  const { t, locale } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  // Phase 1.3: latest 3 notifications for the dashboard card.
  // Keeps the bell badge + the card in sync without a separate
  // fetch on the dashboard.
  interface StudentNotifSummary {
    id: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    link_url?: string | null;
  }
  const [latestNotifs, setLatestNotifs] = useState<StudentNotifSummary[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      // The student layout should redirect, but bail safely here.
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [appsRes, docsRes, notifsRes] = await Promise.all([
          apiFetchJson<{ data: StudentApplication[] }>('/api/student/applications'),
          apiFetchJson<{ data: StudentDocument[] }>('/api/student/documents'),
          apiFetchJson<{ notifications: StudentNotifSummary[] }>(
            '/api/student/notifications?limit=3',
          ),
        ]);
        if (cancelled) return;
        setApplications(appsRes.data || []);
        setDocuments(docsRes.data || []);
        setLatestNotifs(notifsRes.notifications || []);
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof ApiError ? err.message : 'Failed to load dashboard';
        setLoadError(msg);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  // Derive stats from real data
  const totalApplications = applications.length;
  const pendingApplications = applications.filter((a) => PENDING_STATUSES.has(a.status)).length;
  const acceptedOffers = applications.filter((a) => a.status === 'Accepted').length;
  const totalDocuments = documents.length;
  // Phase 2: action-needed breakdown for the dashboard banner
  const docsNeeded = applications.filter((a) => a.status === 'Documents Requested');
  const resumableDrafts = applications.filter((a) => a.status === 'Draft');
  const recentApplications = applications.slice(0, 2);
  const recentDocuments = documents.slice(0, 3);

  const getStatusColor = (status: string) =>
    STATUS_COLOR[status] || 'bg-yellow-100 text-yellow-800';

  const quickActions = [
    {
      title: t('student.newApplication'),
      description: t('student.startNewApplication'),
      icon: Plus,
      href: '/student/applications/new',
      color: 'bg-[#9B1B30]',
    },
    {
      title: t('student.uploadDocument'),
      description: t('student.uploadRequiredDocs'),
      icon: FileText,
      href: '/student/documents',
      color: 'bg-[#1B2A4A]',
    },
    {
      title: t('student.browseUniversities'),
      description: t('student.explorePrograms'),
      icon: GraduationCap,
      href: '/universities',
      color: 'bg-[#D4A853]',
    },
  ];

  if (isLoading) {
    return <StudentDashboardSkeleton />;
  }

  if (loadError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {loadError}
        </div>
      </div>
    );
  }

  const formatBytes = (bytes?: number | null) => {
    if (!bytes) return '—';
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1B2A4A]">
          {t('student.welcomeBack')}{user?.email ? `, ${user.email}` : ''} 👋
        </h1>
        <p className="text-[#4B5563] mt-2">{t('student.manageApplications')}</p>
      </div>

      {/* Phase 2: action-needed callout — surfaces the highest-priority
          items from the sidebar badge in the body so the student
          doesn't miss them. Urgent (Documents Requested) outranks
          resumable (Draft). */}
      {docsNeeded.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-l-4 border-[#9B1B30] bg-red-50 rounded-none">
          <AlertCircle className="h-5 w-5 text-[#9B1B30] flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-[#1B2A4A]">
              {docsNeeded.length} application{docsNeeded.length === 1 ? '' : 's'}{' '}
              need{docsNeeded.length === 1 ? 's' : ''} documents from you
            </p>
            <p className="text-sm text-gray-700 mt-0.5">
              SICA is waiting on uploaded files before they can continue reviewing your application.
            </p>
          </div>
          <Link href="/student/applications" className="sm:ml-auto">
            <Button size="sm" className="bg-[#9B1B30] hover:bg-[#7A1525] text-white rounded-none">
              Review now
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      )}
      {resumableDrafts.length > 0 && docsNeeded.length === 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-l-4 border-[#D4A853] bg-[#FAF6E8] rounded-none">
          <FileText className="h-5 w-5 text-[#9B1B30] flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-[#1B2A4A]">
              You have {resumableDrafts.length} unsent draft
              {resumableDrafts.length === 1 ? '' : 's'}
            </p>
            <p className="text-sm text-gray-700 mt-0.5">
              Pick up where you left off — your progress is saved.
            </p>
          </div>
          <Link href="/student/applications" className="sm:ml-auto">
            <Button
              size="sm"
              variant="outline"
              className="border-[#1B2A4A] text-[#1B2A4A] hover:bg-[#1B2A4A] hover:text-white rounded-none"
            >
              Resume
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#4B5563]">
              {t('student.totalApplications')}
            </CardTitle>
            <BookOpen className="h-4 w-4 text-[#1B2A4A]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B2A4A]">{totalApplications}</div>
            <p className="text-xs text-[#4B5563] mt-1">{t('student.thisCycle')}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#4B5563]">
              {t('student.pendingReview')}
            </CardTitle>
            <Clock className="h-4 w-4 text-[#D4A853]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B2A4A]">{pendingApplications}</div>
            <p className="text-xs text-[#4B5563] mt-1">{t('student.awaitingDecision')}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#4B5563]">
              {t('student.acceptedOffers')}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B2A4A]">{acceptedOffers}</div>
            <p className="text-xs text-[#4B5563] mt-1">{t('student.congratulations')}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#4B5563]">
              {t('student.documents')}
            </CardTitle>
            <FileText className="h-4 w-4 text-[#1B2A4A]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B2A4A]">{totalDocuments}</div>
            <p className="text-xs text-[#4B5563] mt-1">{t('student.uploaded')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-[#1B2A4A] mb-4">{t('student.quickActions')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-[#1B2A4A]">{action.title}</h3>
                  <p className="text-sm text-[#4B5563] mt-1">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#1B2A4A]">
                {t('student.recentApplications')}
              </CardTitle>
              <Link href="/student/applications">
                <Button variant="ghost" size="sm" className="text-[#9B1B30] hover:text-[#7a1525]">
                  {t('student.viewAll')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentApplications.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">
                <p className="mb-3">{t('student.noApplications')}</p>
                <Link href="/student/applications/new">
                  <Button size="sm" className="bg-[#9B1B30] hover:bg-[#7A1526]">
                    {t('student.startYourFirst')}
                  </Button>
                </Link>
              </div>
            ) : (
              recentApplications.map((app) => (
                <div key={app.id} className="flex items-start justify-between p-4 bg-[#F3F4F6] rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-[#1B2A4A]">
                      {locale === 'zh' && app.university_name_cn
                        ? app.university_name_cn
                        : app.university_name}
                    </h4>
                    <p className="text-sm text-[#4B5563]">
                      {locale === 'zh' && app.program_name_cn
                        ? app.program_name_cn
                        : app.program_name}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="h-3 w-3 text-[#4B5563]" />
                      <span className="text-xs text-[#4B5563]">{app.intake}</span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#1B2A4A]">
                {t('student.recentDocuments')}
              </CardTitle>
              <Link href="/student/documents">
                <Button variant="ghost" size="sm" className="text-[#9B1B30] hover:text-[#7a1525]">
                  {t('student.viewAll')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentDocuments.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">
                <p className="mb-3">{t('student.noDocuments')}</p>
                <Link href="/student/documents">
                  <Button size="sm" variant="outline" className="border-[#1B2A4A] text-[#1B2A4A]">
                    {t('student.uploadNow')}
                  </Button>
                </Link>
              </div>
            ) : (
              recentDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-[#F3F4F6] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1B2A4A] rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[#1B2A4A]">
                        {locale === 'zh' && doc.name_cn ? doc.name_cn : doc.name}
                      </h4>
                      <p className="text-xs text-[#4B5563]">
                        {doc.category} • {formatBytes(doc.file_size)}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(doc.status)}>{doc.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Phase 1.3: latest-3 notifications card. Renders the
          3 most recent rows from the notifications API.
          Unread rows get a crimson dot + bold title; read
          rows are muted. The 'Open →' hint shows when the
          row has a link_url (Phase 1.2). */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-[#1B2A4A]">
              {t('student.notifications')}
            </CardTitle>
            <Link
              href="/student/notifications"
              className="text-xs font-semibold text-[#9B1B30] hover:underline"
            >
              {t('student.viewAll')} →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {latestNotifs.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              {t('student.noNotifications')}
            </p>
          ) : (
            <div className="space-y-3">
              {latestNotifs.map((n) => (
                <Link
                  key={n.id}
                  href={n.link_url || '/student/notifications'}
                  className="block group hover:bg-gray-50 -mx-2 px-2 py-1.5"
                >
                  <div className="flex items-start gap-2">
                    {!n.is_read && (
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-[#9B1B30] flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm truncate ${
                          n.is_read ? 'font-normal text-gray-700' : 'font-semibold text-[#1B2A4A]'
                        }`}
                      >
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{n.message}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

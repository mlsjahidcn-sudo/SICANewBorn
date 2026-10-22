'use client';
import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowRight,
  FileText,
  UserPlus,
  Inbox,
  CalendarCheck,
  GraduationCap,
  BookOpen,
  Award,
  Activity,
} from 'lucide-react';
import { PageContainer } from '@/components/admin/page-container';
import {
  MetricTile,
  ReportPanel,
  ReportingToolbar,
  ReportingError,
  ReportLoading,
  ReportingTrend,
} from '@/components/admin/reporting-ui';
import { useI18n } from '@/lib/i18n';
import { useAdminReport, useReportingFilters } from '@/hooks/use-admin-report';
import type { DashboardAnalytics } from '@/lib/admin-dashboard-report';

interface RecentApplication {
  id: string;
  studentName: string;
  university: string;
  program: string;
  status: string;
  applicationNumber: string | null;
  createdAt: string;
  surface?: 'student' | 'partner';
}
interface ActivityEvent {
  id: string;
  type: 'application' | 'student' | 'lead';
  message: string;
  timestamp: string;
  meta?: {
    student_id?: string;
    partner_student_id?: string;
    application_id?: string;
    partner_application_id?: string;
    name?: string;
    lead_id?: string;
    lead_type?: string;
  };
}
interface DashboardReport {
  analytics: DashboardAnalytics;
  generatedAt: string;
  stats: {
    universities: number;
    programs: number;
    scholarships: number;
    leadsUnassigned: number;
    leadsNeedsFollowup: number;
  };
  recentApplications: RecentApplication[];
  recentActivity: ActivityEvent[];
}

const APPLICATION_STATUS_KEYS: Record<string, string> = {
  'Decision Made': 'adminReporting.decisionMade',
  Draft: 'studentApps.filterDraft',
  Submitted: 'studentApps.filterSubmitted',
  'Under Review': 'studentApps.filterInReview',
  'In Review': 'studentApps.filterInReview',
  'Documents Requested': 'studentApps.filterDocumentsRequested',
  Accepted: 'studentApps.filterAccepted',
  Rejected: 'studentApps.filterRejected',
  Withdrawn: 'studentApps.filterWithdrawn',
  'Withdrawal Requested': 'partnerAppStatus.withdrawalrequested',
};
function ApplicationStatus({ status }: { status: string }): React.JSX.Element {
  const { t } = useI18n();
  return (
    <span
      className={`inline-block whitespace-nowrap border px-2 py-1 text-[10px] font-medium ${status === 'Rejected' || status === 'Documents Requested' ? 'border-[#9B1B30]/20 bg-[#9B1B30]/5 text-[#9B1B30]' : 'border-[#1B2A4A]/15 bg-[#1B2A4A]/5 text-[#1B2A4A]'}`}
    >
      {APPLICATION_STATUS_KEYS[status]
        ? t(APPLICATION_STATUS_KEYS[status])
        : status}
    </span>
  );
}

export default function AdminDashboardPage(): React.JSX.Element {
  const { t, locale } = useI18n();
  const { filters, ready, query, update } = useReportingFilters();
  const report = useAdminReport<DashboardReport>(
    ready ? `/api/admin/dashboard?${query}` : null,
  );
  const data = report.data;
  const analytics = data?.analytics;
  const formatDate = (value: string): string =>
    new Date(value).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-GB', {
      timeZone: 'Asia/Shanghai',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  const appLink = (application: RecentApplication): string =>
    application.surface === 'partner'
      ? `/admin/partner-applications/${application.id}`
      : `/admin/applications/${application.id}`;
  const activityLink = (event: ActivityEvent): string => {
    if (event.meta?.student_id)
      return `/admin/students/${event.meta.student_id}`;
    if (event.meta?.partner_student_id)
      return `/admin/partner-students/${event.meta.partner_student_id}`;
    if (event.meta?.partner_application_id)
      return `/admin/partner-applications/${event.meta.partner_application_id}`;
    if (event.meta?.application_id)
      return `/admin/applications/${event.meta.application_id}`;
    if (event.meta?.lead_type === 'webinar_signup')
      return '/admin/webinar-signups';
    if (event.meta?.lead_id && event.meta?.lead_type)
      return `/admin/leads/${event.meta.lead_id}?type=${event.meta.lead_type}`;
    return '/admin/applications';
  };
  const activityLabel = (event: ActivityEvent): string => {
    if (event.meta?.name)
      return t(
        event.meta.partner_student_id
          ? 'adminReporting.partnerStudentCreated'
          : 'adminReporting.studentCreated',
        { name: event.meta.name },
      );
    if (event.type === 'lead')
      return t('adminReporting.leadActivity', {
        source:
          event.meta?.lead_type === 'webinar_signup'
            ? t('adminReporting.webinars')
            : event.meta?.lead_type === 'contact'
              ? t('adminReporting.contactSource')
              : event.meta?.lead_type === 'chat'
                ? t('adminReporting.chatSource')
                : event.meta?.lead_type === 'assessment'
                  ? t('adminReporting.assessmentSource')
                  : '—',
      });
    return event.message;
  };
  return (
    <PageContainer width="wide">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9B1B30]">
            SICA / {t('adminNav.dashboard')}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1B2A4A] sm:text-3xl">
            {t('adminReporting.dashboardTitle')}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            {t('adminReporting.dashboardSubtitle')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/students/new"
            className="inline-flex items-center gap-2 border border-gray-200 bg-white px-3 py-2.5 text-xs font-medium text-[#1B2A4A] hover:bg-gray-50"
          >
            <UserPlus className="size-3.5" />
            {t('adminDashboard.quickAddOfflineStudent')}
          </Link>
          <Link
            href="/admin/applications/new"
            className="inline-flex items-center gap-2 bg-[#9B1B30] px-3 py-2.5 text-xs font-medium text-white hover:bg-[#7A1526]"
          >
            <FileText className="size-3.5 text-white" />
            {t('adminDashboard.quickAddApplication')}
          </Link>
        </div>
      </div>
      <div className="border border-[#1B2A4A]/12 bg-white p-4 sm:p-5">
        <ReportingToolbar
          filters={filters}
          update={update}
          refresh={report.refresh}
          loading={report.loading}
          generatedAt={data?.generatedAt}
          range={analytics?.range}
        />
      </div>
      <ReportingError
        error={report.error}
        stale={!!data}
        retry={report.refresh}
      />
      {!data && !report.error && <ReportLoading />}
      {data && analytics && (
        <>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <MetricTile
              label={t('adminReporting.leads')}
              value={analytics.metrics.leads.current}
              comparison={analytics.metrics.leads}
              subtitle={t('adminReporting.leadHint')}
              accent
            />
            <MetricTile
              label={t('adminReporting.applications')}
              value={analytics.metrics.applications.current}
              comparison={analytics.metrics.applications}
            />
            <MetricTile
              label={t('adminReporting.accounts')}
              value={analytics.metrics.accounts.current}
              comparison={analytics.metrics.accounts}
              subtitle={t('adminReporting.accountHint')}
            />
            <MetricTile
              label={t('adminReporting.webinars')}
              value={analytics.metrics.webinars.current}
              comparison={analytics.metrics.webinars}
            />
          </div>
          <div className="grid gap-5 xl:grid-cols-3">
            <ReportPanel
              title={t('adminReporting.attention')}
              description={t('adminReporting.currentQueues')}
              className="xl:order-2"
            >
              <div className="divide-y divide-gray-100 px-5">
                {[
                  {
                    label: t('adminDashboard.unassignedLeads'),
                    value: data.stats.leadsUnassigned,
                    href: '/admin/leads?queue=unassigned',
                    icon: UserPlus,
                  },
                  {
                    label: t('adminDashboard.needsFollowup'),
                    value: data.stats.leadsNeedsFollowup,
                    href: '/admin/leads?queue=followup',
                    icon: Inbox,
                  },
                  {
                    label: t('adminReporting.submitted'),
                    value: analytics.submitted,
                    href: '/admin/applications?status=Submitted',
                    icon: FileText,
                  },
                  {
                    label: t('adminReporting.pendingConsultations'),
                    value: analytics.pendingConsultations,
                    href: '/admin/counselling?status=Pending',
                    icon: CalendarCheck,
                  },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 py-4 text-xs text-[#1B2A4A] hover:text-[#9B1B30]"
                  >
                    <item.icon
                      aria-hidden="true"
                      className="size-4 shrink-0 text-[#1B2A4A]"
                    />
                    <span className="flex-1">{item.label}</span>
                    <strong
                      className={`text-xl font-semibold tabular-nums ${item.value ? 'text-[#9B1B30]' : 'text-gray-400'}`}
                    >
                      {item.value.toLocaleString()}
                    </strong>
                    <ArrowUpRight className="size-3.5 text-gray-400" />
                  </Link>
                ))}
              </div>
            </ReportPanel>
            <ReportPanel
              title={t('adminReporting.activityTrend')}
              description={t('adminReporting.trendDescription')}
              className="xl:order-1 xl:col-span-2"
            >
              <ReportingTrend
                data={analytics.trend}
                series={[
                  {
                    key: 'leads',
                    label: t('adminReporting.leads'),
                    color: '#1B2A4A',
                  },
                  {
                    key: 'applications',
                    label: t('adminReporting.applications'),
                    color: '#9B1B30',
                  },
                  {
                    key: 'previousApplications',
                    label: t('adminReporting.previousApplications'),
                    color: '#9CA3AF',
                    dashed: true,
                  },
                ]}
              />
            </ReportPanel>
          </div>
          <div className="grid gap-5 xl:grid-cols-3">
            <ReportPanel
              title={t('adminDashboard.recentApplications')}
              description={t('adminReporting.latestRecords')}
              className="xl:col-span-2"
              action={
                <Link
                  href="/admin/applications"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#9B1B30] hover:underline"
                >
                  {t('adminDashboard.viewAll')}
                  <ArrowUpRight className="size-3" />
                </Link>
              }
            >
              {data.recentApplications.length === 0 ? (
                <p className="p-10 text-center text-xs text-gray-500">
                  {t('adminDashboard.noApplicationsYet')}
                </p>
              ) : (
                <>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAFAF8] text-[10px] uppercase tracking-wider text-gray-500">
                        <tr>
                          <th className="px-5 py-3 font-medium">
                            {t('adminDashboard.colApplicant')}
                          </th>
                          <th className="px-5 py-3 font-medium">
                            {t('adminDashboard.colProgram')}
                          </th>
                          <th className="px-5 py-3 font-medium">
                            {t('adminDashboard.colStatus')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {data.recentApplications.map((application) => (
                          <tr
                            key={`${application.surface}-${application.id}`}
                            className="hover:bg-gray-50"
                          >
                            <td className="max-w-48 px-5 py-4">
                              <Link
                                href={appLink(application)}
                                className="block truncate font-semibold text-[#1B2A4A] hover:underline"
                              >
                                {application.studentName}
                              </Link>
                              <p className="mt-1 text-[10px] text-gray-500">
                                {t(
                                  application.surface === 'partner'
                                    ? 'adminReporting.sourcePartner'
                                    : 'adminReporting.sourceStudent',
                                )}{' '}
                                ·{' '}
                                {application.applicationNumber ||
                                  formatDate(application.createdAt)}
                              </p>
                            </td>
                            <td className="max-w-60 px-5 py-4">
                              <p
                                className="truncate text-[#1B2A4A]"
                                title={application.program}
                              >
                                {application.program}
                              </p>
                              <p
                                className="mt-1 truncate text-[11px] text-gray-500"
                                title={application.university}
                              >
                                {application.university}
                              </p>
                            </td>
                            <td className="px-5 py-4">
                              <ApplicationStatus status={application.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="divide-y divide-gray-100 md:hidden">
                    {data.recentApplications.map((application) => (
                      <Link
                        key={`${application.surface}-${application.id}`}
                        href={appLink(application)}
                        className="block p-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <strong className="text-sm font-semibold text-[#1B2A4A]">
                            {application.studentName}
                          </strong>
                          <ApplicationStatus status={application.status} />
                        </div>
                        <p className="mt-2 line-clamp-1 text-xs text-gray-600">
                          {application.program}
                        </p>
                        <p className="mt-1 text-[11px] text-gray-500">
                          {application.university}
                        </p>
                        <p className="mt-2 text-[10px] text-gray-400">
                          {t(
                            application.surface === 'partner'
                              ? 'adminReporting.sourcePartner'
                              : 'adminReporting.sourceStudent',
                          )}{' '}
                          · {formatDate(application.createdAt)}
                        </p>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </ReportPanel>
            <ReportPanel
              title={t('adminReporting.webinarOverview')}
              description={`${analytics.range.from} – ${analytics.range.to}`}
            >
              <div className="p-5">
                <p className="text-4xl font-semibold tracking-tight text-[#1B2A4A] tabular-nums">
                  {analytics.webinar.total.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {t('adminReporting.registrations')}
                </p>
                <dl className="mt-6 space-y-4 text-xs">
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">
                      {t('adminReporting.attended')}
                    </dt>
                    <dd className="font-semibold tabular-nums text-[#1B2A4A]">
                      {analytics.webinar.attended.toLocaleString()}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">
                      {t('adminReporting.awaiting')}
                    </dt>
                    <dd className="font-semibold tabular-nums text-[#1B2A4A]">
                      {analytics.webinar.awaiting.toLocaleString()}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-gray-500">
                      {t('adminReporting.attendanceRate')}
                    </dt>
                    <dd className="font-semibold tabular-nums text-[#1B2A4A]">
                      {analytics.webinar.attendanceRate === null
                        ? '—'
                        : `${Math.round(analytics.webinar.attendanceRate)}%`}
                    </dd>
                  </div>
                </dl>
                <p className="mt-3 text-[10px] leading-relaxed text-gray-400">
                  {t('adminReporting.rateHint')}
                </p>
                <Link
                  href={`/admin/webinar-signups?${query}`}
                  className="mt-6 inline-flex items-center gap-2 border-t border-gray-100 pt-4 text-xs font-semibold text-[#9B1B30] hover:underline"
                >
                  {t('adminReporting.openWebinars')}
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </ReportPanel>
          </div>
          <div className="grid gap-5 xl:grid-cols-3">
            <ReportPanel
              title={t('adminReporting.recentActivity')}
              className="xl:col-span-2"
              action={
                <Activity
                  aria-hidden="true"
                  className="size-4 text-[#1B2A4A]"
                />
              }
            >
              <div className="divide-y divide-gray-100 px-5">
                {!data.recentActivity.length && (
                  <p className="py-8 text-center text-xs text-gray-500">
                    {t('adminReporting.emptyActivity')}
                  </p>
                )}
                {data.recentActivity.map((event) => (
                  <Link
                    key={`${event.type}-${event.id}`}
                    href={activityLink(event)}
                    className="flex items-start gap-3 py-3.5 hover:bg-gray-50"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 bg-[#1B2A4A]" />
                    <div className="min-w-0">
                      <p className="truncate text-xs text-[#1B2A4A]">
                        {activityLabel(event)}
                      </p>
                      <p className="mt-1 text-[10px] text-gray-500">
                        {formatDate(event.timestamp)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </ReportPanel>
            <ReportPanel title={t('adminReporting.quickActions')}>
              <div className="space-y-1 p-3">
                {[
                  {
                    href: '/admin/students/new',
                    label: t('adminDashboard.quickAddOfflineStudent'),
                    icon: UserPlus,
                  },
                  {
                    href: '/admin/applications/new',
                    label: t('adminDashboard.quickAddApplication'),
                    icon: FileText,
                  },
                  {
                    href: '/admin/universities/new',
                    label: t('adminDashboard.quickAddUniversity'),
                    icon: GraduationCap,
                  },
                  {
                    href: '/admin/programs/new',
                    label: t('adminDashboard.quickAddProgram'),
                    icon: BookOpen,
                  },
                  {
                    href: '/admin/scholarships/new',
                    label: t('adminDashboard.quickAddScholarship'),
                    icon: Award,
                  },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-2 py-2.5 text-xs text-[#1B2A4A] hover:bg-gray-50"
                  >
                    <item.icon className="size-4" />
                    <span className="flex-1">{item.label}</span>
                    <ArrowUpRight className="size-3 text-gray-400" />
                  </Link>
                ))}
              </div>
            </ReportPanel>
          </div>
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3 border border-[#1B2A4A]/12 bg-white px-5 py-4 text-xs">
            <span className="font-semibold text-[#1B2A4A]">
              {t('adminReporting.catalog')}
            </span>
            {[
              {
                label: t('adminDashboard.statUniversities'),
                count: data.stats.universities,
                href: '/admin/universities',
              },
              {
                label: t('adminDashboard.statPrograms'),
                count: data.stats.programs,
                href: '/admin/programs',
              },
              {
                label: t('adminNav.scholarships'),
                count: data.stats.scholarships,
                href: '/admin/scholarships',
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-500 hover:text-[#1B2A4A]"
              >
                <strong className="mr-2 font-semibold tabular-nums text-[#1B2A4A]">
                  {item.count.toLocaleString()}
                </strong>
                {item.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </PageContainer>
  );
}

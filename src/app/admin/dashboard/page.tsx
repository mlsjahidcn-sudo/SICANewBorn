'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
  GraduationCap, BookOpen, Award, FileText, Users, TrendingUp,
  ArrowUpRight, Clock, Loader2, AlertCircle, UserPlus, Activity,
  Inbox, AlertTriangle, MessageCircle, MessageSquare, ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiFetchJson } from '@/lib/api-client';
import { StatusBadge } from '@/components/admin/status-badge';
import { useI18n } from '@/lib/i18n';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  trend?: string;
}

function StatCard({ title, value, subtitle, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#4B5563] mb-1">{title}</p>
          <p className="text-2xl font-bold text-[#1F2937]">{value}</p>
          <p className="text-xs text-[#4B5563] mt-1">{subtitle}</p>
        </div>
        <div className="w-10 h-10 bg-[#1B2A4A]/10 flex items-center justify-center flex-shrink-0">
          <Icon size={20} className="text-[#1B2A4A]" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-3 text-xs text-green-600">
          <TrendingUp size={12} />
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}

interface AdminApplication {
  id: string;
  studentId: string | null;
  studentName: string;
  studentEmail: string;
  isLinked: boolean;
  university: string;
  program: string;
  degree: string;
  intake: string;
  status: string;
  applicationNumber: string | null;
  createdAt: string;
}

interface ActivityEvent {
  id: string;
  type: 'application' | 'student' | 'lead';
  message: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

interface DashboardData {
  stats: {
    universities: number;
    programs: number;
    scholarships: number;
    students: number;
    studentsLast7d: number;
    applications: number;
    applicationsLast7d: number;
    leads: number;          // unlinked applications
    activeApplications: number;
    // Lead workflow (Phase 2.1)
    leadsContact: number;
    leadsContactLast7d: number;
    leadsChat: number;
    leadsChatLast7d: number;
    leadsAssessment: number;
    leadsAssessmentLast7d: number;
    leadsUnassigned: number;
    leadsNeedsFollowup: number;
  };
  recentApplications: AdminApplication[];
  recentActivity: ActivityEvent[];
}

const statusDisplay: Record<string, { label: string; color: string }> = {
  Draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  Submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
  'Under Review': { label: 'Under Review', color: 'bg-yellow-100 text-yellow-800' },
  'Documents Requested': { label: 'Docs Needed', color: 'bg-purple-100 text-purple-800' },
  'Decision Made': { label: 'Decision', color: 'bg-orange-100 text-orange-800' },
  Accepted: { label: 'Accepted', color: 'bg-green-100 text-green-800' },
  Rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  Withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-800' },
};

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    apiFetchJson<DashboardData>('/api/admin/dashboard', { signal: controller.signal })
      .then(setData)
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load dashboard');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [mounted]);

  if (!mounted || isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-gray-100 rounded animate-pulse" />
          <div className="space-y-6">
            <div className="h-32 bg-gray-100 rounded animate-pulse" />
            <div className="h-48 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <div className="p-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800">{t('adminDashboard.failedToLoad')}</h3>
                <p className="text-red-700 text-sm mt-1">{error || 'Unknown error'}</p>
                <Button size="sm" variant="outline" onClick={() => window.location.reload()} className="mt-3">
                  {t('adminDashboard.retry')}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const s = data.stats;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">
          {t('adminDashboard.welcomeBack', {
            name: user?.user_metadata?.full_name || t('adminDashboard.welcomeFallback'),
          })}
        </h1>
        <p className="text-[#4B5563] text-sm mt-1">
          {t('adminDashboard.overviewBlurb')}
        </p>
      </div>

      {/* Stats Grid — 8 cards now (real data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('adminDashboard.statStudents')}
          value={s.students.toLocaleString()}
          subtitle={t('adminDashboard.statStudentsSub', { n: s.studentsLast7d })}
          icon={Users}
        />
        <StatCard
          title={t('adminDashboard.statApplications')}
          value={s.applications.toLocaleString()}
          subtitle={t('adminDashboard.statApplicationsSub', {
            active: s.activeApplications,
            unlinked: s.leads,
          })}
          icon={FileText}
        />
        <StatCard
          title={t('adminDashboard.statUniversities')}
          value={s.universities.toLocaleString()}
          subtitle={t('adminDashboard.statUniversitiesSub')}
          icon={GraduationCap}
        />
        <StatCard
          title={t('adminDashboard.statPrograms')}
          value={s.programs.toLocaleString()}
          subtitle={t('adminDashboard.statProgramsSub', { n: s.scholarships })}
          icon={BookOpen}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-[#1F2937]">{t('adminDashboard.recentApplications')}</h2>
              <Link
                href="/admin/applications"
                className="text-sm text-[#9B1B30] font-medium hover:underline flex items-center gap-1"
              >
                {t('adminDashboard.viewAll')} <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              {data.recentApplications.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p>{t('adminDashboard.noApplicationsYet')}</p>
                  <Link
                    href="/admin/applications/new"
                    className="text-sm text-[#9B1B30] hover:underline mt-2 inline-block"
                  >
                    {t('adminDashboard.addFirstApplication')}
                  </Link>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F3F4F6]">
                      <th className="text-left text-xs font-medium text-[#4B5563] px-5 py-3">{t('adminDashboard.colApplicant')}</th>
                      <th className="text-left text-xs font-medium text-[#4B5563] px-5 py-3">{t('adminDashboard.colProgram')}</th>
                      <th className="text-left text-xs font-medium text-[#4B5563] px-5 py-3">{t('adminDashboard.colUniversity')}</th>
                      <th className="text-left text-xs font-medium text-[#4B5563] px-5 py-3">{t('adminDashboard.colDate')}</th>
                      <th className="text-left text-xs font-medium text-[#4B5563] px-5 py-3">{t('adminDashboard.colStatus')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.recentApplications.map((app) => {
                      const s = statusDisplay[app.status] || { label: app.status, color: 'bg-gray-100 text-gray-800' };
                      return (
                        <tr key={app.id} className="hover:bg-[#FAFAF8] transition-colors">
                          <td className="px-5 py-3 text-sm font-medium text-[#1F2937]">
                            <Link href={`/admin/applications/${app.id}`} className="hover:underline">
                              {app.studentName}
                            </Link>
                            {!app.isLinked && (
                              <span className="ml-2 text-xs text-[#9B1B30] font-normal">{t('adminDashboard.noAccountHint')}</span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-sm text-[#4B5563]">
                            {app.program}
                            {app.applicationNumber && (
                              <span className="ml-1 text-xs text-gray-400">{app.applicationNumber}</span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-sm text-[#4B5563]">{app.university}</td>
                          <td className="px-5 py-3 text-sm text-[#4B5563]">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3">
                            <span className={`text-xs px-2 py-1 rounded ${s.color}`}>
                              {s.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Lead pipeline (Phase 2.1) */}
          <div className="bg-white border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-[#1F2937] flex items-center gap-2">
                <Inbox size={16} className="text-[#1B2A4A]" />
                {t('adminDashboard.leadPipeline')}
              </h2>
              <Link
                href="/admin/leads"
                className="text-sm text-[#9B1B30] font-medium hover:underline flex items-center gap-1"
              >
                {t('adminDashboard.viewAllLeads')} <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <Link
                  href="/admin/leads?type=contact"
                  className="border border-gray-200 p-4 hover:border-[#1B2A4A] transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare size={14} className="text-[#1B2A4A]" />
                    <span className="text-xs text-gray-500">{t('adminDashboard.leadContactForm')}</span>
                  </div>
                  <p className="text-2xl font-bold text-[#1F2937]">
                    {s.leadsContact.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t('adminDashboard.in7d', { n: s.leadsContactLast7d })}
                  </p>
                </Link>
                <Link
                  href="/admin/leads?type=chat"
                  className="border border-gray-200 p-4 hover:border-[#9B1B30] transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MessageCircle size={14} className="text-[#9B1B30]" />
                    <span className="text-xs text-gray-500">{t('adminDashboard.leadChat')}</span>
                  </div>
                  <p className="text-2xl font-bold text-[#1F2937]">
                    {s.leadsChat.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t('adminDashboard.in7d', { n: s.leadsChatLast7d })}
                  </p>
                </Link>
                <Link
                  href="/admin/leads?type=assessment"
                  className="border border-gray-200 p-4 hover:border-[#D4A853] transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ClipboardList size={14} className="text-[#D4A853]" />
                    <span className="text-xs text-gray-500">{t('adminDashboard.leadAssessment')}</span>
                  </div>
                  <p className="text-2xl font-bold text-[#1F2937]">
                    {s.leadsAssessment.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t('adminDashboard.in7d', { n: s.leadsAssessmentLast7d })}
                  </p>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/admin/leads?assignee=unassigned"
                  className="flex items-center justify-between p-3 bg-[#9B1B30]/5 border border-[#9B1B30]/20 hover:bg-[#9B1B30]/10 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <UserPlus size={14} className="text-[#9B1B30]" />
                    <span className="text-sm text-[#1F2937]">{t('adminDashboard.unassignedLeads')}</span>
                  </div>
                  <span className="text-lg font-bold text-[#9B1B30]">
                    {s.leadsUnassigned.toLocaleString()}
                  </span>
                </Link>
                <Link
                  href="/admin/leads?type=all"
                  className="flex items-center justify-between p-3 bg-[#D4A853]/5 border border-[#D4A853]/20 hover:bg-[#D4A853]/10 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-[#D4A853]" />
                    <span className="text-sm text-[#1F2937]">{t('adminDashboard.needsFollowup')}</span>
                  </div>
                  <span className="text-lg font-bold text-[#1B2A4A]">
                    {s.leadsNeedsFollowup.toLocaleString()}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Activity */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 p-5">
            <h2 className="font-semibold text-[#1F2937] mb-4">{t('adminDashboard.quickActions')}</h2>
            <div className="space-y-2">
              {[
                { label: t('adminDashboard.quickAddOfflineStudent'), icon: UserPlus, href: '/admin/students/new' },
                { label: t('adminDashboard.quickAddApplication'), icon: FileText, href: '/admin/applications/new' },
                { label: t('adminDashboard.quickAddUniversity'), icon: GraduationCap, href: '/admin/universities/new' },
                { label: t('adminDashboard.quickAddProgram'), icon: BookOpen, href: '/admin/programs/new' },
                { label: t('adminDashboard.quickAddScholarship'), icon: Award, href: '/admin/scholarships/new' },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#1F2937] hover:bg-[#F3F4F6] transition-colors text-left"
                  >
                    <Icon size={16} className="text-[#1B2A4A]" />
                    {action.label}
                    <ArrowUpRight size={14} className="ml-auto text-gray-400" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Activity (real) */}
          <div className="bg-white border border-gray-200 p-5">
            <h2 className="font-semibold text-[#1F2937] mb-4 flex items-center gap-2">
              <Activity size={16} className="text-[#1B2A4A]" />
              {t('adminDashboard.recentActivity')}
            </h2>
            {data.recentActivity.length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-4">
                {t('adminDashboard.noActivityYet')}
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentActivity.map((event) => (
                  <div key={`${event.type}-${event.id}`} className="flex items-start gap-3">
                    {event.type === 'student' ? (
                      <UserPlus size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                    ) : event.type === 'lead' ? (
                      <Inbox size={14} className="text-[#9B1B30] mt-0.5 flex-shrink-0" />
                    ) : (
                      <FileText size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-[#1F2937] truncate">{event.message}</p>
                      <p className="text-xs text-[#4B5563]">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Card import (re-using shadcn card shape for the error state)
import { Card } from '@/components/ui/card';

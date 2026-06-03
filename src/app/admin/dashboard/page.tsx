'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
  GraduationCap, BookOpen, Award, FileText, Users, TrendingUp,
  ArrowUpRight, Clock, Loader2, AlertCircle, UserPlus, Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiFetchJson } from '@/lib/api-client';
import { StatusBadge } from '@/components/admin/status-badge';

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
  type: 'application' | 'student';
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
                <h3 className="font-semibold text-red-800">Failed to load dashboard</h3>
                <p className="text-red-700 text-sm mt-1">{error || 'Unknown error'}</p>
                <Button size="sm" variant="outline" onClick={() => window.location.reload()} className="mt-3">
                  Retry
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
          Welcome back, {user?.user_metadata?.full_name || 'Admin'}
        </h1>
        <p className="text-[#4B5563] text-sm mt-1">
          Here&apos;s an overview of your platform.
        </p>
      </div>

      {/* Stats Grid — 8 cards now (real data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Students"
          value={s.students.toLocaleString()}
          subtitle={`+${s.studentsLast7d} in the last 7 days`}
          icon={Users}
        />
        <StatCard
          title="Applications"
          value={s.applications.toLocaleString()}
          subtitle={`${s.activeApplications} active · ${s.leads} unlinked`}
          icon={FileText}
        />
        <StatCard
          title="Universities"
          value={s.universities.toLocaleString()}
          subtitle="Registered institutions"
          icon={GraduationCap}
        />
        <StatCard
          title="Programs"
          value={s.programs.toLocaleString()}
          subtitle={`${s.scholarships} scholarships available`}
          icon={BookOpen}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2 bg-white border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-[#1F2937]">Recent Applications</h2>
            <Link
              href="/admin/applications"
              className="text-sm text-[#9B1B30] font-medium hover:underline flex items-center gap-1"
            >
              View All <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            {data.recentApplications.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p>No applications yet.</p>
                <Link
                  href="/admin/applications/new"
                  className="text-sm text-[#9B1B30] hover:underline mt-2 inline-block"
                >
                  Add the first one →
                </Link>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F3F4F6]">
                    <th className="text-left text-xs font-medium text-[#4B5563] px-5 py-3">Applicant</th>
                    <th className="text-left text-xs font-medium text-[#4B5563] px-5 py-3">Program</th>
                    <th className="text-left text-xs font-medium text-[#4B5563] px-5 py-3">University</th>
                    <th className="text-left text-xs font-medium text-[#4B5563] px-5 py-3">Date</th>
                    <th className="text-left text-xs font-medium text-[#4B5563] px-5 py-3">Status</th>
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
                            <span className="ml-2 text-xs text-[#9B1B30] font-normal">(no account)</span>
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

        {/* Quick Actions & Activity */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 p-5">
            <h2 className="font-semibold text-[#1F2937] mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'Add Offline Student', icon: UserPlus, href: '/admin/students/new' },
                { label: 'Add Application', icon: FileText, href: '/admin/applications/new' },
                { label: 'Add University', icon: GraduationCap, href: '/admin/universities/new' },
                { label: 'Add Program', icon: BookOpen, href: '/admin/programs/new' },
                { label: 'Add Scholarship', icon: Award, href: '/admin/scholarships/new' },
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
              Recent Activity
            </h2>
            {data.recentActivity.length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-4">
                No activity yet.
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentActivity.map((event) => (
                  <div key={`${event.type}-${event.id}`} className="flex items-start gap-3">
                    {event.type === 'student' ? (
                      <UserPlus size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
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

'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, Users, FileText, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { apiFetchJson } from '@/lib/api-client';

interface FunnelReport {
  dateRange: { from: string; to: string };
  leadSources: { source: string; count: number }[];
  applicationsByStatus: { status: string; count: number }[];
  partnerVsOnline: { name: string; value: number }[];
  acceptanceRate: number;
  totalApplications: number;
  acceptedApplications: number;
  timeSeries: { date: string; leads: number; applications: number; accepted: number }[];
}

const COLORS = ['#9B1B30', '#1B2A4A', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

export default function AdminReportsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [report, setReport] = useState<FunnelReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');

  const fetchReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const data = await apiFetchJson<FunnelReport>(`/api/admin/reports/funnel?${params}`);
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const totalLeads = report?.leadSources.reduce((sum, s) => sum + s.count, 0) ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-80" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Failed to load report. {error}</p>
        <Button onClick={fetchReport} className="mt-4 bg-[#9B1B30] hover:bg-[#7A1625] text-white">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Reports & Insights</h1>
          <p className="text-gray-600">
            Funnel overview for {report.dateRange.from} → {report.dateRange.to}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-auto" />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-auto" />
          <Button onClick={fetchReport} className="bg-[#9B1B30] hover:bg-[#7A1625] text-white">
            Update
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button className="ml-2 underline" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Leads</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="h-5 w-5 text-[#9B1B30]" />
              {totalLeads.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">Across all sources</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Applications</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#1B2A4A]" />
              {report.totalApplications.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">Partner + Online</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Accepted</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              {report.acceptedApplications.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">Accepted offers</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Acceptance Rate</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-600" />
              {report.acceptanceRate}%
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">Accepted / Total applications</CardContent>
        </Card>
      </div>

      {/* Time Series */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#9B1B30]" />
            Daily Trends
          </CardTitle>
          <CardDescription>Leads, applications, and accepted applications over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={report.timeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="leads" stroke={COLORS[0]} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="applications" stroke={COLORS[2]} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="accepted" stroke={COLORS[3]} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
            <CardDescription>Where inbound leads came from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.leadSources}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="source" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {report.leadSources.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Partner vs Online */}
        <Card>
          <CardHeader>
            <CardTitle>Partner vs Online</CardTitle>
            <CardDescription>Application volume split by source</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={report.partnerVsOnline}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {report.partnerVsOnline.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Status */}
      <Card>
        <CardHeader>
          <CardTitle>Applications by Status</CardTitle>
          <CardDescription>Combined student and partner application statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.applicationsByStatus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="status" type="category" tick={{ fontSize: 12 }} width={120} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {report.applicationsByStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

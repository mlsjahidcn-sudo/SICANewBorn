'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  GraduationCap, Plus, ChevronRight, Calendar, CheckCircle2, Clock, XCircle,
  AlertCircle, RefreshCw, Loader2, FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiFetchJson } from '@/lib/api-client';
import type { StudentApplication } from '@/lib/application-mapper';

interface ListResponse {
  applications: StudentApplication[];
}

// Status display config — DB values (8) → user-friendly label + badge style
const statusDisplay: Record<string, { label: string; badge: string; iconClass: string }> = {
  Draft: {
    label: 'Draft',
    badge: 'bg-gray-100 text-gray-800',
    iconClass: 'text-gray-400',
  },
  Submitted: {
    label: 'Submitted',
    badge: 'bg-blue-100 text-blue-800',
    iconClass: 'text-blue-600',
  },
  'Under Review': {
    label: 'Under Review',
    badge: 'bg-yellow-100 text-yellow-800',
    iconClass: 'text-yellow-600',
  },
  'Documents Requested': {
    label: 'Docs Needed',
    badge: 'bg-purple-100 text-purple-800',
    iconClass: 'text-purple-600',
  },
  'Decision Made': {
    label: 'Decision',
    badge: 'bg-orange-100 text-orange-800',
    iconClass: 'text-orange-600',
  },
  Accepted: {
    label: 'Accepted',
    badge: 'bg-green-100 text-green-800',
    iconClass: 'text-green-600',
  },
  Rejected: {
    label: 'Rejected',
    badge: 'bg-red-100 text-red-800',
    iconClass: 'text-red-600',
  },
  Withdrawn: {
    label: 'Withdrawn',
    badge: 'bg-gray-100 text-gray-800',
    iconClass: 'text-gray-400',
  },
};

// Filter chips — show the most relevant statuses (not the raw 8)
const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'Under Review', label: 'In Review' },
  { value: 'Documents Requested', label: 'Docs Needed' },
  { value: 'Accepted', label: 'Accepted' },
  { value: 'Rejected', label: 'Rejected' },
];

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState('all');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiFetchJson<ListResponse>('/api/student/applications');
      setApplications(data.applications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications');
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredApplications = activeStatus === 'all'
    ? applications
    : applications.filter((a) => a.status === activeStatus);

  // Status icon per app
  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'Accepted') return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (status === 'Rejected') return <XCircle className="h-5 w-5 text-red-600" />;
    if (status === 'Decision Made') return <FileCheck className="h-5 w-5 text-orange-600" />;
    if (status === 'Submitted' || status === 'Under Review' || status === 'Documents Requested') {
      return <Clock className="h-5 w-5 text-yellow-600" />;
    }
    return <Clock className="h-5 w-5 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">My Applications</h1>
          <p className="text-[#4B5563] mt-1">Track your university applications</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={load} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild variant="default" className="rounded-none bg-[#9B1B30] hover:bg-[#7A1526]">
            <Link href="/student/applications/new">
              <Plus className="mr-2 h-4 w-4" />
              New Application
            </Link>
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-800">Failed to load: {error}</p>
            <Button size="sm" variant="outline" onClick={load} className="ml-auto">Retry</Button>
          </CardContent>
        </Card>
      )}

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            variant={activeStatus === f.value ? 'default' : 'outline'}
            className="rounded-none"
            onClick={() => setActiveStatus(f.value)}
            size="sm"
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Loading skeleton */}
      {isLoading && applications.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="rounded-none">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-none animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredApplications.length === 0 ? (
        <Card className="rounded-none">
          <CardContent className="p-12 text-center">
            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#1B2A4A] mb-2">
              {activeStatus === 'all' ? 'No applications yet' : 'No applications match this filter'}
            </h3>
            <p className="text-[#4B5563] mb-6">
              {activeStatus === 'all'
                ? 'Create your first application to get started'
                : 'Try a different status filter, or create a new application.'}
            </p>
            {activeStatus === 'all' && (
              <Button asChild variant="default" className="rounded-none bg-[#9B1B30] hover:bg-[#7A1526]">
                <Link href="/student/applications/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Application
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const display = statusDisplay[app.status] || {
              label: app.status,
              badge: 'bg-gray-100 text-gray-800',
              iconClass: 'text-gray-400',
            };
            return (
              <Link key={app.id} href={`/student/applications/${app.id}`}>
                <Card className="rounded-none hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#9B1B30]/10 p-3 rounded-none">
                        <GraduationCap className="h-6 w-6 text-[#9B1B30]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-medium text-[#1B2A4A]">{app.university}</h3>
                          <Badge className={`rounded-none ${display.badge}`}>{display.label}</Badge>
                          {app.applicationNumber && (
                            <span className="text-xs text-gray-400 font-mono">
                              {app.applicationNumber}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#4B5563] mt-1">{app.program}</p>
                        <p className="text-xs text-[#4B5563] mt-1">
                          <span className="text-gray-400">Intake:</span> {app.intake} ·
                          <span className="text-gray-400 ml-1">Degree:</span> {app.degree}
                        </p>
                        {app.submittedAt && (
                          <p className="text-xs text-[#4B5563] mt-1 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusIcon status={app.status} />
                        <ChevronRight className="h-4 w-4 text-[#4B5563]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

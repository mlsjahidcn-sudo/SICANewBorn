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
import { useI18n } from '@/lib/i18n';
import type { StudentApplication } from '@/lib/application-mapper';

interface ListResponse {
  applications: StudentApplication[];
}

// Status display config — DB values (8) → user-friendly label + badge style.
// The label is a translation key (looked up via t()) so the badge text
// flips with the locale.
const statusDisplay: Record<string, { labelKey: string; badge: string; iconClass: string }> = {
  Draft: {
    labelKey: 'studentApps.filterDraft',
    badge: 'bg-gray-100 text-gray-800',
    iconClass: 'text-gray-400',
  },
  Submitted: {
    labelKey: 'studentApps.filterSubmitted',
    badge: 'bg-blue-100 text-blue-800',
    iconClass: 'text-blue-600',
  },
  'Under Review': {
    labelKey: 'studentApps.filterInReview',
    badge: 'bg-yellow-100 text-yellow-800',
    iconClass: 'text-yellow-600',
  },
  'Documents Requested': {
    labelKey: 'studentApps.filterDocumentsRequested',
    badge: 'bg-purple-100 text-purple-800',
    iconClass: 'text-purple-600',
  },
  'Decision Made': {
    labelKey: 'studentAppDetail.status',
    badge: 'bg-orange-100 text-orange-800',
    iconClass: 'text-orange-600',
  },
  Accepted: {
    labelKey: 'studentApps.filterAccepted',
    badge: 'bg-green-100 text-green-800',
    iconClass: 'text-green-600',
  },
  Rejected: {
    labelKey: 'studentApps.filterRejected',
    badge: 'bg-red-100 text-red-800',
    iconClass: 'text-red-600',
  },
  Withdrawn: {
    labelKey: 'studentApps.filterWithdrawn',
    badge: 'bg-gray-100 text-gray-800',
    iconClass: 'text-gray-400',
  },
};

// Filter chips — show the most relevant statuses (not the raw 8).
// Labels are translation keys, resolved via t() at render time so
// they flip with the locale.
const FILTERS: Array<{ value: string; labelKey: string }> = [
  { value: 'all', labelKey: 'studentApps.filterAll' },
  { value: 'Draft', labelKey: 'studentApps.filterDraft' },
  { value: 'Submitted', labelKey: 'studentApps.filterSubmitted' },
  { value: 'Under Review', labelKey: 'studentApps.filterInReview' },
  { value: 'Documents Requested', labelKey: 'studentApps.filterDocumentsRequested' },
  { value: 'Accepted', labelKey: 'studentApps.filterAccepted' },
  { value: 'Rejected', labelKey: 'studentApps.filterRejected' },
];

export default function StudentApplicationsPage() {
  const { t } = useI18n();
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

  // Phase 2: action-needed counts so we can render the in-page banner
  // AND keep the filter chips aware of what's outstanding.
  const attentionBreakdown = {
    requested: applications.filter((a) => a.status === 'Documents Requested').length,
    drafts: applications.filter((a) => a.status === 'Draft').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">{t('studentApps.title')}</h1>
          <p className="text-[#4B5563] mt-1">{t('studentApps.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={load} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </Button>
          <Button asChild variant="default" className="rounded-none bg-[#9B1B30] hover:bg-[#7A1526]">
            <Link href="/student/applications/new">
              <Plus className="mr-2 h-4 w-4" />
              {t('studentApps.newApplication')}
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
            <Button size="sm" variant="outline" onClick={load} className="ml-auto">{t('common.retry')}</Button>
          </CardContent>
        </Card>
      )}

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          // Phase 2: show the relevant count next to actionable filters
          // so the student can see "you have 2 drafts" at a glance.
          const countForFilter =
            f.value === 'Documents Requested'
              ? attentionBreakdown.requested
              : f.value === 'Draft'
              ? attentionBreakdown.drafts
              : null;
          return (
            <Button
              key={f.value}
              variant={activeStatus === f.value ? 'default' : 'outline'}
              className="rounded-none"
              onClick={() => setActiveStatus(f.value)}
              size="sm"
            >
              {t(f.labelKey)}
              {countForFilter != null && countForFilter > 0 && (
                <span
                  className={`ml-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold rounded-full ${
                    f.value === 'Documents Requested'
                      ? 'bg-[#9B1B30] text-white'
                      : 'bg-[#D4A853] text-[#1B2A4A]'
                  }`}
                >
                  {countForFilter}
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Phase 2: in-page action banner — same data the sidebar badge
          shows, surfaced here so the student sees it without having
          to glance at the sidebar. */}
      {attentionBreakdown.requested > 0 && (
        <div className="flex items-start gap-3 p-3 border border-[#9B1B30] bg-red-50 text-sm text-[#1B2A4A]">
          <AlertCircle className="h-4 w-4 text-[#9B1B30] flex-shrink-0 mt-0.5" />
          <p>
            <strong>{attentionBreakdown.requested}</strong>{' '}
            {t('studentApps.attentionBanner')}.{' '}
            <button
              type="button"
              onClick={() => setActiveStatus('Documents Requested')}
              className="font-semibold underline text-[#9B1B30] hover:text-[#7A1525]"
            >
              {t('common.showMeWhich')}
            </button>
          </p>
        </div>
      )}
      {attentionBreakdown.drafts > 0 && attentionBreakdown.requested === 0 && (
        <div className="flex items-start gap-3 p-3 border border-[#D4A853] bg-[#FAF6E8] text-sm text-[#1B2A4A]">
          <Clock className="h-4 w-4 text-[#9B1B30] flex-shrink-0 mt-0.5" />
          <p>
            {t('studentApps.draftsYouHave', { n: attentionBreakdown.drafts })}{' '}
            <button
              type="button"
              onClick={() => setActiveStatus('Draft')}
              className="font-semibold underline text-[#9B1B30] hover:text-[#7A1525]"
            >
              {t('studentApps.resumeDraft')}
            </button>
          </p>
        </div>
      )}

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
              {activeStatus === 'all' ? t('studentApps.empty') : t('studentApps.emptyFiltered')}
            </h3>
            <p className="text-[#4B5563] mb-6">
              {activeStatus === 'all' ? t('studentApps.emptyCta') : t('studentApps.tryDifferentFilter')}
            </p>
            {activeStatus === 'all' && (
              <Button asChild variant="default" className="rounded-none bg-[#9B1B30] hover:bg-[#7A1526]">
                <Link href="/student/applications/new">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('studentApps.newApplication')}
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const display = statusDisplay[app.status] || {
              labelKey: 'studentAppDetail.status',
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
                          <Badge className={`rounded-none ${display.badge}`}>{t(display.labelKey)}</Badge>
                          {app.applicationNumber && (
                            <span className="text-xs text-gray-400 font-mono">
                              {app.applicationNumber}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#4B5563] mt-1">{app.program}</p>
                        <p className="text-xs text-[#4B5563] mt-1">
                          <span className="text-gray-400">{t('studentAppDetail.intake')}:</span> {app.intake} ·
                          <span className="text-gray-400 ml-1">{t('studentAppDetail.degree')}:</span> {app.degree}
                        </p>
                        {app.submittedAt && (
                          <p className="text-xs text-[#4B5563] mt-1 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {t('studentAppDetail.submittedAt')}: {new Date(app.submittedAt).toLocaleDateString()}
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

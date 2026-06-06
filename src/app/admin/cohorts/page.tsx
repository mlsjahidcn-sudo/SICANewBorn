'use client';

/**
 * S34: Cohort View — read-only admin dashboard that groups
 * applications by intake. See the matching API route at
 * /api/admin/cohorts for the data shape.
 *
 * The page is a client component because the admin auth pattern
 * is Bearer-token based (the auth context stores the session
 * in localStorage; the apiFetch helper attaches the JWT on
 * every request). There's no SSR auth path for protected
 * areas, so we fetch the same way the rest of the admin
 * pages do.
 */
import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { ArrowRight, Users, CalendarClock, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiFetchJson } from '@/lib/api-client';

interface CohortBucket {
  cohort: string;
  slug: string;
  isCanonical: boolean;
  isUnassigned: boolean;
  total: number;
  studentCount: number;
  partnerCount: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  sampleNames: string[];
}

interface CohortsResponse {
  cohorts: CohortBucket[];
  totals: { total: number; student: number; partner: number };
}

const PRIORITY_ORDER = ['Urgent', 'High', 'Normal', 'Low'] as const;
const PRIORITY_COLORS: Record<string, string> = {
  Urgent: 'bg-red-100 text-red-800',
  High: 'bg-orange-100 text-orange-800',
  Normal: 'bg-gray-100 text-gray-700',
  Low: 'bg-gray-100 text-gray-500',
};

const STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-700',
  Submitted: 'bg-blue-100 text-blue-800',
  'Under Review': 'bg-yellow-100 text-yellow-800',
  'Documents Requested': 'bg-purple-100 text-purple-800',
  'Decision Made': 'bg-orange-100 text-orange-800',
  Accepted: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Withdrawn: 'bg-gray-100 text-gray-700',
  // Partner taxonomy — appears on partner_applications rows
  'In Review': 'bg-yellow-100 text-yellow-800',
};

export default function AdminCohortsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [cohorts, setCohorts] = useState<CohortBucket[]>([]);
  const [totals, setTotals] = useState({ total: 0, student: 0, partner: 0 });
  const [error, setError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  const fetchCohorts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiFetchJson<CohortsResponse>('/api/admin/cohorts');
      setCohorts(data.cohorts || []);
      setTotals(data.totals || { total: 0, student: 0, partner: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cohorts');
      setCohorts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCohorts();
  }, [fetchCohorts, retryNonce]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Cohort View</h1>
          <p className="text-[#4B5563] mt-1">
            All student and partner applications grouped by target intake.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-[#4B5563]">
            <CalendarClock className="w-4 h-4" />
            <span>
              <strong className="text-[#1B2A4A]">{totals.total}</strong> apps
              {' · '}
              <strong className="text-[#1B2A4A]">{totals.student}</strong> student
              {' · '}
              <strong className="text-[#1B2A4A]">{totals.partner}</strong> partner CRM
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-none"
            onClick={() => setRetryNonce((n) => n + 1)}
            disabled={isLoading}
            title="Reload cohort data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && !isLoading && (
        <div className="border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-900">Could not load cohort data</h3>
            <p className="text-xs text-red-700 mt-1 font-mono">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
              onClick={() => setRetryNonce((n) => n + 1)}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try again
            </Button>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && cohorts.length === 0 && !error && (
        <div className="flex items-center justify-center py-20">
          <Spinner size="md" className="text-[#1B2A4A]" />
        </div>
      )}

      {/* Cohort grid */}
      {!isLoading && cohorts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cohorts.map((b) => (
            <CohortCard key={b.cohort} bucket={b} />
          ))}
        </div>
      )}
    </div>
  );
}

function CohortCard({ bucket }: { bucket: CohortBucket }) {
  const hasApps = bucket.total > 0;
  return (
    <Card className="rounded-none border border-gray-200 shadow-sm">
      <CardHeader className="pb-3 border-b border-gray-100">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base text-[#1B2A4A]">
              {bucket.cohort}
              {bucket.isUnassigned && (
                <span className="ml-2 text-xs font-normal text-amber-700">
                  (no intake set)
                </span>
              )}
            </CardTitle>
            {!bucket.isCanonical && !bucket.isUnassigned && (
              <p className="text-xs text-[#6B7280] mt-0.5">Historical cohort</p>
            )}
          </div>
          <Badge
            className={`rounded-none text-xs ${
              hasApps ? 'bg-[#9B1B30] text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {bucket.total} {bucket.total === 1 ? 'app' : 'apps'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-3 space-y-3">
        {hasApps ? (
          <>
            {/* Student / partner split */}
            <div className="flex items-center gap-3 text-xs text-[#4B5563]">
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>
                  <strong className="text-[#1B2A4A]">{bucket.studentCount}</strong> student
                </span>
              </div>
              {bucket.partnerCount > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>
                    <strong className="text-[#1B2A4A]">{bucket.partnerCount}</strong> partner CRM
                  </span>
                </div>
              )}
            </div>

            {/* Status distribution */}
            {Object.keys(bucket.byStatus).length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Status
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(bucket.byStatus)
                    .sort((a, b) => b[1] - a[1])
                    .map(([status, n]) => (
                      <span
                        key={status}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium ${
                          STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {status} <span className="font-bold">{n}</span>
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Priority distribution */}
            {Object.keys(bucket.byPriority).length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Priority
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {PRIORITY_ORDER.map((p) =>
                    bucket.byPriority[p] ? (
                      <span
                        key={p}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium ${
                          PRIORITY_COLORS[p] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {p} <span className="font-bold">{bucket.byPriority[p]}</span>
                      </span>
                    ) : null,
                  )}
                </div>
              </div>
            )}

            {/* Sample students (max 3) */}
            {bucket.sampleNames.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#6B7280] mb-1">
                  Sample
                </p>
                <p className="text-xs text-[#4B5563] truncate">
                  {bucket.sampleNames.join(' · ')}
                </p>
              </div>
            )}

            {/* Deep link */}
            <Link
              href={`/admin/applications?intake=${encodeURIComponent(bucket.slug)}`}
              className="inline-flex items-center gap-1 text-xs text-[#9B1B30] hover:underline mt-1"
            >
              View applications
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </>
        ) : (
          <div className="py-3 text-center">
            <p className="text-sm text-[#6B7280]">No applications yet</p>
            <p className="text-xs text-[#9CA3AF] mt-1">
              {bucket.isCanonical
                ? "Students haven't applied for this intake yet."
                : bucket.isUnassigned
                ? 'These apps have no intake value set.'
                : 'No historical applications in this cohort.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

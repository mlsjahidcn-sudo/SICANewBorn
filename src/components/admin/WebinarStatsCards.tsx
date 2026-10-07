'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { apiFetchJson, ApiError } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';

interface WebinarStats {
  total: number;
  today: number;
  last7Days: number;
  last30Days: number;
  byStatus: { status: 'Registered' | 'Attended' | 'No-Show' | 'Cancelled'; count: number }[];
  byCountry: { label: string; count: number }[];
  byInterest: { label: string; count: number }[];
  bySource: { label: string; count: number }[];
  generatedAt: string;
}

const STATUS_COLOR: Record<string, string> = {
  Registered: 'bg-blue-100 text-blue-800',
  Attended: 'bg-green-100 text-green-800',
  'No-Show': 'bg-red-100 text-red-800',
  Cancelled: 'bg-gray-100 text-gray-700',
};

const INTEREST_COLOR: Record<string, string> = {
  chinese_language: 'bg-[#D4A853]/20 text-[#1B2A4A] border-[#D4A853]/50',
  foundation: 'bg-[#1B2A4A]/10 text-[#1B2A4A] border-[#1B2A4A]/30',
  bachelor_march: 'bg-[#9B1B30]/10 text-[#9B1B30] border-[#9B1B30]/40',
  bachelor: 'bg-[#9B1B30]/10 text-[#9B1B30] border-[#9B1B30]/40',
  master: 'bg-[#9B1B30]/10 text-[#9B1B30] border-[#9B1B30]/40',
  phd: 'bg-purple-100 text-purple-800 border-purple-300',
  csc: 'bg-emerald-100 text-emerald-800 border-emerald-300',
};

/**
 * Phase 143: stat-card strip + 3 breakdown panels for the
 * /admin/webinar-signups Registrations tab. Polls
 * /api/admin/webinar-signups/stats every 30s.
 *
 * Mirrors /admin/assessments stats widget shape (Phase 126).
 * Stats errors are swallowed — best-effort, the list page
 * still works.
 */
export function WebinarStatsCards() {
  const { t } = useI18n();
  const [stats, setStats] = useState<WebinarStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await apiFetchJson<WebinarStats>('/api/admin/webinar-signups/stats');
      setStats(res);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('adminWebinars.errorStats'));
    }
  }, [t]);

  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [load]);

  if (error && !stats) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
        {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="md" className="text-[#1B2A4A]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 4-card primary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard value={stats.total} label={t('adminWebinars.statTotal')} />
        <StatCard value={stats.today} label={t('adminWebinars.statToday')} accent />
        <StatCard value={stats.last7Days} label={t('adminWebinars.stat7d')} />
        <StatCard value={stats.last30Days} label={t('adminWebinars.stat30d')} />
      </div>

      {/* by-status pills */}
      <Card>
        <div className="p-4">
          <p className="text-sm font-semibold text-[#1B2A4A] mb-3">
            {t('adminWebinars.statByStatus')}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {stats.byStatus.map((row) => (
              <span
                key={row.status}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold ${STATUS_COLOR[row.status]}`}
              >
                {row.status}
                <span className="font-mono">{row.count}</span>
              </span>
            ))}
          </div>
        </div>
      </Card>

      {/* by-country + by-interest + by-source — 3-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <BreakdownCard
          title={t('adminWebinars.statByCountry')}
          items={stats.byCountry.map((c) => ({ label: c.label, count: c.count }))}
        />
        <Card>
          <div className="p-4">
            <p className="text-sm font-semibold text-[#1B2A4A] mb-3">
              {t('adminWebinars.statByInterest')}
            </p>
            {stats.byInterest.length === 0 ? (
              <p className="text-sm text-gray-500">—</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {stats.byInterest.map((row) => (
                  <span
                    key={row.label}
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 border ${INTEREST_COLOR[row.label] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}
                  >
                    {row.label}
                    <span className="font-mono">{row.count}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </Card>
        <BreakdownCard
          title={t('adminWebinars.statBySource')}
          items={stats.bySource.map((c) => ({ label: c.label, count: c.count }))}
        />
      </div>
    </div>
  );
}

function StatCard({
  value,
  label,
  accent = false,
}: {
  value: number;
  label: string;
  accent?: boolean;
}) {
  return (
    <Card>
      <div className="p-4">
        <div
          className={`text-2xl font-bold ${accent ? 'text-[#9B1B30]' : 'text-[#1B2A4A]'}`}
        >
          {value.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500 mt-1">{label}</div>
      </div>
    </Card>
  );
}

function BreakdownCard({
  title,
  items,
}: {
  title: string;
  items: { label: string; count: number }[];
}) {
  const max = items.reduce((m, i) => Math.max(m, i.count), 1);
  return (
    <Card>
      <div className="p-4">
        <p className="text-sm font-semibold text-[#1B2A4A] mb-3">{title}</p>
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">—</p>
        ) : (
          <div className="space-y-1.5">
            {items.map((row) => (
              <div key={row.label} className="flex items-center gap-2 text-sm">
                <span className="flex-1 truncate text-gray-700">{row.label}</span>
                <span className="text-gray-500 font-mono">{row.count}</span>
                <div className="w-16 h-1.5 bg-gray-100 shrink-0">
                  <div
                    className="h-full bg-[#1B2A4A]"
                    style={{ width: `${(row.count / max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
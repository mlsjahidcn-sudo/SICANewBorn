'use client';
import {
  MetricTile,
  RankedBreakdown,
  ReportPanel,
  ReportingTrend,
} from './reporting-ui';
import { useI18n } from '@/lib/i18n';
import {
  WEBINAR_INTEREST_KEYS,
  type WebinarSummary,
  type WebinarStatus,
} from '@/lib/webinar-report';

export function webinarStatusKey(status: string): string {
  return status === 'No-Show'
    ? 'adminWebinars.status_NoShow'
    : `adminWebinars.status_${status}`;
}
export function WebinarStatsCards({
  stats,
  onStatus,
}: {
  stats: WebinarSummary;
  onStatus?: (status: WebinarStatus) => void;
}): React.JSX.Element {
  const { t } = useI18n();
  const attendance =
    stats.attendanceRate === null
      ? '—'
      : `${Math.round(stats.attendanceRate)}%`;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricTile
          label={t('adminReporting.registrations')}
          value={stats.total}
          accent
        />
        <MetricTile
          label={t('adminReporting.attended')}
          value={stats.attended}
        />
        <MetricTile
          label={t('adminReporting.awaiting')}
          value={stats.awaiting}
        />
        <MetricTile
          label={t('adminReporting.attendanceRate')}
          value={attendance}
          subtitle={t('adminReporting.rateHint')}
        />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <ReportPanel
          title={t('adminReporting.registrationTrend')}
          description={t('adminReporting.registrationTrendHint')}
        >
          <ReportingTrend
            data={stats.trend}
            series={[
              {
                key: 'registrations',
                label: t('adminReporting.registrations'),
                color: '#1B2A4A',
              },
            ]}
          />
        </ReportPanel>
        <ReportPanel
          title={t('adminReporting.attendanceOverview')}
          description={t('adminReporting.allStatuses')}
        >
          <div className="space-y-2 p-5">
            {stats.byStatus.map((row) => (
              <button
                key={row.status}
                type="button"
                disabled={!onStatus}
                onClick={() => onStatus?.(row.status)}
                className="flex w-full items-center justify-between border-b border-gray-100 py-3 text-left text-xs text-[#1B2A4A] enabled:hover:text-[#9B1B30]"
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`size-1.5 ${row.status === 'Attended' ? 'bg-[#1B2A4A]' : row.status === 'No-Show' ? 'bg-[#9B1B30]' : row.status === 'Cancelled' ? 'bg-gray-300' : 'border border-[#1B2A4A]'}`}
                  />
                  {t(webinarStatusKey(row.status))}
                </span>
                <strong className="font-semibold tabular-nums">
                  {row.count.toLocaleString()}
                </strong>
              </button>
            ))}
            <p className="pt-3 text-[11px] leading-relaxed text-gray-500">
              {t('adminReporting.coverage', {
                marked: stats.attended + stats.noShow,
                eligible: stats.total - stats.cancelled,
              })}
            </p>
            <p className="text-[11px] leading-relaxed text-gray-500">
              {t('adminReporting.reviewStatuses')}
            </p>
          </div>
        </ReportPanel>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <RankedBreakdown
          title={t('adminReporting.countries')}
          items={stats.byCountry}
          total={stats.total}
          label={(value) =>
            value === '__missing' ? t('adminReporting.notProvided') : value
          }
        />
        <RankedBreakdown
          title={t('adminReporting.interests')}
          description={t('adminReporting.multiInterest')}
          items={stats.byInterest}
          total={stats.total}
          label={(value) =>
            WEBINAR_INTEREST_KEYS[value]
              ? t(WEBINAR_INTEREST_KEYS[value])
              : value
          }
        />
        <RankedBreakdown
          title={t('adminReporting.sources')}
          items={stats.bySource}
          total={stats.total}
          label={(value) =>
            value === '__missing' ? t('adminReporting.unattributed') : value
          }
        />
      </div>
    </div>
  );
}

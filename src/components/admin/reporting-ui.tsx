'use client';
import { useState, type ReactNode } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  CalendarDays,
  AlertCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useI18n } from '@/lib/i18n';
import type {
  MetricComparison,
  ReportBreakdown,
  ReportRange,
} from '@/lib/admin-reporting';
import type { ReportingFilters } from '@/hooks/use-admin-report';

export const REPORT_INPUT =
  'h-9 min-w-0 rounded-none border border-gray-200 bg-white px-3 text-xs text-[#1B2A4A] outline-none focus:border-[#1B2A4A] focus:ring-1 focus:ring-[#1B2A4A]';
export function ReportPanel({
  title,
  description,
  action,
  children,
  className = '',
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <section
      className={`min-w-0 rounded-none border border-[#1B2A4A]/12 bg-white ${className}`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-[#1B2A4A]">{title}</h2>
          {description && (
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
export function MetricTile({
  label,
  value,
  comparison,
  subtitle,
  accent = false,
}: {
  label: string;
  value: number | string;
  comparison?: MetricComparison;
  subtitle?: string;
  accent?: boolean;
}): React.JSX.Element {
  const { t } = useI18n();
  const delta = comparison ? comparison.current - comparison.previous : 0;
  const DeltaIcon = delta < 0 ? ArrowDownRight : ArrowUpRight;
  return (
    <div
      className={`border bg-white p-4 sm:p-5 ${accent ? 'border-[#9B1B30]/30 border-t-2 border-t-[#9B1B30]' : 'border-[#1B2A4A]/12'}`}
    >
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-[#1B2A4A] tabular-nums">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {comparison && (
        <p className="mt-2 flex items-center gap-1 text-[11px] text-gray-500">
          <DeltaIcon className="size-3 text-[#1B2A4A]" aria-hidden="true" />
          {delta > 0 ? '+' : ''}
          {delta.toLocaleString()} ·{' '}
          {comparison.previous === 0
            ? comparison.current
              ? t('adminReporting.new')
              : '—'
            : `${delta > 0 ? '+' : ''}${Math.round((delta / comparison.previous) * 100)}%`}{' '}
          {t('adminReporting.vsPrevious')}
        </p>
      )}
      {subtitle && (
        <p className="mt-2 text-[11px] leading-relaxed text-gray-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}
export function ReportingToolbar({
  filters,
  update,
  refresh,
  loading,
  generatedAt,
  range,
}: {
  filters: ReportingFilters;
  update: (patch: Partial<ReportingFilters>) => void;
  refresh: () => void;
  loading: boolean;
  generatedAt?: string;
  range?: ReportRange;
}): React.JSX.Element {
  const { t, locale } = useI18n();
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <CalendarDays
          aria-hidden="true"
          className="mr-1 size-4 text-[#1B2A4A]"
        />
        <select
          aria-label={t('adminReporting.period')}
          value={filters.range}
          onChange={(event) =>
            update({ range: event.target.value as ReportingFilters['range'] })
          }
          className={`${REPORT_INPUT} font-medium`}
        >
          <option value="7d">{t('adminReporting.days7')}</option>
          <option value="30d">{t('adminReporting.days30')}</option>
          <option value="90d">{t('adminReporting.days90')}</option>
          <option value="custom">{t('adminReporting.custom')}</option>
        </select>
        {filters.range === 'custom' && (
          <>
            <input
              type="date"
              aria-label={t('adminReporting.from')}
              value={filters.from}
              onChange={(event) => update({ from: event.target.value })}
              className={`${REPORT_INPUT} w-36`}
            />
            <span aria-hidden="true" className="text-gray-400">
              –
            </span>
            <input
              type="date"
              aria-label={t('adminReporting.to')}
              value={filters.to}
              onChange={(event) => update({ to: event.target.value })}
              className={`${REPORT_INPUT} w-36`}
            />
          </>
        )}
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className={`${REPORT_INPUT} inline-flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50`}
        >
          <RefreshCw
            aria-hidden="true"
            className={`size-3.5 ${loading ? 'animate-spin' : ''}`}
          />
          {t('adminReporting.refresh')}
        </button>
      </div>
      <p className="text-[11px] leading-relaxed text-gray-500">
        {range ? `${range.from} – ${range.to} · ` : ''}
        {t('adminReporting.timezone')}
        {generatedAt && (
          <>
            {' '}
            · {t('adminReporting.updated')}{' '}
            {new Date(generatedAt).toLocaleTimeString(
              locale === 'zh' ? 'zh-CN' : 'en-GB',
              {
                timeZone: 'Asia/Shanghai',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              },
            )}
          </>
        )}
        {loading && <> · {t('adminReporting.refreshing')}</>}
      </p>
    </div>
  );
}
export function ReportingError({
  error,
  stale,
  retry,
}: {
  error: string | null;
  stale: boolean;
  retry: () => void;
}): React.JSX.Element | null {
  const { t } = useI18n();
  if (!error) return null;
  return (
    <div
      role="alert"
      className="flex flex-wrap items-start gap-2 border border-[#9B1B30]/25 bg-[#9B1B30]/5 p-4 text-sm text-[#1B2A4A]"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-[#1B2A4A]" />
      <div className="flex-1">
        <p className="font-medium">
          {t(stale ? 'adminReporting.stale' : 'adminReporting.loadError')}
        </p>
        <p className="mt-1 text-xs text-gray-600">{error}</p>
      </div>
      <button
        type="button"
        className="text-xs font-semibold underline underline-offset-2"
        onClick={retry}
      >
        {t('adminReporting.retry')}
      </button>
    </div>
  );
}
export function ReportLoading(): React.JSX.Element {
  const { t } = useI18n();
  return (
    <div
      role="status"
      aria-label={t('adminReporting.loading')}
      className="space-y-5"
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse border border-gray-200 bg-white"
          />
        ))}
      </div>
      <div className="h-72 animate-pulse border border-gray-200 bg-white" />
      <p className="sr-only">{t('adminReporting.loading')}</p>
    </div>
  );
}
export function RankedBreakdown({
  title,
  items,
  total,
  label,
  description,
}: {
  title: string;
  items: ReportBreakdown[];
  total: number;
  label?: (value: string) => string;
  description?: string;
}): React.JSX.Element {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? items : items.slice(0, 5);
  const remainder = items.slice(5).reduce((sum, row) => sum + row.count, 0);
  return (
    <ReportPanel
      title={title}
      description={description}
      action={
        items.length > 5 ? (
          <button
            type="button"
            aria-expanded={expanded}
            className="shrink-0 text-[11px] font-semibold text-[#9B1B30] hover:underline"
            onClick={() => setExpanded(!expanded)}
          >
            {t(expanded ? 'adminReporting.less' : 'adminReporting.showAll')}
          </button>
        ) : undefined
      }
    >
      <div className="space-y-4 p-5">
        {!items.length && (
          <p className="py-5 text-center text-xs text-gray-500">
            {t('adminReporting.noData')}
          </p>
        )}
        {shown.map((item) => (
          <div key={item.label}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
              <span
                className="truncate text-[#1B2A4A]"
                title={label?.(item.label) || item.label}
              >
                {label?.(item.label) || item.label}
              </span>
              <span className="shrink-0 tabular-nums text-gray-500">
                <strong className="mr-2 font-semibold text-[#1B2A4A]">
                  {item.count.toLocaleString()}
                </strong>
                {total ? Math.round((item.count / total) * 100) : 0}%
              </span>
            </div>
            <div className="h-1 bg-gray-100">
              <div
                className="h-full bg-[#1B2A4A]"
                style={{
                  width: `${Math.min(100, total ? (item.count / total) * 100 : 0)}%`,
                }}
              />
            </div>
          </div>
        ))}
        {!expanded && remainder > 0 && (
          <p className="border-t border-gray-100 pt-3 text-xs text-gray-500">
            {t('adminReporting.other')}{' '}
            <span className="float-right tabular-nums">
              {remainder.toLocaleString()}
            </span>
          </p>
        )}
      </div>
    </ReportPanel>
  );
}
export function ReportingTrend({
  data,
  series,
}: {
  data: Array<{ date: string; [key: string]: string | number }>;
  series: { key: string; label: string; color: string; dashed?: boolean }[];
}): React.JSX.Element {
  const { t } = useI18n();
  const total = data.reduce(
    (sum, row) =>
      sum + series.reduce((part, s) => part + Number(row[s.key] || 0), 0),
    0,
  );
  return (
    <div className="p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2">
        {series.map((s) => (
          <span
            key={s.key}
            className="inline-flex items-center gap-2 text-[11px] text-gray-500"
          >
            <span
              className={`inline-block w-5 border-t-2 ${s.dashed ? 'border-dashed' : ''}`}
              style={{ borderColor: s.color }}
            />
            {s.label}
          </span>
        ))}
      </div>
      {total === 0 ? (
        <p className="flex h-48 items-center justify-center text-xs text-gray-500">
          {t('adminReporting.noData')}
        </p>
      ) : (
        <div
          className="h-56 min-w-0"
          role="img"
          aria-label={`${series.map((s) => s.label).join(', ')}: ${total.toLocaleString()}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
            >
              <CartesianGrid vertical={false} stroke="#EEF0F3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => String(value).slice(5)}
                tick={{ fontSize: 10, fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
                minTickGap={28}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 0,
                  border: '1px solid #E5E7EB',
                  fontSize: 12,
                }}
              />
              {series.map((s) => (
                <Line
                  key={s.key}
                  name={s.label}
                  type="monotone"
                  dataKey={s.key}
                  stroke={s.color}
                  strokeWidth={s.dashed ? 1.5 : 2}
                  strokeDasharray={s.dashed ? '4 4' : undefined}
                  dot={false}
                  activeDot={{ r: 3 }}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <details className="mt-3 border-t border-gray-100 pt-3">
        <summary className="cursor-pointer text-[11px] text-gray-500">
          {t('adminReporting.dataTable')}
        </summary>
        <div className="mt-2 max-h-48 overflow-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr>
                <th className="p-1 font-medium">{t('adminReporting.date')}</th>
                {series.map((s) => (
                  <th key={s.key} className="p-1 text-right font-medium">
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.date}>
                  <td className="p-1 text-gray-500">{row.date}</td>
                  {series.map((s) => (
                    <td key={s.key} className="p-1 text-right tabular-nums">
                      {row[s.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

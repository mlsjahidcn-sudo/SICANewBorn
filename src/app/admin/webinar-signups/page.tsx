'use client';
import { useEffect, useState } from 'react';
import { Download, ArrowRight, Search, Users, X } from 'lucide-react';
import { PageContainer } from '@/components/admin/page-container';
import {
  WebinarStatsCards,
  webinarStatusKey,
} from '@/components/admin/WebinarStatsCards';
import {
  REPORT_INPUT,
  ReportingToolbar,
  ReportingError,
  ReportLoading,
  ReportPanel,
} from '@/components/admin/reporting-ui';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { apiFetchJson } from '@/lib/api-client';
import { downloadCsvViaApi } from '@/lib/download-csv';
import { useI18n } from '@/lib/i18n';
import { useAdminReport, useReportingFilters } from '@/hooks/use-admin-report';
import {
  WEBINAR_STATUSES,
  WEBINAR_INTEREST_KEYS,
  WEBINAR_KEY_UNTAGGED,
  type WebinarReport,
  type WebinarSignup,
  type WebinarStatus,
} from '@/lib/webinar-report';

interface BulkResult {
  updated: number;
  failed: { id: string; error: string }[];
}
interface HistoryRow {
  id: string;
  action: string;
  from_value: string | null;
  to_value: string | null;
  note: string | null;
  created_at: string;
}

function StatusPill({ status }: { status: WebinarStatus }): React.JSX.Element {
  const { t } = useI18n();
  const tone =
    status === 'Attended'
      ? 'border-[#1B2A4A]/20 bg-[#1B2A4A]/5 text-[#1B2A4A]'
      : status === 'No-Show'
        ? 'border-[#9B1B30]/20 bg-[#9B1B30]/5 text-[#9B1B30]'
        : 'border-gray-200 bg-gray-50 text-gray-600';
  return (
    <span
      className={`inline-flex whitespace-nowrap border px-2 py-1 text-[10px] font-medium ${tone}`}
    >
      {t(webinarStatusKey(status))}
    </span>
  );
}

export default function WebinarSignupsPage(): React.JSX.Element {
  const { t, locale } = useI18n();
  const { filters, ready, query, update } = useReportingFilters();
  const report = useAdminReport<WebinarReport>(
    ready ? `/api/admin/webinar-signups?${query}` : null,
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<WebinarSignup | null>(null);
  const [bulkStatus, setBulkStatus] = useState<WebinarStatus>('Attended');
  const [pending, setPending] = useState<{
    ids: string[];
    status: WebinarStatus;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkResult | null>(null);
  const [exporting, setExporting] = useState(false);
  const data = report.data;
  const history = useAdminReport<{ history: HistoryRow[] }>(
    detail
      ? `/api/admin/webinar-signups/${detail.id}?v=${data?.generatedAt || ''}`
      : null,
    false,
  );
  const blocked =
    report.loading ||
    !!report.error ||
    !data ||
    filters.q.trim() !== data.filters.q;

  useEffect(() => {
    setSelected(new Set());
    setDetail(null);
    setResult(null);
  }, [query, filters.q]);
  const formatDate = (value: string): string =>
    new Date(value).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-GB', {
      timeZone: 'Asia/Shanghai',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  const name = (signup: WebinarSignup): string =>
    `${signup.firstName} ${signup.lastName}`.trim() || signup.email;
  const interestLabel = (interest: string): string =>
    WEBINAR_INTEREST_KEYS[interest]
      ? t(WEBINAR_INTEREST_KEYS[interest])
      : interest;
  const requestChange = (ids: string[], status: WebinarStatus): void => {
    setSaveError(null);
    setPending({ ids, status });
  };
  const confirmChange = async (): Promise<void> => {
    if (!pending) return;
    setSaving(true);
    setSaveError(null);
    try {
      const outcome = await apiFetchJson<BulkResult>(
        '/api/admin/webinar-signups/bulk',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pending),
        },
      );
      setResult(outcome);
      setSelected(new Set(outcome.failed.map((row) => row.id)));
      if (
        detail &&
        pending.ids.includes(detail.id) &&
        !outcome.failed.some((row) => row.id === detail.id)
      )
        setDetail({ ...detail, status: pending.status });
      setPending(null);
      report.refresh();
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : t('adminReporting.saveError'),
      );
    } finally {
      setSaving(false);
    }
  };
  const exportRows = async (ids?: string[]): Promise<void> => {
    setExporting(true);
    setActionError(null);
    try {
      const params = new URLSearchParams(query);
      if (ids) params.set('ids', ids.join(','));
      await downloadCsvViaApi(
        `/api/admin/webinar-signups/export?${params}`,
        'sica-webinar-registrations.csv',
      );
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : t('adminReporting.loadError'),
      );
    } finally {
      setExporting(false);
    }
  };
  const toggle = (id: string): void =>
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const allSelected =
    !!data?.signups.length && data.signups.every((row) => selected.has(row.id));
  const statusControl = (signup: WebinarSignup): React.JSX.Element => (
    <select
      aria-label={`${t('adminReporting.changeStatus')} · ${name(signup)}`}
      value={signup.status}
      disabled={blocked || saving}
      onChange={(event) => {
        if (event.target.value !== signup.status)
          requestChange([signup.id], event.target.value as WebinarStatus);
      }}
      className={`${REPORT_INPUT} w-32 text-[11px]`}
    >
      {WEBINAR_STATUSES.map((status) => (
        <option key={status} value={status}>
          {t(webinarStatusKey(status))}
        </option>
      ))}
    </select>
  );

  return (
    <PageContainer width="wide" className="pb-24">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9B1B30]">
            SICA / {t('adminReporting.webinars')}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1B2A4A] sm:text-3xl">
            {t('adminReporting.webinarTitle')}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {t('adminReporting.webinarSubtitle')}
          </p>
        </div>
        <Button
          variant="outline"
          disabled={blocked || exporting}
          onClick={() => void exportRows()}
          className="gap-2 rounded-none"
        >
          <Download className="size-4 text-[#1B2A4A]" />
          {t(
            exporting
              ? 'adminReporting.exporting'
              : 'adminReporting.exportFiltered',
          )}
        </Button>
      </div>
      <div className="space-y-4 border border-[#1B2A4A]/12 bg-white p-4 sm:p-5">
        <ReportingToolbar
          filters={filters}
          update={update}
          refresh={report.refresh}
          loading={report.loading}
          generatedAt={data?.generatedAt}
          range={data?.range}
        />
        <div className="grid grid-cols-1 gap-2 border-t border-gray-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <select
            aria-label={t('adminReporting.webinarKey')}
            value={filters.webinarKey}
            onChange={(event) => update({ webinarKey: event.target.value })}
            className={REPORT_INPUT}
          >
            <option value="">{t('adminReporting.allWebinarKeys')}</option>
            {(
              data?.facets.webinarKeys ||
              (filters.webinarKey ? [filters.webinarKey] : [])
            ).map((key) => (
              <option key={key} value={key}>
                {key === WEBINAR_KEY_UNTAGGED
                  ? t('adminReporting.untaggedWebinar')
                  : key}
              </option>
            ))}
          </select>
          <select
            aria-label={t('adminReporting.countries')}
            value={filters.country}
            onChange={(event) => update({ country: event.target.value })}
            className={REPORT_INPUT}
          >
            <option value="">{t('adminReporting.allCountries')}</option>
            {(
              data?.facets.countries ||
              (filters.country ? [filters.country] : [])
            ).map((country) => (
              <option key={country} value={country}>
                {country === '__missing'
                  ? t('adminReporting.notProvided')
                  : country}
              </option>
            ))}
          </select>
          <select
            aria-label={t('adminReporting.sources')}
            value={filters.source}
            onChange={(event) => update({ source: event.target.value })}
            className={REPORT_INPUT}
          >
            <option value="">{t('adminReporting.allSources')}</option>
            {(
              data?.facets.sources || (filters.source ? [filters.source] : [])
            ).map((source) => (
              <option key={source} value={source}>
                {source === '__missing'
                  ? t('adminReporting.unattributed')
                  : source}
              </option>
            ))}
          </select>
          <select
            aria-label={t('adminReporting.interests')}
            value={filters.interest}
            onChange={(event) => update({ interest: event.target.value })}
            className={REPORT_INPUT}
          >
            <option value="">{t('adminReporting.allInterests')}</option>
            {(
              data?.facets.interests ||
              (filters.interest ? [filters.interest] : [])
            ).map((interest) => (
              <option key={interest} value={interest}>
                {interestLabel(interest)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              aria-hidden="true"
              className="absolute left-3 top-3 size-3.5 text-[#1B2A4A]"
            />
            <input
              maxLength={200}
              value={filters.q}
              onChange={(event) => update({ q: event.target.value })}
              aria-label={t('adminReporting.search')}
              placeholder={t('adminReporting.search')}
              className={`${REPORT_INPUT} w-full pl-9`}
            />
          </div>
          <select
            aria-label={t('adminReporting.status')}
            value={filters.status}
            onChange={(event) => update({ status: event.target.value })}
            className={`${REPORT_INPUT} sm:w-44`}
          >
            <option value="all">{t('adminWebinars.statusAll')}</option>
            {WEBINAR_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t(webinarStatusKey(status))}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() =>
              update({
                q: '',
                status: 'all',
                country: '',
                source: '',
                interest: '',
                webinarKey: '',
              })
            }
            className="px-2 text-xs font-medium text-[#9B1B30] underline-offset-4 hover:underline"
          >
            {t('adminReporting.clear')}
          </button>
        </div>
      </div>
      <ReportingError
        error={report.error}
        stale={!!data}
        retry={report.refresh}
      />
      <ReportingError
        error={actionError}
        stale={false}
        retry={() => setActionError(null)}
      />
      {!data && !report.error && <ReportLoading />}
      {data && (
        <>
          <WebinarStatsCards
            stats={data.stats}
            onStatus={(status) => update({ status })}
          />
          <ReportPanel
            title={t('adminReporting.matching', {
              count: data.total.toLocaleString(),
            })}
            action={
              <Users aria-hidden="true" className="size-4 text-[#1B2A4A]" />
            }
          >
            {result && (
              <div
                role="status"
                className="border-b border-gray-100 bg-[#FAFAF8] px-5 py-3 text-xs text-[#1B2A4A]"
              >
                <div className="flex items-center justify-between">
                  <p>
                    {t('adminReporting.result', {
                      updated: result.updated,
                      failed: result.failed.length,
                    })}
                  </p>
                  <button
                    type="button"
                    aria-label={t('adminReporting.dismiss')}
                    onClick={() => setResult(null)}
                  >
                    <X className="size-4" />
                  </button>
                </div>
                {result.failed.map((row) => (
                  <p key={row.id} className="mt-2 text-[#9B1B30]">
                    {data.signups.find((signup) => signup.id === row.id)
                      ?.email || row.id}
                    : {row.error}
                  </p>
                ))}
              </div>
            )}
            {data.signups.length === 0 ? (
              <p className="p-12 text-center text-sm text-gray-500">
                {t('adminReporting.emptyTable')}
              </p>
            ) : (
              <>
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAFAF8] text-[10px] uppercase tracking-wider text-gray-500">
                      <tr>
                        <th className="w-12 px-4 py-3">
                          <input
                            type="checkbox"
                            aria-label={t('adminReporting.selectPage')}
                            checked={allSelected}
                            disabled={blocked}
                            ref={(element) => {
                              if (element)
                                element.indeterminate =
                                  selected.size > 0 && !allSelected;
                            }}
                            onChange={(event) =>
                              setSelected(
                                event.target.checked
                                  ? new Set(data.signups.map((row) => row.id))
                                  : new Set(),
                              )
                            }
                            className="accent-[#1B2A4A]"
                          />
                        </th>
                        {[
                          'attendee',
                          'country',
                          'webinarKey',
                          'interests',
                          'registeredAt',
                          'status',
                        ].map((key) => (
                          <th key={key} className="px-4 py-3 font-medium">
                            {t(`adminReporting.${key}`)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.signups.map((signup) => (
                        <tr
                          key={signup.id}
                          className={
                            selected.has(signup.id)
                              ? 'bg-[#9B1B30]/5'
                              : 'hover:bg-gray-50'
                          }
                        >
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              aria-label={t('adminReporting.selectAttendee', {
                                name: name(signup),
                              })}
                              checked={selected.has(signup.id)}
                              disabled={blocked}
                              onChange={() => toggle(signup.id)}
                              className="accent-[#1B2A4A]"
                            />
                          </td>
                          <td className="max-w-60 px-4 py-4">
                            <button
                              type="button"
                              onClick={() => setDetail(signup)}
                              className="block truncate font-semibold text-[#1B2A4A] hover:underline"
                            >
                              {name(signup)}
                            </button>
                            <a
                              href={`mailto:${signup.email}`}
                              className="mt-1 block truncate text-[11px] text-gray-500 hover:underline"
                            >
                              {signup.email}
                            </a>
                            <a
                              href={`https://wa.me/${signup.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 block text-[11px] text-gray-500 hover:underline"
                            >
                              {signup.whatsapp}
                            </a>
                          </td>
                          <td className="px-4 py-4 text-gray-600">
                            {signup.country || '—'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-[11px] text-gray-600">
                            {signup.webinarKey ||
                              t('adminReporting.untaggedWebinar')}
                          </td>
                          <td className="max-w-48 px-4 py-4">
                            <p className="line-clamp-2 leading-relaxed text-gray-600">
                              {signup.programInterests
                                .map(interestLabel)
                                .join(' · ') || '—'}
                            </p>
                            <p className="mt-1 text-[10px] text-gray-400">
                              {signup.utmSource ||
                                t('adminReporting.unattributed')}
                            </p>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-[11px] text-gray-500">
                            {formatDate(signup.createdAt)}
                          </td>
                          <td className="px-4 py-4">{statusControl(signup)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="divide-y divide-gray-100 lg:hidden">
                  {data.signups.map((signup) => (
                    <article
                      key={signup.id}
                      className={`p-4 ${selected.has(signup.id) ? 'bg-[#9B1B30]/5' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-1 accent-[#1B2A4A]"
                          aria-label={t('adminReporting.selectAttendee', {
                            name: name(signup),
                          })}
                          checked={selected.has(signup.id)}
                          disabled={blocked}
                          onChange={() => toggle(signup.id)}
                        />
                        <div className="min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => setDetail(signup)}
                            className="text-left text-sm font-semibold text-[#1B2A4A]"
                          >
                            {name(signup)}
                          </button>
                          <p className="mt-1 truncate text-xs text-gray-500">
                            {signup.email}
                          </p>
                          <p className="mt-1 text-[11px] text-gray-500">
                            {signup.country || '—'} ·{' '}
                            {signup.webinarKey ||
                              t('adminReporting.untaggedWebinar')}{' '}
                            · {formatDate(signup.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        {statusControl(signup)}
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#1B2A4A]"
                          onClick={() => setDetail(signup)}
                        >
                          {t('adminReporting.details')}
                          <ArrowRight className="size-3" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
              <span>
                {t('adminReporting.page', {
                  page: data.page,
                  total: data.totalPages,
                })}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={blocked || data.page <= 1}
                  onClick={() => update({ page: data.page - 1 })}
                  className={`${REPORT_INPUT} disabled:opacity-40`}
                >
                  {t('adminReporting.previous')}
                </button>
                <button
                  type="button"
                  disabled={blocked || data.page >= data.totalPages}
                  onClick={() => update({ page: data.page + 1 })}
                  className={`${REPORT_INPUT} disabled:opacity-40`}
                >
                  {t('adminReporting.next')}
                </button>
              </div>
            </div>
          </ReportPanel>
        </>
      )}
      {selected.size > 0 && (
        <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 border border-[#1B2A4A]/20 bg-white p-4 shadow-lg">
          <span className="text-xs font-semibold text-[#1B2A4A]">
            {t('adminReporting.selected', { count: selected.size })}
          </span>
          <div className="flex flex-wrap gap-2">
            <select
              aria-label={t('adminReporting.changeStatus')}
              value={bulkStatus}
              onChange={(event) =>
                setBulkStatus(event.target.value as WebinarStatus)
              }
              className={REPORT_INPUT}
            >
              {WEBINAR_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t(webinarStatusKey(status))}
                </option>
              ))}
            </select>
            <Button
              className="rounded-none bg-[#1B2A4A] text-xs hover:bg-[#24395F]"
              disabled={blocked}
              onClick={() => requestChange([...selected], bulkStatus)}
            >
              {t('adminReporting.changeStatus')}
            </Button>
            <Button
              variant="outline"
              className="rounded-none text-xs"
              disabled={blocked || exporting}
              onClick={() => void exportRows([...selected])}
            >
              {t('adminReporting.exportSelected')}
            </Button>
          </div>
        </div>
      )}
      <AlertDialog
        open={!!pending}
        onOpenChange={(open) => {
          if (!open && !saving) setPending(null);
        }}
      >
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('adminReporting.confirmStatus')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending &&
                t('adminReporting.confirmStatusBody', {
                  count: pending.ids.length,
                  status: t(webinarStatusKey(pending.status)),
                })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {saveError && (
            <p role="alert" className="text-sm text-[#9B1B30]">
              {saveError}
            </p>
          )}
          <AlertDialogFooter>
            <Button
              variant="outline"
              className="rounded-none"
              disabled={saving}
              onClick={() => setPending(null)}
            >
              {t('adminReporting.cancel')}
            </Button>
            <Button
              className="rounded-none bg-[#9B1B30] hover:bg-[#7A1526]"
              disabled={saving}
              onClick={() => void confirmChange()}
            >
              {t(saving ? 'adminReporting.saving' : 'adminReporting.confirm')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Sheet
        open={!!detail}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
      >
        <SheetContent className="w-full overflow-y-auto rounded-none sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>
              {detail ? name(detail) : t('adminReporting.attendee')}
            </SheetTitle>
            <SheetDescription>{t('adminReporting.timezone')}</SheetDescription>
          </SheetHeader>
          {detail && (
            <div className="space-y-6 px-5 pb-8">
              <StatusPill status={detail.status} />
              <div className="space-y-2 text-sm text-[#1B2A4A]">
                <a
                  className="block break-all hover:underline"
                  href={`mailto:${detail.email}`}
                >
                  {detail.email}
                </a>
                <a
                  className="block hover:underline"
                  href={`https://wa.me/${detail.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {detail.whatsapp}
                </a>
                <p className="text-xs text-gray-500">
                  {detail.country || '—'} ·{' '}
                  {detail.webinarKey || t('adminReporting.untaggedWebinar')} ·{' '}
                  {formatDate(detail.createdAt)}
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-xs font-semibold text-[#1B2A4A]">
                  {t('adminReporting.interests')}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  {detail.programInterests.map(interestLabel).join(' · ') ||
                    '—'}
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-xs font-semibold text-[#1B2A4A]">
                  {t('adminReporting.notes')}
                </h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                  {detail.notes || t('adminReporting.noNotes')}
                </p>
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-2 text-xs">
                <dt className="text-gray-500">{t('adminReporting.source')}</dt>
                <dd className="break-all text-[#1B2A4A]">
                  {detail.utmSource || t('adminReporting.unattributed')}
                </dd>
                <dt className="text-gray-500">
                  {t('adminReporting.campaign')}
                </dt>
                <dd className="break-all text-[#1B2A4A]">
                  {detail.utmCampaign || '—'}
                </dd>
              </dl>
              <div>
                <h3 className="mb-3 text-xs font-semibold text-[#1B2A4A]">
                  {t('adminReporting.history')}
                </h3>
                <ReportingError
                  error={history.error}
                  stale={!!history.data}
                  retry={history.refresh}
                />
                {!history.data && !history.error && (
                  <p className="text-xs text-gray-500">
                    {t('adminReporting.loading')}
                  </p>
                )}
                {history.data?.history.length === 0 && (
                  <p className="text-xs text-gray-500">
                    {t('adminReporting.noHistory')}
                  </p>
                )}
                {history.data?.history.map((row) => (
                  <div
                    key={row.id}
                    className="border-l border-gray-200 py-2 pl-3"
                  >
                    <p className="text-xs text-[#1B2A4A]">
                      {t('adminReporting.historyChange', {
                        from: row.from_value
                          ? t(webinarStatusKey(row.from_value))
                          : '—',
                        to: row.to_value
                          ? t(webinarStatusKey(row.to_value))
                          : '—',
                      })}
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      {formatDate(row.created_at)}
                    </p>
                    {row.note && (
                      <p className="mt-1 text-xs text-gray-500">{row.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}

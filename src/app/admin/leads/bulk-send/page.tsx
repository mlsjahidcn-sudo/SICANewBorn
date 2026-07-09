'use client';

/**
 * Phase 46: admin bulk WhatsApp send.
 *
 * URL: /admin/leads/bulk-send
 *
 * Three-section wizard:
 *   1. Filters (source / country / date / target_intake)
 *   2. Template picker (only approved WABPO templates)
 *   3. Preview + confirm (live count, sample, send)
 *
 * The "live count" is a `dryRun: true` call to the same bulk-send
 * endpoint that runs the actual send — single source of truth, no
 * duplicate query logic. Confirmed with `dryRun: false` after the
 * admin clicks the confirm button.
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Send, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { apiFetchJson, ApiError } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';

type LeadSource = 'contact' | 'chat' | 'assessment';
const ALL_SOURCES: LeadSource[] = ['contact', 'chat', 'assessment'];

interface WABPOTemplate {
  id: string;
  templateName: string;
  status: string;
  metaStatus: string | null;
  variableDefinitions: Array<{
    key: string;
    placeholder: string;
    sequence: number;
  }>;
}

interface BulkPreview {
  matched: number;
  sendable: number;
  preSkipped: number;
  sample: Array<{
    leadType: LeadSource;
    leadId: string;
    leadName: string | null;
    phone: string;
    country: string | null;
  }>;
}

interface BulkResult {
  matched: number;
  sent: number;
  skipped: number;
  failed: number;
  results: Array<{
    leadType: LeadSource;
    leadId: string;
    leadName: string | null;
    phone: string;
    status: 'sent' | 'skipped' | 'failed';
    skipReason?: string;
    messageId?: string;
    error?: string;
  }>;
}

export default function BulkSendPage() {
  const { t } = useI18n();
  // ---- Form state ----
  const [sources, setSources] = useState<LeadSource[]>([...ALL_SOURCES]);
  const [country, setCountry] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [targetIntake, setTargetIntake] = useState('');
  const [templateName, setTemplateName] = useState('');

  // ---- Templates + preview ----
  const [templates, setTemplates] = useState<WABPOTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [preview, setPreview] = useState<BulkPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [wabpoConfigured, setWabpoConfigured] = useState<boolean | null>(null);

  // ---- Send state ----
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<BulkResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Debounce the dry-run refetch so a flurry of filter changes doesn't
  // hammer the API. 400ms is short enough to feel live, long enough to
  // coalesce a checkbox click + dropdown change in one round-trip.
  const dryRunTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Fetch approved templates once on mount ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setTemplatesLoading(true);
      try {
        const res = await apiFetchJson<{ templates?: WABPOTemplate[]; configured: boolean }>(
          '/api/admin/wabpo/templates',
        );
        if (!cancelled) {
          setTemplates(res.templates ?? []);
          setWabpoConfigured(res.configured);
        }
      } catch (err) {
        if (!cancelled) {
          setWabpoConfigured(false);
          setError(err instanceof ApiError ? err.message : 'Failed to load templates');
        }
      } finally {
        if (!cancelled) setTemplatesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- Build the filter payload (memoized for stable identity) ----
  const filterPayload = useMemo(
    () => ({
      sources,
      filters: {
        country: country || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        targetIntake: targetIntake || undefined,
      },
    }),
    [sources, country, startDate, endDate, targetIntake],
  );

  // ---- Debounced dry-run on filter change ----
  useEffect(() => {
    if (sources.length === 0) {
      setPreview(null);
      return;
    }
    if (dryRunTimer.current) clearTimeout(dryRunTimer.current);
    dryRunTimer.current = setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const res = await apiFetchJson<BulkPreview>(
          '/api/admin/leads/bulk-send-whatsapp',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...filterPayload, dryRun: true }),
          },
        );
        setPreview(res);
      } catch {
        setPreview(null);
      } finally {
        setPreviewLoading(false);
      }
    }, 400);
    return () => {
      if (dryRunTimer.current) clearTimeout(dryRunTimer.current);
    };
  }, [filterPayload]);

  // ---- Send handler ----
  const onSend = useCallback(async () => {
    if (!templateName) {
      setError(t('adminBulkSend.errorNoTemplate'));
      return;
    }
    if (sources.length === 0) {
      setError(t('adminBulkSend.errorNoSource'));
      return;
    }
    setError(null);
    setConfirmOpen(false);
    setSending(true);
    try {
      const res = await apiFetchJson<BulkResult>(
        '/api/admin/leads/bulk-send-whatsapp',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...filterPayload, templateName, limit: 1000 }),
        },
      );
      setSendResult(res);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t('adminBulkSend.errorSendFailed'),
      );
    } finally {
      setSending(false);
    }
  }, [filterPayload, templateName, sources, t]);

  const canSend =
    !sending &&
    !!templateName &&
    sources.length > 0 &&
    !!preview &&
    preview.sendable > 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1B2A4A]">
          {t('adminBulkSend.title')}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {t('adminBulkSend.subtitle')}
        </p>
      </div>

      {wabpoConfigured === false && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <span>{t('adminBulkSend.notConfigured')}</span>
        </div>
      )}

      {/* Section 1: Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t('adminBulkSend.filtersTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Lead sources
            </label>
            <div className="flex flex-wrap gap-4">
              {ALL_SOURCES.map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={sources.includes(s)}
                    onCheckedChange={(checked) => {
                      setSources((prev) =>
                        checked
                          ? [...prev, s]
                          : prev.filter((x) => x !== s),
                      );
                    }}
                  />
                  {t(`adminBulkSend.source${s.charAt(0).toUpperCase() + s.slice(1)}`)}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                {t('adminBulkSend.filterCountry')}
              </label>
              <Input
                value={country}
                onChange={(e) => setCountry(e.target.value.toUpperCase())}
                placeholder={t('adminBulkSend.filterCountryPlaceholder')}
                maxLength={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                {t('adminBulkSend.filterTargetIntake')}
              </label>
              <Input
                value={targetIntake}
                onChange={(e) => setTargetIntake(e.target.value)}
                placeholder={t('adminBulkSend.filterTargetIntakePlaceholder')}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                {t('adminBulkSend.filterStartDate')}
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                {t('adminBulkSend.filterEndDate')}
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Template */}
      <Card>
        <CardHeader>
          <CardTitle>{t('adminBulkSend.templateTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {templatesLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading templates…
            </div>
          ) : templates.length === 0 ? (
            <p className="text-sm text-gray-500">{t('adminBulkSend.templateNone')}</p>
          ) : (
            <Select value={templateName} onValueChange={setTemplateName}>
              <SelectTrigger>
                <SelectValue placeholder={t('adminBulkSend.templatePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {templates.map((tpl) => (
                  <SelectItem key={tpl.id} value={tpl.templateName}>
                    {tpl.templateName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Preview */}
      <Card>
        <CardHeader>
          <CardTitle>{t('adminBulkSend.previewTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {previewLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Counting…
            </div>
          ) : preview ? (
            <>
              <p className="text-lg font-semibold text-[#1B2A4A]">
                {t('adminBulkSend.matchedCount', { count: preview.matched  })}
              </p>
              <p className="text-sm text-gray-600">
                {t('adminBulkSend.sendableCount', {
                  sendable: preview.sendable,
                  skipped: preview.preSkipped,
                })}
              </p>
              {preview.sample.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {t('adminBulkSend.sampleTitle', { count: preview.sample.length  })}
                  </p>
                  <div className="space-y-1">
                    {preview.sample.map((s) => (
                      <div
                        key={`${s.leadType}-${s.leadId}`}
                        className="text-sm text-gray-600 flex items-center gap-2"
                      >
                        <Badge variant="outline" className="text-xs">
                          {s.leadType}
                        </Badge>
                        <span className="font-medium">{s.leadName || '(no name)'}</span>
                        <span className="text-gray-400">·</span>
                        <span>{s.phone}</span>
                        {s.country && (
                          <>
                            <span className="text-gray-400">·</span>
                            <span>{s.country}</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">—</p>
          )}
        </CardContent>
      </Card>

      {/* Send action */}
      <div className="flex items-center gap-3 sticky bottom-0 bg-white py-4 border-t">
        <Button
          onClick={() => setConfirmOpen(true)}
          disabled={!canSend}
          className="bg-[#9B1B30] hover:bg-[#7d1626] text-white"
        >
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('adminBulkSend.sending')}
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              {t('adminBulkSend.confirmSend', {
                count: preview?.sendable ?? 0,
              })}
            </>
          )}
        </Button>
        {error && (
          <span className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {error}
          </span>
        )}
      </div>

      {/* Results */}
      {sendResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              {t('adminBulkSend.done')}
            </CardTitle>
            <CardDescription>
              <span className="text-green-700 font-medium">
                {t('adminBulkSend.resultsSent', { count: sendResult.sent  })}
              </span>
              {' · '}
              <span className="text-amber-700 font-medium">
                {t('adminBulkSend.resultsSkipped', { count: sendResult.skipped  })}
              </span>
              {' · '}
              <span className="text-red-700 font-medium">
                {t('adminBulkSend.resultsFailed', { count: sendResult.failed  })}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b text-left">
                    <th className="py-2 pr-2">{t('adminBulkSend.colLead')}</th>
                    <th className="py-2 pr-2">{t('adminBulkSend.colPhone')}</th>
                    <th className="py-2 pr-2">{t('adminBulkSend.colStatus')}</th>
                    <th className="py-2">{t('adminBulkSend.colDetail')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sendResult.results.map((r) => (
                    <tr key={`${r.leadType}-${r.leadId}`} className="border-b">
                      <td className="py-1.5 pr-2">
                        <Badge variant="outline" className="text-xs mr-1">
                          {r.leadType}
                        </Badge>
                        {r.leadName || '(no name)'}
                      </td>
                      <td className="py-1.5 pr-2 text-gray-600">{r.phone}</td>
                      <td className="py-1.5 pr-2">
                        {r.status === 'sent' && (
                          <span className="text-green-700">
                            {t('adminBulkSend.statusSent')}
                          </span>
                        )}
                        {r.status === 'skipped' && (
                          <span className="text-amber-700">
                            {t('adminBulkSend.statusSkipped')} ({r.skipReason})
                          </span>
                        )}
                        {r.status === 'failed' && (
                          <span className="text-red-700">
                            {t('adminBulkSend.statusFailed')}
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 text-gray-500 text-xs">
                        {r.messageId || r.error || ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirm modal */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('adminBulkSend.confirmTitle', {
                count: preview?.sendable ?? 0,
              })}
            </DialogTitle>
            <DialogDescription>
              {t('adminBulkSend.confirmBody', {
                count: preview?.sendable ?? 0,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              {t('adminBulkSend.confirmCancel')}
            </Button>
            <Button
              onClick={onSend}
              className="bg-[#9B1B30] hover:bg-[#7d1626] text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              {t('adminBulkSend.confirmSend', {
                count: preview?.sendable ?? 0,
              })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

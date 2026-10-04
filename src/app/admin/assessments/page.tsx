'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ClipboardList, Mail, MessageCircle, Calendar, GraduationCap, FileText, AlertCircle, CheckCircle, ExternalLink, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiFetchJson, ApiError } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import { useUrlState } from '@/hooks/use-url-state';

const PAGE_SIZE = 20;

interface AssessmentStats {
  total: number;
  today: number;
  last7Days: number;
  last30Days: number;
  byStatus: { status: string; count: number }[];
  countries: { label: string; count: number }[];
  education: { label: string; count: number }[];
  conversionRate: number;
  hasTranscriptRate: number;
  avgTranscriptsSizeBytes: number;
  generatedAt: string;
}

interface Assessment {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  whatsapp: string;
  country: string;
  date_of_birth: string | null;
  current_education: string | null;
  intended_major: string | null;
  target_universities: string | null;
  transcript_file_name: string | null;
  transcript_file_size: number | null;
  transcript_file_type: string | null;
  has_transcript: boolean;
  transcript_storage_path: string | null;
  notes: string | null;
  status: 'New' | 'Reviewing' | 'Completed' | 'Rejected';
  reviewer_notes: string | null;
  source_page: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string | null;
}

interface AssessmentsResponse {
  assessments: Assessment[];
  total: number;
  limit: number;
  offset: number;
}

const STATUS_COLOR: Record<string, string> = {
  New: 'bg-blue-100 text-blue-800',
  Reviewing: 'bg-yellow-100 text-yellow-800',
  Completed: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
};

function calculateAge(dob: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function formatBytes(bytes: number | null) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function AssessmentsPage() {
  const { t } = useI18n();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useUrlState<string>('status', 'all');
  const [page, setPage] = useUrlState<number>('page', 1, { coerce: (v) => Math.max(1, parseInt(v || '1', 10) || 1) });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [stats, setStats] = useState<AssessmentStats | null>(null);

  const offset = (page - 1) * PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const load = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      params.set('limit', String(PAGE_SIZE));
      params.set('offset', String(offset));
      const res = await apiFetchJson<AssessmentsResponse>(
        `/api/admin/assessments?${params}`,
      );
      setAssessments(res.assessments || []);
      setTotal(res.total ?? 0);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : t('adminAssessments.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Reset to page 1 whenever the status filter changes — we don't
    // carry offset N+1 across filters (different totals).
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const loadStats = async () => {
    try {
      const res = await apiFetchJson<AssessmentStats>('/api/admin/assessments/stats');
      setStats(res);
    } catch {
      // Stats are best-effort; if the endpoint fails (e.g. migration
      // not yet applied) the cards just stay blank — the list still works.
    }
  };

  useEffect(() => {
    loadStats();
    const id = setInterval(loadStats, 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page]);

  // Phase 126 — 30s background polling for the list (same cadence as
  // the stats endpoint). New assessments landing via /assessment appear
  // without a manual refresh. Cheap: bounded by PAGE_SIZE (20) per call.
  useEffect(() => {
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page]);

  const filtered = useMemo(() => {
    if (!searchQuery) return assessments;
    const q = searchQuery.toLowerCase();
    return assessments.filter(
      (a) =>
        a.first_name?.toLowerCase().includes(q) ||
        a.last_name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.whatsapp?.toLowerCase().includes(q) ||
        a.country?.toLowerCase().includes(q),
    );
  }, [assessments, searchQuery]);

  const selected = assessments.find((a) => a.id === selectedId) || null;

  const subtitle = (() => {
    if (total === 0) return t('adminAssessments.subtitle', { count: 0 });
    const from = offset + 1;
    const to = Math.min(offset + PAGE_SIZE, total);
    return t('adminAssessments.subtitlePaginated', { from, to, total });
  })();

  const updateStatus = async (id: string, status: Assessment['status']) => {
    setUpdatingId(id);
    try {
      await apiFetchJson(`/api/admin/assessments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setAssessments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : t('adminAssessments.errorUpdate'));
    } finally {
      setUpdatingId(null);
    }
  };

  const downloadTranscript = async (id: string) => {
    setDownloadingId(id);
    try {
      const { downloadUrl, fileName } = await apiFetchJson<{ downloadUrl: string; fileName: string }>(
        `/api/admin/assessments/${id}/download`,
      );
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName || 'transcript';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : t('adminAssessments.errorDownload'));
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937] flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-[#1B2A4A]" />
            {t('adminAssessments.title')}
          </h1>
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        </div>
      </div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      {/* Phase 126 — submission analytics (30s-polled from /stats) */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="p-4">
              <div className="text-2xl font-bold text-[#1B2A4A]">{stats.total}</div>
              <div className="text-xs text-gray-500 mt-1">{t('adminAssessments.statTotal')}</div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <div className="text-2xl font-bold text-[#9B1B30]">{stats.today}</div>
              <div className="text-xs text-gray-500 mt-1">{t('adminAssessments.statToday')}</div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <div className="text-2xl font-bold text-[#1B2A4A]">{stats.last7Days}</div>
              <div className="text-xs text-gray-500 mt-1">{t('adminAssessments.stat7d')}</div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <div className="text-2xl font-bold text-green-700">
                {(stats.conversionRate * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">{t('adminAssessments.statConversion')}</div>
            </div>
          </Card>
        </div>
      )}

      {stats && stats.byStatus.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-gray-500">{t('adminAssessments.statByStatus')}:</span>
          {stats.byStatus.map((b) => (
            <span
              key={b.status}
              className={`px-3 py-1 border ${STATUS_COLOR[b.status] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}
            >
              {b.status} · {b.count}
            </span>
          ))}
        </div>
      )}

      {stats && stats.countries.length > 0 && (
        <Card>
          <div className="p-4">
            <div className="text-sm font-semibold text-[#1B2A4A] mb-3">
              {t('adminAssessments.statTopCountries')} · {stats.countries.length}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-1.5">
              {stats.countries.map((c) => (
                <div key={c.label} className="flex items-center gap-2 text-sm">
                  <span className="flex-1 truncate text-gray-700">{c.label}</span>
                  <span className="text-gray-500">{c.count}</span>
                  <div className="w-16 h-1.5 bg-gray-100 shrink-0">
                    <div
                      className="h-full bg-[#1B2A4A]"
                      style={{ width: `${(c.count / stats.countries[0].count) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {stats && stats.education.length > 0 && (
        <Card>
          <div className="p-4">
            <div className="text-sm font-semibold text-[#1B2A4A] mb-3">
              {t('adminAssessments.statTopEducation')} · {stats.education.length}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1.5">
              {stats.education.map((c) => (
                <div key={c.label} className="flex items-center gap-2 text-sm">
                  <span className="flex-1 truncate text-gray-700">{c.label}</span>
                  <span className="text-gray-500">{c.count}</span>
                  <div className="w-16 h-1.5 bg-gray-100 shrink-0">
                    <div
                      className="h-full bg-[#9B1B30]"
                      style={{ width: `${(c.count / stats.education[0].count) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={t('adminAssessments.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full lg:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <SelectValue placeholder="All Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('adminAssessments.statusAll')}</SelectItem>
                  <SelectItem value="New">{t('adminAssessments.statusNew')}</SelectItem>
                  <SelectItem value="Reviewing">{t('adminAssessments.statusReviewing')}</SelectItem>
                  <SelectItem value="Completed">{t('adminAssessments.statusCompleted')}</SelectItem>
                  <SelectItem value="Rejected">{t('adminAssessments.statusRejected')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className={`${selected ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-3`}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="md" className="text-[#1B2A4A]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-gray-200 px-4 py-12 text-center text-gray-500">
              {assessments.length === 0
                ? t('adminAssessments.emptyAll')
                : t('adminAssessments.emptyFiltered')}
            </div>
          ) : (
            filtered.map((a) => {
              const age = calculateAge(a.date_of_birth);
              return (
                <button
                  key={a.id}
                  onClick={() => setSelectedId(a.id)}
                  className={`w-full text-left bg-white border ${
                    selectedId === a.id ? 'border-[#9B1B30] ring-1 ring-[#9B1B30]' : 'border-gray-200'
                  } p-4 hover:border-[#9B1B30]/50 transition-colors`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-10 w-10 bg-[#9B1B30]/10 flex items-center justify-center">
                      <span className="text-[#9B1B30] font-semibold text-sm">
                        {a.first_name?.[0]}
                        {a.last_name?.[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-[#1B2A4A]">
                          {a.first_name} {a.last_name}
                        </h3>
                        <Badge className={STATUS_COLOR[a.status]}>{a.status}</Badge>
                        {age !== null && (
                          <span className="text-xs text-gray-500">{age}y · {a.country}</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1 flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {a.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {a.whatsapp}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 mt-1 flex items-center gap-2 flex-wrap">
                        <GraduationCap className="h-3.5 w-3.5 text-gray-400" />
                        <span>{a.current_education || '—'}</span>
                        {a.intended_major && (
                          <span className="text-gray-500">· {a.intended_major}</span>
                        )}
                        {a.has_transcript && (
                          <span className="text-xs text-[#1B2A4A] flex items-center gap-1 ml-1">
                            <FileText className="h-3 w-3" />
                            {a.transcript_file_name} ({formatBytes(a.transcript_file_size)})
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(a.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {selected && (
          <Card className="lg:col-span-1 h-fit sticky top-6">
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#1B2A4A]">
                    {selected.first_name} {selected.last_name}
                  </h2>
                  <p className="text-sm text-gray-500">{formatDate(selected.created_at)}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>
                  ✕
                </Button>
              </div>

              <div className="space-y-2 text-sm border-b pb-4">
                <a
                  href={`mailto:${selected.email}`}
                  className="flex items-center gap-2 text-[#1B2A4A] hover:underline"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {selected.email}
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href={`https://wa.me/${selected.whatsapp.replace(/[^\d+]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#1B2A4A] hover:underline"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  {selected.whatsapp} (WhatsApp)
                  <ExternalLink className="h-3 w-3" />
                </a>
                <div className="text-gray-600">
                  <span className="font-medium">{t('adminAssessments.detailCountry')}</span> {selected.country}
                </div>
                {selected.date_of_birth && (
                  <div className="text-gray-600">
                    <span className="font-medium">{t('adminAssessments.detailDob')}</span> {selected.date_of_birth} (
                    {calculateAge(selected.date_of_birth)}y)
                  </div>
                )}
                <div className="text-gray-600">
                  <span className="font-medium">{t('adminAssessments.detailEducation')}</span> {selected.current_education || '—'}
                </div>
                {selected.intended_major && (
                  <div className="text-gray-600">
                    <span className="font-medium">{t('adminAssessments.detailMajor')}</span> {selected.intended_major}
                  </div>
                )}
                {selected.target_universities && (
                  <div className="text-gray-600">
                    <span className="font-medium">{t('adminAssessments.detailTargets')}</span>{' '}
                    {selected.target_universities}
                  </div>
                )}
              </div>

              {selected.has_transcript && (
                <div className="border-b pb-4">
                  <p className="text-sm text-gray-600 font-medium mb-2">{t('adminAssessments.transcriptTitle')}</p>
                  <div className="bg-gray-50 border border-gray-200 p-3 text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#1B2A4A]" />
                    <span className="font-mono text-xs truncate flex-1">{selected.transcript_file_name}</span>
                    <span className="text-xs text-gray-500">
                      ({formatBytes(selected.transcript_file_size)})
                    </span>
                  </div>
                  {selected.transcript_storage_path ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 w-full"
                      disabled={downloadingId === selected.id}
                      onClick={() => downloadTranscript(selected.id)}
                    >
                      {downloadingId === selected.id ? (
                        <Spinner size="xs" />
                      ) : (
                        <Download className="h-3 w-3" />
                      )}
                      <span className="ml-1">{t('adminAssessments.downloadFile')}</span>
                    </Button>
                  ) : (
                    <p className="text-xs text-gray-500 mt-2">
                      {t('adminAssessments.noFileWarning')}
                    </p>
                  )}
                </div>
              )}

              {selected.notes && (
                <div className="border-b pb-4">
                  <p className="text-sm text-gray-600 font-medium mb-2">{t('adminAssessments.notesTitle')}</p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{selected.notes}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">{t('adminAssessments.statusTitle')}</p>
                <div className="flex flex-wrap gap-2">
                  {(['New', 'Reviewing', 'Completed', 'Rejected'] as const).map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={selected.status === s ? 'default' : 'outline'}
                      disabled={updatingId === selected.id}
                      onClick={() => updateStatus(selected.id, s)}
                      className={
                        selected.status === s
                          ? s === 'Completed'
                            ? 'bg-green-600 hover:bg-green-700'
                            : s === 'Rejected'
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-[#1B2A4A] hover:bg-[#152033]'
                          : ''
                      }
                    >
                      {updatingId === selected.id ? (
                        <Spinner size="xs" />
                      ) : selected.status === s ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : null}
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {total > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            {t('adminAssessments.pagination', {
              from: offset + 1,
              to: Math.min(offset + PAGE_SIZE, total),
              total,
            })}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t('adminAssessments.prev')}
            </Button>
            <span className="text-xs text-gray-500 px-2">
              {t('adminAssessments.pageXofY', { page, totalPages })}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              {t('adminAssessments.next')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

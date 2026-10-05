'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Filter, Mail, MessageCircle, Globe, Megaphone, AlertCircle, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiFetchJson, ApiError } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';

interface WebinarSignup {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  country: string | null;
  programInterests: string[];
  notes: string | null;
  sourcePage: string | null;
  utmSource: string | null;
  utmCampaign: string | null;
  status: 'Registered' | 'Attended' | 'No-Show' | 'Cancelled';
  createdAt: string;
}

interface WebinarResponse {
  signups: WebinarSignup[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const PAGE_SIZE = 50;

// Status colors are untranslated (DB enum round-trip contract).
const STATUS_COLOR: Record<string, string> = {
  Registered: 'bg-blue-100 text-blue-800',
  Attended: 'bg-green-100 text-green-800',
  'No-Show': 'bg-red-100 text-red-800',
  Cancelled: 'bg-gray-100 text-gray-700',
};

// Interest-key suffix → display label i18n key. The API
// returns the DB enum values; we translate on the client so
// the badge never shows a raw DB string to the admin.
const INTEREST_KEYS: Record<string, string> = {
  chinese_language: 'webinar.interests.chineseLanguage',
  foundation: 'webinar.interests.foundation',
  bachelor: 'webinar.interests.bachelor',
  master: 'webinar.interests.master',
  csc: 'webinar.interests.csc',
};

const INTEREST_COLOR: Record<string, string> = {
  chinese_language: 'bg-[#D4A853]/20 text-[#1B2A4A] border-[#D4A853]/50',
  foundation: 'bg-[#1B2A4A]/10 text-[#1B2A4A] border-[#1B2A4A]/30',
  bachelor: 'bg-[#9B1B30]/10 text-[#9B1B30] border-[#9B1B30]/40',
  master: 'bg-[#9B1B30]/10 text-[#9B1B30] border-[#9B1B30]/40',
  csc: 'bg-emerald-100 text-emerald-800 border-emerald-300',
};

function formatDate(iso: string): string {
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

function formatWhatsappNumber(raw: string): string {
  // Strip everything except digits and the leading +
  return raw.replace(/[^\d+]/g, '');
}

export default function WebinarSignupsPage() {
  const { t } = useI18n();
  const [signups, setSignups] = useState<WebinarSignup[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const offset = (page - 1) * PAGE_SIZE;

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      params.set('page', String(page));
      params.set('limit', String(PAGE_SIZE));
      const res = await apiFetchJson<WebinarResponse>(
        `/api/admin/webinar-signups?${params}`,
      );
      setSignups(res.signups || []);
      setTotal(res.total ?? 0);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : t('adminWebinars.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery, page, t]);

  useEffect(() => {
    // Reset to page 1 whenever filters change — different
    // totals mean the current offset may be past the new
    // last page.
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchQuery, page]);

  // Client-side search filter — the API also filters, but
  // doing it client-side too keeps the input responsive when
  // typing fast.
  const visible = useMemo(() => {
    if (!searchQuery) return signups;
    const q = searchQuery.toLowerCase();
    return signups.filter(
      (s) =>
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.whatsapp.toLowerCase().includes(q) ||
        (s.country?.toLowerCase().includes(q) ?? false),
    );
  }, [signups, searchQuery]);

  const subtitle = (() => {
    if (total === 0) return t('adminWebinars.subtitle');
    return t('adminWebinars.pagination', {
      from: offset + 1,
      to: Math.min(offset + signups.length, total),
      total,
    });
  })();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937] flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-[#1B2A4A]" />
            {t('adminWebinars.title')}
          </h1>
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        </div>
        <Badge className="bg-[#1B2A4A] text-white">
          {t('adminWebinars.colSource')}:{' '}
          <code className="ml-1 text-xs">/webinar-2027-intake-csc</code>
        </Badge>
      </div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      <Card>
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={t('adminWebinars.searchPlaceholder')}
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
                    <SelectValue placeholder={t('adminWebinars.statusAll')} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('adminWebinars.statusAll')}</SelectItem>
                  <SelectItem value="Registered">{t('adminWebinars.status_Registered')}</SelectItem>
                  <SelectItem value="Attended">{t('adminWebinars.status_Attended')}</SelectItem>
                  <SelectItem value="No-Show">{t('adminWebinars.status_NoShow')}</SelectItem>
                  <SelectItem value="Cancelled">{t('adminWebinars.status_Cancelled')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="md" className="text-[#1B2A4A]" />
          </div>
        ) : visible.length === 0 ? (
          <div className="bg-white border border-gray-200 px-4 py-12 text-center text-gray-500">
            {total === 0 ? t('adminWebinars.emptyAll') : t('adminWebinars.emptyFiltered')}
          </div>
        ) : (
          visible.map((s) => (
            <div
              key={s.id}
              className="bg-white border border-gray-200 p-4 hover:border-[#9B1B30]/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 h-10 w-10 bg-[#9B1B30]/10 flex items-center justify-center">
                  <span className="text-[#9B1B30] font-semibold text-sm">
                    {s.firstName?.[0]}
                    {s.lastName?.[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-[#1B2A4A]">
                      {s.firstName} {s.lastName}
                    </h3>
                    <Badge className={STATUS_COLOR[s.status]}>{s.status}</Badge>
                    {s.country && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Globe className="h-3 w-3" /> {s.country}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 flex items-center gap-3 flex-wrap">
                    <a
                      href={`mailto:${s.email}`}
                      className="flex items-center gap-1 text-[#1B2A4A] hover:underline"
                    >
                      <Mail className="h-3 w-3" />
                      {s.email}
                    </a>
                    <a
                      href={`https://wa.me/${formatWhatsappNumber(s.whatsapp)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[#1B2A4A] hover:underline"
                    >
                      <MessageCircle className="h-3 w-3" />
                      {s.whatsapp}
                    </a>
                  </div>
                  {s.programInterests.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-gray-500">
                        {t('adminWebinars.interestsLabel')}:
                      </span>
                      {s.programInterests.map((interest) => (
                        <span
                          key={interest}
                          className={`inline-block text-[11px] font-semibold px-2 py-0.5 border ${INTEREST_COLOR[interest] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}
                        >
                          {t(INTEREST_KEYS[interest] ?? 'webinar.interests.csc')}
                        </span>
                      ))}
                    </div>
                  )}
                  {s.notes && (
                    <div className="mt-2 flex items-start gap-2 text-sm text-gray-700 bg-[#FAF6E8] border border-[#D4A853]/30 p-2">
                      <FileText className="h-3.5 w-3.5 text-[#1B2A4A] flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{s.notes}</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {formatDate(s.createdAt)}
                    {s.utmSource && (
                      <span className="ml-2 text-gray-500">
                        · {s.utmSource}
                        {s.utmCampaign ? `/${s.utmCampaign}` : ''}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            {t('adminWebinars.pagination', {
              from: offset + 1,
              to: Math.min(offset + PAGE_SIZE, total),
              total,
            })}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 bg-white text-[#1B2A4A] text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t('adminWebinars.prev')}
            </button>
            <span className="text-xs text-gray-500 px-2">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 bg-white text-[#1B2A4A] text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t('adminWebinars.next')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

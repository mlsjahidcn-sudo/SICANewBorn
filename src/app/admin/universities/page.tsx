'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Pencil, Trash2, ExternalLink, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { universities as staticUniversities, type University } from '@/lib/data';
import { ToastProvider, useToast } from '@/components/admin/toast';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { AIGenerateModal } from '@/components/admin/ai-generate-modal';
import { AIBulkGenerateModal } from '@/components/admin/ai-bulk-generate-modal';
import { useI18n } from '@/lib/i18n';

// Phase 55: page size for the admin table. 25 keeps the table
// scannable on a 1080p screen without scrolling for the first
// page; the API caps at 100 per call. Partners/students use 20
// (smaller dataset, more pages); admin users want to see more
// rows per page because they're triaging, not browsing.
const PAGE_SIZE = 25;

interface UniversitiesResponse {
  universities: University[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function UniversitiesPageInner() {
  const { user } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  const { t } = useI18n();
  const [universities, setUniversities] = useState<University[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<University | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [aiMode, setAiMode] = useState<'create' | 'regenerate'>('create');
  const [aiInitialName, setAiInitialName] = useState('');

  // Single refetch path used by both the single-row AI modal and
  // the bulk modal. Resets to page 1 (since new rows shift the
  // existing set) — same pattern the partner documents list uses
  // after mutations.
  const refreshUniversities = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      params.set('page', '1');
      params.set('limit', String(PAGE_SIZE));
      const res = await fetch(`/api/universities?${params.toString()}`);
      const data: UniversitiesResponse | null = res.ok ? await res.json() : null;
      if (data?.universities) {
        setUniversities(data.universities);
        setTotal(data.total);
        setPage(data.page);
        setHasMore(data.universities.length < (data.total || 0));
      } else {
        // Fallback to static data when API fails
        setUniversities(staticUniversities);
        setTotal(staticUniversities.length);
        setPage(1);
        setHasMore(false);
      }
    } catch {
      setUniversities(staticUniversities);
      setTotal(staticUniversities.length);
      setPage(1);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch]);

  // Phase 55: 300ms debounce on the search box. Same UX as the
  // public /universities page (Phase 19 S19) — typing a full
  // name doesn't fire 8 separate fetches, but the result lands
  // fast enough that the user doesn't notice the delay.
  useEffect(() => {
    const tm = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(tm);
  }, [search]);

  // Initial + search-driven fetch
  useEffect(() => {
    void refreshUniversities();
  }, [refreshUniversities]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      params.set('page', String(page + 1));
      params.set('limit', String(PAGE_SIZE));
      const res = await fetch(`/api/universities?${params.toString()}`);
      const data: UniversitiesResponse | null = res.ok ? await res.json() : null;
      if (data?.universities) {
        setUniversities((prev) => [...prev, ...data.universities]);
        setPage(data.page);
        setHasMore((universities.length + data.universities.length) < (data.total || 0));
      }
    } catch {
      addToast(t('adminUniversities.toastDeleteFailed'), 'error');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, debouncedSearch, page, universities.length, addToast, t]);

  const handleDelete = useCallback(async (uni: University) => {
    try {
      const res = await fetch(`/api/universities/${uni.slug}`, { method: 'DELETE' });
      if (res.ok) {
        // Remove the row locally instead of re-fetching the full
        // page (the API is paginated; the deleted row is the last
        // one we want to disappear visually).
        setUniversities((prev) => prev.filter((u) => u.slug !== uni.slug));
        setTotal((prev) => Math.max(0, prev - 1));
        addToast(t('adminUniversities.toastDeleted'), 'success');
      } else {
        addToast(t('adminUniversities.toastDeleteFailed'), 'error');
      }
    } catch {
      addToast(t('adminUniversities.toastDeleteFailed'), 'error');
    }
    setDeleteTarget(null);
  }, [addToast, t]);

  const openAIModalCreate = () => {
    setAiMode('create');
    setAiInitialName('');
    setShowAIModal(true);
  };

  const openAIModalRegenerate = (uni: University) => {
    setAiMode('regenerate');
    setAiInitialName(uni.name);
    setShowAIModal(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">{t('adminUniversities.title')}</h1>
          <p className="text-[#4B5563] text-sm mt-1">{t('adminUniversities.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBulkModal(true)}
            className="inline-flex items-center gap-2 border-2 border-[#1B2A4A] text-[#1B2A4A] px-4 py-2 text-sm font-semibold hover:bg-[#1B2A4A] hover:text-white transition-colors"
            title={t('adminUniversities.bulkGenerateTitle')}
          >
            <Sparkles className="w-4 h-4" />
            {t('adminUniversities.bulkGenerate')}
          </button>
          <button
            onClick={openAIModalCreate}
            className="inline-flex items-center gap-2 border-2 border-[#9B1B30] text-[#9B1B30] px-4 py-2 text-sm font-semibold hover:bg-[#9B1B30] hover:text-white transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            {t('adminUniversities.aiGenerate')}
          </button>
          <Link
            href="/admin/universities/new"
            className="inline-flex items-center gap-2 bg-[#9B1B30] text-white px-4 py-2 text-sm font-semibold hover:bg-[#7A1526] transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('adminUniversities.addUniversity')}
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 mb-4">
        <div className="p-4">
          <input
            type="text"
            placeholder={t('adminUniversities.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F3F4F6] border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A]">{t('adminUniversities.colUniversity')}</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A]">{t('adminUniversities.colCity')}</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A]">{t('adminUniversities.colChinaRank')}</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A]">{t('adminUniversities.colQsWorld')}</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A]">{t('adminUniversities.colTags')}</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A]">{t('adminUniversities.colRating')}</th>
                <th className="text-right px-4 py-3 font-semibold text-[#1B2A4A]">{t('adminUniversities.colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {universities.map((uni) => (
                <tr key={uni.slug} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {uni.logo && (
                        <div className="w-8 h-8 bg-[#F3F4F6] flex items-center justify-center flex-shrink-0">
                          <img src={uni.logo} alt="" className="w-6 h-6 object-contain" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-[#1F2937]">{uni.name}</div>
                        <div className="text-xs text-[#4B5563]">{uni.nameCn}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#4B5563]">{uni.city}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center bg-[#9B1B30] text-white text-xs font-bold w-7 h-7">
                      {uni.ranking}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-[#1B2A4A]">#{uni.qsWorldRanking}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {uni.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-semibold px-1.5 py-0.5 border border-[#1B2A4A]/20 bg-[#1B2A4A]/5 text-[#1B2A4A]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#4B5563]">
                    <span className="text-[#D4A853]">&#9733;</span> {uni.rating}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={`/universities/${uni.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-[#1B2A4A] hover:bg-gray-100 transition-colors"
                        title={t('adminUniversities.viewOnSite')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => openAIModalRegenerate(uni)}
                        className="p-1.5 text-[#9B1B30] hover:bg-[#9B1B30]/10 transition-colors"
                        title={t('adminUniversities.regenerateAi')}
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/admin/universities/${uni.slug}/edit`}
                        className="p-1.5 text-[#1B2A4A] hover:bg-gray-100 transition-colors"
                        title={t('adminUniversities.edit')}
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(uni)}
                        className="p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                        title={t('adminUniversities.delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {universities.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#4B5563]">
                    {t('adminUniversities.emptyRow')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Phase 55: footer now drives the pagination. Three
            states: (a) loading initial, (b) more available
            (Load more button), (c) end of list (small caption). */}
        <div className="px-4 py-3 border-t border-gray-200 bg-[#F3F4F6] flex items-center justify-between text-xs text-[#4B5563]">
          <span>{t('adminUniversities.loadMoreCount', { shown: universities.length, total })}</span>
          <div className="flex items-center gap-3">
            {isLoading && (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {t('adminUniversities.loadMoreBusy')}
              </span>
            )}
            {!isLoading && hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-1.5 border border-[#1B2A4A] text-[#1B2A4A] px-3 py-1 hover:bg-[#1B2A4A] hover:text-white transition-colors disabled:opacity-50"
              >
                {loadingMore && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {t('adminUniversities.loadMore')}
              </button>
            )}
            {!isLoading && !hasMore && total > 0 && (
              <span className="text-[#4B5563]/60">{t('adminUniversities.loadMoreEnd')}</span>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title={t('adminUniversities.deleteConfirmTitle')}
        message={t('adminUniversities.deleteConfirmMessage', { name: deleteTarget?.name ?? '' })}
        confirmText={t('adminUniversities.delete')}
      />

      <AIGenerateModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        mode={aiMode}
        initialName={aiInitialName}
        onGenerated={async (data, mode) => {
          try {
            // In 'regenerate' mode we PUT to the existing slug. Use
            // the slug from the AI's output (which should match the
            // existing one for the same name) — fall back to the
            // pre-filled initial name's slug if the AI omitted one.
            const targetSlug = (data.slug as string) || '';
            const endpoint =
              mode === 'regenerate' && targetSlug
                ? `/api/universities/${targetSlug}`
                : '/api/universities';
            const method = mode === 'regenerate' ? 'PUT' : 'POST';

            const res = await fetch(endpoint, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
            if (res.ok) {
              addToast(
                mode === 'regenerate'
                  ? t('adminUniversities.toastUpdatedViaAi')
                  : t('adminUniversities.toastCreatedViaAi'),
                'success',
              );
              await refreshUniversities();
            } else {
              const err = await res.json().catch(() => ({ error: 'Failed' }));
              addToast(err.error || t('adminUniversities.toastFailedAi', { mode }), 'error');
            }
          } catch {
            addToast(t('adminUniversities.toastFailedAi', { mode }), 'error');
          }
        }}
      />

      <AIBulkGenerateModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSaved={(count) => {
          // Pluralization: count==1 vs >1 — both keys share the
          // same string for English (no plural form) but Chinese
          // has no plural distinction at all. Either way the
          // interpolation works.
          addToast(
            count === 1
              ? t('adminUniversities.toastBulkSaved_one', { count })
              : t('adminUniversities.toastBulkSaved_other', { count }),
            'success',
          );
          refreshUniversities();
        }}
      />
    </div>
  );
}

export default function UniversitiesPage() {
  return (
    <ToastProvider>
      <UniversitiesPageInner />
    </ToastProvider>
  );
}

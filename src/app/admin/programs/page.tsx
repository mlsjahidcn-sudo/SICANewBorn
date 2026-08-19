'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, ExternalLink, Upload, Loader2 } from 'lucide-react';
import { programs as staticPrograms, universities as staticUniversities, type Program } from '@/lib/data';
import { ToastProvider, useToast } from '@/components/admin/toast';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { useI18n } from '@/lib/i18n';
import { apiFetch } from '@/lib/api-client';

// Phase 56: page size for the admin programs table. 25 keeps
// the table scannable, matches the universities page (admin is
// triaging, not browsing). The API supports up to ~500 rows per
// call — we fetch the whole merged set once (DB + static) and
// paginate client-side because the merge happens here, not on
// the server (the API only knows the DB side).
const PAGE_SIZE = 25;

/**
 * Merge DB-fetched programs with the static fallback by slug.
 * DB rows win on conflict (richer data, fresher edits). Static
 * rows that have no DB counterpart are kept so pre-seeded entries
 * still appear in dev / pre-migration state. Result is sorted by
 * name for stable display.
 */
function mergeBySlug(primary: Program[], secondary: Program[]): Program[] {
  const bySlug = new Map<string, Program>();
  for (const p of secondary) bySlug.set(p.slug, p);
  for (const p of primary) bySlug.set(p.slug, p);
  return Array.from(bySlug.values()).sort((a, b) =>
    a.name.localeCompare(b.name, 'en'),
  );
}

function ProgramsPageInner() {
  const { t } = useI18n();
  const { addToast } = useToast();
  // Start with static data so the table renders immediately. On mount
  // we replace this with the merged static+DB list so admin sees
  // everything that exists in either source.
  const [programs, setPrograms] = useState<Program[]>(staticPrograms);
  const [loading, setLoading] = useState(true);
  // Phase 56: pagination state. We track how many of the
  // filtered+merged list we've actually rendered. Load more
  // bumps this by PAGE_SIZE. Unlike universities, this is
  // client-side because the API only paginates the DB side and
  // we need the merge with the static fallback to be the source
  // of truth.
  const [shown, setShown] = useState(PAGE_SIZE);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterDegree, setFilterDegree] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Program | null>(null);

  // Fetch live programs from the API and merge with the static
  // fallback by slug. DB wins on conflict (richer data, fresher
  // edits). Static rows that have no DB counterpart are kept so
  // pre-seeded entries still appear in dev / pre-migration state.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Phase 56: cap bumped from 200 → 500 so the page can
        // render the entire merged set (151 DB + ~32 static in
        // dev, but production will be higher). 500 is a
        // pragmatic ceiling — the API caps at 100 per call by
        // default but accepts up to 500. Anything past that
        // would need a server-side search endpoint, not in scope.
        const res = await fetch('/api/programs?limit=500');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const dbPrograms: Program[] = data.programs || [];
        if (cancelled) return;
        const merged = mergeBySlug(dbPrograms, staticPrograms);
        setPrograms(merged);
      } catch {
        // Keep the static list on error. Admin still sees the
        // pre-seeded set; the only loss is admin-imported programs
        // added since the page last loaded. Surface a hint toast
        // so the user knows to retry.
        if (!cancelled) {
          addToast(t('adminPrograms.fallbackError'), 'error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [addToast, t]);

  // 300ms debounce on the search box — matches the universities
  // + partner list pattern (Phase 19 S19). The filter is
  // client-side on the merged list, so no extra round trip.
  useEffect(() => {
    const tm = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(tm);
  }, [search]);

  // Filter the merged set. Memoized so the filtered list is
  // stable across re-renders that don't change inputs. Reset
  // shown-count to PAGE_SIZE on filter/search change so the
  // user lands on the first page of the new view.
  const filtered = useMemo(() => {
    const s = debouncedSearch.toLowerCase();
    return programs.filter((p) => {
      const matchSearch =
        !s ||
        p.name.toLowerCase().includes(s) ||
        p.nameCn.includes(s) ||
        p.universitySlug.toLowerCase().includes(s);
      const matchDegree = !filterDegree || p.degree === filterDegree;
      return matchSearch && matchDegree;
    });
  }, [programs, debouncedSearch, filterDegree]);

  // Reset shown-count when the filtered list changes. We track
  // this via a useEffect on the filtered identity so the reset
  // happens once per filter change, not on every render.
  useEffect(() => {
    setShown(PAGE_SIZE);
  }, [debouncedSearch, filterDegree]);

  const visible = useMemo(() => filtered.slice(0, shown), [filtered, shown]);
  const hasMore = shown < filtered.length;

  const getUniName = (slug: string) => {
    const uni = staticUniversities.find((u) => u.slug === slug);
    return uni ? uni.name : slug;
  };

  const handleDelete = useCallback(
    async (prog: Program) => {
      try {
        const res = await apiFetch(`/api/programs/${prog.slug}`, { method: 'DELETE' });
        if (res.ok) {
          // Local remove: the DB still serves the merged list as
          // the source of truth, but we patch the in-memory copy
          // to match. The next mount will re-fetch.
          setPrograms((prev) => prev.filter((p) => p.slug !== prog.slug));
          addToast(t('adminPrograms.toastDeleted'), 'success');
        } else {
          addToast(t('adminPrograms.toastDeleteFailed'), 'error');
        }
      } catch {
        addToast(t('adminPrograms.toastDeleteFailed'), 'error');
      }
      setDeleteTarget(null);
    },
    [addToast, t],
  );

  const loadMore = useCallback(() => {
    if (!hasMore) return;
    setShown((prev) => prev + PAGE_SIZE);
  }, [hasMore]);

  // Degree enum values stay untranslated (DB round-trip).
  const degreeColor: Record<string, string> = {
    Bachelor: 'bg-blue-100 text-blue-800',
    Master: 'bg-purple-100 text-purple-800',
    PhD: 'bg-green-100 text-green-800',
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">{t('adminPrograms.title')}</h1>
          <p className="text-[#4B5563] text-sm mt-1">{t('adminPrograms.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/programs/new"
            className="inline-flex items-center gap-2 bg-[#9B1B30] text-white px-4 py-2 text-sm font-semibold hover:bg-[#7A1526] transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('adminPrograms.add')}
          </Link>
          <Link
            href="/admin/programs/bulk"
            className="inline-flex items-center gap-2 border border-[#9B1B30] text-[#9B1B30] px-4 py-2 text-sm font-semibold hover:bg-[#9B1B30] hover:text-white transition-colors"
          >
            <Upload className="w-4 h-4" />
            {t('adminPrograms.bulkImport')}
          </Link>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="bg-white border border-gray-200 mb-4">
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder={t('adminPrograms.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
          />
          <select
            value={filterDegree}
            onChange={(e) => setFilterDegree(e.target.value)}
            className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
          >
            <option value="">{t('adminPrograms.filterAllDegrees')}</option>
            <option value="Bachelor">Bachelor</option>
            <option value="Master">Master</option>
            <option value="PhD">PhD</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F3F4F6] border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A]">{t('adminPrograms.colProgram')}</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A]">{t('adminPrograms.colUniversity')}</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A]">{t('adminPrograms.colDegree')}</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A]">{t('adminPrograms.colLanguage')}</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A]">{t('adminPrograms.colDuration')}</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A]">{t('adminPrograms.colTuition')}</th>
                <th className="text-right px-4 py-3 font-semibold text-[#1B2A4A]">{t('adminPrograms.colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((prog) => (
                <tr key={prog.slug} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-[#1F2937]">{prog.name}</div>
                      <div className="text-xs text-[#4B5563]">{prog.nameCn}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#4B5563]">{getUniName(prog.universitySlug)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium ${degreeColor[prog.degree] || 'bg-gray-100 text-gray-800'}`}>
                      {prog.degree}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#4B5563]">{prog.language}</td>
                  <td className="px-4 py-3 text-[#4B5563]">{prog.duration}</td>
                  <td className="px-4 py-3 text-[#4B5563]">{prog.tuition}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={`/programs/${prog.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-[#1B2A4A] hover:bg-gray-100 transition-colors"
                        title={t('adminPrograms.viewOnSite')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <Link
                        href={`/admin/programs/${prog.slug}/edit`}
                        className="p-1.5 text-[#1B2A4A] hover:bg-gray-100 transition-colors"
                        title={t('adminPrograms.edit')}
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(prog)}
                        className="p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                        title={t('adminPrograms.delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#4B5563]">{t('adminPrograms.emptyNone')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Phase 56: pagination footer. Three states: (a) initial
            load in progress, (b) more available (Load more button),
            (c) end of list. The "Showing N of M" count reflects
            the filtered+merged list (not just the DB side) so
            the user sees the real number of items in their view. */}
        <div className="px-4 py-3 border-t border-gray-200 bg-[#F3F4F6] flex items-center justify-between text-xs text-[#4B5563]">
          <span>{t('adminPrograms.loadMoreCount', { shown: visible.length, total: filtered.length })}</span>
          <div className="flex items-center gap-3">
            {loading && (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {t('adminPrograms.syncingLatest')}
              </span>
            )}
            {!loading && hasMore && (
              <button
                onClick={loadMore}
                className="inline-flex items-center gap-1.5 border border-[#1B2A4A] text-[#1B2A4A] px-3 py-1 hover:bg-[#1B2A4A] hover:text-white transition-colors"
              >
                {t('adminPrograms.loadMore')}
              </button>
            )}
            {!loading && !hasMore && filtered.length > 0 && (
              <span className="text-[#4B5563]/60">{t('adminPrograms.loadMoreEnd')}</span>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title={t('adminPrograms.deleteDialogTitle')}
        message={t('adminPrograms.deleteDialogMessage', { name: deleteTarget?.name ?? '' })}
        confirmText={t('adminPrograms.deleteDialogConfirm')}
      />
    </div>
  );
}

export default function ProgramsPage() {
  return (
    <ToastProvider>
      <ProgramsPageInner />
    </ToastProvider>
  );
}

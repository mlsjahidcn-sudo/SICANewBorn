'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, ExternalLink, Upload, Loader2, Star, StarOff, Archive, ArchiveRestore, Eye, EyeOff } from 'lucide-react';
import { programs as staticPrograms, universities as staticUniversities, type Program } from '@/lib/data';
import { ToastProvider, useToast } from '@/components/admin/toast';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { useI18n } from '@/lib/i18n';
import { apiFetchJson, ApiError } from '@/lib/api-client';

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
  // Track 1.3 U4 #1: when the API refuses a delete (409 CASCADE_BLOCKED),
  // we surface the child counts here so the confirm dialog can warn
  // before the user re-confirms with ?force=true.
  const [cascadeCounts, setCascadeCounts] = useState<{
    partnerPromotions: number;
    partnerApplications: number;
  } | null>(null);
  // Phase 128a: archive-instead offer. Surfaced when the DELETE
  // 409 response includes `archiveInstead` (the admin can then pick
  // soft-delete over the destructive force-cascade path). Declared
  // up here so handleDelete / patchStatus / archiveProgram can read
  // the setter without a "variable accessed before declaration" lint
  // error.
  const [archiveOffer, setArchiveOffer] = useState<{
    method: string;
    url: string;
    body: { archived_at: string };
  } | null>(null);

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
        //
        // Phase 128a: pass `include_archived=true` so the admin
        // sees archived rows too — the public /api/programs
        // endpoint hides them by default. The merged list shows
        // every row, then a UI badge (added below) tells the
        // admin which ones are archived / unpublished.
        const res = await fetch('/api/programs?limit=500&include_archived=true');
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
  //
  // Phase 128a: extra "status" filter — defaults to "active"
  // (hides archived rows from the default view) but the admin
  // can flip to "archived" to see what they soft-deleted or
  // "all" to see every row including unpublished.
  const [filterStatus, setFilterStatus] = useState<'active' | 'archived' | 'all'>('active');
  const filtered = useMemo(() => {
    const s = debouncedSearch.toLowerCase();
    return programs.filter((p) => {
      const matchSearch =
        !s ||
        p.name.toLowerCase().includes(s) ||
        p.nameCn.includes(s) ||
        p.universitySlug.toLowerCase().includes(s);
      const matchDegree = !filterDegree || p.degree === filterDegree;
      const isArchived = !!p.archivedAt;
      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'archived' ? isArchived : !isArchived);
      return matchSearch && matchDegree && matchStatus;
    });
  }, [programs, debouncedSearch, filterDegree, filterStatus]);

  // Reset shown-count when the filtered list changes. We track
  // this via a useEffect on the filtered identity so the reset
  // happens once per filter change, not on every render.
  useEffect(() => {
    setShown(PAGE_SIZE);
  }, [debouncedSearch, filterDegree, filterStatus]);

  const visible = useMemo(() => filtered.slice(0, shown), [filtered, shown]);
  const hasMore = shown < filtered.length;

  const getUniName = (slug: string) => {
    const uni = staticUniversities.find((u) => u.slug === slug);
    return uni ? uni.name : slug;
  };

  const handleDelete = useCallback(
    async (prog: Program, force = false) => {
      try {
        const url = force
          ? `/api/programs/${prog.slug}?force=true`
          : `/api/programs/${prog.slug}`;
        await apiFetchJson<{
          success: true;
          counts: { partnerPromotions: number; partnerApplications: number };
          deleted: boolean;
        }>(url, { method: 'DELETE' });
        setPrograms((prev) => prev.filter((p) => p.slug !== prog.slug));
        setCascadeCounts(null);
        addToast(t('adminPrograms.toastDeleted'), 'success');
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          const body = err.body as {
            code?: string;
            counts?: { partnerPromotions: number; partnerApplications: number };
            archiveInstead?: { method: string; url: string; body: { archived_at: string } };
          } | null;
          if (body && body.code === 'CASCADE_BLOCKED' && body.counts) {
            setCascadeCounts(body.counts);
            // Phase 128a: surface the archive-instead offer so the
            // admin can choose soft-delete (preserves the FK graph
            // and is reversible) over a destructive force-cascade.
            // Clone the nested object so React's immutability
            // checker doesn't flag a shared reference (the error
            // body is shared across hook renders otherwise).
            if (body.archiveInstead) {
              setArchiveOffer({
                method: body.archiveInstead.method,
                url: body.archiveInstead.url,
                body: { archived_at: body.archiveInstead.body.archived_at },
              });
            }
            return;
          }
        }
        addToast(t('adminPrograms.toastDeleteFailed'), 'error');
      }
      setDeleteTarget(null);
      setCascadeCounts(null);
    },
    [addToast, t],
  );

  // Phase 128a: per-row status toggles + archive/restore.
  // The list is loaded with `include_archived=true` so archived rows
  // render (with a status badge) instead of vanishing on next
  // refresh. All three operations hit the new PATCH /api/programs/[slug]
  // route and only update the affected row in local state — no full
  // refetch, no flash.
  // archiveOffer state is declared at the top of the component
  // (alongside deleteTarget/cascadeCounts) so handleDelete can read
  // its setter without a "variable accessed before declaration"
  // lint error.

  const patchStatus = useCallback(
    async (prog: Program, patch: Partial<Pick<Program, 'isFeatured' | 'isPublished' | 'featuredRank'>>) => {
      try {
        const res = await apiFetchJson<{ program: Program }>(
          `/api/programs/${prog.slug}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              is_featured: patch.isFeatured ?? prog.isFeatured ?? false,
              is_published: patch.isPublished ?? prog.isPublished ?? true,
              featured_rank: patch.featuredRank ?? prog.featuredRank ?? null,
            }),
          },
        );
        setPrograms((prev) =>
          prev.map((p) => (p.slug === prog.slug ? res.program : p)),
        );
        const changedFields = Object.keys(patch);
        addToast(
          t('adminPrograms.toastStatusUpdated', { fields: changedFields.join(', ') }),
          'success',
        );
      } catch {
        addToast(t('adminPrograms.toastStatusFailed'), 'error');
      }
    },
    [addToast, t],
  );

  const archiveProgram = useCallback(
    async (prog: Program) => {
      try {
        await apiFetchJson<{ program: Program }>(
          `/api/programs/${prog.slug}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'archive' }),
          },
        );
        setPrograms((prev) =>
          prev.map((p) =>
            p.slug === prog.slug ? { ...p, archivedAt: new Date().toISOString() } : p,
          ),
        );
        addToast(t('adminPrograms.toastArchived'), 'success');
      } catch {
        addToast(t('adminPrograms.toastArchiveFailed'), 'error');
      }
      setArchiveOffer(null);
      setDeleteTarget(null);
      setCascadeCounts(null);
    },
    // setArchiveOffer is a stable React setter; listing it here
    // keeps the React Compiler memoization happy (no behavior change).
    [addToast, t, setArchiveOffer],
  );

  const restoreProgram = useCallback(
    async (prog: Program) => {
      try {
        await apiFetchJson<{ program: Program }>(
          `/api/programs/${prog.slug}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'restore' }),
          },
        );
        setPrograms((prev) =>
          prev.map((p) =>
            p.slug === prog.slug ? { ...p, archivedAt: null } : p,
          ),
        );
        addToast(t('adminPrograms.toastRestored'), 'success');
      } catch {
        addToast(t('adminPrograms.toastRestoreFailed'), 'error');
      }
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
          {/* Phase 128a: status filter — Active (default, hides archived),
              Archived (only archived, for restoring), All (every row). */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'active' | 'archived' | 'all')}
            className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
            aria-label={t('adminPrograms.filterStatusLabel')}
          >
            <option value="active">{t('adminPrograms.filterActive')}</option>
            <option value="archived">{t('adminPrograms.filterArchived')}</option>
            <option value="all">{t('adminPrograms.filterAllStatus')}</option>
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
                <tr
                  key={prog.slug}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    prog.archivedAt ? 'opacity-60' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-[#1F2937]">{prog.name}</div>
                        <div className="text-xs text-[#4B5563]">{prog.nameCn}</div>
                      </div>
                      {/* Phase 128a: status badges stacked next to the
                          name so the admin can tell at a glance which
                          rows are featured / archived / unpublished.
                          Archived row is dimmed at the <tr> level above. */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {prog.isFeatured && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#D4A853]/15 text-[#8B6F35]">
                            <Star className="h-3 w-3" />
                            {t('adminPrograms.featuredBadge')}
                          </span>
                        )}
                        {prog.archivedAt ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-700">
                            <Archive className="h-3 w-3" />
                            {t('adminPrograms.archivedBadge')}
                          </span>
                        ) : prog.isPublished === false ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                            <EyeOff className="h-3 w-3" />
                            {t('adminPrograms.unpublishedBadge')}
                          </span>
                        ) : null}
                      </div>
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
                      {/* Phase 128a: per-row status switches. Featured
                          toggles is_featured; the eye icon toggles
                          is_published (without unpublishing, the row
                          stays hidden from /programs but the data is
                          preserved). The archive button is the
                          soft-delete path; once archived, the same
                          slot becomes a "Restore" button. */}
                      <button
                        onClick={() => patchStatus(prog, { isFeatured: !prog.isFeatured })}
                        className={`p-1.5 hover:bg-gray-100 transition-colors ${
                          prog.isFeatured ? 'text-[#D4A853]' : 'text-gray-400'
                        }`}
                        title={prog.isFeatured ? t('adminPrograms.unfeature') : t('adminPrograms.feature')}
                      >
                        {prog.isFeatured ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                      </button>
                      {!prog.archivedAt && (
                        <button
                          onClick={() => patchStatus(prog, { isPublished: !(prog.isPublished ?? true) })}
                          className={`p-1.5 hover:bg-gray-100 transition-colors ${
                            prog.isPublished === false ? 'text-amber-600' : 'text-gray-400'
                          }`}
                          title={prog.isPublished === false ? t('adminPrograms.publish') : t('adminPrograms.unpublish')}
                        >
                          {prog.isPublished === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      )}
                      {prog.archivedAt ? (
                        <button
                          onClick={() => restoreProgram(prog)}
                          className="p-1.5 text-green-600 hover:bg-green-50 transition-colors"
                          title={t('adminPrograms.restore')}
                        >
                          <ArchiveRestore className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setDeleteTarget(prog)}
                          className="p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                          title={t('adminPrograms.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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
        onCancel={() => {
          setDeleteTarget(null);
          setCascadeCounts(null);
          setArchiveOffer(null);
        }}
        // Phase 128a: when the API surfaces the archive-instead
        // offer (CASCADE_BLOCKED + dependents), the dialog presents
        // two buttons: archive (soft-delete, preserves FK history,
        // reversible) + force-delete (the old destructive path).
        onConfirm={() => {
          if (!deleteTarget) return;
          if (archiveOffer) {
            void archiveProgram(deleteTarget);
            return;
          }
          if (cascadeCounts) {
            void handleDelete(deleteTarget, true);
            return;
          }
          void handleDelete(deleteTarget, false);
        }}
        title={
          archiveOffer
            ? t('adminPrograms.archiveOfferTitle', { name: deleteTarget?.name ?? '' })
            : cascadeCounts
            ? t('adminPrograms.cascadeDialogTitle', {
                name: deleteTarget?.name ?? '',
                promotions: cascadeCounts.partnerPromotions,
                applications: cascadeCounts.partnerApplications,
              })
            : t('adminPrograms.deleteDialogTitle')
        }
        message={
          archiveOffer
            ? t('adminPrograms.archiveOfferMessage', {
                promotions: cascadeCounts?.partnerPromotions ?? 0,
                applications: cascadeCounts?.partnerApplications ?? 0,
              })
            : cascadeCounts
            ? t('adminPrograms.cascadeDialogMessage', {
                promotions: cascadeCounts.partnerPromotions,
                applications: cascadeCounts.partnerApplications,
              })
            : t('adminPrograms.deleteDialogMessage', {
                name: deleteTarget?.name ?? '',
              })
        }
        confirmText={
          archiveOffer
            ? t('adminPrograms.archiveOfferConfirm')
            : cascadeCounts
            ? t('adminPrograms.cascadeDialogForce')
            : t('adminPrograms.deleteDialogConfirm')
        }
        variant={archiveOffer ? 'info' : cascadeCounts ? 'warning' : 'danger'}
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

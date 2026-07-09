'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { scholarships as staticScholarships, type Scholarship } from '@/lib/data';
import { apiFetch } from '@/lib/api-client';
import { ToastProvider, useToast } from '@/components/admin/toast';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { useI18n } from '@/lib/i18n';

function ScholarshipsPageInner() {
  const { t } = useI18n();
  const { addToast } = useToast();
  // Start with static data so the table renders immediately. On
  // mount we replace this with the merged static+DB list so admin
  // sees everything that exists in either source — same pattern as
  // /admin/programs.
  const [scholarships, setScholarships] = useState<Scholarship[]>(staticScholarships);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Scholarship | null>(null);

  // Fetch live scholarships from the API and merge with the
  // static fallback by slug. DB wins on conflict (richer data,
  // fresher edits). Static rows that have no DB counterpart are
  // kept so pre-seeded entries still appear in dev / pre-migration
  // state.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/scholarships?limit=200');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const dbScholarships: Scholarship[] = data.scholarships || [];
        if (cancelled) return;
        const merged = mergeBySlug(dbScholarships, staticScholarships);
        setScholarships(merged);
      } catch {
        if (!cancelled) {
          addToast(t('adminScholarships.fallbackError'), 'error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [addToast, t]);

  const filtered = scholarships.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.nameCn.includes(search);
    const matchType = !filterType || s.type === filterType;
    return matchSearch && matchType;
  });

  const handleDelete = useCallback(async (schol: Scholarship) => {
    try {
      const res = await apiFetch(`/api/scholarships/${schol.slug}`, { method: 'DELETE' });
      if (res.ok) {
        setScholarships(prev => prev.filter(s => s.slug !== schol.slug));
        addToast(t('adminScholarships.toastDeleted'), 'success');
      } else {
        addToast(t('adminScholarships.toastDeleteFailed'), 'error');
      }
    } catch {
      addToast(t('adminScholarships.toastDeleteFailed'), 'error');
    }
    setDeleteTarget(null);
  }, [addToast, t]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">{t('adminScholarships.title')}</h1>
          <p className="text-[#4B5563] text-sm mt-1">{t('adminScholarships.subtitle')}</p>
        </div>
        <Link
          href="/admin/scholarships/new"
          className="inline-flex items-center gap-2 bg-[#9B1B30] text-white px-4 py-2 text-sm font-semibold hover:bg-[#7A1526] transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('adminScholarships.add')}
        </Link>
      </div>

      <div className="bg-white border border-gray-200 mb-4">
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder={t('adminScholarships.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
          >
            <option value="">{t('adminScholarships.filterAllTypes')}</option>
            <option value="Full">Full</option>
            <option value="Partial">Partial</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F3F4F6] border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A]">{t('adminScholarships.colScholarship')}</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A]">{t('adminScholarships.colType')}</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A]">{t('adminScholarships.colDegreeLevels')}</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A]">{t('adminScholarships.colDeadline')}</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A]">{t('adminScholarships.colCoverage')}</th>
                <th className="text-right px-4 py-3 font-semibold text-[#1B2A4A]">{t('adminScholarships.colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((schol) => (
                <tr key={schol.slug} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-[#1F2937]">{schol.name}</div>
                      <div className="text-xs text-[#4B5563]">{schol.nameCn}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium ${schol.type === 'Full' ? 'bg-[#9B1B3015] text-[#9B1B30]' : 'bg-[#1B2A4A15] text-[#1B2A4A]'}`}>
                      {schol.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#4B5563] text-xs">
                    {schol.degreeLevels.slice(0, 3).join(', ')}{schol.degreeLevels.length > 3 ? '...' : ''}
                  </td>
                  <td className="px-4 py-3 text-[#4B5563]">{schol.deadline}</td>
                  <td className="px-4 py-3 text-[#4B5563] text-xs">
                    {schol.coverage.slice(0, 3).join(', ')}{schol.coverage.length > 3 ? '...' : ''}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={`/scholarships/${schol.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-[#1B2A4A] hover:bg-gray-100 transition-colors"
                        title={t('adminScholarships.viewOnSite')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <Link
                        href={`/admin/scholarships/${schol.slug}/edit`}
                        className="p-1.5 text-[#1B2A4A] hover:bg-gray-100 transition-colors"
                        title={t('adminScholarships.edit')}
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(schol)}
                        className="p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                        title={t('adminScholarships.delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#4B5563]">{t('adminScholarships.emptyNone')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-200 bg-[#F3F4F6] text-xs text-[#4B5563] flex items-center justify-between">
          <span>
            {t('adminScholarships.footerShowing', { shown: filtered.length, total: scholarships.length })}
          </span>
          {loading && (
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 border-2 border-[#1B2A4A] border-t-transparent rounded-full animate-spin" />
              {t('adminScholarships.syncingLatest')}
            </span>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title={t('adminScholarships.deleteDialogTitle')}
        message={t('adminScholarships.deleteDialogMessage', { name: deleteTarget?.name ?? '' })}
        confirmText={t('adminScholarships.deleteDialogConfirm')}
      />
    </div>
  );
}

export default function ScholarshipsPage() {
  return (
    <ToastProvider>
      <ScholarshipsPageInner />
    </ToastProvider>
  );
}

/**
 * Merge DB-fetched scholarships with the static fallback by slug.
 * DB rows win on conflict (richer data, fresher edits). Static
 * rows that have no DB counterpart are kept so pre-seeded entries
 * still appear in dev / pre-migration state. Result is sorted by
 * name for stable display.
 */
function mergeBySlug(
  primary: Scholarship[],
  secondary: Scholarship[],
): Scholarship[] {
  const bySlug = new Map<string, Scholarship>();
  for (const s of secondary) bySlug.set(s.slug, s);
  for (const s of primary) bySlug.set(s.slug, s);
  return Array.from(bySlug.values()).sort((a, b) =>
    a.name.localeCompare(b.name, 'en'),
  );
}

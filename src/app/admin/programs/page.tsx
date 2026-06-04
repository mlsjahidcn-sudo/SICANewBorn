'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Pencil, Trash2, ExternalLink, Upload } from 'lucide-react';
import { programs as staticPrograms, universities as staticUniversities, type Program } from '@/lib/data';
import { ToastProvider, useToast } from '@/components/admin/toast';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';

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
  const router = useRouter();
  const { addToast } = useToast();
  // Start with static data so the table renders immediately. On mount
  // we replace this with the merged static+DB list so admin sees
  // everything that exists in either source.
  const [programs, setPrograms] = useState<Program[]>(staticPrograms);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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
        const res = await fetch('/api/programs?limit=200');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const dbPrograms: Program[] = data.programs || [];
        if (cancelled) return;
        const merged = mergeBySlug(dbPrograms, staticPrograms);
        setPrograms(merged);
      } catch (err) {
        // Keep the static list on error. Admin still sees the
        // pre-seeded set; the only loss is admin-imported programs
        // added since the page last loaded. Surface a hint toast
        // so the user knows to retry.
        if (!cancelled) {
          addToast(
            'Could not reach /api/programs — showing local fallback. ' +
              'If you recently imported programs, refresh to retry.',
            'error',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [addToast]);

  const filtered = programs.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.nameCn.includes(search) ||
      p.universitySlug.toLowerCase().includes(search.toLowerCase());
    const matchDegree = !filterDegree || p.degree === filterDegree;
    return matchSearch && matchDegree;
  });

  const getUniName = (slug: string) => {
    const uni = staticUniversities.find(u => u.slug === slug);
    return uni ? uni.name : slug;
  };

  const handleDelete = useCallback(async (prog: Program) => {
    try {
      const res = await fetch(`/api/programs/${prog.slug}`, { method: 'DELETE' });
      if (res.ok) {
        setPrograms(prev => prev.filter(p => p.slug !== prog.slug));
        addToast('Program deleted successfully', 'success');
      } else {
        addToast('Failed to delete program', 'error');
      }
    } catch {
      addToast('Failed to delete program', 'error');
    }
    setDeleteTarget(null);
  }, [addToast]);

  const degreeColor: Record<string, string> = {
    Bachelor: 'bg-blue-100 text-blue-800',
    Master: 'bg-purple-100 text-purple-800',
    PhD: 'bg-green-100 text-green-800',
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Programs</h1>
          <p className="text-[#4B5563] text-sm mt-1">Manage degree programs across universities</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/programs/new"
            className="inline-flex items-center gap-2 bg-[#9B1B30] text-white px-4 py-2 text-sm font-semibold hover:bg-[#7A1526] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Program
          </Link>
          <Link
            href="/admin/programs/bulk"
            className="inline-flex items-center gap-2 border border-[#9B1B30] text-[#9B1B30] px-4 py-2 text-sm font-semibold hover:bg-[#9B1B30] hover:text-white transition-colors"
          >
            <Upload className="w-4 h-4" />
            Bulk Import
          </Link>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="bg-white border border-gray-200 mb-4">
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search programs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
          />
          <select
            value={filterDegree}
            onChange={(e) => setFilterDegree(e.target.value)}
            className="px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
          >
            <option value="">All Degrees</option>
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
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A]">Program</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A]">University</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A]">Degree</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A]">Language</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A]">Duration</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A]">Tuition</th>
                <th className="text-right px-4 py-3 font-semibold text-[#1B2A4A]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((prog) => (
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
                        title="View on site"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <Link
                        href={`/admin/programs/${prog.slug}/edit`}
                        className="p-1.5 text-[#1B2A4A] hover:bg-gray-100 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(prog)}
                        className="p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#4B5563]">No programs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-200 bg-[#F3F4F6] text-xs text-[#4B5563] flex items-center justify-between">
          <span>
            Showing {filtered.length} of {programs.length} programs
          </span>
          {loading && (
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 border-2 border-[#1B2A4A] border-t-transparent rounded-full animate-spin" />
              Syncing latest…
            </span>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Delete Program"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
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

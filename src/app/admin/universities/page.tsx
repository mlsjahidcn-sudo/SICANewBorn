'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Pencil, Trash2, ExternalLink, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { universities as staticUniversities, type University } from '@/lib/data';
import { ToastProvider, useToast } from '@/components/admin/toast';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { AIGenerateModal } from '@/components/admin/ai-generate-modal';
import { AIBulkGenerateModal } from '@/components/admin/ai-bulk-generate-modal';

function UniversitiesPageInner() {
  const { user } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  const [universities, setUniversities] = useState<University[]>([]);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<University | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [aiMode, setAiMode] = useState<'create' | 'regenerate'>('create');
  const [aiInitialName, setAiInitialName] = useState('');

  // Single refetch path used by both the single-row AI modal and
  // the bulk modal. Pulls a generous limit so admin-added rows
  // (not yet on the static fallback) show up.
  const refreshUniversities = useCallback(async () => {
    const fresh = await fetch('/api/universities?limit=100').then((r) => (r.ok ? r.json() : null));
    if (fresh?.universities) setUniversities(fresh.universities);
  }, []);

  useEffect(() => {
    fetch('/api/universities?limit=100')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.universities) setUniversities(data.universities);
        else setUniversities(staticUniversities);
      })
      .catch(() => setUniversities(staticUniversities));
  }, []);

  const filtered = universities.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.nameCn.includes(search) ||
    u.city.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = useCallback(async (uni: University) => {
    try {
      const res = await fetch(`/api/universities/${uni.slug}`, { method: 'DELETE' });
      if (res.ok) {
        setUniversities(prev => prev.filter(u => u.slug !== uni.slug));
        addToast('University deleted successfully', 'success');
      } else {
        addToast('Failed to delete university', 'error');
      }
    } catch {
      addToast('Failed to delete university', 'error');
    }
    setDeleteTarget(null);
  }, [addToast]);

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
          <h1 className="text-2xl font-bold text-[#1F2937]">Universities</h1>
          <p className="text-[#4B5563] text-sm mt-1">Manage university listings and information</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBulkModal(true)}
            className="inline-flex items-center gap-2 border-2 border-[#1B2A4A] text-[#1B2A4A] px-4 py-2 text-sm font-semibold hover:bg-[#1B2A4A] hover:text-white transition-colors"
            title="Generate 5 universities at once with AI"
          >
            <Sparkles className="w-4 h-4" />
            Bulk Generate (5)
          </button>
          <button
            onClick={openAIModalCreate}
            className="inline-flex items-center gap-2 border-2 border-[#9B1B30] text-[#9B1B30] px-4 py-2 text-sm font-semibold hover:bg-[#9B1B30] hover:text-white transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            AI Generate
          </button>
          <Link
            href="/admin/universities/new"
            className="inline-flex items-center gap-2 bg-[#9B1B30] text-white px-4 py-2 text-sm font-semibold hover:bg-[#7A1526] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add University
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 mb-4">
        <div className="p-4">
          <input
            type="text"
            placeholder="Search universities..."
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
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A]">University</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A]">City</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A]">China Rank</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A]">QS World</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A]">Tags</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1B2A4A]">Rating</th>
                <th className="text-right px-4 py-3 font-semibold text-[#1B2A4A]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((uni) => (
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
                        title="View on site"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => openAIModalRegenerate(uni)}
                        className="p-1.5 text-[#9B1B30] hover:bg-[#9B1B30]/10 transition-colors"
                        title="Re-generate with AI (overwrites AI fields, keeps manual edits)"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/admin/universities/${uni.slug}/edit`}
                        className="p-1.5 text-[#1B2A4A] hover:bg-gray-100 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(uni)}
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
                  <td colSpan={7} className="px-4 py-8 text-center text-[#4B5563]">
                    No universities found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-200 bg-[#F3F4F6] text-xs text-[#4B5563]">
          Showing {filtered.length} of {universities.length} universities
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Delete University"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
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
                  ? 'University updated via AI re-generation!'
                  : 'University created successfully via AI!',
                'success',
              );
              await refreshUniversities();
            } else {
              const err = await res.json().catch(() => ({ error: 'Failed' }));
              addToast(err.error || `Failed to ${mode} university`, 'error');
            }
          } catch {
            addToast(`Failed to ${mode} university`, 'error');
          }
        }}
      />

      <AIBulkGenerateModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSaved={(count) => {
          addToast(`${count} ${count === 1 ? 'university' : 'universities'} created via AI!`, 'success');
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

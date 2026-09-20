'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  Clock,
  RefreshCw,
  Pencil,
  Archive,
  ArchiveRestore,
  Search,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api-client';
import { ToastProvider, useToast } from '@/components/admin/toast';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';

/**
 * Shared sub-nav for the /admin/chatbot section (Phase 121).
 * Lives in the faqs page and is imported by the automation page —
 * same pattern as NewsSubNav.
 */
export function ChatbotSubNav({ active }: { active: 'faqs' | 'automation' }) {
  const tabs = [
    { key: 'faqs' as const, label: 'FAQs', href: '/admin/chatbot/faqs' },
    { key: 'automation' as const, label: 'Automation', href: '/admin/chatbot/automation' },
  ];
  return (
    <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
      {tabs.map((t) => (
        <a
          key={t.key}
          href={t.href}
          className={`inline-flex items-center gap-1.5 px-1 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            active === t.key
              ? 'border-[#9B1B30] text-[#9B1B30]'
              : 'border-transparent text-gray-500 hover:text-[#1B2A4A]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          {t.label}
        </a>
      ))}
    </div>
  );
}

interface FaqRow {
  id: string;
  question: string;
  answer: string;
  category: string;
  language: string;
  status: 'draft' | 'active' | 'retired';
  source: 'seed' | 'manual' | 'auto';
  queue_item_id: string | null;
  priority: number;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = ['general', 'application', 'visa', 'scholarship', 'life'] as const;
const LANGUAGES = ['en', 'zh'] as const;
const STATUS_FILTERS = [
  { key: '', label: 'All' },
  { key: 'draft', label: 'Drafts' },
  { key: 'active', label: 'Active' },
  { key: 'retired', label: 'Retired' },
] as const;

function FaqsInner() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  const [faqs, setFaqs] = useState<FaqRow[] | null>(null);
  const [fetching, setFetching] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [editTarget, setEditTarget] = useState<FaqRow | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FaqRow | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/admin/login');
  }, [user, loading, router]);

  const fetchFaqs = useCallback(async () => {
    setFetching(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());
      const res = await apiFetch(`/api/admin/chatbot/faqs?${params.toString()}`);
      if (res.ok) {
        const json = (await res.json()) as { faqs: FaqRow[] };
        setFaqs(json.faqs);
      } else {
        addToast('Failed to load FAQs', 'error');
      }
    } finally {
      setFetching(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search]);

  useEffect(() => {
    if (user) fetchFaqs();
  }, [user, fetchFaqs]);

  const handleApprove = async (faq: FaqRow) => {
    setApprovingId(faq.id);
    try {
      const res = await apiFetch(`/api/admin/chatbot/faqs/${faq.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      });
      if (res.ok) {
        addToast('FAQ approved — live in the chatbot', 'success');
        fetchFaqs();
      } else {
        const err = await res.json().catch(() => ({ error: 'Approve failed' }));
        addToast(err.error || 'Approve failed', 'error');
      }
    } finally {
      setApprovingId(null);
    }
  };

  const handleRetire = async (faq: FaqRow) => {
    const res = await apiFetch(`/api/admin/chatbot/faqs/${faq.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'retired' }),
    });
    if (res.ok) {
      addToast('FAQ retired — no longer served to the bot', 'success');
      fetchFaqs();
    } else {
      const err = await res.json().catch(() => ({ error: 'Retire failed' }));
      addToast(err.error || 'Retire failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await apiFetch(`/api/admin/chatbot/faqs/${deleteTarget.id}`, { method: 'DELETE' });
    if (res.ok) {
      addToast('FAQ deleted', 'success');
      setDeleteTarget(null);
      fetchFaqs();
    } else {
      const err = await res.json().catch(() => ({ error: 'Delete failed' }));
      addToast(err.error || 'Delete failed', 'error');
    }
  };

  const handleSave = async (payload: {
    question: string;
    answer: string;
    category: string;
    language: string;
    priority: number;
    status: string;
  }) => {
    if (editTarget) {
      const res = await apiFetch(`/api/admin/chatbot/faqs/${editTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        addToast('FAQ saved', 'success');
        setEditTarget(null);
        fetchFaqs();
      } else {
        const err = await res.json().catch(() => ({ error: 'Save failed' }));
        addToast(err.error || 'Save failed', 'error');
      }
    } else {
      const res = await apiFetch('/api/admin/chatbot/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        addToast('FAQ created', 'success');
        setShowAdd(false);
        fetchFaqs();
      } else {
        const err = await res.json().catch(() => ({ error: 'Create failed' }));
        addToast(err.error || 'Create failed', 'error');
      }
    }
  };

  if (loading || !user) {
    return <div className="p-12 text-center text-gray-500">Loading...</div>;
  }

  const list = faqs ?? [];
  const draftCount = list.filter((f) => f.status === 'draft').length;

  return (
    <div>
      <ChatbotSubNav active="faqs" />

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937] flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#9B1B30]" />
            Chatbot FAQs
          </h1>
          <p className="text-sm text-[#4B5563] mt-1 max-w-2xl">
            The knowledge base the chatbot answers from. Active FAQs are injected into
            every conversation; AI-drafted answers wait here for your approval.
            Changes go live immediately.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchFaqs}
            disabled={fetching}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${fetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 bg-[#9B1B30] hover:bg-[#7A1526] text-white px-4 py-2 text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add FAQ
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center border border-gray-300 bg-white">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1.5 text-xs font-semibold ${
                statusFilter === f.key
                  ? 'bg-[#1B2A4A] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
              {f.key === 'draft' && draftCount > 0 && statusFilter !== 'draft' && (
                <span className="ml-1 text-[10px] bg-amber-100 text-amber-800 px-1 rounded-sm">
                  {draftCount}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions and answers…"
            className="w-full pl-8 pr-3 py-2 text-xs border border-gray-300 bg-white focus:outline-none focus:border-[#9B1B30]"
          />
        </div>
      </div>

      {/* FAQ table */}
      <section className="bg-white border border-gray-200">
        {list.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-gray-500">
            {fetching ? 'Loading…' : 'No FAQs match this filter.'}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#FAFAF8] border-b border-gray-200">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                <th className="px-4 py-2">Question</th>
                <th className="px-4 py-2 w-24">Category</th>
                <th className="px-4 py-2 w-20">Source</th>
                <th className="px-4 py-2 w-24">Status</th>
                <th className="px-4 py-2 w-24">Updated</th>
                <th className="px-4 py-2 w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((faq) => (
                <tr key={faq.id} className="border-b border-gray-100 hover:bg-[#FAFAF8] align-top">
                  <td className="px-4 py-2.5">
                    <p className="text-sm font-semibold text-[#1B2A4A]">{faq.question}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 max-w-xl">{faq.answer}</p>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-600 capitalize">{faq.category}</td>
                  <td className="px-4 py-2.5">
                    <SourceBadge source={faq.source} />
                  </td>
                  <td className="px-4 py-2.5">
                    <FaqStatusBadge status={faq.status} />
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">{relativeTime(faq.updated_at)}</td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    {faq.status === 'draft' && (
                      <button
                        onClick={() => handleApprove(faq)}
                        disabled={approvingId === faq.id}
                        className="p-1 text-green-700 hover:text-green-900 disabled:opacity-50"
                        title="Approve — make live"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    {faq.status === 'active' && (
                      <button
                        onClick={() => handleRetire(faq)}
                        className="p-1 text-gray-400 hover:text-amber-700"
                        title="Retire — stop serving to the bot"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                    {faq.status === 'retired' && (
                      <button
                        onClick={() => handleApprove(faq)}
                        disabled={approvingId === faq.id}
                        className="p-1 text-gray-400 hover:text-green-700 disabled:opacity-50"
                        title="Re-activate"
                      >
                        <ArchiveRestore className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setEditTarget(faq)}
                      className="p-1 text-gray-400 hover:text-[#1B2A4A]"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(faq)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Edit / Add dialog */}
      {editTarget && (
        <FaqDialog
          title="Edit FAQ"
          initial={editTarget}
          onCancel={() => setEditTarget(null)}
          onSubmit={handleSave}
        />
      )}
      {showAdd && (
        <FaqDialog
          title="Add FAQ"
          initial={null}
          onCancel={() => setShowAdd(false)}
          onSubmit={handleSave}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete FAQ?"
        message={
          deleteTarget
            ? `"${deleteTarget.question.slice(0, 80)}" will be permanently removed from the chatbot's knowledge base.`
            : ''
        }
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        variant="danger"
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────

function FaqStatusBadge({ status }: { status: FaqRow['status'] }) {
  const map: Record<FaqRow['status'], { label: string; className: string; icon: typeof CheckCircle2 }> = {
    draft: { label: 'Draft', className: 'bg-amber-100 text-amber-800', icon: Clock },
    active: { label: 'Active', className: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    retired: { label: 'Retired', className: 'bg-gray-100 text-gray-600', icon: Archive },
  };
  const m = map[status];
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${m.className}`}>
      <Icon className="w-3 h-3" />
      {m.label}
    </span>
  );
}

function SourceBadge({ source }: { source: FaqRow['source'] }) {
  const map: Record<FaqRow['source'], { label: string; className: string }> = {
    seed: { label: 'Seed', className: 'bg-gray-100 text-gray-600' },
    manual: { label: 'Manual', className: 'bg-blue-100 text-blue-800' },
    auto: { label: 'AI', className: 'bg-purple-100 text-purple-800' },
  };
  const m = map[source];
  return (
    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${m.className}`}>
      {m.label}
    </span>
  );
}

function FaqDialog({
  title,
  initial,
  onCancel,
  onSubmit,
}: {
  title: string;
  initial: FaqRow | null;
  onCancel: () => void;
  onSubmit: (payload: {
    question: string;
    answer: string;
    category: string;
    language: string;
    priority: number;
    status: string;
  }) => Promise<void>;
}) {
  const [question, setQuestion] = useState(initial?.question ?? '');
  const [answer, setAnswer] = useState(initial?.answer ?? '');
  const [category, setCategory] = useState(initial?.category ?? 'general');
  const [language, setLanguage] = useState(initial?.language ?? 'en');
  const [priority, setPriority] = useState(initial?.priority ?? 0);
  const [status, setStatus] = useState<string>(initial?.status ?? 'active');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = question.trim().length > 0 && answer.trim().length > 0;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit({
        question: question.trim(),
        answer: answer.trim(),
        category,
        language,
        priority,
        status,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h3 className="text-base font-bold text-[#1B2A4A]">{title}</h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Question *</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="e.g. How much is the application fee?"
              className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-[#9B1B30]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Answer * (markdown)</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              maxLength={4000}
              rows={8}
              placeholder="The answer the chatbot will give…"
              className="w-full border border-gray-300 p-2 text-sm font-mono focus:outline-none focus:border-[#9B1B30]"
            />
            <p className="text-xs text-gray-400 mt-1">{answer.length}/4000</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-[#9B1B30]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-[#9B1B30]"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-[#9B1B30]"
              >
                <option value="active">Active (live)</option>
                <option value="draft">Draft (hidden)</option>
                <option value="retired">Retired</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Priority ({priority} — higher = matched first)
            </label>
            <input
              type="range"
              min={-10}
              max={10}
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
        <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting || !canSubmit}
            className="px-4 py-2 text-sm font-semibold bg-[#9B1B30] hover:bg-[#7A1526] disabled:bg-gray-300 text-white"
          >
            {submitting ? 'Saving…' : 'Save FAQ'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return 'just now';
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h ago`;
  return `${Math.floor(ms / 86_400_000)}d ago`;
}

export default function ChatbotFaqsPage() {
  return (
    <ToastProvider>
      <FaqsInner />
    </ToastProvider>
  );
}

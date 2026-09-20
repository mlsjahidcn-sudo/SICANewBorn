'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Play,
  Plus,
  Trash2,
  X,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api-client';
import { ToastProvider, useToast } from '@/components/admin/toast';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { ChatbotSubNav } from '../faqs/page';

interface QueueRow {
  id: string;
  question: string;
  question_norm: string;
  context: string | null;
  session_token: string | null;
  source: 'fallback' | 'zero_match' | 'manual';
  language: string;
  priority: number;
  hit_count: number;
  status: 'pending' | 'generating' | 'done' | 'skipped' | 'failed';
  faq_id: string | null;
  last_error: string | null;
  generated_at: string | null;
  created_at: string;
  updated_at: string;
}

interface RunRow {
  id: string;
  triggered_by: 'cron' | 'admin';
  status: 'running' | 'success' | 'partial' | 'failed';
  count_planned: number;
  count_done: number;
  count_failed: number;
  queue_item_ids: string[];
  failed_item_ids: string[];
  started_at: string;
  finished_at: string | null;
  error_log: string | null;
}

interface DashboardData {
  summary: {
    pendingCount: number;
    doneThisWeek: number;
    draftsCount: number;
    activeFaqCount: number;
    lastRun: { id: string; status: string; started_at: string; count_done: number; count_failed: number; triggered_by: string } | null;
  };
  queue: QueueRow[];
  runs: RunRow[];
}

function AutomationInner() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [fetching, setFetching] = useState(false);
  const [running, setRunning] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<QueueRow | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/admin/login');
  }, [user, loading, router]);

  const fetchDashboard = useCallback(async () => {
    setFetching(true);
    try {
      const res = await apiFetch('/api/admin/chatbot/automation');
      if (res.ok) {
        const json = (await res.json()) as DashboardData;
        setData(json);
      } else {
        addToast('Failed to load automation dashboard', 'error');
      }
    } finally {
      setFetching(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) fetchDashboard();
  }, [user, fetchDashboard]);

  const handleRunNow = async () => {
    if (running) return;
    setRunning(true);
    addToast('Generating FAQ drafts… this usually takes under a minute.', 'info');
    try {
      const res = await apiFetch('/api/admin/chatbot/automation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 5 }),
      });
      if (res.ok) {
        const json = await res.json();
        addToast(
          `Run finished: ${json.count_done} drafted, ${json.count_failed} failed`,
          json.count_failed === 0 ? 'success' : 'info',
        );
        fetchDashboard();
      } else {
        const err = await res.json().catch(() => ({ error: 'Run failed' }));
        addToast(err.error || 'Run failed', 'error');
      }
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Run failed', 'error');
    } finally {
      setRunning(false);
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    const res = await apiFetch(`/api/admin/chatbot/automation/queue/${removeTarget.id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      addToast('Question removed from queue', 'success');
      setRemoveTarget(null);
      fetchDashboard();
    } else {
      const err = await res.json().catch(() => ({ error: 'Remove failed' }));
      addToast(err.error || 'Remove failed', 'error');
    }
  };

  const handleAdd = async (payload: { question: string; context: string; language: string; priority: number }) => {
    const res = await apiFetch('/api/admin/chatbot/automation/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      addToast('Question added to queue', 'success');
      setShowAdd(false);
      fetchDashboard();
    } else {
      const err = await res.json().catch(() => ({ error: 'Add failed' }));
      addToast(err.error || 'Add failed', 'error');
    }
  };

  if (loading || !user) {
    return <div className="p-12 text-center text-gray-500">Loading...</div>;
  }

  const queue = data?.queue ?? [];
  const runs = data?.runs ?? [];
  const pendingQueue = queue.filter((q) => q.status === 'pending');
  const recentQueue = queue.filter((q) => q.status !== 'pending').slice(0, 15);

  return (
    <div>
      <ChatbotSubNav active="automation" />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937] flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#9B1B30]" />
            Chatbot FAQ Automation
          </h1>
          <p className="text-sm text-[#4B5563] mt-1 max-w-2xl">
            Questions the chatbot couldn&apos;t answer well are mined from live conversations
            into the queue. Generate AI-drafted answers, then approve them on the FAQs tab —
            nothing reaches visitors until you approve it.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboard}
            disabled={fetching}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${fetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleRunNow}
            disabled={running || (data?.summary.pendingCount ?? 0) === 0}
            className="inline-flex items-center gap-2 bg-[#9B1B30] hover:bg-[#7A1526] disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 text-sm font-semibold transition-colors"
          >
            {running ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Running…
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Generate 5 now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          label="Pending questions"
          value={data?.summary.pendingCount ?? 0}
          accent={data?.summary.pendingCount === 0 ? 'muted' : 'primary'}
        />
        <SummaryCard
          label="Drafts awaiting review"
          value={data?.summary.draftsCount ?? 0}
          accent={data?.summary.draftsCount ? 'warning' : 'muted'}
          subline={data?.summary.draftsCount ? 'Approve on the FAQs tab' : null}
        />
        <SummaryCard
          label="Active FAQs"
          value={data?.summary.activeFaqCount ?? 0}
          accent="success"
        />
        <SummaryCard
          label="Last run"
          value={data?.summary.lastRun ? formatRunStatus(data.summary.lastRun) : 'No runs yet'}
          subline={data?.summary.lastRun ? relativeTime(data.summary.lastRun.started_at) : null}
          accent={data?.summary.lastRun ? runStatusColor(data.summary.lastRun.status) : 'muted'}
        />
      </div>

      {/* Pending queue */}
      <section className="bg-white border border-gray-200 mb-6">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#1B2A4A]">
              Pending questions ({pendingQueue.length})
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Trending questions (hit count) are picked first. The runner takes the top
              5 each run.
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-[#1B2A4A] text-[#1B2A4A] hover:bg-[#1B2A4A] hover:text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add question
          </button>
        </div>
        {pendingQueue.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm text-gray-500">
              No pending questions. The queue fills automatically as visitors ask things
              the bot can&apos;t answer — or{' '}
              <button
                onClick={() => setShowAdd(true)}
                className="text-[#9B1B30] hover:underline font-semibold"
              >
                add one
              </button>{' '}
              yourself.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#FAFAF8] border-b border-gray-200">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                <th className="px-4 py-2">Question</th>
                <th className="px-4 py-2 w-28">Source</th>
                <th className="px-4 py-2 w-16 text-center">Hits</th>
                <th className="px-4 py-2 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {pendingQueue.map((q) => (
                <tr key={q.id} className="border-b border-gray-100 hover:bg-[#FAFAF8]">
                  <td className="px-4 py-2.5">
                    <p className="text-sm font-semibold text-[#1B2A4A]">{q.question}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      asked {relativeTime(q.created_at)} · {q.language.toUpperCase()}
                    </p>
                  </td>
                  <td className="px-4 py-2.5">
                    <SourceBadge source={q.source} />
                  </td>
                  <td className="px-4 py-2.5 text-xs text-center font-mono text-gray-700">
                    {q.hit_count > 1 ? (
                      <span className="font-bold text-[#9B1B30]">×{q.hit_count}</span>
                    ) : (
                      q.hit_count
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => setRemoveTarget(q)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Remove from queue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Recent activity (non-pending queue items) */}
      {recentQueue.length > 0 && (
        <section className="bg-white border border-gray-200 mb-6">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#1B2A4A]">
              Recent activity
            </h2>
          </div>
          <table className="w-full">
            <thead className="bg-[#FAFAF8] border-b border-gray-200">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                <th className="px-4 py-2">Question</th>
                <th className="px-4 py-2 w-28">Status</th>
                <th className="px-4 py-2 w-32">Generated</th>
                <th className="px-4 py-2 w-24 text-right">FAQ</th>
              </tr>
            </thead>
            <tbody>
              {recentQueue.map((q) => (
                <tr key={q.id} className="border-b border-gray-100">
                  <td className="px-4 py-2 text-sm text-[#1B2A4A]">
                    {q.question}
                    {q.last_error && (
                      <p className="text-xs text-red-600 mt-0.5 line-clamp-1" title={q.last_error}>
                        {q.last_error}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <QueueStatusBadge status={q.status} />
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500">
                    {q.generated_at ? relativeTime(q.generated_at) : '—'}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {q.faq_id ? (
                      <a
                        href="/admin/chatbot/faqs"
                        className="inline-flex items-center gap-1 text-xs text-[#1B2A4A] hover:text-[#9B1B30] font-semibold"
                      >
                        Open
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Run history */}
      <section className="bg-white border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#1B2A4A]">
            Run history ({runs.length})
          </h2>
        </div>
        {runs.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-gray-500">
            No runs yet. Click &quot;Generate 5 now&quot; to draft your first batch of answers.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#FAFAF8] border-b border-gray-200">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                <th className="px-4 py-2 w-8"></th>
                <th className="px-4 py-2">Started</th>
                <th className="px-4 py-2 w-24">Triggered</th>
                <th className="px-4 py-2 w-28">Status</th>
                <th className="px-4 py-2 w-24">Done</th>
                <th className="px-4 py-2 w-24">Failed</th>
                <th className="px-4 py-2 w-20">Duration</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => {
                const isOpen = expandedRunId === r.id;
                const startedAt = new Date(r.started_at);
                const finishedAt = r.finished_at ? new Date(r.finished_at) : null;
                const durationMs = finishedAt ? finishedAt.getTime() - startedAt.getTime() : null;
                return (
                  <RunRowExpanded
                    key={r.id}
                    run={r}
                    isOpen={isOpen}
                    onToggle={() => setExpandedRunId(isOpen ? null : r.id)}
                    durationMs={durationMs}
                    queueById={queueByIdMap(queue)}
                  />
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* Add question dialog */}
      {showAdd && (
        <AddQuestionDialog
          onCancel={() => setShowAdd(false)}
          onSubmit={handleAdd}
        />
      )}

      <ConfirmDialog
        open={!!removeTarget}
        title="Remove question?"
        message={
          removeTarget
            ? `"${removeTarget.question.slice(0, 80)}" will be removed from the queue. A drafted FAQ (if any) stays on the FAQs tab.`
            : ''
        }
        confirmText="Remove"
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
        variant="danger"
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  subline,
  accent,
}: {
  label: string;
  value: number | string;
  subline?: string | null;
  accent: 'primary' | 'muted' | 'success' | 'warning' | 'danger';
}) {
  const valueColor =
    accent === 'primary' ? 'text-[#9B1B30]' :
    accent === 'success' ? 'text-green-700' :
    accent === 'warning' ? 'text-amber-700' :
    accent === 'danger' ? 'text-red-700' :
    'text-[#1B2A4A]';
  return (
    <div className="bg-white border border-gray-200 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</p>
      {subline && <p className="text-xs text-gray-500 mt-1">{subline}</p>}
    </div>
  );
}

function QueueStatusBadge({ status }: { status: QueueRow['status'] }) {
  const map: Record<QueueRow['status'], { label: string; className: string; icon: typeof CheckCircle2 }> = {
    pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800', icon: Clock },
    generating: { label: 'Generating', className: 'bg-blue-100 text-blue-800', icon: RefreshCw },
    done: { label: 'Done', className: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    skipped: { label: 'Skipped', className: 'bg-gray-100 text-gray-600', icon: X },
    failed: { label: 'Failed', className: 'bg-red-100 text-red-800', icon: AlertCircle },
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

function SourceBadge({ source }: { source: QueueRow['source'] }) {
  const map: Record<QueueRow['source'], { label: string; className: string }> = {
    fallback: { label: 'Fallback', className: 'bg-red-100 text-red-800' },
    zero_match: { label: 'No match', className: 'bg-amber-100 text-amber-800' },
    manual: { label: 'Manual', className: 'bg-blue-100 text-blue-800' },
  };
  const m = map[source];
  return (
    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${m.className}`}>
      {m.label}
    </span>
  );
}

function RunRowExpanded({
  run,
  isOpen,
  onToggle,
  durationMs,
  queueById,
}: {
  run: RunRow;
  isOpen: boolean;
  onToggle: () => void;
  durationMs: number | null;
  queueById: Map<string, QueueRow>;
}) {
  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-[#FAFAF8] cursor-pointer" onClick={onToggle}>
        <td className="px-4 py-2">
          {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
        </td>
        <td className="px-4 py-2 text-sm text-[#1B2A4A]">
          {new Date(run.started_at).toLocaleString()}
        </td>
        <td className="px-4 py-2 text-xs text-gray-600 capitalize">
          {run.triggered_by}
        </td>
        <td className="px-4 py-2">
          <RunStatusBadge status={run.status} />
        </td>
        <td className="px-4 py-2 text-sm font-mono text-green-700">
          {run.count_done}
        </td>
        <td className="px-4 py-2 text-sm font-mono text-red-700">
          {run.count_failed}
        </td>
        <td className="px-4 py-2 text-xs text-gray-500">
          {durationMs != null ? `${(durationMs / 1000).toFixed(1)}s` : '—'}
        </td>
      </tr>
      {isOpen && (
        <tr className="bg-[#FAFAF8]">
          <td colSpan={7} className="px-4 py-3">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Questions in this run ({run.queue_item_ids.length})
              </p>
              <div className="space-y-1">
                {run.queue_item_ids.map((qid) => {
                  const item = queueById.get(qid);
                  const failed = run.failed_item_ids.includes(qid);
                  return (
                    <div key={qid} className="flex items-center gap-2 text-xs">
                      {failed ? (
                        <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                      )}
                      <span className="text-[#1B2A4A] flex-1 truncate">
                        {item?.question ?? `(${qid.slice(0, 8)}…)`}
                      </span>
                      {item?.faq_id && (
                        <a
                          href="/admin/chatbot/faqs"
                          className="text-[#1B2A4A] hover:text-[#9B1B30] font-semibold"
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                          View FAQ →
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
              {run.error_log && (
                <details className="mt-2">
                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                    Error log
                  </summary>
                  <pre className="text-xs text-red-700 bg-red-50 border border-red-200 p-2 mt-1 overflow-x-auto whitespace-pre-wrap">
                    {run.error_log}
                  </pre>
                </details>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function RunStatusBadge({ status }: { status: RunRow['status'] }) {
  const map: Record<RunRow['status'], { label: string; className: string }> = {
    running: { label: 'Running', className: 'bg-blue-100 text-blue-800' },
    success: { label: 'Success', className: 'bg-green-100 text-green-800' },
    partial: { label: 'Partial', className: 'bg-amber-100 text-amber-800' },
    failed: { label: 'Failed', className: 'bg-red-100 text-red-800' },
  };
  const m = map[status];
  return (
    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${m.className}`}>
      {m.label}
    </span>
  );
}

function AddQuestionDialog({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (payload: { question: string; context: string; language: string; priority: number }) => Promise<void>;
}) {
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');
  const [language, setLanguage] = useState('en');
  const [priority, setPriority] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (question.trim().length < 8) return;
    setSubmitting(true);
    try {
      await onSubmit({
        question: question.trim(),
        context: context.trim(),
        language,
        priority,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white border border-gray-200 w-full max-w-lg">
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-[#1B2A4A]">Add question to queue</h3>
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
              rows={3}
              placeholder="e.g. How do I convert my transcript to the Chinese grading scale?"
              className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-[#9B1B30]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Context (optional)</label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              maxLength={2000}
              rows={3}
              placeholder="Any conversation context that helps the generator draft a better answer…"
              className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-[#9B1B30]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-[#9B1B30]"
              >
                <option value="en">en</option>
                <option value="zh">zh</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Priority ({priority} — higher = picked first)
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
            disabled={submitting || question.trim().length < 8}
            className="px-4 py-2 text-sm font-semibold bg-[#9B1B30] hover:bg-[#7A1526] disabled:bg-gray-300 text-white"
          >
            {submitting ? 'Adding…' : 'Add to queue'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

function queueByIdMap(queue: QueueRow[]): Map<string, QueueRow> {
  const m = new Map<string, QueueRow>();
  for (const q of queue) m.set(q.id, q);
  return m;
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return 'just now';
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h ago`;
  return `${Math.floor(ms / 86_400_000)}d ago`;
}

function formatRunStatus(lastRun: DashboardData['summary']['lastRun']): string {
  if (!lastRun) return '—';
  return `${lastRun.count_done} done / ${lastRun.count_failed} failed`;
}

function runStatusColor(status: string | undefined): 'success' | 'warning' | 'danger' | 'muted' {
  if (status === 'success') return 'success';
  if (status === 'partial') return 'warning';
  if (status === 'failed') return 'danger';
  return 'muted';
}

export default function ChatbotAutomationPage() {
  return (
    <ToastProvider>
      <AutomationInner />
    </ToastProvider>
  );
}

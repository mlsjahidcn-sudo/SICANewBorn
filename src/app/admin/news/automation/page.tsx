'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
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
import { NewsSubNav } from '../page';

interface TopicRow {
  id: string;
  topic: string;
  category: string;
  language: string;
  tone: string;
  target_keyword: string | null;
  priority: number;
  status: 'pending' | 'generating' | 'done' | 'skipped' | 'failed';
  post_id: string | null;
  last_error: string | null;
  generated_at: string | null;
  created_at: string;
  updated_at: string;
}

interface RunRow {
  id: string;
  triggered_by: 'cron' | 'admin' | 'seed';
  status: 'running' | 'success' | 'partial' | 'failed';
  count_planned: number;
  count_done: number;
  count_failed: number;
  topic_ids: string[];
  failed_topic_ids: string[];
  started_at: string;
  finished_at: string | null;
  error_log: string | null;
}

interface DashboardData {
  summary: {
    pendingCount: number;
    doneThisWeek: number;
    lastRun: { id: string; status: string; started_at: string; count_done: number; count_failed: number; triggered_by: string } | null;
  };
  topics: TopicRow[];
  runs: RunRow[];
}

const CATEGORIES = ['scholarship', 'university', 'guide', 'event', 'announcement', 'partnership'] as const;
const LANGUAGES = ['en', 'zh', 'both'] as const;
const TONES = ['informational', 'instructional', 'analytical', 'celebratory', 'urgent'] as const;

function AutomationInner() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [fetching, setFetching] = useState(false);
  const [running, setRunning] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<TopicRow | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/admin/login');
  }, [user, loading, router]);

  const fetchDashboard = useCallback(async () => {
    setFetching(true);
    try {
      const res = await apiFetch('/api/admin/news/automation');
      if (res.ok) {
        const json = (await res.json()) as DashboardData;
        setData(json);
      } else {
        addToast('Failed to load automation dashboard', 'error');
      }
    } finally {
      setFetching(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (user) fetchDashboard();
  }, [user, fetchDashboard]);

  const handleRunNow = async () => {
    if (running) return;
    setRunning(true);
    addToast('Generating drafts… this can take 1-3 minutes.', 'info');
    try {
      const res = await apiFetch('/api/admin/news/automation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 5, length: 'short' }),
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
    const res = await apiFetch(`/api/admin/news/automation/topics/${removeTarget.id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      addToast('Topic removed', 'success');
      setRemoveTarget(null);
      fetchDashboard();
    } else {
      const err = await res.json().catch(() => ({ error: 'Remove failed' }));
      addToast(err.error || 'Remove failed', 'error');
    }
  };

  const handleAdd = async (payload: {
    topic: string;
    category: string;
    language: string;
    tone: string;
    target_keyword: string;
    priority: number;
  }) => {
    const res = await apiFetch('/api/admin/news/automation/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      addToast('Topic added to queue', 'success');
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

  const topics = data?.topics ?? [];
  const runs = data?.runs ?? [];
  const pendingTopics = topics.filter((t) => t.status === 'pending');
  const recentTopics = topics.filter((t) => t.status !== 'pending').slice(0, 15);

  return (
    <div>
      <NewsSubNav active="automation" />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937] flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#9B1B30]" />
            News Automation
          </h1>
          <p className="text-sm text-[#4B5563] mt-1 max-w-2xl">
            Generate AI-written draft posts in bulk. Pick topics from the queue,
            run the batch, and review the drafts on the Posts tab. Every
            generated post is saved as a draft — nothing goes live until you
            click Publish.
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
                Run 5 now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          label="Pending topics"
          value={data?.summary.pendingCount ?? 0}
          accent={data?.summary.pendingCount === 0 ? 'muted' : 'primary'}
        />
        <SummaryCard
          label="Drafts (last 7 days)"
          value={data?.summary.doneThisWeek ?? 0}
          accent="muted"
        />
        <SummaryCard
          label="Last run"
          value={data?.summary.lastRun ? formatRunStatus(data.summary.lastRun) : 'No runs yet'}
          subline={data?.summary.lastRun ? relativeTime(data.summary.lastRun.started_at) : null}
          accent={data?.summary.lastRun ? runStatusColor(data.summary.lastRun.status) : 'muted'}
        />
      </div>

      {/* Pending topics */}
      <section className="bg-white border border-gray-200 mb-6">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#1B2A4A]">
              Pending topics ({pendingTopics.length})
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Higher priority topics are picked first. The runner takes the top
              5 each run.
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-[#1B2A4A] text-[#1B2A4A] hover:bg-[#1B2A4A] hover:text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add topic
          </button>
        </div>
        {pendingTopics.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm text-gray-500">
              No pending topics.{' '}
              <button
                onClick={() => setShowAdd(true)}
                className="text-[#9B1B30] hover:underline font-semibold"
              >
                Add one
              </button>{' '}
              or wait for the next daily cron.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#FAFAF8] border-b border-gray-200">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                <th className="px-4 py-2">Topic</th>
                <th className="px-4 py-2 w-32">Category</th>
                <th className="px-4 py-2 w-20">Lang</th>
                <th className="px-4 py-2 w-16 text-center">Prio</th>
                <th className="px-4 py-2 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {pendingTopics.map((t) => (
                <tr key={t.id} className="border-b border-gray-100 hover:bg-[#FAFAF8]">
                  <td className="px-4 py-2.5">
                    <p className="text-sm font-semibold text-[#1B2A4A]">{t.topic}</p>
                    {t.target_keyword && (
                      <p className="text-xs text-gray-500 mt-0.5">keyword: {t.target_keyword}</p>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-600 capitalize">{t.category}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-600 uppercase">{t.language}</td>
                  <td className="px-4 py-2.5 text-xs text-center font-mono text-gray-700">
                    {t.priority > 0 ? `+${t.priority}` : t.priority}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => setRemoveTarget(t)}
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

      {/* Recent activity (non-pending topics) */}
      {recentTopics.length > 0 && (
        <section className="bg-white border border-gray-200 mb-6">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#1B2A4A]">
              Recent activity
            </h2>
          </div>
          <table className="w-full">
            <thead className="bg-[#FAFAF8] border-b border-gray-200">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                <th className="px-4 py-2">Topic</th>
                <th className="px-4 py-2 w-28">Status</th>
                <th className="px-4 py-2 w-32">Generated</th>
                <th className="px-4 py-2 w-24 text-right">Post</th>
              </tr>
            </thead>
            <tbody>
              {recentTopics.map((t) => (
                <tr key={t.id} className="border-b border-gray-100">
                  <td className="px-4 py-2 text-sm text-[#1B2A4A]">
                    {t.topic}
                    {t.last_error && (
                      <p className="text-xs text-red-600 mt-0.5 line-clamp-1" title={t.last_error}>
                        {t.last_error}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <TopicStatusBadge status={t.status} />
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500">
                    {t.generated_at ? relativeTime(t.generated_at) : '—'}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {t.post_id ? (
                      <Link
                        href={`/admin/news/${t.post_id}/edit`}
                        className="inline-flex items-center gap-1 text-xs text-[#1B2A4A] hover:text-[#9B1B30] font-semibold"
                      >
                        Open
                        <ExternalLink className="w-3 h-3" />
                      </Link>
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
            No runs yet. Click "Run 5 now" to generate your first batch of drafts.
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
                    topicsById={topicsByIdMap(topics)}
                  />
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* Add topic dialog */}
      {showAdd && (
        <AddTopicDialog
          onCancel={() => setShowAdd(false)}
          onSubmit={handleAdd}
        />
      )}

      <ConfirmDialog
        open={!!removeTarget}
        title="Remove topic?"
        message={
          removeTarget
            ? `"${removeTarget.topic.slice(0, 80)}" will be removed from the queue. The post (if any) stays in /admin/news.`
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

function TopicStatusBadge({ status }: { status: TopicRow['status'] }) {
  const map: Record<TopicRow['status'], { label: string; className: string; icon: typeof CheckCircle2 }> = {
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

function RunRowExpanded({
  run,
  isOpen,
  onToggle,
  durationMs,
  topicsById,
}: {
  run: RunRow;
  isOpen: boolean;
  onToggle: () => void;
  durationMs: number | null;
  topicsById: Map<string, TopicRow>;
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
                Topics in this run ({run.topic_ids.length})
              </p>
              <div className="space-y-1">
                {run.topic_ids.map((tid) => {
                  const topic = topicsById.get(tid);
                  const failed = run.failed_topic_ids.includes(tid);
                  return (
                    <div key={tid} className="flex items-center gap-2 text-xs">
                      {failed ? (
                        <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                      )}
                      <span className="text-[#1B2A4A] flex-1 truncate">
                        {topic?.topic ?? `(${tid.slice(0, 8)}…)`}
                      </span>
                      {topic?.post_id && (
                        <Link
                          href={`/admin/news/${topic.post_id}/edit`}
                          className="text-[#1B2A4A] hover:text-[#9B1B30] font-semibold"
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                          View post →
                        </Link>
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

function AddTopicDialog({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (payload: {
    topic: string;
    category: string;
    language: string;
    tone: string;
    target_keyword: string;
    priority: number;
  }) => Promise<void>;
}) {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState<string>('announcement');
  const [language, setLanguage] = useState<string>('en');
  const [tone, setTone] = useState<string>('informational');
  const [targetKeyword, setTargetKeyword] = useState('');
  const [priority, setPriority] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (topic.trim().length < 3) return;
    setSubmitting(true);
    try {
      await onSubmit({
        topic: topic.trim(),
        category,
        language,
        tone,
        target_keyword: targetKeyword.trim(),
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
          <h3 className="text-base font-bold text-[#1B2A4A]">Add topic to queue</h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Topic *</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="e.g. CSC Scholarship 2026 monthly stipend amounts and what they cover"
              className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-[#9B1B30]"
            />
            <p className="text-xs text-gray-400 mt-1">{topic.length}/200</p>
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
              <label className="block text-xs font-semibold text-gray-700 mb-1">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-[#9B1B30]"
              >
                {TONES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Target SEO keyword (optional)</label>
            <input
              type="text"
              value={targetKeyword}
              onChange={(e) => setTargetKeyword(e.target.value)}
              maxLength={200}
              placeholder="e.g. CSC scholarship stipend 2026"
              className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-[#9B1B30]"
            />
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
        <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting || topic.trim().length < 3}
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

function topicsByIdMap(topics: TopicRow[]): Map<string, TopicRow> {
  const m = new Map<string, TopicRow>();
  for (const t of topics) m.set(t.id, t);
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

export default function NewsAutomationPage() {
  return (
    <ToastProvider>
      <AutomationInner />
    </ToastProvider>
  );
}

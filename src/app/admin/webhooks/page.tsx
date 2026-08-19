'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Webhook,
  Plus,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  PowerOff,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
}

interface Subscription {
  id: string;
  url: string;
  events: string[];
  description: string | null;
  active: boolean;
  created_at: string;
  last_triggered_at: string | null;
  success_count: number;
  failure_count: number;
  api_key: ApiKey | ApiKey[] | null;
}

interface Delivery {
  id: string;
  event: string;
  status: 'pending' | 'success' | 'failed' | 'dead';
  http_status: number | null;
  attempt_count: number;
  created_at: string;
  last_attempt_at: string | null;
  next_retry_at: string | null;
}

const ALL_EVENTS = [
  'university.created',
  'university.updated',
  'university.deleted',
  'program.created',
  'program.updated',
  'program.deleted',
] as const;

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function apiKeyLabel(sub: Subscription): string {
  // PostgREST can return joined rows as either an object or a single-item
  // array depending on the relationship cardinality. Normalize.
  const k = Array.isArray(sub.api_key) ? sub.api_key[0] : sub.api_key;
  if (!k) return '—';
  return `${k.name} · ${k.key_prefix}…`;
}

export default function AdminWebhooksPage() {
  const { t } = useI18n();
  const [subs, setSubs] = useState<Subscription[] | null>(null);
  const [keys, setKeys] = useState<ApiKey[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Per-subscription delivery log
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [deliveries, setDeliveries] = useState<Record<string, Delivery[]>>({});

  // Create modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [formKeyId, setFormKeyId] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formEvents, setFormEvents] = useState<string[]>([...ALL_EVENTS]);
  const [formDescription, setFormDescription] = useState('');

  // Created plaintext reveal modal
  const [reveal, setReveal] = useState<{ subscription: Subscription; secret: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Disable confirmation
  const [disableTarget, setDisableTarget] = useState<Subscription | null>(null);
  const [disabling, setDisabling] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [subsRes, keysRes] = await Promise.all([
        fetch('/api/admin/webhooks', { cache: 'no-store' }),
        fetch('/api/admin/api-keys', { cache: 'no-store' }),
      ]);
      if (!subsRes.ok) {
        const j = await subsRes.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${subsRes.status}`);
      }
      if (!keysRes.ok) {
        const j = await keysRes.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${keysRes.status}`);
      }
      const subsJson = (await subsRes.json()) as { subscriptions: Subscription[] };
      const keysJson = (await keysRes.json()) as { keys: ApiKey[] };
      setSubs(subsJson.subscriptions ?? []);
      // Only surface active, non-revoked keys in the create dropdown.
      setKeys((keysJson.keys ?? []).filter((k) => (k as unknown as { revoked_at?: string | null }).revoked_at == null));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function loadDeliveries(subId: string) {
    try {
      const res = await fetch(`/api/admin/webhooks/${subId}/deliveries`, { cache: 'no-store' });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const j = (await res.json()) as { deliveries: Delivery[] };
      setDeliveries((prev) => ({ ...prev, [subId]: j.deliveries ?? [] }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load deliveries');
    }
  }

  function toggleExpand(subId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(subId)) {
        next.delete(subId);
      } else {
        next.add(subId);
        if (!deliveries[subId]) {
          void loadDeliveries(subId);
        }
      }
      return next;
    });
  }

  async function handleCreate() {
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch('/api/admin/webhooks', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          api_key_id: formKeyId,
          url: formUrl,
          events: formEvents,
          description: formDescription || undefined,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const j = (await res.json()) as { subscription: Subscription; secret: string };
      setReveal({ subscription: j.subscription, secret: j.secret });
      setCreateOpen(false);
      setFormKeyId('');
      setFormUrl('');
      setFormEvents([...ALL_EVENTS]);
      setFormDescription('');
      await load();
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Create failed');
    } finally {
      setCreating(false);
    }
  }

  async function copySecret() {
    if (!reveal) return;
    try {
      await navigator.clipboard.writeText(reveal.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API.
      const ta = document.createElement('textarea');
      ta.value = reveal.secret;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); setCopied(true); } catch { /* noop */ }
      document.body.removeChild(ta);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleDisable() {
    if (!disableTarget) return;
    setDisabling(true);
    try {
      const res = await fetch(`/api/admin/webhooks/${disableTarget.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ active: false }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      setDisableTarget(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Disable failed');
    } finally {
      setDisabling(false);
    }
  }

  function toggleEvent(eventName: string) {
    setFormEvents((prev) =>
      prev.includes(eventName) ? prev.filter((e) => e !== eventName) : [...prev, eventName],
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
            <Webhook className="h-6 w-6" />
            {t('adminWebhooks.title')}
          </h1>
          <p className="text-sm text-gray-600 mt-1">{t('adminWebhooks.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </Button>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-[#9B1B30] hover:bg-[#7A1526] text-white"
            disabled={!keys || keys.length === 0}
            title={!keys || keys.length === 0 ? 'Create an API key first' : undefined}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('adminWebhooks.createButton')}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {subs === null ? (
        <div className="text-center py-12 text-gray-500">{t('common.loading')}</div>
      ) : subs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Webhook className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-semibold text-[#1B2A4A]">{t('adminWebhooks.emptyTitle')}</h3>
            <p className="text-sm text-gray-600 mt-1">{t('adminWebhooks.emptyBody')}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{subs.length} subscription{subs.length === 1 ? '' : 's'}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#FAFAF8] border-b">
                  <tr>
                    <th className="text-left p-3 font-semibold text-[#1B2A4A]">{t('adminWebhooks.tableApiKey')}</th>
                    <th className="text-left p-3 font-semibold text-[#1B2A4A]">{t('adminWebhooks.tableUrl')}</th>
                    <th className="text-left p-3 font-semibold text-[#1B2A4A]">{t('adminWebhooks.tableEvents')}</th>
                    <th className="text-right p-3 font-semibold text-[#1B2A4A]">{t('adminWebhooks.tableSuccess')}</th>
                    <th className="text-right p-3 font-semibold text-[#1B2A4A]">{t('adminWebhooks.tableFailure')}</th>
                    <th className="text-left p-3 font-semibold text-[#1B2A4A]">{t('adminWebhooks.tableLastTriggered')}</th>
                    <th className="text-left p-3 font-semibold text-[#1B2A4A]">{t('adminWebhooks.tableStatus')}</th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody>
                  {subs.map((s) => {
                    const isExpanded = expanded.has(s.id);
                    return (
                      <>
                        <tr key={s.id} className="border-b hover:bg-[#FAFAF8]">
                          <td className="p-3 text-gray-700 text-xs">
                            <div className="font-medium text-[#1B2A4A]">{apiKeyLabel(s)}</div>
                          </td>
                          <td className="p-3 font-mono text-xs text-gray-700 max-w-xs truncate" title={s.url}>
                            {s.url}
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {s.events.map((e) => (
                                <Badge key={e} variant="secondary" className="font-mono text-xs">
                                  {e}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 text-right text-emerald-700 font-medium">{s.success_count}</td>
                          <td className="p-3 text-right text-red-700 font-medium">{s.failure_count}</td>
                          <td className="p-3 text-gray-700 text-xs">
                            {s.last_triggered_at ? formatDate(s.last_triggered_at) : t('adminWebhooks.never')}
                          </td>
                          <td className="p-3">
                            {s.active ? (
                              <Badge className="bg-emerald-100 text-emerald-800">
                                {t('adminWebhooks.statusActive')}
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                {t('adminWebhooks.statusDisabled')}
                              </Badge>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleExpand(s.id)}
                              className="text-gray-500"
                              title={isExpanded ? 'Hide deliveries' : 'Show deliveries'}
                            >
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </Button>
                            {s.active && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-800"
                                onClick={() => setDisableTarget(s)}
                                title="Disable"
                              >
                                <PowerOff className="h-4 w-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${s.id}-deliveries`} className="border-b bg-gray-50">
                            <td colSpan={8} className="p-4">
                              <div className="text-xs font-semibold text-[#1B2A4A] mb-2">
                                {t('adminWebhooks.recentDeliveries')}
                              </div>
                              {deliveries[s.id] === undefined ? (
                                <div className="text-xs text-gray-500">{t('common.loading')}</div>
                              ) : deliveries[s.id].length === 0 ? (
                                <div className="text-xs text-gray-500">{t('adminWebhooks.deliveryNoRows')}</div>
                              ) : (
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="text-gray-500">
                                      <th className="text-left p-1 font-medium">{t('adminWebhooks.deliveryEvent')}</th>
                                      <th className="text-left p-1 font-medium">{t('adminWebhooks.deliveryStatus')}</th>
                                      <th className="text-left p-1 font-medium">{t('adminWebhooks.deliveryHttpStatus')}</th>
                                      <th className="text-right p-1 font-medium">{t('adminWebhooks.deliveryAttempts')}</th>
                                      <th className="text-left p-1 font-medium">{t('adminWebhooks.deliveryCreatedAt')}</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {deliveries[s.id].map((d) => (
                                      <tr key={d.id} className="border-t border-gray-200">
                                        <td className="p-1 font-mono">{d.event}</td>
                                        <td className="p-1">
                                          {d.status === 'success' && (
                                            <Badge className="bg-emerald-100 text-emerald-800">
                                              {t('adminWebhooks.deliveryStatusSuccess')}
                                            </Badge>
                                          )}
                                          {d.status === 'pending' && (
                                            <Badge variant="secondary">
                                              {t('adminWebhooks.deliveryStatusPending')}
                                            </Badge>
                                          )}
                                          {d.status === 'failed' && (
                                            <Badge className="bg-amber-100 text-amber-800">
                                              {t('adminWebhooks.deliveryStatusFailed')}
                                            </Badge>
                                          )}
                                          {d.status === 'dead' && (
                                            <Badge variant="destructive">
                                              {t('adminWebhooks.deliveryStatusDead')}
                                            </Badge>
                                          )}
                                        </td>
                                        <td className="p-1 text-gray-700">{d.http_status ?? '—'}</td>
                                        <td className="p-1 text-right text-gray-700">{d.attempt_count}</td>
                                        <td className="p-1 text-gray-500">{formatDate(d.created_at)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('adminWebhooks.createTitle')}</DialogTitle>
            <DialogDescription>{t('adminWebhooks.subtitle')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="api-key">{t('adminWebhooks.fieldApiKey')}</Label>
              <select
                id="api-key"
                className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                value={formKeyId}
                onChange={(e) => setFormKeyId(e.target.value)}
              >
                <option value="">— select —</option>
                {keys?.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name} · {k.key_prefix}…
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">{t('adminWebhooks.fieldApiKeyHelp')}</p>
            </div>
            <div>
              <Label htmlFor="url">{t('adminWebhooks.fieldUrl')}</Label>
              <Input
                id="url"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://api.example.com/webhooks/sica"
              />
              <p className="text-xs text-gray-500 mt-1">{t('adminWebhooks.fieldUrlHelp')}</p>
            </div>
            <div>
              <Label>{t('adminWebhooks.fieldEvents')}</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {ALL_EVENTS.map((ev) => (
                  <label key={ev} className="flex items-center gap-2 text-sm font-mono">
                    <input
                      type="checkbox"
                      checked={formEvents.includes(ev)}
                      onChange={() => toggleEvent(ev)}
                    />
                    {ev}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="description">{t('adminWebhooks.fieldDescription')}</Label>
              <Input
                id="description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Acme production worker"
              />
            </div>
            {createError && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{createError}</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
              {t('adminWebhooks.cancel')}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !formKeyId || !formUrl || formEvents.length === 0}
              className="bg-[#9B1B30] hover:bg-[#7A1526] text-white"
            >
              {creating ? t('adminWebhooks.creating') : t('adminWebhooks.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Secret reveal modal — shown exactly once after creation */}
      <Dialog open={!!reveal} onOpenChange={(open) => !open && setReveal(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-[#9B1B30] flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {t('adminWebhooks.createdTitle')}
            </DialogTitle>
            <DialogDescription>{t('adminWebhooks.createdBody')}</DialogDescription>
          </DialogHeader>
          {reveal && (
            <div className="space-y-3">
              <div className="bg-gray-900 text-green-400 font-mono text-sm p-4 rounded break-all">
                {reveal.secret}
              </div>
              <div className="flex justify-end">
                <Button onClick={copySecret} variant="outline">
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-emerald-600" />
                      {t('adminWebhooks.copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      {t('adminWebhooks.copyButton')}
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                {reveal.subscription.url} · {reveal.subscription.events.join(', ')}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Disable confirmation */}
      <AlertDialog
        open={!!disableTarget}
        onOpenChange={(open) => !open && setDisableTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('adminWebhooks.revokeTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('adminWebhooks.revokeBody')}</AlertDialogDescription>
          </AlertDialogHeader>
          {disableTarget && (
            <div className="py-2 text-sm">
              <span className="font-mono text-gray-600">{disableTarget.url}</span>
              <div className="text-xs text-gray-500 mt-1">{apiKeyLabel(disableTarget)}</div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disabling}>{t('adminWebhooks.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisable}
              disabled={disabling}
              className="bg-red-600 hover:bg-red-700"
            >
              {disabling ? '…' : t('adminWebhooks.confirmRevoke')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

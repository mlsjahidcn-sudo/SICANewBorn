'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  AlertTriangle,
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
import { Textarea } from '@/components/ui/textarea';

interface ApiKey {
  id: string;
  name: string;
  org_name: string | null;
  contact_email: string;
  key_prefix: string;
  scope: string[];
  rate_limit_per_minute: number;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  revoke_reason: string | null;
}

type Status = 'active' | 'revoked' | 'expired';

function statusOf(k: ApiKey): Status {
  if (k.revoked_at) return 'revoked';
  if (k.expires_at && new Date(k.expires_at) < new Date()) return 'expired';
  return 'active';
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function AdminApiKeysPage() {
  const { t } = useI18n();
  const [keys, setKeys] = useState<ApiKey[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Create modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formOrg, setFormOrg] = useState('');
  const [formScope, setFormScope] = useState<string>('read:catalog');
  const [formRate, setFormRate] = useState<string>('100');

  // Created plaintext reveal modal
  const [reveal, setReveal] = useState<{ key: ApiKey; plaintext: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Revoke confirmation
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [revoking, setRevoking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/api-keys', { cache: 'no-store' });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const j = (await res.json()) as { keys: ApiKey[] };
      setKeys(j.keys ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate() {
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          contact_email: formEmail,
          org_name: formOrg || undefined,
          scope: [formScope],
          rate_limit_per_minute: Number(formRate) || 100,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const j = (await res.json()) as { key: ApiKey; plaintext: string };
      setReveal({ key: j.key, plaintext: j.plaintext });
      setCreateOpen(false);
      // Reset form
      setFormName('');
      setFormEmail('');
      setFormOrg('');
      setFormScope('read:catalog');
      setFormRate('100');
      await load();
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Create failed');
    } finally {
      setCreating(false);
    }
  }

  async function copyPlaintext() {
    if (!reveal) return;
    try {
      await navigator.clipboard.writeText(reveal.plaintext);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the text in a hidden input. Browsers without
      // clipboard API still allow execCommand('copy') on selected text.
      const ta = document.createElement('textarea');
      ta.value = reveal.plaintext;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); setCopied(true); } catch { /* noop */ }
      document.body.removeChild(ta);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleRevoke() {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      const res = await fetch(`/api/admin/api-keys/${revokeTarget.id}`, {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ revoke_reason: revokeReason || undefined }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      setRevokeTarget(null);
      setRevokeReason('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Revoke failed');
    } finally {
      setRevoking(false);
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
            <Key className="h-6 w-6" />
            {t('adminApiKeys.title')}
          </h1>
          <p className="text-sm text-gray-600 mt-1">{t('adminApiKeys.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </Button>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-[#9B1B30] hover:bg-[#7A1526] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('adminApiKeys.createButton')}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {keys === null ? (
        <div className="text-center py-12 text-gray-500">{t('common.loading')}</div>
      ) : keys.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Key className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-semibold text-[#1B2A4A]">{t('adminApiKeys.emptyTitle')}</h3>
            <p className="text-sm text-gray-600 mt-1">{t('adminApiKeys.emptyBody')}</p>
            <Button
              onClick={() => setCreateOpen(true)}
              className="mt-4 bg-[#9B1B30] hover:bg-[#7A1526] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('adminApiKeys.createButton')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{keys.length} keys</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#FAFAF8] border-b">
                  <tr>
                    <th className="text-left p-3 font-semibold text-[#1B2A4A]">{t('adminApiKeys.tableName')}</th>
                    <th className="text-left p-3 font-semibold text-[#1B2A4A]">{t('adminApiKeys.tablePrefix')}</th>
                    <th className="text-left p-3 font-semibold text-[#1B2A4A]">{t('adminApiKeys.tableOrg')}</th>
                    <th className="text-left p-3 font-semibold text-[#1B2A4A]">{t('adminApiKeys.tableScope')}</th>
                    <th className="text-right p-3 font-semibold text-[#1B2A4A]">{t('adminApiKeys.tableRateLimit')}</th>
                    <th className="text-left p-3 font-semibold text-[#1B2A4A]">{t('adminApiKeys.tableLastUsed')}</th>
                    <th className="text-left p-3 font-semibold text-[#1B2A4A]">{t('adminApiKeys.tableStatus')}</th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k) => {
                    const s = statusOf(k);
                    return (
                      <tr key={k.id} className="border-b hover:bg-[#FAFAF8]">
                        <td className="p-3">
                          <div className="font-medium text-[#1B2A4A]">{k.name}</div>
                          <div className="text-xs text-gray-500">{k.contact_email}</div>
                        </td>
                        <td className="p-3 font-mono text-xs text-gray-700">
                          {k.key_prefix}…
                        </td>
                        <td className="p-3 text-gray-700">{k.org_name || '—'}</td>
                        <td className="p-3">
                          {k.scope.map((sc) => (
                            <Badge key={sc} variant="secondary" className="mr-1 font-mono text-xs">
                              {sc}
                            </Badge>
                          ))}
                        </td>
                        <td className="p-3 text-right text-gray-700">{k.rate_limit_per_minute}</td>
                        <td className="p-3 text-gray-700 text-xs">
                          {k.last_used_at ? formatDate(k.last_used_at) : t('adminApiKeys.never')}
                        </td>
                        <td className="p-3">
                          {s === 'active' && (
                            <Badge className="bg-emerald-100 text-emerald-800">
                              {t('adminApiKeys.statusActive')}
                            </Badge>
                          )}
                          {s === 'revoked' && (
                            <Badge variant="destructive">{t('adminApiKeys.statusRevoked')}</Badge>
                          )}
                          {s === 'expired' && (
                            <Badge className="bg-amber-100 text-amber-800">
                              {t('adminApiKeys.statusExpired')}
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {s === 'active' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-800"
                              onClick={() => setRevokeTarget(k)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
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
            <DialogTitle>{t('adminApiKeys.createTitle')}</DialogTitle>
            <DialogDescription>{t('adminApiKeys.subtitle')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">{t('adminApiKeys.fieldName')}</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Acme Recruitment — Production"
              />
              <p className="text-xs text-gray-500 mt-1">{t('adminApiKeys.fieldNameHelp')}</p>
            </div>
            <div>
              <Label htmlFor="email">{t('adminApiKeys.fieldContactEmail')}</Label>
              <Input
                id="email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="dev@acme.com"
              />
            </div>
            <div>
              <Label htmlFor="org">{t('adminApiKeys.fieldOrgName')}</Label>
              <Input
                id="org"
                value={formOrg}
                onChange={(e) => setFormOrg(e.target.value)}
                placeholder="Acme Recruitment"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="scope">{t('adminApiKeys.fieldScope')}</Label>
                <select
                  id="scope"
                  className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                  value={formScope}
                  onChange={(e) => setFormScope(e.target.value)}
                >
                  <option value="read:catalog">read:catalog</option>
                </select>
              </div>
              <div>
                <Label htmlFor="rate">{t('adminApiKeys.fieldRateLimit')}</Label>
                <Input
                  id="rate"
                  type="number"
                  min={1}
                  max={100000}
                  value={formRate}
                  onChange={(e) => setFormRate(e.target.value)}
                />
              </div>
            </div>
            {createError && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{createError}</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
              {t('adminApiKeys.cancel')}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !formName || !formEmail}
              className="bg-[#9B1B30] hover:bg-[#7A1526] text-white"
            >
              {creating ? t('adminApiKeys.creating') : t('adminApiKeys.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plaintext reveal modal — shown exactly once after creation */}
      <Dialog open={!!reveal} onOpenChange={(open) => !open && setReveal(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-[#9B1B30] flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {t('adminApiKeys.createdTitle')}
            </DialogTitle>
            <DialogDescription>{t('adminApiKeys.createdBody')}</DialogDescription>
          </DialogHeader>
          {reveal && (
            <div className="space-y-3">
              <div className="bg-gray-900 text-green-400 font-mono text-sm p-4 rounded break-all">
                {reveal.plaintext}
              </div>
              <div className="flex justify-end">
                <Button onClick={copyPlaintext} variant="outline">
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-emerald-600" />
                      {t('adminApiKeys.copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      {t('adminApiKeys.copyButton')}
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                {reveal.key.name} · {reveal.key.org_name || 'no org'} · {reveal.key.contact_email}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Revoke confirmation */}
      <AlertDialog
        open={!!revokeTarget}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('adminApiKeys.revokeTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('adminApiKeys.revokeBody')}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label htmlFor="reason">{t('adminApiKeys.revokeReason')}</Label>
            <Textarea
              id="reason"
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              rows={2}
              className="mt-1"
            />
            {revokeTarget && (
              <p className="mt-3 text-sm">
                <span className="font-mono text-gray-600">{revokeTarget.key_prefix}…</span>
                {' — '}
                <span className="font-medium">{revokeTarget.name}</span>
              </p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revoking}>{t('adminApiKeys.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              disabled={revoking}
              className="bg-red-600 hover:bg-red-700"
            >
              {revoking ? '…' : t('adminApiKeys.confirmRevoke')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

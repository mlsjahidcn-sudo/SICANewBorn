'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';

interface NotesPayload {
  application: {
    id: string;
    additionalNotes?: string | null;
    adminNotes?: string | null;
    internalNotes?: string | null;
  };
}

export function NotesTab({ applicationId, onSaved }: { applicationId: string; onSaved?: () => void }) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoaded(false);
    setError(null);
    apiFetchJson<NotesPayload>(`/api/admin/applications/${applicationId}`)
      .then((d) => {
        if (cancelled) return;
        setAdditionalNotes(d.application.additionalNotes || '');
        setAdminNotes(d.application.adminNotes || '');
        setInternalNotes(d.application.internalNotes || '');
        setLoaded(true);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || t('adminAppDetail.notesError'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applicationId, retry, t]);

  const handleSave = async () => {
    if (!loaded || saving) return;
    setSaving(true);
    setError(null);
    setSavedAt(null);
    try {
      // PATCH only the notes fields. The API whitelist at
      // /api/admin/applications/[id] already accepts both.
      await apiFetchJson(`/api/admin/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          additional_notes: additionalNotes,
          admin_notes: adminNotes,
          internal_notes: internalNotes,
        }),
      });
      setSavedAt(new Date().toLocaleTimeString());
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('adminAppDetail.notesError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!loaded) {
    return <div role="alert" className="flex flex-wrap items-center gap-3 border p-4 text-sm">
      <AlertCircle className="size-4 text-[#1B2A4A]" />
      <span>{error}</span>
      <Button variant="outline" size="sm" onClick={() => setRetry(n => n + 1)}>{t('common.retry')}</Button>
    </div>;
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-none">
        <CardContent className="pt-6 space-y-2">
          <label htmlFor="internal-team-note" className="block text-sm font-medium">{t('adminManagement.internalNotes')}</label>
          <p className="text-xs text-gray-500">{t('adminManagement.internalNotesHint')}</p>
          <textarea id="internal-team-note" value={internalNotes} onChange={e => { setInternalNotes(e.target.value); setSavedAt(null); }} rows={6} maxLength={8000} className="w-full p-3 rounded-none border border-gray-300 text-sm" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 space-y-2">
          <label htmlFor="application-additional-notes" className="block text-sm font-medium text-[#1F2937]">
            {t('adminAppDetail.notesAdditionalLabel')}
          </label>
          <p className="text-xs text-gray-500 mb-2">
            {t('adminAppDetail.notesAdditionalHint')}
          </p>
          <textarea
            id="application-additional-notes"
            value={additionalNotes}
            onChange={(e) => { setAdditionalNotes(e.target.value); setSavedAt(null); }}
            rows={6}
            maxLength={2000}
            className="w-full px-3 py-2 rounded-none border border-gray-300 bg-white text-sm"
          />
          <p className="text-xs text-gray-500">
            {additionalNotes.length} / 2000
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-2">
          <label htmlFor="application-student-message" className="block text-sm font-medium text-[#1F2937]">
            {t('adminAppDetail.notesAdminLabel')}
          </label>
          <p className="text-xs text-gray-500 mb-2">
            {t('adminAppDetail.notesAdminHint')}
          </p>
          <textarea
            id="application-student-message"
            value={adminNotes}
            onChange={(e) => { setAdminNotes(e.target.value); setSavedAt(null); }}
            rows={6}
            maxLength={4000}
            className="w-full px-3 py-2 rounded-none border border-gray-300 bg-white text-sm"
          />
          <p className="text-xs text-gray-500">
            {adminNotes.length} / 4000
          </p>
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
      {savedAt && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          {t('adminAppDetail.notesSaved')} · {savedAt}
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#9B1B30] hover:bg-[#7A1625] text-white"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {t('adminAppDetail.notesSave')}
        </Button>
      </div>
    </div>
  );
}

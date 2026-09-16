'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { apiFetch, apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';

interface NotesPayload {
  application: {
    id: string;
    additionalNotes?: string | null;
    adminNotes?: string | null;
  };
}

export function NotesTab({ applicationId }: { applicationId: string }) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiFetchJson<NotesPayload>(`/api/admin/applications/${applicationId}`)
      .then((d) => {
        if (cancelled) return;
        setAdditionalNotes(d.application.additionalNotes || '');
        setAdminNotes(d.application.adminNotes || '');
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
  }, [applicationId, t]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSavedAt(null);
    try {
      // PATCH only the notes fields. The API whitelist at
      // /api/admin/applications/[id] already accepts both.
      await apiFetch(`/api/admin/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          additional_notes: additionalNotes,
          admin_notes: adminNotes,
        }),
      });
      setSavedAt(new Date().toLocaleTimeString());
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

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 space-y-2">
          <label className="block text-sm font-medium text-[#1F2937]">
            {t('adminAppDetail.notesAdditionalLabel')}
          </label>
          <p className="text-xs text-gray-500 mb-2">
            {t('adminAppDetail.notesAdditionalHint')}
          </p>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            rows={6}
            maxLength={2000}
            className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-sm"
          />
          <p className="text-xs text-gray-500">
            {additionalNotes.length} / 2000
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-2">
          <label className="block text-sm font-medium text-[#1F2937]">
            {t('adminAppDetail.notesAdminLabel')}
          </label>
          <p className="text-xs text-gray-500 mb-2">
            {t('adminAppDetail.notesAdminHint')}
          </p>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={6}
            maxLength={4000}
            className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-sm"
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
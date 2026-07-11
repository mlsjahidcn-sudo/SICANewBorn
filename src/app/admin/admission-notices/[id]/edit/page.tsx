'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { AdmissionNoticeForm } from '@/components/admin/AdmissionNoticeForm';
import type { AdmissionNotice } from '@/lib/admission-notices/types';
import { apiFetchJson } from '@/lib/api-client';

interface ApiResponse {
  notice: AdmissionNotice & { publicImageUrl: string | null };
}

export default function EditAdmissionNoticePage() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [notice, setNotice] = useState<AdmissionNotice | null>(null);
  const [publicImageUrl, setPublicImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotice = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      // The list endpoint doesn't have a single-fetch, but the
      // create endpoint returns the single notice. We can hit the
      // admin list and find by id, OR call PATCH with no body to
      // get 400 + a hint, OR just call GET on /[id]... wait, the
      // /[id] route only has PATCH + DELETE. Hmm.
      //
      // The simplest path: hit the list endpoint with a high limit
      // and find by id. For a small admin catalog this is fine.
      // Future: add GET to /api/admin/admission-notices/[id].
      const data = await apiFetchJson<{
        notices: (AdmissionNotice & { publicImageUrl: string | null })[];
      }>(`/api/admin/admission-notices?limit=100`);
      const found = data.notices.find((n) => n.id === id);
      if (!found) {
        setError(t('adminAdmissionNotices.notFound'));
        return;
      }
      setNotice(found);
      setPublicImageUrl(found.publicImageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load');
    } finally {
      setIsLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void fetchNotice();
  }, [fetchNotice]);

  if (isLoading) {
    return <div className="text-center py-12 text-[#4B5563]">{t('adminAdmissionNotices.loading')}</div>;
  }
  if (error || !notice) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 max-w-2xl">
        <p className="text-sm text-red-700">{error || t('adminAdmissionNotices.notFound')}</p>
      </div>
    );
  }
  return (
    <AdmissionNoticeForm
      mode="edit"
      initial={{ ...notice, publicImageUrl }}
    />
  );
}

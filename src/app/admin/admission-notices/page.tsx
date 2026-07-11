'use client';

/**
 * /admin/admission-notices — admin list page.
 *
 * Phase 51: shows all admission notices (drafts + published) with
 * a quick toggle for is_published. Admin can add a new notice or
 * edit/delete an existing one.
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ExternalLink, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { apiFetchJson } from '@/lib/api-client';
import type { AdmissionDegree } from '@/lib/admission-notices/types';

interface AdmissionNotice {
  id: string;
  studentName: string;
  universityName: string;
  program: string | null;
  degree: AdmissionDegree | null;
  intake: string | null;
  scholarship: string | null;
  country: string | null;
  imagePath: string;
  publicImageUrl: string | null;
  isPublished: boolean;
  displayOrder: number;
  createdAt: string;
}

interface ApiResponse {
  notices: AdmissionNotice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminAdmissionNoticesPage() {
  const { t } = useI18n();
  const [notices, setNotices] = useState<AdmissionNotice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchNotices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiFetchJson<ApiResponse>('/api/admin/admission-notices?limit=100');
      setNotices(data.notices || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNotices();
  }, [fetchNotices]);

  const handleTogglePublished = async (notice: AdmissionNotice) => {
    try {
      await apiFetchJson(`/api/admin/admission-notices/${notice.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isPublished: !notice.isPublished }),
      });
      await fetchNotices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('adminAdmissionNotices.deleteConfirm'))) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/admission-notices/${id}`, { method: 'DELETE' });
      await fetchNotices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">
            {t('adminAdmissionNotices.pageTitle')}
          </h1>
          <p className="text-sm text-[#4B5563] mt-1">
            {t('adminAdmissionNotices.pageSubtitle', { count: notices.length })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchNotices}
            variant="outline"
            className="rounded-none border-[#1B2A4A] text-[#1B2A4A]"
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            {t('adminAdmissionNotices.refresh')}
          </Button>
          <Link href="/admin/admission-notices/new">
            <Button className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]">
              <Plus className="h-4 w-4 mr-1" />
              {t('adminAdmissionNotices.addNew')}
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* List */}
      {isLoading && notices.length === 0 ? (
        <div className="text-center py-12 text-[#4B5563]">
          {t('adminAdmissionNotices.loading')}
        </div>
      ) : notices.length === 0 ? (
        <Card className="rounded-none">
          <CardContent className="py-12 text-center">
            <p className="text-[#4B5563] mb-4">{t('adminAdmissionNotices.empty')}</p>
            <Link href="/admin/admission-notices/new">
              <Button className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]">
                <Plus className="h-4 w-4 mr-1" />
                {t('adminAdmissionNotices.addFirst')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notices.map((n) => (
            <Card key={n.id} className="rounded-none overflow-hidden">
              <div className="relative aspect-[3/4] bg-gray-100">
                {n.publicImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={n.publicImageUrl}
                    alt={n.universityName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    {t('adminAdmissionNotices.noImage')}
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {n.isPublished ? (
                    <Badge className="rounded-none bg-green-600 text-white">
                      <Eye className="h-3 w-3 mr-1" />
                      {t('adminAdmissionNotices.statusPublished')}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="rounded-none bg-white/90">
                      <EyeOff className="h-3 w-3 mr-1" />
                      {t('adminAdmissionNotices.statusDraft')}
                    </Badge>
                  )}
                </div>
              </div>
              <CardContent className="p-3">
                <h3 className="font-semibold text-[#1B2A4A] text-sm leading-tight line-clamp-1">
                  {n.studentName}
                </h3>
                <p className="text-xs text-[#4B5563] mt-0.5 line-clamp-1">{n.universityName}</p>
                {n.program && (
                  <p className="text-xs text-[#4B5563] mt-1 line-clamp-1">{n.program}</p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {n.degree && (
                    <Badge variant="outline" className="rounded-none text-[10px]">
                      {n.degree}
                    </Badge>
                  )}
                  {n.country && (
                    <Badge variant="outline" className="rounded-none text-[10px]">
                      {n.country}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-3 pt-3 border-t">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleTogglePublished(n)}
                    className="rounded-none h-7 px-2 text-xs"
                    title={n.isPublished ? t('adminAdmissionNotices.unpublish') : t('adminAdmissionNotices.publish')}
                  >
                    {n.isPublished ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </Button>
                  <Link href={`/admin/admission-notices/${n.id}/edit`} className="flex-1">
                    <Button size="sm" variant="outline" className="rounded-none h-7 px-2 text-xs w-full">
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      {t('adminAdmissionNotices.edit')}
                    </Button>
                  </Link>
                  {n.publicImageUrl && (
                    <a
                      href={n.publicImageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#1B2A4A] hover:text-[#15243f]"
                      title={t('adminAdmissionNotices.viewImage')}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(n.id)}
                    disabled={deletingId === n.id}
                    className="rounded-none h-7 px-2 text-red-600 hover:text-red-700"
                    title={t('adminAdmissionNotices.delete')}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

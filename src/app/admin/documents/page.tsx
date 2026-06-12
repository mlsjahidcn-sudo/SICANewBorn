'use client';

/**
 * Phase 2: /admin/documents — review queue for student-uploaded
 * documents. Filterable by status (default: Pending, the active
 * queue), search by document name, with row links into a detail
 * page where the admin can approve / reject with a reason.
 *
 * The list also supports bulk approve / reject via checkbox
 * selection + a sticky bottom action bar (mirrors the S31
 * admin applications bulk pattern + Phase 1.4 partner bulk).
 *
 * Status colors:
 *   Pending  = amber  — waiting for admin
 *   Verified = emerald — accepted, locked in
 *   Rejected = crimson — needs student re-upload
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  FileCheck,
  FileX,
  Clock,
  ChevronRight,
  AlertCircle,
  Loader2,
  ExternalLink,
  CheckSquare,
  Square,
  X,
  Eye,
  GraduationCap,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { ToastProvider, useToast } from '@/components/admin/toast';
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';

type DocStatus = 'Pending' | 'Verified' | 'Rejected';

interface StudentRef {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

interface PartnerStudentRef {
  id: string;
  student_name: string | null;
  student_email: string | null;
}

interface AdminDocument {
  id: string;
  student_id: string | null;
  application_id: string | null;
  partner_student_id: string | null;
  partner_application_id: string | null;
  document_type_id: string;
  name: string;
  name_cn: string | null;
  category: string;
  file_url: string;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  status: DocStatus | null;
  notes: string | null;
  rejection_reason: string | null;
  uploaded_at: string | null;
  verified_at: string | null;
  verified_by: string | null;
  student: StudentRef | null;
  partnerStudent: PartnerStudentRef | null;
}

interface DocumentsResponse {
  documents: AdminDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const PAGE_SIZE = 20;

const STATUS_STYLES: Record<DocStatus, string> = {
  Pending: 'bg-amber-100 text-amber-800',
  Verified: 'bg-emerald-100 text-emerald-800',
  Rejected: 'bg-red-100 text-red-800',
};

const STATUS_ICONS: Record<DocStatus, React.ElementType> = {
  Pending: Clock,
  Verified: FileCheck,
  Rejected: FileX,
};

const FILTER_TABS: { value: DocStatus | 'all'; key: string }[] = [
  { value: 'Pending',  key: 'adminDocs.filterPending' },
  { value: 'Verified', key: 'adminDocs.filterVerified' },
  { value: 'Rejected', key: 'adminDocs.filterRejected' },
  { value: 'all',      key: 'adminDocs.filterAll' },
];

function fullName(s: StudentRef | null | undefined): string {
  if (!s) return '—';
  return [s.first_name, s.last_name].filter(Boolean).join(' ') || s.email || '—';
}

/**
 * Phase 31: list-page uploader resolver. Student-uploaded docs
 * have `student` populated; partner-uploaded docs have
 * `partnerStudent` populated (student_id is NULL on partner
 * rows). Returns a flag so the UI can render a small "Partner"
 * badge next to the name and disambiguate two students with
 * the same name in different portals.
 */
function uploaderLabel(doc: AdminDocument): { name: string; email: string | null; kind: 'student' | 'partner' | 'unknown' } {
  if (doc.student) {
    return { name: fullName(doc.student), email: doc.student.email, kind: 'student' };
  }
  if (doc.partnerStudent) {
    return {
      name: doc.partnerStudent.student_name || '—',
      email: doc.partnerStudent.student_email,
      kind: 'partner',
    };
  }
  return { name: '—', email: null, kind: 'unknown' };
}

function formatBytes(n: number | null | undefined): string {
  if (!n) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function AdminDocumentsPageInner() {
  const { t } = useI18n();
  const { addToast } = useToast();

  const [statusFilter, setStatusFilter] = useState<DocStatus | 'all'>('Pending');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [docs, setDocs] = useState<AdminDocument[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState<null | 'approve' | 'reject'>(null);
  const [bulkReason, setBulkReason] = useState('');
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  // Debounce search so each keystroke doesn't fire a request
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page when filter / search changes
  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [statusFilter, debouncedSearch]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (debouncedSearch) params.set('search', debouncedSearch);
      const res = await apiFetchJson<DocumentsResponse>(
        `/api/admin/documents?${params.toString()}`,
      );
      setDocs(res.documents || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load documents';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, debouncedSearch]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const counts = useMemo(() => {
    // We don't have per-status totals from the server in this list
    // call (would need a separate count endpoint), so render the
    // simple total here. A future iteration can add a /counts
    // endpoint if admins need it.
    return { total };
  }, [total]);

  const allSelected = docs.length > 0 && docs.every((d) => selected.has(d.id));
  const someSelected = docs.some((d) => selected.has(d.id)) && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(docs.map((d) => d.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submitBulk = async () => {
    if (!bulkOpen) return;
    if (bulkOpen === 'reject' && !bulkReason.trim()) return;
    setBulkSubmitting(true);
    try {
      const res = await apiFetchJson<{ updated: number; failed: { id: string; error: string }[] }>(
        '/api/admin/documents/bulk',
        {
          method: 'POST',
          body: JSON.stringify({
            ids: Array.from(selected),
            status: bulkOpen === 'approve' ? 'Verified' : 'Rejected',
            rejectionReason: bulkOpen === 'reject' ? bulkReason.trim() : null,
          }),
        },
      );
      const ok = res.updated || 0;
      const failed = res.failed?.length || 0;
      if (failed > 0) {
        addToast(
          t(bulkOpen === 'approve' ? 'adminDocs.toastApproved' : 'adminDocs.toastRejected', { n: ok })
            + ` (${failed} failed)`,
          'info',
        );
      } else {
        addToast(
          t(bulkOpen === 'approve' ? 'adminDocs.toastApproved' : 'adminDocs.toastRejected', { n: ok }),
          'success',
        );
      }
      setSelected(new Set());
      setBulkOpen(null);
      setBulkReason('');
      void fetchList();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      addToast(t('adminDocs.toastError', { error: msg }), 'error');
    } finally {
      setBulkSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">{t('adminDocs.title')}</h1>
        <p className="text-sm text-[#4B5563] mt-1">{t('adminDocs.subtitle')}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex gap-1 flex-wrap">
          {FILTER_TABS.map((tab) => {
            const active = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${
                  active
                    ? 'border-[#9B1B30] text-[#1B2A4A]'
                    : 'border-transparent text-gray-500 hover:text-[#1B2A4A] hover:border-gray-200'
                }`}
                type="button"
              >
                {t(tab.key)}
              </button>
            );
          })}
        </div>
        <div className="flex-1 relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('adminDocs.searchPlaceholder')}
            className="rounded-none pl-9"
          />
        </div>
      </div>

      {error && (
        <Card className="rounded-none border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </CardContent>
        </Card>
      )}

      <Card className="rounded-none">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Spinner className="w-6 h-6" />
            </div>
          ) : docs.length === 0 ? (
            <div className="p-12 text-center">
              <FileCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-[#1B2A4A] font-medium">{t('adminDocs.emptyTitle')}</p>
              <p className="text-sm text-[#4B5563] mt-1">{t('adminDocs.emptyBody')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-600">
                  <tr>
                    <th className="px-3 py-3 w-10">
                      <Checkbox
                        checked={allSelected}
                        // indeterminate isn't a native HTML prop — Radix handles via ref
                        onCheckedChange={toggleAll}
                        aria-label="Select all"
                      />
                    </th>
                    <th className="px-3 py-3">{t('adminDocs.columnStudent')}</th>
                    <th className="px-3 py-3">{t('adminDocs.columnDocument')}</th>
                    <th className="px-3 py-3">{t('adminDocs.columnCategory')}</th>
                    <th className="px-3 py-3">{t('adminDocs.columnStatus')}</th>
                    <th className="px-3 py-3">{t('adminDocs.columnUploaded')}</th>
                    <th className="px-3 py-3 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {docs.map((doc) => {
                    const Icon = doc.status ? STATUS_ICONS[doc.status] : Clock;
                    const isSelected = selected.has(doc.id);
                    return (
                      <tr
                        key={doc.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-[#fef2f4]' : ''
                        }`}
                      >
                        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleOne(doc.id)}
                            aria-label={`Select ${doc.name}`}
                          />
                        </td>
                        <td className="px-3 py-3">
                          <div className="font-medium text-[#1B2A4A] inline-flex items-center gap-2">
                            {uploaderLabel(doc).name}
                            {uploaderLabel(doc).kind === 'partner' && (
                              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-none">
                                Partner
                              </span>
                            )}
                          </div>
                          {uploaderLabel(doc).email && (
                            <div className="text-xs text-[#4B5563]">{uploaderLabel(doc).email}</div>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <div className="font-medium text-[#1B2A4A]">{doc.name}</div>
                          {doc.file_name && (
                            <div className="text-xs text-[#4B5563] mt-0.5">
                              {doc.file_name}
                              {doc.file_size ? ` · ${formatBytes(doc.file_size)}` : ''}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 text-[#4B5563]">{doc.category}</td>
                        <td className="px-3 py-3">
                          {doc.status && (
                            <Badge className={`rounded-none ${STATUS_STYLES[doc.status]}`}>
                              <Icon className="w-3 h-3 mr-1" />
                              {doc.status}
                            </Badge>
                          )}
                          {doc.status === 'Rejected' && doc.rejection_reason && (
                            <div className="text-xs text-red-700 mt-1 max-w-xs truncate" title={doc.rejection_reason}>
                              {doc.rejection_reason}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 text-[#4B5563] text-xs">{formatDate(doc.uploaded_at)}</td>
                        <td className="px-3 py-3 text-right">
                          <Link
                            href={`/admin/documents/${doc.id}`}
                            className="text-[#1B2A4A] hover:text-[#9B1B30] inline-flex items-center"
                            aria-label="View details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-[#4B5563]">
          <span>{counts.total} total</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-none"
            >
              Previous
            </Button>
            <span>Page {page} of {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-none"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t-2 border-[#9B1B30] shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => setSelected(new Set())}
                className="p-1 hover:bg-gray-100"
                aria-label="Clear selection"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="font-medium text-[#1B2A4A]">{selected.size} selected</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => { setBulkOpen('approve'); setBulkReason(''); }}
                className="rounded-none border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                <FileCheck className="w-4 h-4 mr-1" />
                {t('adminDocs.bulkApprove')}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setBulkOpen('reject'); setBulkReason(''); }}
                className="rounded-none border-red-300 text-red-700 hover:bg-red-50"
              >
                <FileX className="w-4 h-4 mr-1" />
                {t('adminDocs.bulkReject')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={bulkOpen !== null} onOpenChange={(o) => { if (!o) { setBulkOpen(null); setBulkReason(''); } }}>
        <DialogContent className="rounded-none">
          <DialogHeader>
            <DialogTitle>
              {bulkOpen === 'approve'
                ? t('adminDocs.bulkConfirmApproveTitle', { n: selected.size })
                : t('adminDocs.bulkConfirmRejectTitle', { n: selected.size })}
            </DialogTitle>
            <DialogDescription>
              {bulkOpen === 'approve'
                ? t('adminDocs.bulkConfirmApproveBody')
                : t('adminDocs.bulkConfirmRejectBody')}
            </DialogDescription>
          </DialogHeader>
          {bulkOpen === 'reject' && (
            <Textarea
              value={bulkReason}
              onChange={(e) => setBulkReason(e.target.value)}
              placeholder={t('adminDocs.rejectReasonPlaceholder')}
              rows={3}
              className="rounded-none"
              autoFocus
            />
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setBulkOpen(null); setBulkReason(''); }}
              disabled={bulkSubmitting}
              className="rounded-none"
            >
              {t('adminDocs.detailBackToList') === 'Back to review queue' ? 'Cancel' : '取消'}
            </Button>
            <Button
              onClick={submitBulk}
              disabled={bulkSubmitting || (bulkOpen === 'reject' && !bulkReason.trim())}
              className={`rounded-none ${
                bulkOpen === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-[#9B1B30] hover:bg-[#7a1626]'
              }`}
            >
              {bulkSubmitting && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              {bulkOpen === 'approve' ? t('adminDocs.bulkApprove') : t('adminDocs.bulkReject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminDocumentsPage() {
  return (
    <ToastProvider>
      <AdminDocumentsPageInner />
    </ToastProvider>
  );
}

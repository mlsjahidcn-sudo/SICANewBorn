'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, ClipboardList, Mail, MessageCircle, Calendar, GraduationCap, FileText, Loader2, AlertCircle, CheckCircle, ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiFetchJson, ApiError } from '@/lib/api-client';

interface Assessment {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  whatsapp: string;
  country: string;
  date_of_birth: string | null;
  current_education: string | null;
  intended_major: string | null;
  target_universities: string | null;
  transcript_file_name: string | null;
  transcript_file_size: number | null;
  transcript_file_type: string | null;
  has_transcript: boolean;
  transcript_storage_path: string | null;
  notes: string | null;
  status: 'New' | 'Reviewing' | 'Completed' | 'Rejected';
  reviewer_notes: string | null;
  source_page: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string | null;
}

const STATUS_COLOR: Record<string, string> = {
  New: 'bg-blue-100 text-blue-800',
  Reviewing: 'bg-yellow-100 text-yellow-800',
  Completed: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
};

function calculateAge(dob: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function formatBytes(bytes: number | null) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      params.set('limit', '100');
      const res = await apiFetchJson<{ assessments: Assessment[] }>(
        `/api/admin/assessments?${params}`,
      );
      setAssessments(res.assessments || []);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Failed to load assessments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const filtered = assessments.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.first_name?.toLowerCase().includes(q) ||
      a.last_name?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.whatsapp?.toLowerCase().includes(q) ||
      a.country?.toLowerCase().includes(q)
    );
  });

  const selected = assessments.find((a) => a.id === selectedId) || null;

  const updateStatus = async (id: string, status: Assessment['status']) => {
    setUpdatingId(id);
    try {
      await apiFetchJson(`/api/admin/assessments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setAssessments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Failed to update');
    } finally {
      setUpdatingId(null);
    }
  };

  const downloadTranscript = async (id: string) => {
    setDownloadingId(id);
    try {
      const { downloadUrl, fileName } = await apiFetchJson<{ downloadUrl: string; fileName: string }>(
        `/api/admin/assessments/${id}/download`,
      );
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName || 'transcript';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Failed to download');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937] flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-[#1B2A4A]" />
            Assessments
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Free academic assessment submissions from /assessment. {assessments.length} total.
          </p>
        </div>
      </div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      <Card>
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, email, country, or WhatsApp..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full lg:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <SelectValue placeholder="All Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Reviewing">Reviewing</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className={`${selected ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-3`}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#1B2A4A]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-gray-200 px-4 py-12 text-center text-gray-500">
              {assessments.length === 0
                ? 'No assessments yet. Submissions from /assessment will appear here.'
                : 'No assessments match your filters.'}
            </div>
          ) : (
            filtered.map((a) => {
              const age = calculateAge(a.date_of_birth);
              return (
                <button
                  key={a.id}
                  onClick={() => setSelectedId(a.id)}
                  className={`w-full text-left bg-white border ${
                    selectedId === a.id ? 'border-[#9B1B30] ring-1 ring-[#9B1B30]' : 'border-gray-200'
                  } p-4 hover:border-[#9B1B30]/50 transition-colors`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-10 w-10 bg-[#9B1B30]/10 flex items-center justify-center">
                      <span className="text-[#9B1B30] font-semibold text-sm">
                        {a.first_name?.[0]}
                        {a.last_name?.[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-[#1B2A4A]">
                          {a.first_name} {a.last_name}
                        </h3>
                        <Badge className={STATUS_COLOR[a.status]}>{a.status}</Badge>
                        {age !== null && (
                          <span className="text-xs text-gray-500">{age}y · {a.country}</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1 flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {a.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {a.whatsapp}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 mt-1 flex items-center gap-2 flex-wrap">
                        <GraduationCap className="h-3.5 w-3.5 text-gray-400" />
                        <span>{a.current_education || '—'}</span>
                        {a.intended_major && (
                          <span className="text-gray-500">· {a.intended_major}</span>
                        )}
                        {a.has_transcript && (
                          <span className="text-xs text-[#1B2A4A] flex items-center gap-1 ml-1">
                            <FileText className="h-3 w-3" />
                            {a.transcript_file_name} ({formatBytes(a.transcript_file_size)})
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(a.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {selected && (
          <Card className="lg:col-span-1 h-fit sticky top-6">
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#1B2A4A]">
                    {selected.first_name} {selected.last_name}
                  </h2>
                  <p className="text-sm text-gray-500">{formatDate(selected.created_at)}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>
                  ✕
                </Button>
              </div>

              <div className="space-y-2 text-sm border-b pb-4">
                <a
                  href={`mailto:${selected.email}`}
                  className="flex items-center gap-2 text-[#1B2A4A] hover:underline"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {selected.email}
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href={`https://wa.me/${selected.whatsapp.replace(/[^\d+]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#1B2A4A] hover:underline"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  {selected.whatsapp} (WhatsApp)
                  <ExternalLink className="h-3 w-3" />
                </a>
                <div className="text-gray-600">
                  <span className="font-medium">Country:</span> {selected.country}
                </div>
                {selected.date_of_birth && (
                  <div className="text-gray-600">
                    <span className="font-medium">DOB:</span> {selected.date_of_birth} (
                    {calculateAge(selected.date_of_birth)}y)
                  </div>
                )}
                <div className="text-gray-600">
                  <span className="font-medium">Education:</span> {selected.current_education || '—'}
                </div>
                {selected.intended_major && (
                  <div className="text-gray-600">
                    <span className="font-medium">Intended Major:</span> {selected.intended_major}
                  </div>
                )}
                {selected.target_universities && (
                  <div className="text-gray-600">
                    <span className="font-medium">Target Universities:</span>{' '}
                    {selected.target_universities}
                  </div>
                )}
              </div>

              {selected.has_transcript && (
                <div className="border-b pb-4">
                  <p className="text-sm text-gray-600 font-medium mb-2">Transcript</p>
                  <div className="bg-gray-50 border border-gray-200 p-3 text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#1B2A4A]" />
                    <span className="font-mono text-xs truncate flex-1">{selected.transcript_file_name}</span>
                    <span className="text-xs text-gray-500">
                      ({formatBytes(selected.transcript_file_size)})
                    </span>
                  </div>
                  {selected.transcript_storage_path ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 w-full"
                      disabled={downloadingId === selected.id}
                      onClick={() => downloadTranscript(selected.id)}
                    >
                      {downloadingId === selected.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Download className="h-3 w-3" />
                      )}
                      <span className="ml-1">Download File</span>
                    </Button>
                  ) : (
                    <p className="text-xs text-gray-500 mt-2">
                      ⚠ No file uploaded — request by email.
                    </p>
                  )}
                </div>
              )}

              {selected.notes && (
                <div className="border-b pb-4">
                  <p className="text-sm text-gray-600 font-medium mb-2">Notes</p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{selected.notes}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Status</p>
                <div className="flex flex-wrap gap-2">
                  {(['New', 'Reviewing', 'Completed', 'Rejected'] as const).map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={selected.status === s ? 'default' : 'outline'}
                      disabled={updatingId === selected.id}
                      onClick={() => updateStatus(selected.id, s)}
                      className={
                        selected.status === s
                          ? s === 'Completed'
                            ? 'bg-green-600 hover:bg-green-700'
                            : s === 'Rejected'
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-[#1B2A4A] hover:bg-[#152033]'
                          : ''
                      }
                    >
                      {updatingId === selected.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : selected.status === s ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : null}
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

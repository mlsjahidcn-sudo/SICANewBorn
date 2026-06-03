'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, Calendar, Building, BookOpen, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiFetchJson } from '@/lib/api-client';
import type {
  PartnerApplication,
  PartnerApplicationStatus,
  PartnerApplicationDecision,
} from '@/lib/partner-application-mapper';
import {
  PARTNER_APPLICATION_STATUSES,
  PARTNER_APPLICATION_DECISIONS,
} from '@/lib/partner-application-mapper';

const STATUS_VARIANTS: Record<PartnerApplicationStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'Draft': 'secondary',
  'Submitted': 'outline',
  'In Review': 'outline',
  'Accepted': 'default',
  'Rejected': 'destructive',
  'Withdrawn': 'outline',
};

export default function PartnerApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;

  const [app, setApp] = useState<PartnerApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!applicationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetchJson<{ application: PartnerApplication }>(
        `/api/partner/applications/${applicationId}`,
      );
      setApp(res.application);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load application.');
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/partner/applications/${applicationId}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Delete failed (HTTP ${res.status})`);
      }
      router.push('/partner/applications');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.');
      setIsDeleting(false);
      setShowDelete(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 animate-pulse w-48" />
        <div className="h-64 bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (error && !app) {
    return (
      <div className="space-y-4">
        <Link href="/partner/applications" className="inline-flex items-center gap-2 text-[#1B2A4A]">
          <ArrowLeft className="w-4 h-4" /> Back to applications
        </Link>
        <Card className="rounded-none border-red-200 bg-red-50">
          <CardContent className="p-6 text-red-700 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <p className="font-medium">Couldn't load application</p>
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!app) return null;

  return (
    <div className="space-y-6">
      {showDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full mx-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-[#1B2A4A] mb-4">Delete Application</h3>
            <p className="text-[#4B5563] mb-6">
              Delete application for <strong>{app.studentName}</strong> at {app.university}? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDelete(false)}
                disabled={isDeleting}
                className="rounded-none"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Link href="/partner/applications" className="p-2 hover:bg-gray-100 inline-flex">
          <ArrowLeft className="w-5 h-5 text-[#1B2A4A]" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1B2A4A]">{app.studentName}</h1>
            <Badge variant={STATUS_VARIANTS[app.status]} className="rounded-none">
              {app.status}
            </Badge>
            <Badge variant="outline" className="rounded-none">
              {app.decision}
            </Badge>
          </div>
          <p className="text-[#4B5563] mt-1 text-sm">
            {app.university} · {app.program}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="rounded-none">
            <Link href={`/partner/applications/${app.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDelete(true)}
            className="rounded-none border-red-300 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {error && (
        <Card className="rounded-none border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A] flex items-center gap-2">
              <Building className="w-4 h-4" /> University & Program
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field label="University" value={app.university} />
            <Field label="Program" value={app.program} />
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A] flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-[#4B5563] min-w-24">Status:</span>
              <Badge variant={STATUS_VARIANTS[app.status]} className="rounded-none">
                {app.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#4B5563] min-w-24">Decision:</span>
              <Badge variant="outline" className="rounded-none">{app.decision}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#4B5563] min-w-24">Submitted:</span>
              <span className="text-[#1F2937]">
                {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : '—'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="text-[#1B2A4A]">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          {app.notes ? (
            <p className="text-sm text-[#1F2937] whitespace-pre-wrap">{app.notes}</p>
          ) : (
            <p className="text-sm text-[#4B5563] italic">No notes recorded yet.</p>
          )}
          <p className="text-xs text-[#4B5563] mt-4 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Created {app.createdAt ? new Date(app.createdAt).toLocaleString() : '—'}
            {app.updatedAt && app.updatedAt !== app.createdAt && (
              <> · Updated {new Date(app.updatedAt).toLocaleString()}</>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[#4B5563] min-w-24">{label}:</span>
      <span className="font-medium text-[#1F2937]">{value || '—'}</span>
    </div>
  );
}

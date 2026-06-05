'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Edit, Trash2, Calendar, Building, BookOpen, AlertTriangle,
  Mail, Phone, Globe, Hash, Flag, Send, CheckCircle2, XCircle, X, Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { apiFetchJson } from '@/lib/api-client';
import type {
  PartnerApplication,
  PartnerApplicationStatus,
  PartnerApplicationDecision,
  PartnerApplicationPriority,
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

// Phase 4: partner-driven status transitions. The partner can move an
// application forward in the pipeline (Draft → Submitted → In Review →
// Accepted / Rejected) and back (Submitted → Draft, In Review → Draft).
// Withdrawn and the terminal decisions are also reachable. We keep
// this in a small allow-list so a UI bug or stale button can't write
// a status that's nonsensical in the partner workflow.
const PARTNER_STATUS_TRANSITIONS: Record<PartnerApplicationStatus, PartnerApplicationStatus[]> = {
  Draft: ['Draft', 'Submitted', 'Withdrawn'],
  Submitted: ['Submitted', 'In Review', 'Draft', 'Withdrawn'],
  'In Review': ['In Review', 'Accepted', 'Rejected', 'Withdrawn'],
  Accepted: ['Accepted'],
  Rejected: ['Rejected', 'Draft'], // partner can re-open a rejection
  Withdrawn: ['Withdrawn', 'Draft'], // partner can re-open a withdrawal
};

const PRIORITY_VARIANTS: Record<PartnerApplicationPriority, string> = {
  Low: 'bg-gray-100 text-gray-700',
  Normal: 'bg-blue-50 text-blue-700',
  High: 'bg-orange-100 text-orange-800',
  Urgent: 'bg-[#9B1B30] text-white',
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
  // Phase 4: status workflow. We always show a confirmation dialog
  // before flipping status — destructive transitions get a stronger
  // copy, routine transitions get a "are you sure" footer.
  const [statusPending, setStatusPending] = useState<PartnerApplicationStatus | null>(null);
  const [statusConfirming, setStatusConfirming] = useState<PartnerApplicationStatus | null>(null);

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

  const handleStatusChange = async (nextStatus: PartnerApplicationStatus) => {
    if (!app) return;
    setStatusPending(nextStatus);
    try {
      const res = await apiFetchJson<{ application: PartnerApplication }>(
        `/api/partner/applications/${applicationId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            status: nextStatus,
            // Auto-stamp submittedAt on the Draft → Submitted transition.
            // The PATCH endpoint keeps an existing value if already set.
            ...(app.status === 'Draft' && nextStatus === 'Submitted' && !app.submittedAt
              ? { submittedAt: new Date().toISOString() }
              : {}),
          }),
        },
      );
      setApp(res.application);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to set status to ${nextStatus}.`);
    } finally {
      setStatusPending(null);
    }
  };

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
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[#1B2A4A]">{app.studentName}</h1>
            <Badge variant={STATUS_VARIANTS[app.status]} className="rounded-none">
              {app.status}
            </Badge>
            <Badge variant="outline" className="rounded-none">
              {app.decision}
            </Badge>
            {app.priority && app.priority !== 'Normal' && (
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-none ${PRIORITY_VARIANTS[app.priority]}`}
                title="Partner-set priority"
              >
                <Flag className="w-3 h-3" /> {app.priority}
              </span>
            )}
          </div>
          <p className="text-[#4B5563] mt-1 text-sm">
            {app.university} · {app.program}
            {app.applicationNumber && (
              <span className="ml-2 font-mono text-xs text-gray-400">
                {app.applicationNumber}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
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

      {/* Phase 4: Quick status update panel — only shows transitions
          the partner can drive from the current state. Lets the partner
          mark Submitted / In Review / Accepted / Rejected without
          opening the full edit form. */}
      {(() => {
        const next = PARTNER_STATUS_TRANSITIONS[app.status] || [];
        const actionable = next.filter((s) => s !== app.status);
        if (actionable.length === 0) return null;
        return (
          <Card className="rounded-none">
            <CardHeader className="border-b border-gray-200 pb-3">
              <CardTitle className="text-base text-[#1B2A4A] flex items-center gap-2">
                <Send className="w-4 h-4" />
                Quick status update
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-sm text-[#4B5563] mb-3">
                Move this application to the next state. The student and SICA
                admin will see the new status immediately.
              </p>
              <div className="flex flex-wrap gap-2">
                {actionable.map((target) => {
                  const label =
                    target === 'Submitted' ? 'Mark as Submitted'
                    : target === 'In Review' ? 'Move to In Review'
                    : target === 'Accepted' ? 'Mark Accepted'
                    : target === 'Rejected' ? 'Mark Rejected'
                    : target === 'Withdrawn' ? 'Withdraw'
                    : target === 'Draft' ? 'Reopen as Draft'
                    : `Set ${target}`;
                  const isPending = statusPending === target;
                  const isDestructive = target === 'Rejected' || target === 'Withdrawn';
                  return (
                    <Button
                      key={target}
                      size="sm"
                      variant={isDestructive ? 'outline' : 'default'}
                      disabled={statusPending !== null}
                      onClick={() => setStatusConfirming(target)}
                      className={
                        isDestructive
                          ? 'rounded-none border-red-300 text-red-600 hover:bg-red-50'
                          : 'rounded-none bg-[#1B2A4A] hover:bg-[#26345A] text-white'
                      }
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" /> Updating…
                        </>
                      ) : target === 'Accepted' ? (
                        <CheckCircle2 className="mr-2 h-3 w-3" />
                      ) : target === 'Rejected' || target === 'Withdrawn' ? (
                        <XCircle className="mr-2 h-3 w-3" />
                      ) : (
                        <Send className="mr-2 h-3 w-3" />
                      )}
                      {label}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })()}

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
            <Field label="Intake" value={app.intake} />
            <Field label="Degree" value={app.degree} />
            <Field label="Application #" value={app.applicationNumber} mono />
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A] flex items-center gap-2">
              <UserIcon name="book" className="w-4 h-4" /> Status
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
              <span className="text-[#4B5563] min-w-24">Priority:</span>
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-none ${PRIORITY_VARIANTS[app.priority]}`}
              >
                <Flag className="w-3 h-3" /> {app.priority}
              </span>
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
          <CardTitle className="text-[#1B2A4A] flex items-center gap-2">
            <Mail className="w-4 h-4" /> Student Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {app.studentEmail ? (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#4B5563]" />
              <a
                href={`mailto:${app.studentEmail}`}
                className="text-[#1B2A4A] hover:underline"
              >
                {app.studentEmail}
              </a>
            </div>
          ) : (
            <p className="text-sm text-[#4B5563] italic">No email on file.</p>
          )}
          {app.studentPhone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#4B5563]" />
              <a href={`tel:${app.studentPhone}`} className="text-[#1B2A4A] hover:underline">
                {app.studentPhone}
              </a>
            </div>
          )}
          {app.nationality && (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#4B5563]" />
              <span className="text-[#1F2937]">{app.nationality}</span>
            </div>
          )}
          {app.createdByEmail && (
            <div className="text-xs text-[#4B5563] pt-2 border-t border-gray-100 mt-2">
              Added by <span className="font-medium text-[#1B2A4A]">{app.createdByEmail}</span>
              {app.createdAt && (
                <> on {new Date(app.createdAt).toLocaleDateString()}</>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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

      {/* Phase 4: confirmation dialog for the Quick Status Update panel.
          Wording is tailored per (from, to) pair so the partner knows
          exactly what they're committing to. Destructive transitions
          (Rejected, Withdrawn) get a red confirm button + explicit
          "this signals X" copy; routine transitions stay calm. */}
      <StatusChangeDialog
        fromStatus={app.status}
        toStatus={statusConfirming}
        studentName={app.studentName}
        university={app.university}
        program={app.program}
        isPending={statusPending !== null}
        onConfirm={async () => {
          if (!statusConfirming) return;
          const target = statusConfirming;
          setStatusConfirming(null);
          await handleStatusChange(target);
        }}
        onCancel={() => {
          if (statusPending === null) setStatusConfirming(null);
        }}
      />
    </div>
  );
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[#4B5563] min-w-24">{label}:</span>
      <span className={`font-medium text-[#1F2937] ${mono ? 'font-mono' : ''}`}>
        {value || '—'}
      </span>
    </div>
  );
}

// Local icon shim — keeps the import block short and matches the
// pattern used elsewhere in the partner portal.
function UserIcon({ name, className }: { name: string; className?: string }) {
  // We import BookOpen statically at the top of the file and re-use
  // it here. The "name" param is a future-proofing hook for the day
  // we want to add a User icon next to student info.
  if (name === 'book') return <BookOpen className={className} />;
  return <BookOpen className={className} />;
}

/**
 * Phase 4: confirmation dialog for the Quick Status Update panel.
 * Wording is per (from, to) pair so the partner always knows what
 * they're committing to. Destructive transitions (Rejected, Withdrawn)
 * get a red confirm button + stronger copy; routine transitions stay
 * calm. Built on shadcn AlertDialog so the focus trap + ESC dismissal
 * work out of the box.
 *
 * When `toStatus` is null the dialog is closed (shadcn handles
 * unmounting when open flips to false).
 */
function StatusChangeDialog({
  fromStatus,
  toStatus,
  studentName,
  university,
  program,
  isPending,
  onConfirm,
  onCancel,
}: {
  fromStatus: PartnerApplicationStatus;
  toStatus: PartnerApplicationStatus | null;
  studentName: string;
  university: string;
  program: string;
  isPending: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}) {
  // Per-transition copy. Anything not in the table falls back to a
  // generic "are you sure" footer, so a future transition added to
  // PARTNER_STATUS_TRANSITIONS doesn't render a broken dialog.
  const COPY: Record<string, { title: string; body: string; confirmLabel: string; destructive: boolean }> = {
    'Draft->Submitted': {
      title: 'Mark this application as Submitted?',
      body: `SICA will see ${studentName}'s application in the review queue and a Submitted timestamp will be recorded on the row. You can still move it back to Draft if you need to make a change.`,
      confirmLabel: 'Yes, mark as Submitted',
      destructive: false,
    },
    'Draft->Withdrawn': {
      title: 'Withdraw this draft?',
      body: `The application for ${studentName} at ${university} will be marked Withdrawn. You can re-open it as a Draft later if you change your mind — the row stays on file.`,
      confirmLabel: 'Yes, withdraw',
      destructive: true,
    },
    'Submitted->In Review': {
      title: 'Move this application to In Review?',
      body: `This signals to SICA admin that ${studentName}'s application is actively being evaluated. Use this when you've actually started the review conversation.`,
      confirmLabel: 'Yes, move to In Review',
      destructive: false,
    },
    'Submitted->Draft': {
      title: 'Move this application back to Draft?',
      body: `The Submitted timestamp is kept on the row, but the application leaves SICA's review queue. Use this if you need to fix something before review starts.`,
      confirmLabel: 'Yes, move back to Draft',
      destructive: false,
    },
    'Submitted->Withdrawn': {
      title: 'Withdraw this submitted application?',
      body: `${studentName}'s application at ${university} will be marked Withdrawn. SICA admin will see it leave the queue. You can re-open it later if circumstances change.`,
      confirmLabel: 'Yes, withdraw',
      destructive: true,
    },
    'In Review->Accepted': {
      title: `Mark ${studentName}'s application as Accepted?`,
      body: `This is a big deal — it tells SICA admin and the student that the university has accepted them. Make sure the acceptance is real and documented before confirming.`,
      confirmLabel: 'Yes, mark Accepted',
      destructive: false,
    },
    'In Review->Rejected': {
      title: `Mark ${studentName}'s application as Rejected?`,
      body: `This will signal the bad news to the student and SICA. The application is still on file and can be re-opened as a Draft later if there's new information.`,
      confirmLabel: 'Yes, mark Rejected',
      destructive: true,
    },
    'In Review->Withdrawn': {
      title: `Withdraw ${studentName}'s application?`,
      body: `This is an unusual move — the application is already in the review queue. Withdrawing now will pull it out. The student and SICA admin will both be affected.`,
      confirmLabel: 'Yes, withdraw',
      destructive: true,
    },
    'Rejected->Draft': {
      title: 'Re-open this rejection as a Draft?',
      body: `The original Rejected status and any admin notes are preserved on the timeline. The application goes back to Draft so you can edit fields and resubmit.`,
      confirmLabel: 'Yes, re-open as Draft',
      destructive: false,
    },
    'Withdrawn->Draft': {
      title: 'Re-open this withdrawal as a Draft?',
      body: `The application goes back to Draft so you can edit and submit again. The previous Withdrawn event is preserved on the timeline.`,
      confirmLabel: 'Yes, re-open as Draft',
      destructive: false,
    },
  };

  const key = `${fromStatus}->${toStatus}`;
  const copy = toStatus
    ? COPY[key] || {
        title: `Change status to ${toStatus}?`,
        body: `Move ${studentName}'s application at ${university} (${program}) from ${fromStatus} to ${toStatus}.`,
        confirmLabel: `Yes, set to ${toStatus}`,
        destructive: false,
      }
    : null;

  return (
    <AlertDialog
      // Force-closed if no target — shadcn renders nothing.
      open={toStatus !== null}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <AlertDialogContent className="rounded-none">
        {copy && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[#1B2A4A]">
                {copy.title}
              </AlertDialogTitle>
              <AlertDialogDescription>{copy.body}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={isPending}
                onClick={(e) => {
                  e.preventDefault();
                  onCancel();
                }}
                className="rounded-none"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={isPending}
                onClick={(e) => {
                  e.preventDefault();
                  void onConfirm();
                }}
                className={
                  copy.destructive
                    ? 'rounded-none bg-red-600 hover:bg-red-700 text-white'
                    : 'rounded-none bg-[#1B2A4A] hover:bg-[#26345A] text-white'
                }
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating…
                  </>
                ) : (
                  copy.confirmLabel
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}

'use client';

/**
 * Phase 107 / Batch 3 — admin Timeline tab.
 *
 * Fetches /api/admin/applications/[id]/timeline once on mount and
 * renders merged stage_history + application_timeline rows newest-
 * first. Admin view: internal-flagged rows (note starts with
 * [internal]) are surfaced with a small badge so the admin
 * remembers what they hid from the student.
 */

import React, { useEffect, useState } from 'react';
import { Clock, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import {
  mapStageHistoryFromDb,
  isInternalNote,
  mergeTimelineForAdmin,
  type StageHistoryDbRow,
  type StageHistoryRow,
  type UnifiedTimelineEvent,
} from '@/lib/application-history-mapper';

interface TimelineResponse {
  stageHistory: StageHistoryRow[];
  timelineNotes: Array<{
    id: string;
    status: string | null;
    notes: string | null;
    created_at: string;
    created_by: string | null;
  }>;
}

export function TimelineTab({ applicationId }: { applicationId: string }) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<UnifiedTimelineEvent[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetchJson<TimelineResponse>(
          `/api/admin/applications/${applicationId}/timeline`,
        );
        if (cancelled) return;
        // Re-normalize the response into StageHistoryRow[] (already done
        // server-side; we re-apply here for type safety) and merge.
        const stage = (res.stageHistory ?? []).map((r) =>
          mapStageHistoryFromDb(r as unknown as StageHistoryDbRow),
        );
        const merged = mergeTimelineForAdmin(
          stage,
          (res.timelineNotes ?? []).map((n) => ({
            id: n.id,
            status: n.status,
            notes: n.notes,
            createdAt: n.created_at,
            createdBy: n.created_by,
          })),
        );
        setEvents(merged);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : t('common.error'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applicationId, t]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-[#4B5563]">
        <Loader2 className="w-4 h-4 animate-spin" />
        {t('common.loading')}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm flex items-start gap-2">
        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-white border border-gray-200 p-6 text-center text-sm text-[#4B5563]">
        <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        {t('adminAppDetail.timelineEmpty')}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <TimelineRow key={event.id} event={event} />
      ))}
    </div>
  );
}

function TimelineRow({ event }: { event: UnifiedTimelineEvent }) {
  const { t } = useI18n();
  const internal = isInternalNote(event.note);
  return (
    <div
      className={`border p-3 bg-white ${
        internal ? 'border-amber-300 bg-amber-50/40' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#1B2A4A]">
              {event.kind === 'stage'
                ? t('adminAppDetail.timelineKindStage')
                : t('adminAppDetail.timelineKindNote')}
            </span>
            {event.kind === 'stage' && event.fromStatus && event.toStatus && (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-[#1F2937]">
                {event.fromStatus}
                <ArrowRight className="h-3 w-3 text-gray-400" />
                {event.toStatus}
              </span>
            )}
            {event.kind === 'stage' && !event.fromStatus && event.toStatus && (
              <span className="inline-flex items-center gap-1 text-sm font-medium text-[#1F2937]">
                {event.toStatus}
              </span>
            )}
            {internal && (
              <span className="text-[10px] px-1.5 py-0.5 font-semibold uppercase tracking-wide bg-amber-200 text-amber-900">
                {t('adminAppDetail.timelineInternalBadge')}
              </span>
            )}
          </div>
          {event.note && (
            <p className="text-sm text-[#4B5563] mt-1 whitespace-pre-wrap break-words">
              {event.note}
            </p>
          )}
        </div>
        <div className="text-right text-xs text-gray-500 flex-shrink-0">
          <div>{event.actorLabel}</div>
          <div>{new Date(event.timestamp).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Layers,
  Loader2,
  Plus,
  Receipt,
  AlertTriangle,
} from 'lucide-react';
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';

interface StudentFeeEvent {
  id: string;
  fee_id: string;
  event_type:
    | 'created'
    | 'status_changed'
    | 'amount_paid_changed'
    | 'payment_proof_uploaded'
    | 'bulk_action';
  actor_id: string | null;
  actor_email: string | null;
  from_status: string | null;
  to_status: string | null;
  amount_paid_at_event: number | string | null;
  note: string | null;
  created_at: string;
}

interface EventsResponse {
  events: StudentFeeEvent[];
  maxEvents: number;
}

const EVENT_LABEL_KEY: Record<StudentFeeEvent['event_type'], string> = {
  created: 'adminFees.timelineEventCreated',
  status_changed: 'adminFees.timelineEventStatusChanged',
  amount_paid_changed: 'adminFees.timelineEventAmountPaidChanged',
  payment_proof_uploaded: 'adminFees.timelineEventPaymentProof',
  bulk_action: 'adminFees.timelineEventBulkAction',
};

const EVENT_ICON = {
  created: Plus,
  status_changed: ArrowRight,
  amount_paid_changed: CheckCircle,
  payment_proof_uploaded: Receipt,
  bulk_action: Layers,
} as const;

export function FeeTimelineTab({ feeId }: { feeId: string }) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<StudentFeeEvent[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiFetchJson<EventsResponse>(`/api/admin/fees/${feeId}/events`)
      .then((d) => {
        if (!cancelled) setEvents(d.events || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || t('adminFees.timelineLoadError'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [feeId, t]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-6 text-gray-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-6 text-red-600">
        <AlertTriangle className="h-4 w-4" />
        {error}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex items-center gap-2 p-6 text-gray-500">
        <Clock className="h-4 w-4" />
        {t('adminFees.timelineNoEvents')}
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {events.map((evt) => {
        const Icon = EVENT_ICON[evt.event_type];
        const labelKey = EVENT_LABEL_KEY[evt.event_type];
        const isBulk = evt.event_type === 'bulk_action';
        const statusPair =
          evt.from_status && evt.to_status
            ? t('adminFees.timelineFromTo', {
                from: evt.from_status,
                to: evt.to_status,
              })
            : evt.to_status || '';
        return (
          <li
            key={evt.id}
            className="border-l-4 border-[#1B2A4A] pl-4 py-2 bg-white"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-[#1B2A4A]">
              <Icon className="h-4 w-4" />
              {t(labelKey)}
              {isBulk && (
                <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                  {t('adminFees.timelineBulkChip', { count: 0 })}
                </span>
              )}
            </div>
            {statusPair && (
              <div className="text-sm text-gray-700 mt-1">{statusPair}</div>
            )}
            {evt.amount_paid_at_event != null && (
              <div className="text-xs text-gray-500 mt-0.5">
                amount_paid = {Number(evt.amount_paid_at_event).toLocaleString()}
              </div>
            )}
            {evt.note && (
              <div className="text-xs text-gray-500 mt-0.5 whitespace-pre-wrap">
                {evt.note}
              </div>
            )}
            <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
              <span>{new Date(evt.created_at).toLocaleString()}</span>
              {evt.actor_email && (
                <span>
                  {t('adminFees.timelineBy', { email: evt.actor_email })}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
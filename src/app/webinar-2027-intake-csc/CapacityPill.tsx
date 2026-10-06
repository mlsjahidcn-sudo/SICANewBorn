'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Users } from 'lucide-react';

interface CapacityData {
  maxAttendees: number;
  seatHolders: number;
  seatsRemaining: number;
  isFull: boolean;
  acceptsSignups: boolean;
}

/**
 * Phase 142: live capacity readout. Polls /api/webinar-sessions/capacity
 * every 30s so the count stays fresh even though the public RSC
 * is statically cached (revalidate = 3600).
 *
 * Renders three flavors:
 *   - "23 of 50 seats remaining" when not full
 *   - "1 seat remaining"  when only one is left
 *   - "Session full"      when seatsRemaining <= 0
 */
export function CapacityPill({ initial }: { initial: CapacityData | null }) {
  const { t } = useI18n();
  const [data, setData] = useState<CapacityData | null>(initial);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch('/api/webinar-sessions/capacity', { cache: 'no-store' });
        if (!res.ok) return;
        const next = (await res.json()) as CapacityData;
        if (!cancelled) setData(next);
      } catch {
        // Swallow — the pill just stays at the SSR-rendered
        // value. The signup POST still uses the authoritative
        // server-side count for the 409 check.
      }
    };
    const id = setInterval(tick, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!data) return null;

  const { seatsRemaining, maxAttendees, isFull } = data;

  if (isFull) {
    return (
      <div className="mt-3 inline-flex items-center gap-2 bg-[#9B1B30]/15 border border-[#9B1B30]/40 px-4 py-2 text-sm text-[#9B1B30] font-semibold">
        <Users className="h-4 w-4" />
        <span>{t('webinar.seatsRemainingNone')}</span>
      </div>
    );
  }

  const text =
    seatsRemaining === 1
      ? t('webinar.seatsRemainingSingle', { remaining: seatsRemaining })
      : t('webinar.seatsRemaining', { remaining: seatsRemaining, total: maxAttendees });

  return (
    <div className="mt-3 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-800">
      <Users className="h-4 w-4" />
      <span className="font-semibold">{text}</span>
    </div>
  );
}
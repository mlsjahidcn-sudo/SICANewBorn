'use client';

import { useEffect, useState } from 'react';
import { Clock, Users, Hourglass } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface Props {
  slug: string;
  /** ISO start (webinar_sessions.session_date) — null until staff sets it. */
  startsAt: string | null;
  /** Display string from DB, e.g. "9:00 PM Beijing · 7:00 PM Dhaka". */
  sessionTimeLabel: string | null;
  initialSeatsLeft: number | null;
  initialSeatCap: number | null;
  initialFormMode: 'signup' | 'waitlist' | 'closed';
}

interface CapacityResponse {
  seatsLeft: number | null;
  seatCap: number | null;
  formMode: 'signup' | 'waitlist' | 'closed';
}

/**
 * Phase 161: hero widget cluster for /webinar/[slug] — countdown,
 * visitor-local time, and the seats-left pill. One component so the
 * 30s capacity poll happens once and everything stays in sync.
 *
 * Hydration-safe: countdown + local time render empty on the server
 * pass and fill in on mount (Date.now / Intl are client-only here —
 * the react-hooks/purity rule also forbids Date.now in render, so
 * every time read lives inside useEffect or its callbacks).
 */
export function WebinarHeroWidgets({
  slug,
  startsAt,
  sessionTimeLabel,
  initialSeatsLeft,
  initialSeatCap,
  initialFormMode,
}: Props) {
  const { t } = useI18n();
  const [capacity, setCapacity] = useState<CapacityResponse>({
    seatsLeft: initialSeatsLeft,
    seatCap: initialSeatCap,
    formMode: initialFormMode,
  });
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [localTimeLabel, setLocalTimeLabel] = useState<string | null>(null);

  // Single ticking clock for the countdown. setInterval callback is
  // not render — Date.now() is allowed there.
  useEffect(() => {
    setNowMs(Date.now());
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Visitor's local rendering of the start instant.
  useEffect(() => {
    if (!startsAt) return;
    try {
      const start = new Date(startsAt);
      const fmt = new Intl.DateTimeFormat(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      setLocalTimeLabel(fmt.format(start));
    } catch {
      setLocalTimeLabel(null);
    }
  }, [startsAt]);

  // Capacity poll every 30s (mirrors the Phase 142 CapacityPill cadence;
  // the endpoint sets a 30s browser cache so bursts share one upstream).
  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch(`/api/webinars/${encodeURIComponent(slug)}/capacity`, {
          cache: 'no-store',
        });
        if (!res.ok) return;
        const json = (await res.json()) as CapacityResponse;
        if (!cancelled) setCapacity(json);
      } catch {
        // keep the last known values
      }
    };
    const timer = setInterval(poll, 30_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [slug]);

  const msLeft =
    startsAt && nowMs !== null ? new Date(startsAt).getTime() - nowMs : null;
  const countdown = (() => {
    if (msLeft === null) return null;
    if (msLeft <= 0) return { started: true as const };
    const totalSec = Math.floor(msLeft / 1000);
    return {
      started: false as const,
      days: Math.floor(totalSec / 86400),
      hours: Math.floor((totalSec % 86400) / 3600),
      minutes: Math.floor((totalSec % 3600) / 60),
      seconds: totalSec % 60,
    };
  })();

  return (
    <div className="mt-8 flex flex-col items-center gap-4">
      {/* Time row: DB display label (Beijing · Dhaka) + visitor local */}
      <div className="inline-flex flex-wrap justify-center items-center gap-2 bg-[#D4A853]/15 border border-[#D4A853]/40 px-4 py-2 text-sm">
        <Clock className="h-4 w-4 text-[#D4A853]" />
        {sessionTimeLabel && (
          <span className="text-[#D4A853] font-semibold">{sessionTimeLabel}</span>
        )}
        {localTimeLabel && (
          <>
            <span className="text-white/40">·</span>
            <span className="text-white/80">
              {t('webinar.page.localTime', { time: localTimeLabel })}
            </span>
          </>
        )}
      </div>

      {/* Countdown */}
      {startsAt && (
        <div className="flex items-center gap-3" suppressHydrationWarning>
          {countdown === null ? (
            <span className="text-white/60 text-sm">—</span>
          ) : countdown.started ? (
            <span className="inline-flex items-center gap-2 bg-[#9B1B30] px-4 py-2 text-sm font-bold uppercase tracking-wider text-white">
              <Hourglass className="h-4 w-4" />
              {t('webinar.page.started')}
            </span>
          ) : (
            <div className="flex items-center gap-2" aria-label={t('webinar.page.countdownLabel')}>
              {(
                [
                  [countdown.days, t('webinar.page.unitDays')],
                  [countdown.hours, t('webinar.page.unitHours')],
                  [countdown.minutes, t('webinar.page.unitMinutes')],
                  [countdown.seconds, t('webinar.page.unitSeconds')],
                ] as const
              ).map(([value, label]) => (
                <div
                  key={label}
                  className="bg-white/10 border border-white/20 px-3 py-2 text-center min-w-[64px]"
                >
                  <div className="text-xl font-extrabold text-white tabular-nums">
                    {String(value).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-white/60">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Seats-left pill */}
      <div className="inline-flex items-center gap-2 text-sm">
        <Users className="h-4 w-4 text-white/70" />
        {capacity.formMode === 'closed' ? (
          <span className="text-white/70 font-semibold">
            {t('webinar.page.closed')}
          </span>
        ) : capacity.seatCap === null ? (
          <span className="text-white/70">{t('webinar.page.uncapped')}</span>
        ) : capacity.formMode === 'waitlist' || capacity.seatsLeft === 0 ? (
          <span className="text-[#D4A853] font-semibold">
            {t('webinar.page.fullPill', { total: capacity.seatCap ?? 0 })}
          </span>
        ) : (
          <span className="text-emerald-300 font-semibold">
            {t('webinar.page.seatsLeft', {
              count: capacity.seatsLeft ?? 0,
              total: capacity.seatCap ?? 0,
            })}
          </span>
        )}
      </div>
    </div>
  );
}

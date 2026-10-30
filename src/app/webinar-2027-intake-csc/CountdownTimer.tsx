'use client';

/**
 * Phase 162: countdown timer client island.
 *
 * Mounts on the hero of /webinar-2027-intake-csc between the
 * date pill and the CTA buttons. Reads the active session's
 * `sessionDate` + `sessionTime` and renders a `dd:hh:mm:ss`
 * countdown that updates every 1s via setInterval.
 *
 * Self-hides once `now >= sessionDate` — Phase 162's
 * "registration closes after the webinar day" rule swaps the
 * page's CTA + form to a closed-state view at that point, so
 * the countdown showing "0d 00:00:00" would be noise.
 *
 * Renders nothing (returns null) when `sessionDate` is null
 * (the staff hasn't confirmed the date) or when the parent
 * passes `forceHidden=true` (the page can override for the
 * closed state).
 */

import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';

interface Props {
  sessionDate: string | null;
  forceHidden?: boolean;
}

interface CountdownState {
  expired: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function computeState(targetMs: number, nowMs: number): CountdownState {
  const diff = targetMs - nowMs;
  if (diff <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { expired: false, days, hours, minutes, seconds };
}

function parseSessionDateMs(sessionDate: string | null): number | null {
  if (!sessionDate) return null;
  const ms = new Date(sessionDate).getTime();
  return Number.isFinite(ms) ? ms : null;
}

export function CountdownTimer({ sessionDate, forceHidden }: Props) {
  const { t } = useI18n();
  const targetMs = parseSessionDateMs(sessionDate);
  // Keep SSR and the first client render identical; compute at mount and
  // every 1s, since Date.now() in initial state would mismatch cached HTML.
  const [state, setState] = useState<CountdownState | null>(null);

  useEffect(() => {
    if (targetMs === null) {
      setState(null);
      return;
    }
    // Re-baseline immediately so a SSR-paint that ran a beat ago
    // doesn't show stale numbers for the first second.
    setState(computeState(targetMs, Date.now()));
    const interval = setInterval(() => {
      setState(computeState(targetMs, Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetMs]);

  if (forceHidden) return null;
  if (!state || targetMs === null) return null;
  if (state.expired) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div
      className="inline-flex items-center gap-1 bg-white/5 border border-white/15 px-3 py-1.5 text-sm font-mono text-white"
      aria-live="polite"
      aria-label={t('webinar.countdown.ariaLabel')}
    >
      <span className="inline-flex items-baseline gap-1">
        <span className="text-base font-bold text-white">{pad(state.days)}</span>
        <span className="text-[10px] uppercase tracking-wider text-white/60">
          {t('webinar.countdown.daysLabel')}
        </span>
      </span>
      <span className="text-white/40">:</span>
      <span className="inline-flex items-baseline gap-1">
        <span className="text-base font-bold text-white">{pad(state.hours)}</span>
        <span className="text-[10px] uppercase tracking-wider text-white/60">
          {t('webinar.countdown.hoursLabel')}
        </span>
      </span>
      <span className="text-white/40">:</span>
      <span className="inline-flex items-baseline gap-1">
        <span className="text-base font-bold text-white">{pad(state.minutes)}</span>
        <span className="text-[10px] uppercase tracking-wider text-white/60">
          {t('webinar.countdown.minutesLabel')}
        </span>
      </span>
      <span className="text-white/40">:</span>
      <span className="inline-flex items-baseline gap-1">
        <span className="text-base font-bold text-white">{pad(state.seconds)}</span>
        <span className="text-[10px] uppercase tracking-wider text-white/60">
          {t('webinar.countdown.secondsLabel')}
        </span>
      </span>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface DeadlineCountdownProps {
  /** ISO 8601 date string (e.g. "2026-07-15"). If invalid or
   * already in the past, the component falls back to a static
   * "Closed" or "Apply now" message. */
  deadline: string | undefined;
  /** Optional label override. Defaults to "Fall 2026 Application Deadline". */
  label?: string;
  /** When true, render in a tighter form (used inline above
   * button rows). Default false (full card with stat tiles). */
  compact?: boolean;
  /** Locale for any user-facing strings. */
  locale?: 'en' | 'zh';
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
  totalMs: number;
}

function computeTimeLeft(deadlineMs: number): TimeLeft {
  const diff = deadlineMs - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true, totalMs: 0 };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, expired: false, totalMs: diff };
}

/**
 * Live countdown to a university application deadline. Pairs a
 * pulsing dot + label ("Application closes in…") with a 4-tile
 * time-left display (DD : HH : MM : SS). Updates every second
 * via setInterval, cleans up on unmount.
 *
 * Falls back gracefully when:
 *  - No deadline set → renders nothing (parent should not mount)
 *  - Invalid date string → renders a generic "Apply now" message
 *  - Deadline already passed → renders "Applications closed" with
 *    a CTA pointing at the next intake
 */
export function DeadlineCountdown({
  deadline,
  label,
  compact = false,
  locale = 'en',
}: DeadlineCountdownProps) {
  const deadlineMs = deadline ? Date.parse(deadline) : NaN;
  const validDeadline = !isNaN(deadlineMs);

  // Server-safe initial render: compute once at mount, then re-tick
  // every 1s. We avoid useState(() => ...) with Date.now() because
  // that would cause hydration mismatches (server time vs client time).
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    if (!validDeadline) return;
    setTimeLeft(computeTimeLeft(deadlineMs));
    const id = setInterval(() => {
      setTimeLeft(computeTimeLeft(deadlineMs));
    }, 1000);
    return () => clearInterval(id);
  }, [deadlineMs, validDeadline]);

  // No deadline prop at all → don't render anything
  if (!deadline || !validDeadline) return null;

  // Still computing first tick — render a placeholder so the layout
  // doesn't jump. We use a deterministic skeleton that matches the
  // final layout dimensions.
  if (timeLeft === null) {
    return (
      <div
        className={`flex items-center gap-3 ${
          compact ? '' : 'rounded-none border-2 border-[#D4A853]/40 bg-[#D4A853]/10 p-4'
        }`}
        suppressHydrationWarning
      >
        <Clock className="h-5 w-5 text-[#D4A853]" />
        <span className="text-sm text-white/80">
          {label ?? (locale === 'en' ? 'Loading deadline…' : '加载截止日期…')}
        </span>
      </div>
    );
  }

  // Deadline already passed
  if (timeLeft.expired) {
    return (
      <div
        className={`flex items-center gap-3 ${
          compact ? '' : 'rounded-none border-2 border-amber-500/50 bg-amber-500/10 p-4'
        }`}
      >
        <Clock className="h-5 w-5 text-amber-300" />
        <div className="text-sm">
          <div className="font-semibold text-white">
            {locale === 'en' ? 'Applications closed for this intake' : '本批次申请已截止'}
          </div>
          <div className="text-xs text-amber-100/80">
            {locale === 'en'
              ? 'Inquire about late applications or the next intake.'
              : '咨询补录或下一批次入学。'}
          </div>
        </div>
      </div>
    );
  }

  // Less than 1 day remaining — pulse red
  const urgent = timeLeft.totalMs < 24 * 60 * 60 * 1000;
  // Less than 3 days — pulse amber
  const soon = timeLeft.totalMs < 3 * 24 * 60 * 60 * 1000;

  const accent = urgent
    ? 'border-red-500/50 bg-red-500/10'
    : soon
    ? 'border-amber-500/50 bg-amber-500/10'
    : 'border-[#D4A853]/40 bg-[#D4A853]/10';
  const dot = urgent ? 'bg-red-400' : soon ? 'bg-amber-300' : 'bg-[#D4A853]';
  const labelColor = urgent ? 'text-red-200' : soon ? 'text-amber-200' : 'text-[#D4A853]';

  const tiles = [
    { value: timeLeft.days, label: locale === 'en' ? 'days' : '天', big: true },
    { value: timeLeft.hours, label: locale === 'en' ? 'hrs' : '时' },
    { value: timeLeft.minutes, label: locale === 'en' ? 'min' : '分' },
    { value: timeLeft.seconds, label: locale === 'en' ? 'sec' : '秒' },
  ];

  return (
    <div
      className={`flex flex-col gap-3 rounded-none border-2 ${accent} ${
        compact ? 'p-3' : 'p-4'
      }`}
      role="timer"
      aria-live="polite"
    >
      {/* Label row */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span
            className={`absolute inline-flex h-full w-full rounded-none opacity-75 ${dot}`}
            style={{ animation: 'sica-pulse 1.6s ease-in-out infinite' }}
          />
          <span className={`relative inline-flex h-2.5 w-2.5 rounded-none ${dot}`} />
        </span>
        <span className={`text-xs font-semibold uppercase tracking-wider ${labelColor}`}>
          {label ?? (locale === 'en' ? 'Fall 2026 Application Deadline' : '2026 秋季申请截止')}
        </span>
        <span className="ml-auto text-[10px] text-white/50 font-mono">
          {new Date(deadlineMs).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      </div>

      {/* Tile row */}
      <div className="grid grid-cols-4 gap-2">
        {tiles.map((tile, i) => (
          <div
            key={i}
            className={`flex flex-col items-center justify-center bg-black/30 border border-white/15 px-1 py-2 ${
              tile.big ? 'min-w-0' : ''
            }`}
          >
            <span
              className={`font-mono font-bold tabular-nums text-white ${
                tile.big ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'
              }`}
            >
              {String(tile.value).padStart(2, '0')}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-white/60 mt-0.5">
              {tile.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

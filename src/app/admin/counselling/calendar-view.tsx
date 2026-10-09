'use client';

/**
 * Admin counselling calendar (Phase 138) — week + month views over the
 * same slot grid the public picker uses (Mon–Sat, 09:00–17:30 Beijing,
 * 30-min steps; constants imported from lib/counselling-slots).
 *
 * Chip placement rules (mirror the Phase 137 occupancy semantics):
 *   - status 'Proposed' with a proposedSlotStart → chip at the
 *     PROPOSED time, dashed violet (the original slot_start is freed
 *     while the proposal is open — shown inside the details dialog).
 *   - every other status → chip at slotStart. Terminal statuses
 *     (Cancelled / Completed / No-show) render dimmed for context.
 *
 * The range math (weekRangeFor / monthRangeFor) is pure and exported
 * for the page's data fetch + the vitest suite. All dates are Beijing
 * wall-clock 'YYYY-MM-DD' strings; instants convert through the same
 * helpers the slot engine uses.
 */
import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  Mail,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DAY_END_MINUTES,
  DAY_START_MINUTES,
  SLOT_GRID_MINUTES,
  formatBeijingLabel,
  utcToBeijingDateStr,
} from '@/lib/counselling-slots';
import type { CounsellingBooking, CounsellingBookingStatus } from '@/lib/counselling-mapper';
import { STATUS_CHIP_CLASS as CHIP_CLASS } from '@/lib/counselling-status';

// ── Pure date helpers (exported for tests + the page's fetch) ─────────────

function parseBeijingDate(s: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(dateStr: string, n: number): string {
  const d = parseBeijingDate(dateStr);
  if (!d) return dateStr;
  return toIsoDate(new Date(d.getTime() + n * 24 * 60 * 60 * 1000));
}

/** Monday..Sunday containing `anchor` (ISO getUTCDay: Sun=0). */
export function weekRangeFor(anchor: string): { from: string; to: string } {
  const d = parseBeijingDate(anchor);
  if (!d) return { from: anchor, to: anchor };
  const wd = d.getUTCDay(); // 0=Sun … 6=Sat
  const mondayOffset = wd === 0 ? -6 : 1 - wd;
  const from = addDays(anchor, mondayOffset);
  return { from, to: addDays(from, 6) };
}

/** 6-week Monday-anchored grid covering `anchor`'s month. */
export function monthRangeFor(anchor: string): { from: string; to: string } {
  const d = parseBeijingDate(anchor);
  if (!d) return { from: anchor, to: anchor };
  const firstOfMonth = `${anchor.slice(0, 7)}-01`;
  const { from } = weekRangeFor(firstOfMonth);
  return { from, to: addDays(from, 41) };
}

/** Which Beijing day does this instant belong to? */
export function beijingDayKey(iso: string): string {
  return utcToBeijingDateStr(new Date(iso));
}

/** Minutes from Beijing midnight for an instant (week-grid row math). */
export function beijingMinutesOfDay(iso: string): number {
  const ms = new Date(iso).getTime() + 8 * 60 * 60 * 1000;
  const shifted = new Date(ms);
  return shifted.getUTCHours() * 60 + shifted.getUTCMinutes();
}

// ── Chip palette ─────────────────────────────────────────────────────────
//
// Phase 153 (#6): the chip class map now lives in @/lib/counselling-status
// so the admin list + calendar + (eventual) timeline all share the same
// source of truth. The calendar adds two local modifiers on top of the
// shared base classes: the Proposed chip is rendered `border-dashed`
// (visually signals "tentative") and Cancelled / No-show get `opacity-60`
// (signals "terminal, not actionable"). The `chipClass()` helper below
// composes the shared base + the calendar-specific modifiers in one
// place so both call sites get the same treatment.
//
// The chip class is `STATUS_CHIP_CLASS[status]`, imported above as
// `CHIP_CLASS` so the existing JSX keeps working without renaming.

/** Chip class for the calendar grid — shared base + calendar modifiers. */
function chipClass(status: CounsellingBookingStatus): string {
  const base = CHIP_CLASS[status];
  if (status === 'Proposed') return `${base} border-dashed`;
  if (status === 'Cancelled' || status === 'No-show') return `${base} opacity-60`;
  return base;
}

/** The instant the calendar places the chip at (see file doc). */
export function chipInstant(
  b: Pick<CounsellingBooking, 'status' | 'slotStart' | 'proposedSlotStart'>,
): string {
  return b.status === 'Proposed' && b.proposedSlotStart ? b.proposedSlotStart : b.slotStart;
}

// ── Component ──────────────────────────────────────────────────────────────

export type CalendarViewMode = 'week' | 'month';

interface CalendarViewProps {
  bookings: CounsellingBooking[];
  loading: boolean;
  view: CalendarViewMode;
  anchor: string;
  onViewChange: (v: CalendarViewMode) => void;
  onAnchorChange: (a: string) => void;
  /** Quick status action from the details dialog (Confirm/Complete/…). */
  onStatusAction: (b: CounsellingBooking, status: CounsellingBookingStatus) => void;
  acting: boolean;
  localeTag: string;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatSlot: (iso: string) => string;
}

export function AdminCounsellingCalendar({
  bookings,
  loading,
  view,
  anchor,
  onViewChange,
  onAnchorChange,
  onStatusAction,
  acting,
  localeTag,
  t,
  formatSlot,
}: CalendarViewProps) {
  const [selected, setSelected] = useState<CounsellingBooking | null>(null);
  const range = useMemo(
    () => (view === 'week' ? weekRangeFor(anchor) : monthRangeFor(anchor)),
    [view, anchor],
  );

  // Bookings bucketed by Beijing day + chip instant.
  const byDay = useMemo(() => {
    const map = new Map<string, CounsellingBooking[]>();
    for (const b of bookings) {
      const key = beijingDayKey(chipInstant(b));
      const list = map.get(key) ?? [];
      list.push(b);
      map.set(key, list);
    }
    return map;
  }, [bookings]);

  const step = (dir: 1 | -1) =>
    onAnchorChange(view === 'week' ? addDays(anchor, dir * 7) : monthStep(anchor, dir));

  const rangeLabel = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(localeTag, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Shanghai' });
    const sameMonth = range.from.slice(0, 7) === range.to.slice(0, 7);
    if (view === 'month' && sameMonth) {
      return new Intl.DateTimeFormat(localeTag, { month: 'long', year: 'numeric', timeZone: 'Asia/Shanghai' }).format(new Date(`${anchor}-01T00:00:00+08:00`));
    }
    return `${fmt.format(new Date(`${range.from}T00:00:00+08:00`))} – ${fmt.format(new Date(`${range.to}T00:00:00+08:00`))}`;
  }, [range, view, anchor, localeTag]);

  const weekdayLabel = (i: number) =>
    new Intl.DateTimeFormat(localeTag, { weekday: 'short', timeZone: 'UTC' }).format(
      new Date(Date.UTC(2024, 0, 1 + i)),
    ); // 2024-01-01 is a Monday

  const days = useMemo(() => {
    const out: string[] = [];
    for (let d = range.from; out.length < 42; d = addDays(d, 1)) out.push(d);
    return out;
  }, [range]);

  const timeRows = useMemo(() => {
    const rows: number[] = [];
    for (let m = DAY_START_MINUTES; m <= DAY_END_MINUTES; m += SLOT_GRID_MINUTES) rows.push(m);
    return rows;
  }, []);

  const minuteLabel = (m: number) =>
    `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

  return (
    <div className="space-y-3">
      {/* Toolbar: view toggle + navigation + legend */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex border border-gray-300">
          {(['week', 'month'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onViewChange(v)}
              className={`px-3 py-1.5 text-sm font-medium ${
                view === v ? 'bg-[#1B2A4A] text-white' : 'bg-white text-[#1B2A4A] hover:bg-gray-50'
              }`}
            >
              {t(`adminCounselling.view_${v}`)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => step(-1)} aria-label={t('adminCounselling.calPrev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onAnchorChange(utcToBeijingDateStr(new Date()))}>
            {t('adminCounselling.calToday')}
          </Button>
          <Button variant="outline" size="sm" onClick={() => step(1)} aria-label={t('adminCounselling.calNext')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm font-medium text-[#1B2A4A]">{rangeLabel}</div>
        <div className="flex-1" />
        {loading && <Loader2 className="h-4 w-4 animate-spin text-[#1B2A4A]" />}
      </div>

      {view === 'week' ? (
        <div className="overflow-x-auto border border-gray-200 bg-white">
          <div className="min-w-[720px]">
            {/* Header */}
            <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-gray-200 bg-gray-50">
              <div />
              {days.slice(0, 7).map((d) => (
                <div key={d} className="px-1 py-2 text-center text-xs font-semibold text-[#1B2A4A]">
                  {weekdayLabel(new Date(`${d}T00:00:00Z`).getUTCDay() === 0 ? 6 : new Date(`${d}T00:00:00Z`).getUTCDay() - 1)}
                  <span className="ml-1 font-normal text-gray-500">{d.slice(8)}</span>
                </div>
              ))}
            </div>
            {/* Time grid */}
            <div className="grid grid-cols-[56px_repeat(7,1fr)]">
              <div className="border-r border-gray-100">
                {timeRows.map((m) => (
                  <div key={m} className="h-7 text-[10px] text-gray-400 text-right pr-1 leading-7">
                    {m % 60 === 0 ? minuteLabel(m) : ''}
                  </div>
                ))}
              </div>
              {days.slice(0, 7).map((d) => {
                const isSunday = new Date(`${d}T00:00:00Z`).getUTCDay() === 0;
                const dayBookings = byDay.get(d) ?? [];
                return (
                  <div key={d} className={`border-r border-gray-100 last:border-r-0 ${isSunday ? 'bg-gray-50/60' : ''}`}>
                    {timeRows.map((m) => {
                      const inSlot = dayBookings.filter((b) => {
                        const at = chipInstant(b);
                        return beijingDayKey(at) === d && beijingMinutesOfDay(at) === m;
                      });
                      return (
                        <div key={m} className="h-7 border-t border-gray-50 px-0.5">
                          {isSunday && inSlot.length === 0 ? (
                            <div className="text-[9px] text-gray-300 leading-7 text-center">
                              {m === DAY_START_MINUTES ? t('adminCounselling.calClosedDay') : ''}
                            </div>
                          ) : (
                            inSlot.map((b) => (
                              <button
                                key={b.id}
                                type="button"
                                onClick={() => setSelected(b)}
                                className={`w-full h-full text-left text-[10px] leading-tight px-1 truncate border ${chipClass(b.status)}`}
                                title={`${formatBeijingLabel(new Date(chipInstant(b)))} · ${b.name} · ${b.status}`}
                              >
                                {b.status === 'Proposed' && b.proposedSlotStart ? (
                                  <Send className="inline h-2 w-2 mr-0.5" />
                                ) : null}
                                {b.name}
                              </button>
                            ))
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Month grid: 6×7 day cells */
        <div className="border border-gray-200 bg-white">
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
            {[1, 2, 3, 4, 5, 6, 0].map((wd) => (
              <div key={wd} className="py-2 text-center text-xs font-semibold text-[#1B2A4A]">
                {weekdayLabel(wd === 0 ? 6 : wd - 1)}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((d) => {
              const cell = byDay.get(d) ?? [];
              const isSunday = new Date(`${d}T00:00:00Z`).getUTCDay() === 0;
              const inMonth = d.slice(0, 7) === anchor.slice(0, 7);
              const isToday = d === utcToBeijingDateStr(new Date());
              return (
                <div
                  key={d}
                  className={`min-h-[96px] border-r border-b border-gray-100 p-1 ${isSunday ? 'bg-gray-50/60' : ''} ${inMonth ? '' : 'opacity-50'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[11px] font-semibold ${isToday ? 'bg-[#9B1B30] text-white px-1.5 rounded-full' : 'text-gray-500'}`}
                    >
                      {Number(d.slice(8))}
                    </span>
                    {cell.length > 0 && (
                      <button
                        type="button"
                        className="text-[10px] text-[#1B2A4A] hover:text-[#9B1B30] underline"
                        onClick={() => {
                          onAnchorChange(d);
                          onViewChange('week');
                        }}
                      >
                        {t('adminCounselling.calDayButton')}
                      </button>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    {cell.slice(0, 3).map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelected(b)}
                        className={`w-full text-left text-[10px] leading-tight px-1 py-0.5 truncate border ${chipClass(b.status)}`}
                        title={`${b.name} · ${b.status}`}
                      >
                        {formatBeijingLabel(new Date(chipInstant(b)))} {b.name}
                      </button>
                    ))}
                    {cell.length > 3 && (
                      <div className="text-[10px] text-gray-500 px-1">
                        {t('adminCounselling.calMore', { count: cell.length - 3 })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Details dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="rounded-none sm:max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-[#1B2A4A]">{selected.name}</DialogTitle>
                <DialogDescription className="font-mono">{selected.reference}</DialogDescription>
              </DialogHeader>
              <div className="space-y-2 text-sm">
                <div className="font-medium text-[#1B2A4A]">{formatSlot(chipInstant(selected))}</div>
                {selected.status === 'Proposed' && selected.proposedSlotStart && (
                  <div className="text-xs text-gray-500">
                    {t('adminCounselling.calOriginalSlot')}: {formatSlot(selected.slotStart)}
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <a href={`mailto:${selected.email}`} className="flex items-center gap-1.5 text-[#1B2A4A] hover:text-[#9B1B30]">
                    <Mail className="h-3.5 w-3.5" /> {selected.email}
                  </a>
                  <span className="text-gray-600">{selected.phone}</span>
                  {selected.meetingLink && (
                    <a
                      href={selected.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[#9B1B30] hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> {t('adminCounselling.meetingLinkLabel')}
                    </a>
                  )}
                </div>
                {selected.topic && (
                  <p className="text-sm text-gray-600 border-l-2 border-gray-200 pl-2">{selected.topic}</p>
                )}
              </div>
              <DialogFooter className="flex-wrap gap-2">
                {selected.status === 'Pending' && (
                  <Button
                    size="sm"
                    disabled={acting}
                    onClick={() => {
                      onStatusAction(selected, 'Confirmed');
                      setSelected(null);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-none"
                  >
                    {t('adminCounselling.actionConfirm')}
                  </Button>
                )}
                {selected.status === 'Confirmed' && (
                  <Button
                    size="sm"
                    disabled={acting}
                    onClick={() => {
                      onStatusAction(selected, 'Completed');
                      setSelected(null);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-none"
                  >
                    {t('adminCounselling.actionComplete')}
                  </Button>
                )}
                {selected.status !== 'Cancelled' && selected.status !== 'Completed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={acting}
                    onClick={() => {
                      onStatusAction(selected, 'Cancelled');
                      setSelected(null);
                    }}
                    className="text-red-600 border-red-300 hover:bg-red-50 rounded-none"
                  >
                    {t('adminCounselling.actionCancel')}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function monthStep(anchor: string, dir: 1 | -1): string {
  const d = parseBeijingDate(anchor);
  if (!d) return anchor;
  const next = new Date(d);
  next.setUTCDate(1);
  next.setUTCMonth(next.getUTCMonth() + dir);
  return toIsoDate(next);
}

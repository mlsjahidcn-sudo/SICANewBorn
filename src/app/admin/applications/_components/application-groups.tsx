'use client';

/**
 * ApplicationGroups — Phase 176, the grouped (shortlist) view.
 *
 * ── Scope, deliberately ─────────────────────────────────────────────
 * This component is a SIBLING of the flat table, not a replacement for
 * it. When the admin switches to grouped, the original table is not
 * rendered at all — its sort headers, bulk-select, row menus and CSV
 * export live inside that table and stay untouched.
 *
 * That is the whole regression strategy. The plan's risk table flags
 * "grouped view regresses flat-mode bulk/CSV" as Medium likelihood.
 * Both modes keep their own rendering and actions; grouped now opens
 * by default so the student overview is visible on arrival.
 *
 * ── What it does show ───────────────────────────────────────────────
 * A campaign collapses to one parent row: the student, the N targets
 * with their individual statuses, and a per-target status dropdown.
 * Rows with no campaign_id fall back to the strongest identity they
 * carry — an admin student profile, a partner-side student, then the
 * applicant email. partner_applications has no campaign_id column at
 * all, so before that fallback existed every unbridged partner row
 * rendered as its own "Single" card.
 *
 * ── The safety story ────────────────────────────────────────────────
 * A status change here PATCHes exactly one application id — the row
 * whose dropdown was used. There is no group-level bulk status action,
 * deliberately: "mark the whole shortlist Accepted" is almost never
 * what an advisor means, and an accidental group-wide update would be
 * the worst bug this feature could have.
 *
 * Copy is inline English, like most of the surrounding admin page
 * (the admin list is only partially localized).
 */
import { useMemo, useState } from 'react';
import { AtSign, Building2, ChevronDown, ChevronRight, FileText, Layers, Plus, RotateCcw, Trash2, Users, X, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ALLOWED_STUDENT_STATUSES,
  ALLOWED_PARTNER_STATUSES,
  statusColorClass,
} from '@/lib/application-status';
import {
  groupApplications,
  collapsibleCount,
  groupedRowCount,
  type GroupableApplication,
  type GroupKind,
} from '@/lib/application-grouping';

interface RowApp extends GroupableApplication {
  surface: 'student' | 'partner';
  studentName: string;
  degree: string;
  intake: string;
  applicationNumber?: string;
  archivedAt?: string | null;
}

export interface ApplicationGroupsProps {
  applications: RowApp[];
  onOpenRow: (app: { id: string; surface: string }) => void;
  onDeleteRow: (app: { id: string; surface: 'student' | 'partner' }) => void;
  deletingKey: string | null;
  expandedKeys?: string[];
  onExpandedChange?: (keys: string[]) => void;
  onSetStatus: (id: string, status: string, surface: 'student' | 'partner') => void;
  settingStatusFor: string | null;
  /** Clear every filter. The grouped view's empty state offers the
   *  same reset the flat table offers, so an empty result is one
   *  click from a full list in either view mode. */
  onResetFilters: () => void;
  /** Whether any filter is applied — the reset stays disabled when
   *  the list is empty for a different reason. */
  hasActiveFilters: boolean;
  /** Phase 180: open the shortlist builder in append mode for an
   *  existing campaign. Routed through the page rather than handled
   *  here, because target picking needs the full candidate browser —
   *  duplicating it would give the grouped view its second catalog. */
  onAddTarget: (campaignId: string) => void;
}

/** Phase 176: imported, not copied. This dropdown and the PATCH
 *  route it calls must agree on the vocabulary exactly — the first
 *  draft of this file hand-copied the list and dropped 'Draft', which
 *  would have shown an advisor a status the server rejects. The shared
 *  module (lib/application-status.ts) is what all four consumers use. */
const STATUS_OPTIONS = ALLOWED_STUDENT_STATUSES;

const ROLE_LABEL: Record<string, string> = {
  Reach: 'Reach',
  Target: 'Target',
  Safety: 'Safety',
};

const ROLE_COLOR: Record<string, string> = {
  Reach: 'text-[#9B1B30] border-[#9B1B30]',
  Target: 'border-gray-400 text-[#4B5563]',
  Safety: 'border-[#4B5563] text-[#4B5563]',
};

/** What each kind of group actually is, in the words the admin would
 *  use. "Student" is wrong for a partner-side group and "Shortlist" is
 *  wrong for anything the shortlist builder didn't create. */
const GROUP_META: Record<GroupKind, { label: string; Icon: LucideIcon }> = {
  campaign: { label: 'Shortlist', Icon: Layers },
  student: { label: 'Student', Icon: Users },
  partner: { label: 'Partner', Icon: Building2 },
  applicant: { label: 'Applicant', Icon: AtSign },
  single: { label: 'Single', Icon: FileText },
};

export default function ApplicationGroups({
  applications,
  onOpenRow,
  onDeleteRow,
  deletingKey,
  expandedKeys,
  onExpandedChange,
  onSetStatus,
  settingStatusFor,
  onResetFilters,
  hasActiveFilters,
  onAddTarget,
}: ApplicationGroupsProps) {
  const groups = useMemo(() => groupApplications(applications), [applications]);

  // Collapse by default: a grouped view that starts fully expanded is
  // just a taller flat list, which defeats the point.
  const [localExpanded, setLocalExpanded] = useState<Set<string>>(new Set());
  const expanded = expandedKeys ? new Set(expandedKeys) : localExpanded;
  const toggle = (key: string): void => {
    const next = new Set(expanded);
    if (next.has(key)) next.delete(key); else next.add(key);
    if (onExpandedChange) onExpandedChange([...next]); else setLocalExpanded(next);
  };

  const renderDeleteAction = (row: RowApp): React.ReactNode => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="rounded-none text-[#9B1B30] hover:bg-[#9B1B30]/5 hover:text-[#9B1B30]"
      disabled={deletingKey === `${row.surface}:${row.id}`}
      aria-label={`${row.archivedAt ? 'Restore' : 'Delete'} application for ${row.studentName} — ${row.university}, ${row.program}, ${row.intake}`}
      onClick={() => onDeleteRow(row)}
    >
      {row.archivedAt ? <RotateCcw className="w-4 h-4 text-[#1B2A4A]" /> : <Trash2 className="w-4 h-4 text-[#1B2A4A]" />}
      {row.archivedAt ? 'Restore' : 'Delete'}
    </Button>
  );

  if (applications.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-[#4B5563] text-sm">
        <p>No applications match your current filters.</p>
        <button
          type="button"
          onClick={onResetFilters}
          disabled={!hasActiveFilters}
          className="mt-3 inline-flex items-center gap-1 text-xs text-[#1B2A4A] underline underline-offset-2 hover:text-[#9B1B30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2A4A] disabled:text-[#9CA3AF] disabled:no-underline disabled:cursor-default"
        >
          <X size={12} /> Reset filters
        </button>
      </div>
    );
  }

  const groupCount = collapsibleCount(groups);
  const groupedApplications = groupedRowCount(groups);

  return (
    <div className="w-full">
      <div className="px-4 sm:px-5 py-3 bg-[#FAFAF8] border-y border-gray-200 flex flex-wrap items-center gap-2 text-xs text-[#4B5563]">
        <Layers className="w-3.5 h-3.5 text-[#1B2A4A]" />
        {groupCount === 0 ? (
          <span>
            {applications.length} application{applications.length === 1 ? '' : 's'} on this page
          </span>
        ) : (
          <span>
            {groupCount} group{groupCount === 1 ? '' : 's'} · {groupedApplications} of{' '}
            {applications.length} application{applications.length === 1 ? '' : 's'} grouped
          </span>
        )}
        {groupCount > 0 && <span className="ml-auto text-[#6B7280]">Expand a student to see applications</span>}
      </div>

      <ul>
        {groups.map((group) => {
          const isExpanded = expanded.has(group.key);
          const first = group.items[0] as RowApp;
          const multi = group.kind !== 'single';
          const mixed = group.items.length > 1 && !group.uniformStatus;
          const groupMeta = GROUP_META[group.kind];
          const intakes = [...new Set(group.items.map((item) => (item as RowApp).intake).filter(Boolean))];

          return (
            <li key={group.key} className="border-b border-gray-200">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-4 bg-white hover:bg-[#FAFAF8] transition-colors">
                {multi ? (
                  <button
                    type="button"
                    onClick={() => toggle(group.key)}
                    aria-expanded={isExpanded}
                    aria-label={
                      isExpanded
                        ? `Collapse ${groupMeta.label.toLowerCase()} for ${first.studentName}`
                        : `Expand ${groupMeta.label.toLowerCase()} for ${first.studentName}`
                    }
                    aria-controls={`application-group-${group.key}`}
                    className="text-[#1B2A4A] shrink-0 p-1 -m-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2A4A]"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                ) : (
                  <span className="w-4 shrink-0" />
                )}

                <div className="min-w-0 flex-1 basis-[12rem]">
                  {/* Parent header */}
                  <div className="flex flex-wrap items-center gap-2">
                    {multi ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium border border-gray-200 text-[#4B5563]">
                        <groupMeta.Icon className="w-3 h-3 text-[#1B2A4A]" />
                        {groupMeta.label}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#6B7280] uppercase tracking-wide">
                        Application
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => multi ? toggle(group.key) : onOpenRow(first)}
                      aria-expanded={multi ? isExpanded : undefined}
                      aria-controls={multi ? `application-group-${group.key}` : undefined}
                      className="font-semibold text-[#1B2A4A] hover:underline text-left break-words focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2A4A]"
                    >
                      {first.studentName}
                    </button>
                    {intakes.length > 0 && (
                      <span className="text-xs text-[#6B7280]">{intakes.length === 1 ? intakes[0] : `${intakes.length} intakes`}</span>
                    )}
                  </div>

                  {/* Role tally — only meaningful for real shortlists. */}
                  {group.kind === 'campaign' &&
                    (group.roleCounts.Reach > 0 ||
                      group.roleCounts.Target > 0 ||
                      group.roleCounts.Safety > 0) && (
                      <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-[#4B5563]">
                        {(['Reach', 'Target', 'Safety'] as const).map((r) =>
                          group.roleCounts[r] > 0 ? (
                            <span key={r}>
                              <strong>{group.roleCounts[r]}</strong> {ROLE_LABEL[r]}
                            </span>
                          ) : null,
                        )}
                      </div>
                    )}
                </div>

                {/* Aggregate status. "Mixed" is honest — an advisor
                    looking at a 3-school shortlist needs to know the
                    schools are at different stages. */}
                <div className="ml-7 sm:ml-auto flex flex-wrap items-center gap-2">
                  {group.uniformStatus ? (
                    <span
                      className={`px-2 py-0.5 text-xs border ${statusColorClass(group.uniformStatus)}`}
                    >
                      {group.uniformStatus}
                    </span>
                  ) : mixed ? (
                    <span className="px-2 py-0.5 text-xs border border-gray-300 text-gray-600">
                      Mixed
                    </span>
                  ) : null}
                  <span className="text-xs text-[#6B7280]">
                    {group.kind === 'campaign'
                      ? `${group.items.length} target${group.items.length === 1 ? '' : 's'}`
                      : `${group.items.length} application${group.items.length === 1 ? '' : 's'}`}
                  </span>
                  {group.items.length === 1 && !isExpanded && renderDeleteAction(first)}
                </div>
              </div>

              {/* Expanded targets */}
              {multi && isExpanded && (
                <ul id={`application-group-${group.key}`} className="bg-[#FAFAF8] border-t border-gray-100">
                  {group.items.map((item) => {
                    const row = item as RowApp;
                    const busy = Boolean(row.archivedAt) || settingStatusFor === `${row.surface}:${row.id}` || deletingKey === `${row.surface}:${row.id}`;
                    return (
                      <li
                        key={`${row.surface}:${row.id}`}
                        className="flex flex-wrap items-center gap-3 px-4 py-2 pl-11 border-b border-gray-100 last:border-b-0"
                      >
                        {row.surface === 'partner' && group.kind !== 'partner' && (
                          <span className="px-1.5 py-0.5 text-[10px] uppercase tracking-wide border border-gray-300 text-[#6B7280]">
                            Partner CRM
                          </span>
                        )}
                        {row.campaignRole && ROLE_LABEL[row.campaignRole] && (
                          <span
                            className={`px-1.5 py-0.5 text-[10px] border ${ROLE_COLOR[row.campaignRole]}`}
                          >
                            {ROLE_LABEL[row.campaignRole]}
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => onOpenRow(row)}
                            className="text-sm text-[#1F2937] hover:underline text-left truncate block"
                          >
                            {row.university}
                          </button>
                          <span className="text-xs text-[#6B7280]">
                            {row.program}
                            {row.degree ? ` • ${row.degree}` : ''}
                          </span>
                          <div className="mt-0.5 text-xs text-[#6B7280]">
                            {[row.intake, row.applicationNumber].filter(Boolean).join(' · ')}
                          </div>
                        </div>

                        {/* Each action targets one application, never its entire group. */}
                        <select
                          value={row.status}
                          disabled={busy}
                          onChange={(e) => onSetStatus(row.id, e.target.value, row.surface)}
                          aria-label={`Status for ${row.university} — ${row.program}`}
                          className="text-xs border border-gray-300 px-2 py-1 bg-white disabled:opacity-50 max-w-[180px]"
                        >
                          {(row.surface === 'partner' ? ALLOWED_PARTNER_STATUSES : STATUS_OPTIONS).map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        {renderDeleteAction(row)}
                      </li>
                    );
                  })}
                  {group.campaignId && <li className="pl-11 py-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => onAddTarget(group.campaignId!)}
                      className="text-xs text-[#9B1B30] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add another target to this shortlist
                    </button>
                  </li>}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

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
 * "grouped view regresses flat-mode bulk/CSV" as Medium likelihood, and
 * the mitigation was "flat stays the default; grouped is additive". The
 * cheapest way to honour that is to never let the two modes share code.
 *
 * ── What it does show ───────────────────────────────────────────────
 * A campaign collapses to one parent row: the student, the N targets
 * with their individual statuses, and a per-target status dropdown.
 * Legacy rows with no campaign_id group by student instead, which is
 * always accurate — two applications for one student ARE that student's
 * list of schools.
 *
 * ── The safety story ────────────────────────────────────────────────
 * A status change here PATCHes exactly one application id — the row
 * whose dropdown was used. There is no group-level bulk status action,
 * deliberately: "mark the whole shortlist Accepted" is almost never
 * what an advisor means, and an accidental group-wide update would be
 * the worst bug this feature could have.
 *
 * Copy is inline English, matching the surrounding page (Phase 176
 * notes this file is a stopgap; the admin list's own copy is un-localised).
 */
import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Layers, Plus, Users } from 'lucide-react';
import {
  ALLOWED_STUDENT_STATUSES,
  statusColorClass,
} from '@/lib/application-status';
import {
  groupApplications,
  collapsibleCount,
  type GroupableApplication,
} from '@/lib/application-grouping';

interface RowApp extends GroupableApplication {
  surface: 'student' | 'partner';
  studentName: string;
  degree: string;
  intake: string;
  applicationNumber?: string;
}

export interface ApplicationGroupsProps {
  applications: RowApp[];
  onOpenRow: (app: { id: string; surface: string }) => void;
  onSetStatus: (id: string, status: string) => void;
  settingStatusFor: string | null;
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

export default function ApplicationGroups({
  applications,
  onOpenRow,
  onSetStatus,
  settingStatusFor,
  onAddTarget,
}: ApplicationGroupsProps) {
  const groups = useMemo(() => groupApplications(applications), [applications]);

  // Collapse by default: a grouped view that starts fully expanded is
  // just a taller flat list, which defeats the point.
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  if (applications.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-[#4B5563] text-sm">
        No applications match your current filters.
      </div>
    );
  }

  const shortlists = collapsibleCount(groups);

  return (
    <div className="w-full">
      <div className="px-4 py-2 bg-[#F3F4F6] border-b border-gray-200 flex items-center gap-2 text-xs text-[#4B5563]">
        <Layers className="w-3.5 h-3.5" />
        {shortlists === 0 ? (
          <span>
            No shortlists on this page — every application is its own group. Shortlists
            appear once you create one.
          </span>
        ) : (
          <span>
            {shortlists} shortlist{shortlists === 1 ? '' : 's'} from {applications.length}{' '}
            application{applications.length === 1 ? '' : 's'} on this page
          </span>
        )}
      </div>

      <ul>
        {groups.map((group) => {
          const isExpanded = expanded.has(group.key);
          const first = group.items[0] as RowApp;
          const multi = group.kind !== 'single';
          const mixed = group.items.length > 1 && !group.uniformStatus;

          return (
            <li key={group.key} className="border-b border-gray-200">
              <div className="flex items-start gap-3 px-4 py-3 bg-white hover:bg-[#FAFAF8]">
                {multi ? (
                  <button
                    type="button"
                    onClick={() => toggle(group.key)}
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? 'Collapse shortlist' : 'Expand shortlist'}
                    className="mt-0.5 text-[#1B2A4A] shrink-0"
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

                <div className="min-w-0 flex-1">
                  {/* Parent header */}
                  <div className="flex flex-wrap items-center gap-2">
                    {multi ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium border border-[#9B1B30] text-[#9B1B30]">
                        {group.kind === 'campaign' ? (
                          <Layers className="w-3 h-3" />
                        ) : (
                          <Users className="w-3 h-3" />
                        )}
                        {group.kind === 'campaign' ? 'Shortlist' : 'Student'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#6B7280] uppercase tracking-wide">
                        Single
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => onOpenRow(first)}
                      className="font-semibold text-[#1B2A4A] hover:underline text-left"
                    >
                      {first.studentName}
                    </button>
                    {first.intake && (
                      <span className="text-xs text-[#6B7280]">{first.intake}</span>
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
                <div className="shrink-0 flex items-center gap-2">
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
                    {group.items.length} target{group.items.length === 1 ? '' : 's'}
                  </span>
                </div>
              </div>

              {/* Expanded targets */}
              {multi && isExpanded && (
                <ul className="bg-[#FAFAF8] border-t border-gray-100">
                  {group.items.map((item) => {
                    const row = item as RowApp;
                    const busy = settingStatusFor === row.id;
                    return (
                      <li
                        key={row.id}
                        className="flex flex-wrap items-center gap-3 px-4 py-2 pl-11 border-b border-gray-100 last:border-b-0"
                      >
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
                        </div>

                        {/* Per-target quick status. This is the ONLY
                            write action in the grouped view and it
                            always targets exactly one id. */}
                        <select
                          value={row.status}
                          disabled={busy}
                          onChange={(e) => onSetStatus(row.id, e.target.value)}
                          aria-label={`Status for ${row.university} — ${row.program}`}
                          className="text-xs border border-gray-300 px-2 py-1 bg-white disabled:opacity-50 max-w-[180px]"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </li>
                    );
                  })}
                  <li className="pl-11 py-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => onAddTarget(group.campaignId!)}
                      className="text-xs text-[#9B1B30] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add another target to this shortlist
                    </button>
                  </li>
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

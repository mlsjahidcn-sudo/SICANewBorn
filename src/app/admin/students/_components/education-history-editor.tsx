'use client';

/**
 * EducationHistoryEditor — Phase 183.
 *
 * Replaces the eight fixed highSchool / bachelor / master inputs with a
 * repeatable list, so a student can have a fourth qualification, a gap
 * year, or two degrees in unrelated subjects — none of which the fixed
 * columns could express.
 *
 * ── Deliberate design choices ───────────────────────────────────────
 * - Rows save as a unit via PUT (replace-all) rather than N diffs. Two
 *   rapid saves can't interleave and resurrect a deleted row.
 * - `qualification` is a closed list PLUS 'Other'. Agencies meet
 *   foundation courses and national diplomas nobody enumerated;
 *   blocking them pushes advisors back to the free-text blob.
 * - `gradingScale` is a suggestion, not a constraint — "national class
 *   (5-tier)" is real and must be storable.
 * - is_current clears the end date, so "still studying" has exactly one
 *   answer instead of two contradictory ones.
 */
import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2, Loader2, GraduationCap } from 'lucide-react';
import { apiFetchJson } from '@/lib/api-client';
import {
  sanitizeEducationRows,
  emptyEducationRow,
  QUALIFICATIONS,
  GRADING_SCALES,
  MAX_EDUCATION_ROWS,
  type EducationRow,
  type EducationIssue,
} from '@/lib/student-education';
import { useI18n } from '@/lib/i18n';

interface Props {
  studentId: string;
  /** Read-only (detail view) vs editable (create/edit form). */
  readOnly?: boolean;
}

export default function EducationHistoryEditor({ studentId, readOnly = false }: Props) {
  const { t, locale } = useI18n();
  const [rows, setRows] = useState<EducationRow[]>([]);
  const [loading, setLoading] = useState(!!studentId);
  const [saving, setSaving] = useState(false);
  const [issues, setIssues] = useState<EducationIssue[]>([]);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await apiFetchJson<{ rows: EducationRow[] }>(
        `/api/admin/students/${studentId}/education-history`,
      );
      setRows(res.rows ?? []);
    } catch {
      setIssues([{ index: -1, field: 'load', reason: t('adminStudentEdu.loadFailed') }]);
    } finally {
      setLoading(false);
    }
  }, [studentId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(async () => {
    if (!studentId) return;
    // Validate locally first so a bad row is flagged before a round-trip.
    const check = sanitizeEducationRows(rows);
    if (check.issues.length > 0) {
      setIssues(check.issues);
      return;
    }
    setSaving(true);
    setIssues([]);
    try {
      const res = await apiFetchJson<{ rows: EducationRow[] }>(
        `/api/admin/students/${studentId}/education-history`,
        { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rows }) },
      );
      setRows(res.rows ?? []);
      setSavedAt(new Date().toISOString());
    } catch (e) {
      setIssues([{ index: -1, field: 'save', reason: e instanceof Error ? e.message : t('adminStudentEdu.saveFailed') }]);
    } finally {
      setSaving(false);
    }
  }, [rows, studentId, t]);

  const set = (i: number, patch: Partial<EducationRow>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-[#4B5563] py-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t('adminStudentEdu.loading')}
      </div>
    );
  }

  if (readOnly) {
    if (rows.length === 0) {
      return (
        <p className="text-sm text-[#6B7280] py-2">
          {t('adminStudentEdu.emptyReadOnly')}
        </p>
      );
    }
    return (
      <ul className="space-y-2">
        {rows.map((r, i) => (
          <li key={r.id ?? i} className="border border-gray-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium text-sm text-[#1B2A4A]">
                  {r.institution}
                  {r.country ? locale === 'zh' ? ` · ${r.country}` : ` · ${r.country}` : ''}
                </div>
                <div className="text-xs text-[#4B5563]">
                  {[r.qualification, r.subject].filter(Boolean).join(' · ')}
                </div>
                <div className="text-xs text-[#6B7280] mt-0.5">
                  {[
                    r.startDate?.slice(0, 4),
                    r.isCurrent ? t('adminStudentEdu.currentlyStudying') : r.endDate?.slice(0, 4),
                  ]
                    .filter(Boolean)
                    .join(' – ')}
                  {r.grade ? ` · ${r.grade}${r.gradingScale && r.gradingScale !== 'unspecified' ? ` (${r.gradingScale})` : ''}` : ''}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-3">
      {rows.length === 0 && (
        <p className="text-sm text-[#6B7280]">{t('adminStudentEdu.empty')}</p>
      )}

      {rows.map((r, i) => (
        <div key={r.id ?? `new-${i}`} className="border border-gray-200 p-3 space-y-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={r.institution ?? ''}
              onChange={(e) => set(i, { institution: e.target.value })}
              placeholder={t('adminStudentEdu.institution')}
              className="border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              value={r.country ?? ''}
              onChange={(e) => set(i, { country: e.target.value })}
              placeholder={t('adminStudentEdu.country')}
              className="border border-gray-300 px-3 py-2 text-sm"
            />
            <select
              value={r.qualification ?? 'Other'}
              onChange={(e) => set(i, { qualification: e.target.value })}
              aria-label={t('adminStudentEdu.qualification')}
              className="border border-gray-300 px-3 py-2 text-sm"
            >
              {QUALIFICATIONS.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
            <input
              value={r.subject ?? ''}
              onChange={(e) => set(i, { subject: e.target.value })}
              placeholder={t('adminStudentEdu.subject')}
              className="border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={r.startDate ?? ''}
              onChange={(e) => set(i, { startDate: e.target.value || null })}
              aria-label={t('adminStudentEdu.startDate')}
              className="border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={r.endDate ?? ''}
              disabled={r.isCurrent}
              onChange={(e) => set(i, { endDate: e.target.value || null })}
              aria-label={t('adminStudentEdu.endDate')}
              className="border border-gray-300 px-3 py-2 text-sm disabled:opacity-40"
            />
            <input
              value={r.grade ?? ''}
              onChange={(e) => set(i, { grade: e.target.value || null })}
              placeholder={t('adminStudentEdu.grade')}
              className="border border-gray-300 px-3 py-2 text-sm"
            />
            <select
              value={r.gradingScale ?? 'unspecified'}
              onChange={(e) => set(i, { gradingScale: e.target.value })}
              aria-label={t('adminStudentEdu.gradingScale')}
              className="border border-gray-300 px-3 py-2 text-sm"
            >
              {/* A suggestion list, not a whitelist — an agency meets
                  scales we never enumerated, and storing them beats
                  bouncing an admin back to a free-text blob. */}
              {GRADING_SCALES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-[#4B5563]">
              <input
                type="checkbox"
                checked={r.isCurrent}
                onChange={(e) =>
                  set(i, { isCurrent: e.target.checked, endDate: e.target.checked ? null : r.endDate })
                }
              />
              {t('adminStudentEdu.currentlyStudying')}
            </label>
            <button
              type="button"
              onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
              aria-label={t('adminStudentEdu.removeRow')}
              className="text-gray-400 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}

      {rows.length < MAX_EDUCATION_ROWS && (
        <button
          type="button"
          onClick={() => setRows((prev) => [...prev, emptyEducationRow()])}
          className="flex items-center gap-1 text-sm text-[#9B1B30] hover:underline"
        >
          <Plus className="w-4 h-4" />
          {t('adminStudentEdu.addRow')}
        </button>
      )}

      {issues.length > 0 && (
        <ul className="text-xs text-red-700 list-disc pl-4">
          {issues.map((iss, n) => (
            <li key={n}>
              {iss.index >= 0 ? `#${iss.index + 1} ` : ''}
              {iss.reason}
            </li>
          ))}
        </ul>
      )}

      {rows.length > 0 && (
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#1B2A4A] text-white disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <GraduationCap className="h-4 w-4" />}
          {t('adminStudentEdu.save')}
        </button>
      )}

      {savedAt && !saving && (
        <p className="text-xs text-green-700">{t('adminStudentEdu.saved')}</p>
      )}
    </div>
  );
}

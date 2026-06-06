import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { insertTimelineEvent } from '@/lib/timeline';
import {
  notifyApplicantOnStatusChange,
  notifyPartnerOnStatusChange,
} from '@/lib/email';
import { mapPartnerApplicationToDb, parsePartnerApplicationStatus } from '@/lib/partner-application-mapper';

export const dynamic = 'force-dynamic';

/**
 * S31: POST /api/admin/applications/bulk
 *
 * Apply an action to many applications at once. The admin sees
 * the unified /admin/applications list (S28) which mixes rows
 * from `student_applications` and `partner_applications`. Each
 * row carries a `surface` so we know which table to write to.
 *
 * Body:
 *   {
 *     ids: string[],                              // row ids (UUIDs)
 *     action: 'status' | 'priority' | 'note' | 'delete',
 *     value: string                               // action-specific
 *   }
 *
 *   status  value: 'Submitted' | 'Under Review' | 'In Review' |
 *                   'Documents Requested' | 'Decision Made' |
 *                   'Accepted' | 'Rejected' | 'Withdrawn' | 'Draft'
 *                   (the endpoint maps student/partner status names
 *                    to the right column when needed)
 *   priority value: 'Low' | 'Normal' | 'High' | 'Urgent'
 *   note     value: free text, appended to existing notes
 *   delete   value: ignored
 *
 * Response: { updated: number, failed: Array<{id, error}> }
 *
 * Side effects (status action only):
 *   - application_timeline row per affected app (shared table,
 *     student or partner FK set)
 *   - email to the student (existing notifyApplicantOnStatusChange)
 *   - email to the partner (new S29 notifyPartnerOnStatusChange,
 *     for partner surface rows)
 *   - partner_notifications row for partner surface rows
 *   - student_notifications row for student surface rows
 *
 * Best-effort on notifications: if the email or notification
 * insert fails for any one app, the bulk update still completes
 * and we report the row as updated. The per-row error channel is
 * reserved for DB-level failures (row not found, RLS denial,
 * FK violation, etc).
 *
 * Concurrency: we update one row at a time so per-row failure
 * handling is clean. For v1 (max ~50 selections) this is fine;
 * if the selection limit ever goes above 200, swap to a
 * Promise.all + chunked loop.
 */
const ALLOWED_STUDENT_STATUSES = [
  'Draft', 'Submitted', 'Under Review', 'Documents Requested',
  'Decision Made', 'Accepted', 'Rejected', 'Withdrawn',
] as const;

const ALLOWED_PARTNER_STATUSES = [
  'Draft', 'Submitted', 'In Review', 'Accepted', 'Rejected', 'Withdrawn',
] as const;

const ALLOWED_PRIORITIES = ['Low', 'Normal', 'High', 'Urgent'] as const;

const ALLOWED_ACTIONS = ['status', 'priority', 'note', 'delete'] as const;
type BulkAction = (typeof ALLOWED_ACTIONS)[number];

export async function POST(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const ids: unknown = body.ids;
    const action: unknown = body.action;
    const value: unknown = body.value;

    // --- input validation --------------------------------------
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'ids must be a non-empty array' }, { status: 400 });
    }
    if (ids.length > 200) {
      return NextResponse.json(
        { error: 'Bulk actions are limited to 200 rows per call' },
        { status: 400 },
      );
    }
    if (typeof action !== 'string' || !(ALLOWED_ACTIONS as readonly string[]).includes(action)) {
      return NextResponse.json(
        { error: `action must be one of: ${ALLOWED_ACTIONS.join(', ')}` },
        { status: 400 },
      );
    }
    if (action !== 'delete' && (typeof value !== 'string' || value.trim() === '')) {
      return NextResponse.json(
        { error: 'value is required and must be a non-empty string' },
        { status: 400 },
      );
    }
    if (action === 'status') {
      // value must be a known status for at least one surface
      if (
        !(ALLOWED_STUDENT_STATUSES as readonly string[]).includes(value as string) &&
        !(ALLOWED_PARTNER_STATUSES as readonly string[]).includes(value as string)
      ) {
        return NextResponse.json(
          { error: `Unknown status '${value}'` },
          { status: 400 },
        );
      }
    }
    if (action === 'priority' && !(ALLOWED_PRIORITIES as readonly string[]).includes(value as string)) {
      return NextResponse.json({ error: `priority must be one of: ${ALLOWED_PRIORITIES.join(', ')}` }, { status: 400 });
    }

    const service = buildServiceClient();
    let updated = 0;
    const failed: Array<{ id: string; error: string }> = [];

    for (const id of ids) {
      if (typeof id !== 'string' || !id) {
        failed.push({ id: String(id), error: 'Invalid id' });
        continue;
      }
      try {
        // Probe both tables to figure out the surface. We do this
        // in a single round trip per row to keep the code simple;
        // for v1 the page is constrained to one page (~15-30 rows
        // visible at a time) and the second probe is cheap.
        const [{ data: studentRow }, { data: partnerRow }] = await Promise.all([
          service.from('student_applications').select('id, status, student_id, university_name, program_name, degree, degree_level, intake, application_number, applicant_email, applicant_name, priority, notes, admin_notes').eq('id', id).maybeSingle(),
          service.from('partner_applications').select('id, status, partner_id, student_name, student_email, university, program, intake, degree, application_number, priority, notes, submitted_at').eq('id', id).maybeSingle(),
        ]);

        // Surface is just for routing; the type of `studentRow`/
        // `partnerRow` doesn't narrow across the surface check
        // (TS keeps them as `T | null`), so each branch below
        // re-checks the relevant row before dereferencing.
        const surface: 'student' | 'partner' | null = studentRow
          ? 'student'
          : partnerRow
          ? 'partner'
          : null;
        if (!surface) {
          failed.push({ id, error: 'Application not found in either table' });
          continue;
        }
        // The `surface === 'student'` branch checks `studentRow`
        // is non-null; the `surface === 'partner'` branch checks
        // `partnerRow`. We also do an early `!partnerRow`/`!studentRow`
        // bail-out for the surfaces we don't use, so TS narrows
        // `studentRow`/`partnerRow` to non-null below.
        if (surface !== 'student' && !partnerRow) {
          failed.push({ id, error: 'Partner application missing' });
          continue;
        }
        if (surface !== 'partner' && !studentRow) {
          failed.push({ id, error: 'Student application missing' });
          continue;
        }

        if (action === 'delete') {
          // Use the matching DELETE endpoint logic inline. The
          // partner_admin endpoint sets a 204; student does too.
          if (surface === 'partner') {
            const { error: delErr } = await service.from('partner_applications').delete().eq('id', id);
            if (delErr) throw new Error(delErr.message);
          } else {
            const { error: delErr } = await service.from('student_applications').delete().eq('id', id);
            if (delErr) throw new Error(delErr.message);
          }
          updated++;
          continue;
        }

        if (action === 'status') {
          // value is a string status; surface decides the table.
          // The student table accepts the full 8-state list; the
          // partner table accepts the 6-state list. Cross-taxonomy
          // writes are an error (admin UI should only allow valid
          // values per surface, but defend at the API too).
          if (surface === 'student') {
            // Non-null: the surface check + early bail-out above
            // already proved studentRow is defined.
            const sr = studentRow!;
            if (!(ALLOWED_STUDENT_STATUSES as readonly string[]).includes(value as string)) {
              failed.push({ id, error: `Invalid student status '${value}'` });
              continue;
            }
            const reviewedAt = new Date().toISOString();
            const submittedAt =
              (value as string) === 'Submitted' && !(sr as { submitted_at?: string | null }).submitted_at
                ? reviewedAt
                : undefined;
            const { error: updErr } = await service
              .from('student_applications')
              .update({ status: value, reviewed_at: reviewedAt, ...(submittedAt ? { submitted_at: submittedAt } : {}) })
              .eq('id', id);
            if (updErr) throw new Error(updErr.message);

            // Timeline + email + notification (S29)
            await insertTimelineEvent(service, {
              application_id: id,
              status: value as string,
              notes: `Bulk status change to ${value} by admin.`,
              created_by: auth.user.id,
            });

            // Email the student. We resolve the email the same
            // way the single-row PATCH does — student_profiles
            // first, applicant_email fallback.
            let toEmail: string | null = null;
            let applicantName: string | null = (studentRow as { applicant_name?: string | null }).applicant_name || null;
            if (sr.student_id) {
              const { data: profile } = await service
                .from('student_profiles')
                .select('email, first_name, last_name')
                .eq('id', sr.student_id)
                .maybeSingle();
              if (profile) {
                toEmail = profile.email || null;
                applicantName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || applicantName;
              }
            }
            if (!toEmail) toEmail = (studentRow as { applicant_email?: string | null }).applicant_email || null;

            if (toEmail) {
              notifyApplicantOnStatusChange({
                toEmail,
                applicantName,
                universityName: sr.university_name,
                programName: sr.program_name,
                degree: sr.degree_level || sr.degree,
                intake: sr.intake,
                applicationNumber: sr.application_number,
                newStatus: value as string,
              }).catch((emailErr) => {
                console.error('[admin/applications/bulk] student email failed for', id, emailErr);
              });
            }
            if (sr.student_id) {
              const { error: snErr } = await service.from('student_notifications').insert({
                student_id: sr.student_id,
                title: `Application status: ${value}`,
                message: `${studentNameForBulk(applicantName)} — your application to ${sr.university_name} is now ${value}.`,
                type: 'status_change',
                // Phase 1.2: deep-link to the application detail.
                link_url: `/student/applications/${id}`,
              });
              if (snErr) {
                console.error('[admin/applications/bulk] student_notification insert failed for', id, snErr);
              }
            }
          } else {
            // partner surface
            if (!(ALLOWED_PARTNER_STATUSES as readonly string[]).includes(value as string)) {
              failed.push({ id, error: `Invalid partner status '${value}'` });
              continue;
            }
            // Use the existing mapper to validate the payload shape;
            // we only need status, but a full validate is harmless.
            mapPartnerApplicationToDb({ status: value });
            const submittedAt =
              (value as string) === 'Submitted' && !partnerRow!.submitted_at
                ? new Date().toISOString()
                : undefined;
            const { error: updErr } = await service
              .from('partner_applications')
              .update({ status: value, ...(submittedAt ? { submitted_at: submittedAt } : {}) })
              .eq('id', id);
            if (updErr) throw new Error(updErr.message);

            await insertTimelineEvent(service, {
              partner_application_id: id,
              status: value as string,
              notes: `Bulk status change to ${value} by admin.`,
              created_by: auth.user.id,
            });

            // Email the student on the partner app (best-effort)
            // partnerRow was verified non-null above (the surface
            // check + early bail-out). We re-bind it here for
            // closure safety; TS doesn't follow the narrowing
            // across the inner block, so use a non-null assertion.
            const partnerApp = partnerRow!;
            if (partnerApp.student_email) {
              notifyApplicantOnStatusChange({
                toEmail: partnerApp.student_email,
                applicantName: partnerApp.student_name,
                universityName: partnerApp.university,
                programName: partnerApp.program,
                degree: partnerApp.degree,
                intake: partnerApp.intake,
                applicationNumber: partnerApp.application_number,
                newStatus: value as string,
              }).catch((emailErr) => {
                console.error('[admin/applications/bulk] partner-app student email failed for', id, emailErr);
              });
            }
            // Email the partner + insert a partner_notification
            const { data: partnerInfo } = await service
              .from('partners')
              .select('user_id, company_name')
              .eq('id', partnerApp.partner_id)
              .maybeSingle();
            if (partnerInfo?.user_id) {
              const u = await service.auth.admin.getUserById(partnerInfo.user_id);
              const partnerEmail = u.data?.user?.email || null;
              if (partnerEmail) {
                notifyPartnerOnStatusChange({
                  toEmail: partnerEmail,
                  applicantName: partnerInfo.company_name || 'Partner',
                  universityName: partnerApp.university,
                  programName: partnerApp.program,
                  degree: partnerApp.degree,
                  intake: partnerApp.intake,
                  applicationNumber: partnerApp.application_number,
                  newStatus: value as string,
                }).catch((emailErr) => {
                  console.error('[admin/applications/bulk] partner email failed for', id, emailErr);
                });
                const { error: notifErr } = await service.from('partner_notifications').insert({
                  user_id: partnerInfo.user_id,
                  partner_application_id: id,
                  title: `Application status: ${value}`,
                  message: `${partnerApp.student_name || 'Your student'}'s application to ${partnerApp.university} is now ${value}.`,
                  type: 'status_change',
                  link_url: `/partner/applications/${id}`,
                });
                if (notifErr) {
                  console.error('[admin/applications/bulk] partner_notification insert failed for', id, notifErr);
                }
              }
            }
          }
          updated++;
          continue;
        }

        if (action === 'priority') {
          if (surface === 'student') {
            const { error: updErr } = await service
              .from('student_applications')
              .update({ priority: value })
              .eq('id', id);
            if (updErr) throw new Error(updErr.message);
          } else {
            const { error: updErr } = await service
              .from('partner_applications')
              .update({ priority: value })
              .eq('id', id);
            if (updErr) throw new Error(updErr.message);
          }
          updated++;
          continue;
        }

        if (action === 'note') {
          // Append. We prefix the bulk note with a delimiter so
          // admins can tell their bulk-note apart from the
          // existing per-app notes. Format:
          //   {existing}\n\n[Bulk YYYY-MM-DD HH:MM] {value}
          const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
          const bulkLine = `[Bulk ${stamp}] ${value}`;
          if (surface === 'student') {
            const existing = (studentRow as { notes?: string | null }).notes || '';
            const merged = existing ? `${existing}\n\n${bulkLine}` : bulkLine;
            const { error: updErr } = await service
              .from('student_applications')
              .update({ notes: merged })
              .eq('id', id);
            if (updErr) throw new Error(updErr.message);
          } else {
            const existing = (partnerRow as { notes?: string | null }).notes || '';
            const merged = existing ? `${existing}\n\n${bulkLine}` : bulkLine;
            const { error: updErr } = await service
              .from('partner_applications')
              .update({ notes: merged })
              .eq('id', id);
            if (updErr) throw new Error(updErr.message);
          }
          updated++;
          continue;
        }
      } catch (rowErr) {
        const message = rowErr instanceof Error ? rowErr.message : 'Unknown error';
        failed.push({ id, error: message });
      }
    }

    return NextResponse.json({ updated, failed });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/applications/bulk] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function studentNameForBulk(applicantName: string | null): string {
  return applicantName || 'Hello';
}

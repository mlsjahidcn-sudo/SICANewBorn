import { NextRequest, NextResponse } from 'next/server';
import { buildServiceClient, getServerEnv, requireAdmin } from '@/lib/supabase-auth';
import { insertTimelineEvent } from '@/lib/timeline';
import { notifyApplicantOnStatusChange, notifyPartnerOnStatusChange } from '@/lib/email';
import {
  mapPartnerApplicationFromDb,
  mapPartnerApplicationToDb,
  parsePartnerApplicationStatus,
} from '@/lib/partner-application-mapper';

/**
 * GET   /api/admin/partner-applications/[id] — admin view of a single row
 * PATCH /api/admin/partner-applications/[id] — admin can change status,
 *                                                decision, submitted_at,
 *                                                priority, notes, etc.
 *
 * S27: this is the *only* API path that lets the admin advance a
 * partner's application through the workflow. The partner's own
 * PATCH endpoint rejects status / decision / submitted_at with
 * 403, so the only way those fields get changed is through here.
 */
export const dynamic = 'force-dynamic';

/**
 * S29: partner notification title — short (1 line) for the inbox
 * preview. The full message body comes from statusNotificationMessage.
 *
 * Mapping mirrors the email subject line. New status names (S27
 * partner taxonomy) are listed explicitly so adding a new one shows
 * up in TS as a missing case.
 */
function statusNotificationTitle(newStatus: string): string {
  switch (newStatus) {
    case 'Submitted':   return 'Application submitted';
    case 'In Review':   return 'Application in review';
    case 'Accepted':    return '🎉 Application accepted';
    case 'Rejected':    return 'Application rejected';
    case 'Withdrawn':   return 'Application withdrawn';
    case 'Draft':       return 'Application moved to draft';
    default:            return `Application status: ${newStatus}`;
  }
}

function statusNotificationMessage(newStatus: string, studentName: string, university: string): string {
  switch (newStatus) {
    case 'Submitted':
      return `SICA has received ${studentName}'s application to ${university} and queued it for review.`;
    case 'In Review':
      return `The SICA team has started reviewing ${studentName}'s application to ${university}.`;
    case 'Accepted':
      return `Great news — ${studentName}'s application to ${university} was accepted. We'll be in touch with next steps.`;
    case 'Rejected':
      return `Unfortunately, ${studentName}'s application to ${university} was not successful this time. The reasons are in the application detail.`;
    case 'Withdrawn':
      return `${studentName}'s application to ${university} has been withdrawn. The student record has been preserved.`;
    case 'Draft':
      return `${studentName}'s application to ${university} was moved back to draft.`;
    default:
      return `${studentName}'s application to ${university} is now ${newStatus}.`;
  }
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json(
      { error: 'Supabase is not configured' },
      { status: 503 },
    );
  }
  const auth = await requireAdmin(_request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  try {
    const service = buildServiceClient();
    const { data, error } = await service
      .from('partner_applications')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Hydrate created_by_email
    const createdBy = (data as { created_by_user_id?: string | null })
      .created_by_user_id;
    let createdByEmail: string | null = null;
    if (createdBy) {
      // getUserById returns { data: { user }, error }; the user row
      // is on u.data.user, not u.user.
      const u = await service.auth.admin.getUserById(createdBy);
      createdByEmail = u.data?.user?.email || null;
    }
    return NextResponse.json({
      application: mapPartnerApplicationFromDb({
        ...(data as Record<string, unknown>),
        created_by_email: createdByEmail,
      } as Parameters<typeof mapPartnerApplicationFromDb>[0]),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/partner-applications/:id GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json(
      { error: 'Supabase is not configured' },
      { status: 503 },
    );
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  try {
    const body = await request.json();

    // S27: the admin can write any field. The mapper validates the
    // closed-set enums (gender, marital, education, etc.) and throws
    // a 400 on invalid values. status / decision are also validated
    // below so we can give a clearer error than the mapper's
    // generic Invalid field value.
    if (body.status !== undefined && !parsePartnerApplicationStatus(body.status)) {
      return NextResponse.json(
        {
          error:
            "status must be 'Draft' | 'Submitted' | 'In Review' | 'Accepted' | 'Rejected' | 'Withdrawn'",
        },
        { status: 400 },
      );
    }

    let updates: Record<string, unknown>;
    try {
      updates = mapPartnerApplicationToDb(body);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : 'Invalid field value' },
        { status: 400 },
      );
    }

    // The admin's PATCH must not let them swap the row to a different
    // partner or change the creator.
    delete (updates as Record<string, unknown>).partner_id;
    delete (updates as Record<string, unknown>).created_by_user_id;
    delete (updates as Record<string, unknown>).id;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const service = buildServiceClient();

    // S29: read the current row first so we can detect a status
    // change and (a) write a timeline event, (b) email the student,
    // (c) email the partner, and (d) insert a partner_notification
    // row so the in-app inbox (S30) can show it. We only do this
    // work when status actually changed — re-stamping the same
    // status shouldn't spam the recipient.
    const { data: before, error: beforeErr } = await service
      .from('partner_applications')
      .select('status, partner_id, student_name, student_email, university, program, intake, degree, application_number, created_by_user_id')
      .eq('id', id)
      .maybeSingle();
    if (beforeErr) {
      console.error('[admin/partner-applications/:id PATCH] pre-read error:', beforeErr);
      return NextResponse.json({ error: beforeErr.message }, { status: 500 });
    }
    if (!before) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const { data, error } = await service
      .from('partner_applications')
      .update(updates)
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) {
      console.error('[admin/partner-applications/:id PATCH] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // S29: fire timeline + emails + partner notification when status changed.
    const statusChanged =
      typeof updates.status === 'string' && updates.status !== before.status;
    if (statusChanged) {
      const newStatus = updates.status as string;
      // 1. timeline event (shared application_timeline, partner_application_id FK)
      await insertTimelineEvent(service, {
        partner_application_id: id,
        status: newStatus,
        notes: typeof updates.notes === 'string' && updates.notes.trim()
          ? `Status changed to ${newStatus} by admin. Note: ${updates.notes.trim()}`
          : `Status changed from ${before.status} to ${newStatus} by admin.`,
        created_by: auth.user.id,
      });

      // 2. email the student (the person the partner was applying for)
      // The student email lives on the row as `student_email`. If it's
      // empty (e.g. partner created the app for someone with no email)
      // we skip the student email but still email the partner.
      const studentEmail = (data as { student_email?: string | null }).student_email || null;
      if (studentEmail) {
        // Fire-and-forget — never block the response on email.
        notifyApplicantOnStatusChange({
          toEmail: studentEmail,
          applicantName: (data as { student_name?: string | null }).student_name || null,
          universityName: (data as { university?: string | null }).university || null,
          programName: (data as { program?: string | null }).program || null,
          degree: (data as { degree?: string | null }).degree || null,
          intake: (data as { intake?: string | null }).intake || null,
          applicationNumber: (data as { application_number?: string | null }).application_number || null,
          newStatus,
        }).catch((emailErr) => {
          console.error('[admin/partner-applications/:id PATCH] student email failed:', emailErr);
        });
      }

      // 3. email the partner (the agency that submitted the app)
      // We need the partner's user.email — read it via auth.admin and
      // also via the partners.user_id FK.
      const { data: partnerRow } = await service
        .from('partners')
        .select('user_id, company_name')
        .eq('id', before.partner_id)
        .maybeSingle();
      if (partnerRow?.user_id) {
        // getUserById returns { data: { user }, error }; the user row
        // is on u.data.user, not u.user.
        const u = await service.auth.admin.getUserById(partnerRow.user_id);
        const partnerEmail = u.data?.user?.email || null;
        if (partnerEmail) {
          notifyPartnerOnStatusChange({
            toEmail: partnerEmail,
            applicantName: partnerRow.company_name || 'Partner',
            universityName: (data as { university?: string | null }).university || null,
            programName: (data as { program?: string | null }).program || null,
            degree: (data as { degree?: string | null }).degree || null,
            intake: (data as { intake?: string | null }).intake || null,
            applicationNumber: (data as { application_number?: string | null }).application_number || null,
            newStatus,
          }).catch((emailErr) => {
            console.error('[admin/partner-applications/:id PATCH] partner email failed:', emailErr);
          });

          // 4. in-app notification (S30 surfaces this in the partner UI)
          const { error: notifErr } = await service.from('partner_notifications').insert({
            user_id: partnerRow.user_id,
            partner_application_id: id,
            title: statusNotificationTitle(newStatus),
            message: statusNotificationMessage(
              newStatus,
              (data as { student_name?: string | null }).student_name || 'your student',
              (data as { university?: string | null }).university || 'the university',
            ),
            type: 'status_change',
            link_url: `/partner/applications/${id}`,
          });
          if (notifErr) {
            console.error('[admin/partner-applications/:id PATCH] partner_notification insert failed:', notifErr);
          }
        }
      }
    }

    return NextResponse.json({ application: mapPartnerApplicationFromDb(data) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/partner-applications/:id PATCH] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * S28: DELETE /api/admin/partner-applications/[id]
 *
 * Admin-initiated deletion of a partner_applications row. The
 * unified /admin/applications list's Delete button points here for
 * rows with surface='partner'.
 */
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json(
      { error: 'Supabase is not configured' },
      { status: 503 },
    );
  }
  const auth = await requireAdmin(_request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  try {
    const service = buildServiceClient();
    const { error, count } = await service
      .from('partner_applications')
      .delete({ count: 'exact' })
      .eq('id', id);
    if (error) {
      console.error('[admin/partner-applications/:id DELETE] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!count) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/partner-applications/:id DELETE] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { mapPartnerStudentFromDb } from '@/lib/partner-student-mapper';
import crypto from 'crypto';

function generateTempPassword() {
  return crypto.randomBytes(24).toString('hex');
}

/**
 * POST /api/admin/partner-students/[id]/link-profile
 *
 * Links a partner-created student to a real `student_profiles` row.
 * Two modes:
 *   1. Create mode (no existingStudentProfileId):
 *      - Creates an auth.users row with a random password
 *      - Creates/upserts a student_profiles row
 *      - Sets partner_students.linked_student_profile_id
 *   2. Link mode (existingStudentProfileId provided):
 *      - Verifies the student_profiles row exists
 *      - Sets partner_students.linked_student_profile_id
 *
 * In both modes, the handler also backfills linked_student_profile_id
 * on the student's partner_applications and student_documents rows.
 *
 * Auth: any admin or super_admin. Uses service-role client.
 */
export const dynamic = 'force-dynamic';

async function getStudentDetail(service: ReturnType<typeof buildServiceClient>, id: string) {
  const { data, error } = await service
    .from('partner_students')
    .select(
      `*,
      partner:partners!partner_id (id, company_name),
      application_count:partner_applications!id(count),
      document_count:student_documents!id(count)`,
    )
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const partner = data.partner as Record<string, unknown> | undefined;
  const appCount = Array.isArray(data.application_count)
    ? data.application_count[0]?.count
    : (data.application_count as { count?: number } | undefined)?.count;
  const docCount = Array.isArray(data.document_count)
    ? data.document_count[0]?.count
    : (data.document_count as { count?: number } | undefined)?.count;

  return mapPartnerStudentFromDb({
    ...data,
    partner_name: (partner?.company_name as string) || null,
    application_count: typeof appCount === 'number' ? appCount : 0,
    document_count: typeof docCount === 'number' ? docCount : 0,
  } as Parameters<typeof mapPartnerStudentFromDb>[0]);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json(
      { error: 'Supabase is not configured. Set COZE_SUPABASE_SERVICE_ROLE_KEY.' },
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
    const service = buildServiceClient();

    // 1. Load the partner student row.
    const { data: partnerStudent, error: psErr } = await service
      .from('partner_students')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (psErr) {
      console.error('[admin/partner-students/:id/link-profile] load error:', psErr);
      return NextResponse.json({ error: psErr.message }, { status: 500 });
    }
    if (!partnerStudent) {
      return NextResponse.json({ error: 'Partner student not found' }, { status: 404 });
    }

    let profileId: string;

    if (body.existingStudentProfileId) {
      // Link mode
      const { data: existingProfile, error: profileErr } = await service
        .from('student_profiles')
        .select('id')
        .eq('id', body.existingStudentProfileId)
        .maybeSingle();
      if (profileErr) {
        console.error('[admin/partner-students/:id/link-profile] profile lookup error:', profileErr);
        return NextResponse.json({ error: profileErr.message }, { status: 500 });
      }
      if (!existingProfile) {
        return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
      }
      profileId = existingProfile.id;
    } else {
      // Create mode
      const email = partnerStudent.student_email;
      if (!email || typeof email !== 'string') {
        return NextResponse.json(
          { error: 'Partner student has no email; cannot create a student profile without one' },
          { status: 400 },
        );
      }

      // Split student_name into first/last (best effort).
      const nameParts = String(partnerStudent.student_name || '').trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const { data: authData, error: authError } = await service.auth.admin.createUser({
        email,
        password: generateTempPassword(),
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          role: 'student',
          source: 'Partner',
        },
      });
      if (authError) {
        if (authError.message?.toLowerCase().includes('already')) {
          return NextResponse.json(
            { error: 'A user with this email already exists. Use existingStudentProfileId to link.' },
            { status: 409 },
          );
        }
        console.error('[admin/partner-students/:id/link-profile] createUser error:', authError);
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }
      const userId = authData.user?.id;
      if (!userId) {
        return NextResponse.json({ error: 'Failed to create auth user' }, { status: 500 });
      }

      // Upsert the student_profiles row. The trigger may have created an empty one.
      const extra: Record<string, unknown> = {};
      if (partnerStudent.notes) {
        extra.notes = partnerStudent.notes;
      }
      const preferredUniversities = partnerStudent.target_university
        ? [String(partnerStudent.target_university).trim()]
        : [];

      const { error: profileUpsertErr } = await service.from('student_profiles').upsert(
        {
          id: userId,
          user_id: userId,
          email,
          first_name: firstName,
          last_name: lastName,
          phone: partnerStudent.student_phone || null,
          nationality: partnerStudent.nationality || null,
          target_degree: '',
          target_field: partnerStudent.target_program || null,
          target_intake: '',
          preferred_universities: preferredUniversities.length > 0 ? preferredUniversities : null,
          source: 'Partner',
          status: 'Active',
          extra: Object.keys(extra).length > 0 ? extra : {},
        },
        { onConflict: 'id' },
      );
      if (profileUpsertErr) {
        console.error('[admin/partner-students/:id/link-profile] profile upsert error:', profileUpsertErr);
        return NextResponse.json(
          { error: `Auth user created but profile upsert failed: ${profileUpsertErr.message}` },
          { status: 500 },
        );
      }
      profileId = userId;
    }

    // 2. Update the partner student row with the link.
    const { error: linkErr } = await service
      .from('partner_students')
      .update({ linked_student_profile_id: profileId })
      .eq('id', id);
    if (linkErr) {
      console.error('[admin/partner-students/:id/link-profile] link update error:', linkErr);
      return NextResponse.json({ error: linkErr.message }, { status: 500 });
    }

    // 3. Backfill linked_student_profile_id on child rows.
    await service
      .from('partner_applications')
      .update({ linked_student_profile_id: profileId })
      .eq('student_id', id)
      .is('linked_student_profile_id', null);

    await service
      .from('student_documents')
      .update({ linked_student_profile_id: profileId })
      .eq('partner_student_id', id)
      .is('linked_student_profile_id', null);

    const student = await getStudentDetail(service, id);
    return NextResponse.json({ student });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/partner-students/:id/link-profile] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

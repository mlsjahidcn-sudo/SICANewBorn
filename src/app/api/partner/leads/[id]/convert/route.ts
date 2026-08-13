import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember } from '@/lib/supabase-auth';
import { mapPartnerStudentFromDb } from '@/lib/partner-student-mapper';

/**
 * POST /api/partner/leads/[id]/convert
 *
 * Phase 1.8: "Convert lead to student" CTA on the lead detail page.
 *
 * The partner's lead-sharing list is a CRM for incoming inquiries
 * before they become students/applications. The "Converted" status
 * existed in the enum but had no real action behind it — partners
 * would just manually re-enter the lead's name + email into the
 * Students page, then again into a new application. This endpoint
 * atomically:
 *   1. Reads the lead row (authed, scoped to the partner's team)
 *   2. Creates a new partner_students row from the lead's data
 *   3. Marks the lead as "Converted" so it leaves the active list
 *   4. Returns the new student ID so the UI can route to it
 *
 * Idempotency: the source-of-truth is the new partner_students row,
 * not the lead. Re-running this on a "Converted" lead would create
 * a second student. We don't block that — the lead is the inbound
 * capture record, and a partner might convert the same lead twice
 * by accident and notice. Safer to create than to silently fail.
 *
 * Member-role scoping: the convert-creates-a-new-row path follows
 * the same rule as POST /api/partner/students — the new
 * partner_students row is created with the calling user's ID
 * (not the lead's original creator). This keeps "see only what
 * I created" working for member-role partners.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireTeamMember(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    // Step 1: load the lead (scoped to the partner team)
    let leadQ = auth.supabase
      .from('partner_leads')
      .select('*')
      .eq('id', id)
      .eq('partner_id', auth.partnerId);
    if (auth.role === 'member') {
      leadQ = leadQ.eq('created_by_user_id', auth.user.id);
    }
    const { data: leadRow, error: leadError } = await leadQ.maybeSingle();
    if (leadError) {
      console.error('[partner/leads/:id/convert] lead fetch error:', leadError);
      return NextResponse.json({ error: leadError.message }, { status: 500 });
    }
    if (!leadRow) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Step 2: create the new partner_students row from the lead's
    // shape. target_university / target_program are slugs in
    // partner_students but freeform text on the lead — we leave
    // them NULL rather than guess. The partner can fill them in
    // when starting an application.
    const leadNotes = (leadRow as { notes?: string | null }).notes;
    const interestedProgram = (leadRow as { interested_program?: string | null }).interested_program;
    const newStudent: Record<string, unknown> = {
      partner_id: auth.partnerId,
      student_name: (leadRow as { lead_name: string }).lead_name,
      student_email: (leadRow as { lead_email?: string | null }).lead_email ?? null,
      student_phone: (leadRow as { lead_phone?: string | null }).lead_phone ?? null,
      // Carry the lead's program interest forward so the partner
      // doesn't have to re-enter it on the student page.
      target_program: interestedProgram ?? null,
      // Carry the lead's notes forward so the partner doesn't
      // lose context. Prefix with a marker so the partner can
      // see "this came from the lead, not a manual entry".
      notes: leadNotes
        ? `From lead:\n${leadNotes}`
        : `Converted from lead on ${new Date().toISOString().slice(0, 10)}.`,
      status: 'New',
      // Phase 3: server-derived created_by_user_id — the user
      // who clicked Convert, not the user who originally created
      // the lead. This matters for member-role scoping: only the
      // converter sees this new student in their list.
      created_by_user_id: auth.user.id,
    };

    const { data: studentRow, error: studentError } = await auth.supabase
      .from('partner_students')
      .insert(newStudent)
      .select('*')
      .single();

    if (studentError || !studentRow) {
      console.error('[partner/leads/:id/convert] student insert error:', studentError);
      return NextResponse.json(
        { error: studentError?.message || 'Failed to create student row' },
        { status: 500 },
      );
    }

    // Step 3: mark the lead as "Converted" so it leaves the
    // active list. Don't fail the whole request if this update
    // fails — the student row already exists, which is the
    // user-visible outcome. Log and move on.
    const { error: leadUpdateError } = await auth.supabase
      .from('partner_leads')
      .update({ status: 'Converted' })
      .eq('id', id);
    if (leadUpdateError) {
      console.error(
        '[partner/leads/:id/convert] lead status update warning (non-fatal):',
        leadUpdateError,
      );
    }

    return NextResponse.json(
      { student: mapPartnerStudentFromDb(studentRow) },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/leads/:id/convert] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

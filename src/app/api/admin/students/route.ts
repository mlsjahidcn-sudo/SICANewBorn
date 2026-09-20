import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { mapStudentFromDb, mapStudentToDb, parseSource, parseStatus } from '@/lib/student-mapper';
import { sendStudentWelcome } from '@/lib/email';
import { sanitizeOrTerm, parseIntParam } from '@/lib/postgrest';
import { checkRateLimit } from '@/lib/rate-limit';

/**
 * GET /api/admin/students
 *
 * List all students (any status, any source) with optional filters:
 *   - search   : free-text on first_name, last_name, email, phone,
 *                nationality, target_degree, target_field (case-insensitive)
 *   - status   : exact match (Active | Inactive | Pending | Suspended)
 *   - source   : exact match (Admin | Partner | Online)
 *   - isOffline: derived filter — 'true' returns source='Admin', 'false' returns source != 'Admin'
 *   - sort     : created_at | updated_at | first_name | last_name  (default created_at)
 *   - order    : asc | desc                                       (default desc)
 *   - page     : 1-indexed                                        (default 1)
 *   - limit    : 1..100                                            (default 20)
 *
 * Response: { students, total, page, limit, totalPages }
 *
 * Auth: any admin or super_admin (requireAdmin). Uses service-role
 * client so we can read all rows regardless of RLS (student_profiles
 * RLS would hide rows from non-owners).
 *
 * POST /api/admin/students
 *
 * Create a new student. This is the "Add Offline Student" admin flow —
 * the admin enters the student's info directly (no signup email, no
 * password sent to the student). Internally we still need an
 * `auth.users` row because `student_profiles.id` FKs to it, and
 * `student_documents.student_id` FKs to `student_profiles.id`.
 *
 * Two options for the auth.users row:
 *   A) Generate a random password and `email_confirm: true`. The
 *      student can later "claim" the account by resetting the
 *      password via the Supabase recovery email flow.
 *   B) Don't create an auth.users row at all. Decouple the FK so
 *      `student_profiles.id` is a plain UUID with no auth.users
 *      parent. (Schema change.)
 *
 * We go with A for V1 — it's the standard Supabase pattern and
 * doesn't require a schema change. The auto-create trigger in the
 * schema will create a `student_profiles` row from the auth.users
 * row, but we'll upsert our payload on top of it.
 *
 * Body: { email, password?, firstName, lastName, phone?, nationality?,
 *         dateOfBirth?, targetDegree?, targetIntake?, source?,
 *         status?, extra? }
 *
 * Auth: any admin (requireAdmin). Uses service-role client to call
 * the Supabase auth admin API and to insert the profile row
 * (bypasses RLS).
 */

// ---------------------------------------------------------------------------
// GET — list students
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
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

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const status = parseStatus(searchParams.get('status'));
    const source = parseSource(searchParams.get('source'));
    const isOfflineRaw = searchParams.get('isOffline');
    const sortRaw = searchParams.get('sort') || 'created_at';
    const orderRaw = searchParams.get('order') || 'desc';
    const page = parseIntParam(searchParams.get('page'), 1);
    const limit = parseIntParam(searchParams.get('limit'), 20, { max: 100 });

    // Validate sort
    const allowedSort = ['created_at', 'updated_at', 'first_name', 'last_name'];
    const sort = allowedSort.includes(sortRaw) ? sortRaw : 'created_at';
    const ascending = orderRaw === 'asc';

    const service = buildServiceClient();
    let query = service
      .from('student_profiles')
      .select('*', { count: 'exact' })
      .order(sort, { ascending });

    // Apply filters
    if (status) query = query.eq('status', status);
    if (source) query = query.eq('source', source);
    if (isOfflineRaw === 'true') query = query.eq('source', 'Admin');
    if (isOfflineRaw === 'false') query = query.neq('source', 'Admin');

    // Search: case-insensitive partial match across name, email, and
    // the core registration fields (country/phone/degree/program).
    if (search) {
      // Escape ILIKE wildcards + strip PostgREST .or() syntax chars
      // (a comma in the search used to split the filter string and
      // 500 the request — or worse, inject extra filters).
      const safe = sanitizeOrTerm(search);
      // Use OR across searchable columns. The pattern syntax for OR in
      // supabase-js is `.or('col.ilike.%x%,col2.ilike.%y%')`.
      query = query.or(
        `first_name.ilike.%${safe}%,last_name.ilike.%${safe}%,email.ilike.%${safe}%,phone.ilike.%${safe}%,nationality.ilike.%${safe}%,target_degree.ilike.%${safe}%,target_field.ilike.%${safe}%`,
      );
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error('[admin/students GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const students = (data || []).map(mapStudentFromDb);
    const total = count || 0;

    // Phase 122a: application counts for the page slice —
    // student_applications by student_id PLUS partner_applications by
    // the Phase A bridge column (linked_student_profile_id). Two
    // batched IN queries cover the ≤100-row page; both are
    // best-effort (a failure leaves the count at 0 rather than
    // failing the list).
    const studentIds = students.map((s) => s.id);
    if (studentIds.length > 0) {
      const [studentAppsRes, partnerAppsRes] = await Promise.all([
        service.from('student_applications').select('student_id').in('student_id', studentIds),
        service
          .from('partner_applications')
          .select('linked_student_profile_id')
          .in('linked_student_profile_id', studentIds),
      ]);
      const counts = new Map<string, number>();
      if (studentAppsRes.error) {
        console.error('[admin/students GET] student app count error:', studentAppsRes.error);
      } else {
        for (const row of studentAppsRes.data || []) {
          const sid = (row as { student_id?: string | null }).student_id;
          if (sid) counts.set(sid, (counts.get(sid) || 0) + 1);
        }
      }
      if (partnerAppsRes.error) {
        console.error('[admin/students GET] partner app count error:', partnerAppsRes.error);
      } else {
        for (const row of partnerAppsRes.data || []) {
          const sid = (row as { linked_student_profile_id?: string | null })
            .linked_student_profile_id;
          if (sid) counts.set(sid, (counts.get(sid) || 0) + 1);
        }
      }
      for (const s of students) {
        s.applicationCount = counts.get(s.id) || 0;
      }
    }

    return NextResponse.json({
      students,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/students GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — create a student (admin "Add Offline Student" flow)
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
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

  // H3: rate limit (30/15min per admin). Each create triggers
  // auth.admin.createUser + sendStudentWelcome (real Resend send).
  // Caps abuse-from-inside — stolen admin token can't burn the
  // Resend quota + spam the auth.users table.
  const rl = checkRateLimit({
    action: 'admin-student-create',
    key: auth.user.id,
    max: 30,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Too many student creations. Please slow down.' },
      {
        status: 429,
        headers: { 'Retry-After': String(rl.retryAfterSec) },
      },
    );
  }

  try {
    const body = await request.json();

    // Validate required fields.
    // Email is now OPTIONAL (Phase 90) — partner-referred students
    // don't need it on the admin side; the partner has it. When the
    // admin leaves it blank, we synthesize a placeholder email so
    // Supabase auth.users (which has email NOT NULL) accepts the row.
    // Phone + country were never required by the schema, only by the
    // wizard's HTML `required` attribute (which we also removed).
    if (!body.firstName || !body.lastName) {
      return NextResponse.json(
        { error: 'firstName and lastName are required' },
        { status: 400 },
      );
    }
    const emailRaw =
      typeof body.email === 'string' ? body.email.trim() : '';
    const hasRealEmail = emailRaw.length > 0;
    // Validate source if provided
    if (body.source !== undefined && !parseSource(body.source)) {
      return NextResponse.json(
        { error: "source must be 'Admin' | 'Partner' | 'Online'" },
        { status: 400 },
      );
    }

    // Default source to 'Admin' for the admin-create flow (this is the
    // "offline student" entry point). Caller can override.
    const source = body.source ?? 'Admin';
    // Default password: a long random string the admin should share
    // out-of-band with the student. The student resets it on first
    // login via Supabase's recovery flow.
    const password =
      typeof body.password === 'string' && body.password.length >= 8
        ? body.password
        : generateTempPassword();

    const service = buildServiceClient();

    // Synthesize a placeholder email when the admin didn't provide one
    // (Phase 90: partner-referred students don't need a real email).
    // Format: sica-noemail-{userId}@sica.invalid — guarantees uniqueness
    // (randomUUID suffix) and uses an unresolvable TLD so no email
    // ever gets sent to it. The student_profiles row will store the
    // real email if/when the student fills one in via /student/profile.
    const emailForAuth = hasRealEmail
      ? emailRaw
      : `sica-noemail-${crypto.randomUUID()}@sica.invalid`;

    // 1. Create the auth.users row via the admin API
    const { data: authData, error: authError } = await service.auth.admin.createUser({
      email: emailForAuth,
      password,
      email_confirm: true, // admin-created; no email confirmation needed
      user_metadata: {
        first_name: body.firstName,
        last_name: body.lastName,
        role: 'student',
        source,
        // Phase 90: flag the placeholder so future email-merge logic
        // (Phase A link) can detect + skip.
        email_provided: hasRealEmail,
      },
    });

    if (authError) {
      // Common case: email already exists. Surface a clean 409.
      if (authError.message?.toLowerCase().includes('already')) {
        return NextResponse.json(
          { error: 'A user with this email already exists' },
          { status: 409 },
        );
      }
      console.error('[admin/students POST] auth.admin.createUser error:', authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }
    const userId = authData.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Failed to create auth user' }, { status: 500 });
    }

    // 2. Upsert the student_profiles row. The handle_new_student_user
    //    trigger may have already inserted an empty row from step 1 —
    //    we want to overwrite it with our payload.
    // Phase 90: only write the real email to student_profiles when the
    // admin actually provided one. The placeholder stays in auth.users
    // (the FK column requires NOT NULL) but we don't want it surfaced
    // to the admin views or partner CRM.
    const profileEmail = hasRealEmail ? emailRaw : '';
    const { dbRow, extraUpdates } = mapStudentToDb({ ...body, id: userId });
    dbRow.id = userId;
    dbRow.user_id = userId;
    dbRow.email = profileEmail;
    dbRow.source = source;
    if (Object.keys(extraUpdates).length > 0) {
      dbRow.extra = extraUpdates;
    }
    // Default status to Active for new offline students
    if (!dbRow.status) dbRow.status = 'Active';

    const { data: profile, error: profileError } = await service
      .from('student_profiles')
      .upsert(dbRow, { onConflict: 'id' })
      .select('*')
      .single();

    if (profileError) {
      console.error('[admin/students POST] profile upsert error:', profileError);
      // Don't roll back the auth.users row — admin can retry the
      // profile update, or we'll have an orphan. Log it loudly.
      return NextResponse.json(
        {
          error: `Auth user created but profile upsert failed: ${profileError.message}. The auth user (${userId}) is now orphaned — clean up via the Supabase dashboard if needed.`,
        },
        { status: 500 },
      );
    }

    // Fire-and-forget welcome email. Don't block the response on it —
    // the admin already has the temp password in the response body
    // and can re-share it manually if Resend fails.
    //
    // M10: track the result so the API response can surface
    // `emailSent: false` when Resend is down. The admin UI can
    // warn the admin + show a "Re-send welcome email" button
    // instead of silently failing.
    //
    // Phase 90: skip the welcome email entirely when no real email was
    // provided (partner-referred students) — sending to the placeholder
    // would just bounce + pollute the Resend bounce list.
    let emailSent = false;
    if (hasRealEmail) {
      emailSent = await sendStudentWelcome({
        firstName: body.firstName,
        lastName: body.lastName,
        email: emailRaw,
        temporaryPassword: body.password ? '(admin-set)' : password,
        createdByAdmin:
          (auth.user.user_metadata?.full_name as string | undefined) ||
          auth.user.email ||
          'SICA Admin',
        createdAt: new Date().toISOString(),
      }).catch((err) => {
        console.error('[sendStudentWelcome] failed:', err);
        return false;
      });
    }

    return NextResponse.json(
      {
        student: mapStudentFromDb(profile),
        // Return the temp password ONCE so the admin can share it. The
        // student will reset it on first login.
        temporaryPassword: body.password ? undefined : password,
        emailSent,
      },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/students POST] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Generate a URL-safe 20-char random password. The student will
 * reset it via the Supabase recovery flow on first login.
 */
function generateTempPassword(): string {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const bytes = new Uint8Array(20);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 20; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let out = '';
  for (let i = 0; i < 20; i++) {
    out += charset[bytes[i] % charset.length];
  }
  return out;
}

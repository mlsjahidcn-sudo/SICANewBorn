import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import {
  checkPublicRateLimit,
  isHoneypotFilled,
} from '@/lib/rate-limit';
import { mapPartnerApplicationToDb } from '@/lib/partner-application-mapper';
import { mapPartnerStudentToDb } from '@/lib/partner-student-mapper';
import { validatePartnerApplicationPayload } from '@/lib/partner-application-validation';
import { getStorageClient } from '@/lib/storage';
import { validateFileType, validateFileName } from '@/lib/storage-validation';

export const dynamic = 'force-dynamic';

/**
 * Phase 75: Public application submission form — no auth, no token.
 *
 * Endpoint:  POST /api/public/submissions
 * Auth:      None. Anyone can submit.
 * Use case:  A partner tells a student "go to studyinchina.academy/apply
 *            and fill this in". Student fills the form, attaches docs,
 *            and gets a reference number. Admin picks it up in
 *            /admin/partner-applications.
 *
 * Hardening:
 *   - Per-IP rate limit (5/hr) + global cap (50/hr) — bots can spam
 *     but each spam costs them a request that the admin can ignore.
 *   - Honeypot field `website` (hidden via CSS, never filled by
 *     humans). Filled => fake 200 (don't teach bots which field to drop).
 *   - Service-role client (RLS bypass) — same pattern as /api/seed
 *     and the other admin-only mutations. The sentinel partner_id
 *     (Direct / Unassigned) is the partner_id, no real partner user
 *     owns it, so partner-portal RLS cannot read or modify these rows.
 *
 * Content-Type:
 *   - application/json          → text-only submission
 *   - multipart/form-data       → form fields + up to 4 file uploads
 *                                 (passport, transcript, photo, other)
 *   The multipart path uploads files server-side to Supabase Storage
 *   (bucket `student-documents`, prefix `public-submissions/{appId}/`)
 *   and creates one `student_documents` row per file.
 *
 * Submission flow:
 *   1. Rate limit + honeypot check.
 *   2. Validate body (form fields).
 *   3. Resolve partner_id (optional dropdown or sentinel default).
 *   4. Create partner_students row.
 *   5. Mint application_number via existing next_partner_app_number RPC.
 *   6. Create partner_applications row.
 *   7. (multipart only) Upload each file to Storage + create
 *      student_documents row, linked back to the new partner_students.id
 *      and the new partner_applications.id.
 *   8. Return { application_id, application_number, documents[] }.
 */

const DirectPartnerId = '00000000-0000-0000-0000-0000000000d1';
const STUDENT_DOCS_BUCKET = 'student-documents';
const MAX_FILES = 4;
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

const SubmitPayload = z.object({
  // Honeypot — never filled by humans. Filled => fake 200.
  website: z.string().optional(),
  // Student
  studentName: z.string().min(1).max(255),
  studentEmail: z.string().email().max(255).optional().or(z.literal('')),
  studentPhone: z.string().min(5).max(50).optional().or(z.literal('')),
  nationality: z.string().max(100).optional().or(z.literal('')),
  // Program
  university: z.string().max(255).optional().or(z.literal('')),
  program: z.string().max(255).optional().or(z.literal('')),
  degree: z.enum(['Bachelor', 'Master', 'PhD']).optional().or(z.literal('')),
  intake: z.string().max(100).optional().or(z.literal('')),
  // Academics
  gpa: z.string().max(16).optional().or(z.literal('')),
  englishTest: z.enum(['IELTS', 'TOEFL', 'Duolingo', 'PTE', 'Other']).optional().or(z.literal('')),
  englishScore: z.string().max(16).optional().or(z.literal('')),
  // Narrative
  whyProgram: z.string().max(500).optional().or(z.literal('')),
  // Partner attribution
  referringPartnerId: z.string().uuid().optional(),
});

// File categories (mapped to student_documents.category).
// The client sends one multipart part per file. The part name is
// `file_<category>` (e.g. `file_passport`) and the file's original
// name is used as the display name.
const FILE_CATEGORIES = ['passport', 'transcript', 'english_test', 'photo', 'other'] as const;
type FileCategory = typeof FILE_CATEGORIES[number];

const CATEGORY_TO_DOC_TYPE_ID: Record<FileCategory, string> = {
  passport: 'public_passport',
  transcript: 'public_transcript',
  english_test: 'public_english_test',
  photo: 'public_photo',
  other: 'public_other',
};

function safeExt(name: string): string {
  const ext = (name.split('.').pop() || 'pdf').toLowerCase();
  return ext.replace(/[^a-z0-9]/g, '').slice(0, 8) || 'pdf';
}

export async function POST(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Service not configured' }, { status: 503 });
  }

  // Rate limit FIRST (before parsing the body).
  const limit = checkPublicRateLimit({
    action: 'public-applications',
    request,
    maxPerIp: 5,
    maxGlobal: 50,
    windowMs: 60 * 60 * 1000,
  });
  if (limit.blocked) {
    return NextResponse.json(
      { error: 'Too many submissions. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } },
    );
  }

  // Parse either JSON or multipart. Form fields go through the same
  // Zod schema either way; multipart just also carries File parts.
  const contentType = request.headers.get('content-type') ?? '';
  let parsedData: z.infer<typeof SubmitPayload>;
  const files: Array<{ category: FileCategory; file: File }> = [];

  if (contentType.includes('multipart/form-data')) {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return NextResponse.json({ error: 'Invalid multipart body' }, { status: 400 });
    }

    // Honeypot check on the FormData before Zod.
    if (typeof form.get('website') === 'string' && String(form.get('website')).trim().length > 0) {
      return NextResponse.json({ ok: true, application_number: 'SPAM-IGNORED' });
    }

    const fields: Record<string, unknown> = {};
    form.forEach((value, key) => {
      if (typeof value === 'string' && !key.startsWith('file_')) {
        fields[key] = value;
      }
    });

    // Collect file parts. Cap at MAX_FILES.
    let fileCount = 0;
    for (const cat of FILE_CATEGORIES) {
      const part = form.get(`file_${cat}`);
      if (part && part instanceof File && part.size > 0) {
        if (fileCount >= MAX_FILES) break;
        files.push({ category: cat, file: part });
        fileCount++;
      }
    }

    const parsed = SubmitPayload.safeParse(fields);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', issues: parsed.error.flatten() },
        { status: 400 },
      );
    }
    parsedData = parsed.data;
  } else {
    let raw: Record<string, unknown>;
    try {
      raw = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    if (isHoneypotFilled(raw)) {
      return NextResponse.json({ ok: true, application_number: 'SPAM-IGNORED' });
    }
    const parsed = SubmitPayload.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', issues: parsed.error.flatten() },
        { status: 400 },
      );
    }
    parsedData = parsed.data;
  }

  // Resolve referring partner (same logic for both content types).
  const service = buildServiceClient();
  let partnerId: string = DirectPartnerId;
  if (parsedData.referringPartnerId) {
    const { data: partner, error: partnerErr } = await service
      .from('partners')
      .select('id, status')
      .eq('id', parsedData.referringPartnerId)
      .maybeSingle();
    if (partnerErr) {
      console.error('[public/submissions] partner lookup error:', partnerErr);
      return NextResponse.json({ error: 'Failed to look up referring partner' }, { status: 500 });
    }
    if (!partner) {
      return NextResponse.json({ error: 'Referring partner not found' }, { status: 400 });
    }
    if ((partner as { status: string }).status !== 'Active') {
      return NextResponse.json({ error: 'Referring partner is not active' }, { status: 400 });
    }
    partnerId = (partner as { id: string }).id;
  }

  // Shared field validation.
  const validationErrors = validatePartnerApplicationPayload(
    parsedData as Record<string, unknown>,
    'create',
  );
  if (validationErrors.length > 0) {
    return NextResponse.json(
      { error: validationErrors[0].message, errors: validationErrors },
      { status: 400 },
    );
  }

  // 1. partner_students row.
  const studentRow = mapPartnerStudentToDb(parsedData as Record<string, unknown>);
  studentRow.partner_id = partnerId;
  const { data: student, error: studentErr } = await service
    .from('partner_students')
    .insert(studentRow)
    .select('id')
    .single();
  if (studentErr || !student) {
    console.error('[public/submissions] partner_students insert error:', studentErr);
    return NextResponse.json({ error: 'Failed to create student record' }, { status: 500 });
  }
  const studentId = (student as { id: string }).id;

  // 2. partner_applications payload.
  const appRow = mapPartnerApplicationToDb({
    ...(parsedData as Record<string, unknown>),
    studentId,
  });
  appRow.partner_id = partnerId;
  appRow.student_id = studentId;
  appRow.status = 'Draft';
  appRow.decision = 'Pending';
  delete appRow.created_by_user_id;
  appRow.source = 'public_form';

  // 3. Mint application_number.
  const { data: minted, error: mintError } = await service.rpc(
    'next_partner_app_number',
    { p_partner_id: partnerId },
  );
  if (mintError) {
    console.warn('[public/submissions] next_partner_app_number failed:', mintError);
  } else if (typeof minted === 'string' && minted) {
    appRow.application_number = minted;
  }

  // 4. Insert the application.
  const { data: app, error: appErr } = await service
    .from('partner_applications')
    .insert(appRow)
    .select('id, application_number')
    .single();
  if (appErr || !app) {
    console.error('[public/submissions] partner_applications insert error:', appErr);
    await service.from('partner_students').delete().eq('id', studentId);
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
  }
  const applicationId = (app as { id: string }).id;
  const applicationNumber = (app as { application_number: string }).application_number;

  // 5. Upload files (if any). Best-effort — if uploads fail, the
  //    application still exists and the student can be re-contacted
  //    by the admin to send the docs. We surface a `documents` array
  //    in the response so the client can show per-file success.
  const uploadedDocs: Array<{ category: FileCategory; name: string; size: number; documentId: string }> = [];
  const failedDocs: Array<{ category: FileCategory; reason: string }> = [];

  if (files.length > 0) {
    const storage = getStorageClient();
    if (!storage) {
      // Storage not configured — log it but don't fail the whole submission.
      console.error('[public/submissions] storage client unavailable; skipping file uploads');
      for (const f of files) failedDocs.push({ category: f.category, reason: 'Storage not configured' });
    } else {
      for (const { category, file } of files) {
        try {
          // Validate type + size (the existing helpers enforce
          // STUDENT_DOC_ALLOWED_TYPES and 10MB cap).
          const typeCheck = validateFileType(file.type);
          if (!typeCheck.ok) {
            failedDocs.push({ category, reason: typeCheck.error || 'Unsupported file type' });
            continue;
          }
          if (file.size > MAX_FILE_BYTES) {
            failedDocs.push({ category, reason: 'File too large (max 10 MB)' });
            continue;
          }
          const nameCheck = validateFileName(file.name);
          if (!nameCheck.ok) {
            failedDocs.push({ category, reason: nameCheck.error || 'Bad file name' });
            continue;
          }

          const documentId = crypto.randomUUID();
          const ext = safeExt(file.name);
          const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
          const storagePath = `public-submissions/${applicationId}/${documentId}-${safeName}`;

          // Convert File -> ArrayBuffer for the Storage SDK.
          const bytes = await file.arrayBuffer();
          const { error: upErr } = await storage.storage
            .from(STUDENT_DOCS_BUCKET)
            .upload(storagePath, bytes, {
              contentType: file.type,
              upsert: false,
            });
          if (upErr) {
            console.error('[public/submissions] storage upload error:', upErr);
            failedDocs.push({ category, reason: 'Upload failed' });
            continue;
          }

          // student_documents row. We use the new partner_students.id
          // for partner_student_id (link to the student we just
          // created) and the new partner_applications.id for
          // application_id (so the doc shows up on the application
          // detail page). No student_profiles row exists for public
          // submissions yet — the admin can promote the student to
          // a real profile later (Phase D link-profile endpoint).
          const { error: docErr } = await service.from('student_documents').insert({
            id: documentId,
            partner_student_id: studentId,
            application_id: applicationId,
            document_type_id: CATEGORY_TO_DOC_TYPE_ID[category],
            name: file.name,
            category,
            file_url: storagePath,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            status: 'Pending',
          });
          if (docErr) {
            console.error('[public/submissions] student_documents insert error:', docErr);
            // File is in Storage but DB row failed — surface to the
            // admin via the failedDocs list so they can re-link.
            failedDocs.push({ category, reason: 'DB row insert failed (file was uploaded)' });
            continue;
          }

          uploadedDocs.push({
            category,
            name: file.name,
            size: file.size,
            documentId,
          });
        } catch (err) {
          console.error('[public/submissions] file upload unexpected error:', err);
          failedDocs.push({ category, reason: 'Unexpected error' });
        }
      }
    }
  }

  return NextResponse.json(
    {
      application_id: applicationId,
      application_number: applicationNumber,
      student_id: studentId,
      documents: uploadedDocs,
      documents_failed: failedDocs,
      confirmation: {
        student_name: parsedData.studentName,
        university: parsedData.university || null,
        program: parsedData.program || null,
      },
    },
    { status: 201 },
  );
}

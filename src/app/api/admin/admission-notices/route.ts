/**
 * /api/admin/admission-notices
 *
 * Phase 51: admin create + list (the list is for the admin
 * page so the admin can see drafts + published entries).
 *
 *   GET  /api/admin/admission-notices       — list (all, including drafts)
 *   POST /api/admin/admission-notices       — create
 *
 * Auth: requireAdmin.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';
import { mapAdmissionNoticeFromDb, mapAdmissionNoticeInsertToDb } from '@/lib/admission-notices/mapper';
import { parseAdmissionDegree } from '@/lib/admission-notices/types';
import { getAdmissionNoticePublicUrl } from '@/lib/admission-notices/storage';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    const { data, error, count } = await auth.supabase
      .from('admission_notices')
      .select('*', { count: 'exact' })
      .order('display_order', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('[admin/admission-notices GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const notices = (data || []).map((row) => {
      const mapped = mapAdmissionNoticeFromDb(row as never);
      return {
        ...mapped,
        publicImageUrl: getAdmissionNoticePublicUrl(mapped.imagePath),
      };
    });

    const total = count || notices.length;
    return NextResponse.json({
      notices,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/admission-notices GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();

    // Required fields
    if (typeof body.studentName !== 'string' || !body.studentName.trim()) {
      return NextResponse.json({ error: 'studentName is required' }, { status: 400 });
    }
    if (typeof body.universityName !== 'string' || !body.universityName.trim()) {
      return NextResponse.json({ error: 'universityName is required' }, { status: 400 });
    }
    if (typeof body.imagePath !== 'string' || !body.imagePath.startsWith('public/')) {
      return NextResponse.json(
        { error: 'imagePath is required and must be a public/ path (use /api/admin/admission-notices/upload first)' },
        { status: 400 },
      );
    }
    if (typeof body.originalPath !== 'string' || !body.originalPath.startsWith('originals/')) {
      return NextResponse.json(
        { error: 'originalPath is required and must be an originals/ path' },
        { status: 400 },
      );
    }

    // Optional degree must match the closed taxonomy
    if (body.degree !== undefined && body.degree !== null && body.degree !== '') {
      const degree = parseAdmissionDegree(body.degree);
      if (!degree) {
        return NextResponse.json(
          { error: 'Invalid degree. Allowed: Bachelor, Master, PhD, Language, Pre-University' },
          { status: 400 },
        );
      }
      body.degree = degree;
    } else {
      body.degree = null;
    }

    const row = mapAdmissionNoticeInsertToDb(body, auth.user.id);
    const { data, error } = await auth.supabase
      .from('admission_notices')
      .insert(row)
      .select('*')
      .single();
    if (error) {
      console.error('[admin/admission-notices POST] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mapped = mapAdmissionNoticeFromDb(data as never);
    return NextResponse.json(
      {
        notice: {
          ...mapped,
          publicImageUrl: getAdmissionNoticePublicUrl(mapped.imagePath),
        },
      },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/admission-notices POST] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

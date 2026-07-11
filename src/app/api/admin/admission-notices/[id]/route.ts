/**
 * /api/admin/admission-notices/[id]
 *
 * Phase 51: admin PATCH (update) + DELETE for a single notice.
 *
 *   PATCH  /api/admin/admission-notices/[id]   — update any field
 *   DELETE /api/admin/admission-notices/[id]   — remove + cleanup storage
 *
 * Auth: requireAdmin.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';
import {
  mapAdmissionNoticeFromDb,
  mapAdmissionNoticeUpdateToDb,
} from '@/lib/admission-notices/mapper';
import { parseAdmissionDegree } from '@/lib/admission-notices/types';
import {
  deleteAdmissionNoticeImages,
  getAdmissionNoticePublicUrl,
} from '@/lib/admission-notices/storage';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    const body = await request.json();

    // Validate degree if provided.
    if (body.degree !== undefined && body.degree !== null && body.degree !== '') {
      const degree = parseAdmissionDegree(body.degree);
      if (!degree) {
        return NextResponse.json(
          { error: 'Invalid degree' },
          { status: 400 },
        );
      }
      body.degree = degree;
    }
    // Validate paths if provided.
    if (body.imagePath !== undefined && !body.imagePath.startsWith('public/')) {
      return NextResponse.json(
        { error: 'imagePath must be a public/ path' },
        { status: 400 },
      );
    }
    if (body.originalPath !== undefined && !body.originalPath.startsWith('originals/')) {
      return NextResponse.json(
        { error: 'originalPath must be an originals/ path' },
        { status: 400 },
      );
    }

    // Reject server-derived fields defensively.
    const forbidden = [
      'created_by',
      'createdBy',
      'created_at',
      'createdAt',
      'id',
    ];
    for (const key of forbidden) {
      if (body[key] !== undefined) {
        return NextResponse.json(
          { error: `Field '${key}' is server-derived` },
          { status: 403 },
        );
      }
    }

    const updates = mapAdmissionNoticeUpdateToDb(body);
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data, error } = await auth.supabase
      .from('admission_notices')
      .update(updates)
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) {
      console.error('[admin/admission-notices PATCH] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 });
    }

    const mapped = mapAdmissionNoticeFromDb(data as never);
    return NextResponse.json({
      notice: {
        ...mapped,
        publicImageUrl: getAdmissionNoticePublicUrl(mapped.imagePath),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/admission-notices PATCH] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    // Read first so we have the storage paths for cleanup.
    const { data: existing, error: readErr } = await auth.supabase
      .from('admission_notices')
      .select('image_path, original_path')
      .eq('id', id)
      .maybeSingle();
    if (readErr) {
      console.error('[admin/admission-notices DELETE] read:', readErr);
      return NextResponse.json({ error: readErr.message }, { status: 500 });
    }
    if (!existing) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 });
    }

    // Delete the row first (DB is the source of truth for the
    // notice existence). Then clean up storage. If storage fails,
    // we still return 204 because the row is gone — orphan files
    // are recoverable manually.
    const { error: delErr } = await auth.supabase
      .from('admission_notices')
      .delete()
      .eq('id', id);
    if (delErr) {
      console.error('[admin/admission-notices DELETE] supabase error:', delErr);
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    const imagePath = (existing as { image_path: string }).image_path;
    const originalPath = (existing as { original_path: string }).original_path;
    const cleanup = await deleteAdmissionNoticeImages(originalPath, imagePath);
    return NextResponse.json(
      {
        success: true,
        cleanup,
      },
      { status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/admission-notices DELETE] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

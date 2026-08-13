import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { deletePartnerDocFile } from '@/lib/storage';

export const dynamic = 'force-dynamic';

/**
 * POST /api/partner/documents/bulk
 *
 * Bulk actions for the partner Documents list. Mirrors the
 * Phase 1.4 partner applications bulk + S31 admin applications
 * bulk + Phase 1.6 partner applications per-field patterns.
 *
 * Body:
 *   {
 *     ids: string[],                                     // row ids (UUIDs)
 *     action: 'delete' | 'move-to-application' | 'unlink-from-application',
 *     applicationId?: string                             // required for 'move-to-application'
 *   }
 *
 *   - delete                       : delete the row + storage object
 *   - move-to-application          : set partner_application_id = applicationId
 *   - unlink-from-application      : set partner_application_id = NULL
 *
 * Response: { updated: number, failed: Array<{ id, error }> }
 *
 * Auth: requireTeamMember. RLS scopes every operation to the
 * caller's partner — a foreign id surfaces in the `failed` array
 * with "Document not found" instead of failing the whole batch.
 *
 * 200-row cap (matches S31 + Phase 1.4). Per-row errors don't
 * fail-fast — surface in `failed` so the UI can show a result
 * dialog with the failure list (S31 pattern).
 */
const ALLOWED_ACTIONS = [
  'delete',
  'move-to-application',
  'unlink-from-application',
] as const;
type BulkAction = (typeof ALLOWED_ACTIONS)[number];

const MAX_BULK_ROWS = 200;

export async function POST(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireTeamMember(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const ids = Array.isArray(body.ids)
      ? (body.ids as unknown[]).filter((x) => typeof x === 'string')
      : [];
    const actionRaw = typeof body.action === 'string' ? body.action : '';
    const applicationId =
      typeof body.applicationId === 'string' ? body.applicationId.trim() : '';

    if (ids.length === 0) {
      return NextResponse.json({ error: 'ids must be a non-empty array' }, { status: 400 });
    }
    if (ids.length > MAX_BULK_ROWS) {
      return NextResponse.json(
        { error: `Bulk actions are limited to ${MAX_BULK_ROWS} rows per call` },
        { status: 400 },
      );
    }
    if (!(ALLOWED_ACTIONS as readonly string[]).includes(actionRaw)) {
      return NextResponse.json(
        { error: `action must be one of: ${ALLOWED_ACTIONS.join(', ')}` },
        { status: 400 },
      );
    }
    const action = actionRaw as BulkAction;
    if (action === 'move-to-application' && !applicationId) {
      return NextResponse.json(
        { error: 'applicationId is required for move-to-application' },
        { status: 400 },
      );
    }

    // Cross-tenant guard for move-to-application: the target app
    // must belong to the caller's partner. Pre-flight check so we
    // don't issue N row updates that all fail.
    if (action === 'move-to-application') {
      const service = buildServiceClient();
      const { data: appRow, error: appErr } = await service
        .from('partner_applications')
        .select('id, partner_id')
        .eq('id', applicationId)
        .maybeSingle();
      if (appErr) {
        return NextResponse.json({ error: appErr.message }, { status: 500 });
      }
      if (!appRow) {
        return NextResponse.json({ error: 'applicationId not found' }, { status: 400 });
      }
      if ((appRow as { partner_id: string }).partner_id !== auth.partnerId) {
        return NextResponse.json(
          { error: 'applicationId belongs to a different partner org' },
          { status: 403 },
        );
      }
    }

    const failed: Array<{ id: string; error: string }> = [];
    const validIds = ids.filter((id): id is string => typeof id === 'string' && !!id);
    for (const id of ids) {
      if (typeof id !== 'string' || !id) {
        failed.push({ id: String(id), error: 'invalid id' });
      }
    }

    if (action === 'delete') {
      // Fetch the rows in one batch first to avoid N+1 and to detect
      // foreign ids up front — a row not in the partner's scope returns
      // 0 rows from the .in() call.
      const { data: docs, error: docsErr } = await auth.supabase
        .from('student_documents')
        .select('id, file_url, partner_student_id')
        .in('id', validIds)
        .not('partner_student_id', 'is', null);
      if (docsErr) {
        return NextResponse.json({ error: docsErr.message }, { status: 500 });
      }

      const foundIds = new Set<string>();
      const expectedPrefix = `partner/${auth.partnerId}/`;
      await Promise.all(
        (docs || []).map(async (d) => {
          const r = d as { id: string; file_url: string };
          foundIds.add(r.id);
          if (r.file_url.startsWith(expectedPrefix)) {
            await deletePartnerDocFile(r.file_url).catch((err) => {
              console.warn(`[partner/documents/bulk] storage delete failed for ${r.id}:`, err);
            });
          } else {
            console.warn(
              `[partner/documents/bulk] file_url outside partner prefix; skipping storage delete for ${r.id}`,
            );
          }
        }),
      );

      // Single batched DB delete for all found rows.
      let deletedCount = 0;
      if (foundIds.size > 0) {
        const idsToDelete = Array.from(foundIds);
        const { error: delErr, count } = await auth.supabase
          .from('student_documents')
          .delete({ count: 'exact' })
          .in('id', idsToDelete);
        if (delErr) {
          return NextResponse.json({ error: delErr.message }, { status: 500 });
        }
        deletedCount = count || 0;
      }

      for (const id of validIds) {
        if (!foundIds.has(id)) {
          failed.push({ id, error: 'Document not found' });
        }
      }
      return NextResponse.json({ updated: deletedCount, failed });
    }

    // move-to-application / unlink-from-application: single batched update.
    const updatePayload =
      action === 'move-to-application'
        ? { partner_application_id: applicationId }
        : { partner_application_id: null };
    const { data: updatedRows, error: updateErr } = await auth.supabase
      .from('student_documents')
      .update(updatePayload)
      .in('id', validIds)
      .select('id');

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    const updatedIds = new Set((updatedRows || []).map((r) => (r as { id: string }).id));
    for (const id of validIds) {
      if (!updatedIds.has(id)) {
        failed.push({ id, error: 'Document not found' });
      }
    }

    return NextResponse.json({ updated: updatedIds.size, failed });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/documents/bulk] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
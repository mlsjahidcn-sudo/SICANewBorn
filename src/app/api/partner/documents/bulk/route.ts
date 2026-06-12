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

    let updated = 0;
    const failed: Array<{ id: string; error: string }> = [];

    // For delete we need the storage path per row to also remove
    // the Storage object. Fetch the rows in one batch first to
    // avoid N+1 (and to detect foreign ids up front — a row not in
    // the partner's scope returns 0 rows from the .in() call).
    let docsById: Map<string, { id: string; file_url: string }> | null = null;
    if (action === 'delete') {
      const { data: docs, error: docsErr } = await auth.supabase
        .from('student_documents')
        .select('id, file_url, partner_student_id')
        .in('id', ids as string[])
        .not('partner_student_id', 'is', null);
      if (docsErr) {
        return NextResponse.json({ error: docsErr.message }, { status: 500 });
      }
      docsById = new Map(
        (docs || []).map((d) => {
          const r = d as { id: string; file_url: string };
          return [r.id, { id: r.id, file_url: r.file_url }];
        }),
      );
    }

    for (const id of ids) {
      if (typeof id !== 'string' || !id) {
        failed.push({ id: String(id), error: 'invalid id' });
        continue;
      }
      try {
        if (action === 'delete') {
          const doc = docsById?.get(id);
          if (!doc) {
            failed.push({ id, error: 'Document not found' });
            continue;
          }
          // Same prefix guard as the single-doc DELETE route —
          // don't issue a destructive Storage call on a path
          // outside this partner's namespace.
          const expectedPrefix = `partner/${auth.partnerId}/`;
          if (doc.file_url.startsWith(expectedPrefix)) {
            const removed = await deletePartnerDocFile(doc.file_url);
            if (!removed) {
              console.warn(
                `[partner/documents/bulk] storage delete returned false for ${id}`,
              );
            }
          } else {
            console.warn(
              `[partner/documents/bulk] file_url outside partner prefix; skipping storage delete for ${id}`,
            );
          }
          const { error } = await auth.supabase
            .from('student_documents')
            .delete()
            .eq('id', id);
          if (error) {
            failed.push({ id, error: error.message });
          } else {
            updated++;
          }
        } else if (action === 'move-to-application') {
          const { error } = await auth.supabase
            .from('student_documents')
            .update({ partner_application_id: applicationId })
            .eq('id', id);
          if (error) {
            failed.push({ id, error: error.message });
          } else {
            updated++;
          }
        } else if (action === 'unlink-from-application') {
          const { error } = await auth.supabase
            .from('student_documents')
            .update({ partner_application_id: null })
            .eq('id', id);
          if (error) {
            failed.push({ id, error: error.message });
          } else {
            updated++;
          }
        }
      } catch (err) {
        failed.push({ id, error: err instanceof Error ? err.message : 'unknown' });
      }
    }

    return NextResponse.json({ updated, failed });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/documents/bulk] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
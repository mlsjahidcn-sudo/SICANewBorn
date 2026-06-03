/**
 * storage-client.ts — browser-side wrappers around the storage APIs.
 * Mirrors the server-side `src/lib/storage.ts` but exposed to client
 * components (the server one uses the service-role key — we don't want
 * to bundle that into the client).
 *
 * For downloads, the client just calls a server route to get a signed
 * URL, then opens it in a new tab.
 */

import { apiFetchJson } from '@/lib/api-client';

export async function createStudentDocDownloadUrl(
  storagePath: string,
): Promise<{ downloadUrl: string | null }> {
  try {
    const res = await apiFetchJson<{ downloadUrl: string }>(
      `/api/student/documents/download-url?path=${encodeURIComponent(storagePath)}`,
    );
    return { downloadUrl: res.downloadUrl };
  } catch {
    return { downloadUrl: null };
  }
}

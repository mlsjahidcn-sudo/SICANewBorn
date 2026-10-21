/**
 * /success-stories — Public Success Stories page (Phase G5).
 *
 * Showcases SICA's admitted students via watermarked images of
 * real admission notices. Phase 51 shipped this as a single
 * `'use client'` page that fetched on mount — crawlers and the
 * first paint saw an empty grid. Phase G5 splits it the same way
 * Phase 92 did for scholarships/[slug] and universities/compare:
 *   - this RSC shell server-fetches page 1 (mirrors the public API)
 *   - SuccessStoriesClient owns filters / load-more / lightbox
 *
 * Metadata lives in `layout.tsx` (generateMetadata + hreflang).
 */

import SuccessStoriesClient, {
  type SuccessStoryNotice,
} from './success-stories-client';
import { mapAdmissionNoticeFromDb } from '@/lib/admission-notices/mapper';
import { getAdmissionNoticePublicUrl } from '@/lib/admission-notices/storage';
import { getSupabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

interface InitialPayload {
  notices: SuccessStoryNotice[];
  total: number;
  totalPages: number;
}

/**
 * Server-side fetch of page 1 — same shape as
 * `GET /api/admission-notices` so the client island can seed state
 * without a mount re-fetch. Order is `display_order` DESC then
 * `created_at` DESC (API contract). `publicImageUrl` is hydrated
 * separately; `imagePath` stays the storage key.
 */
async function loadInitialNotices(): Promise<InitialPayload> {
  const empty: InitialPayload = { notices: [], total: 0, totalPages: 1 };
  const supabase = getSupabaseServer();
  if (!supabase) return empty;

  try {
    const { data, error, count } = await supabase
      .from('admission_notices')
      .select('*', { count: 'exact' })
      .eq('is_published', true)
      .order('display_order', { ascending: false })
      .order('created_at', { ascending: false })
      .range(0, PAGE_SIZE - 1);

    if (error || !data) {
      if (error) {
        console.error('[success-stories] admission notices fetch failed:', error);
      }
      return empty;
    }

    const notices: SuccessStoryNotice[] = data.map((row) => {
      const mapped = mapAdmissionNoticeFromDb(row as never);
      return {
        id: mapped.id,
        studentName: mapped.studentName,
        universityName: mapped.universityName,
        program: mapped.program,
        degree: mapped.degree,
        intake: mapped.intake,
        scholarship: mapped.scholarship,
        country: mapped.country,
        imagePath: mapped.imagePath,
        publicImageUrl: getAdmissionNoticePublicUrl(mapped.imagePath),
        isPublished: mapped.isPublished,
        displayOrder: mapped.displayOrder,
        createdAt: mapped.createdAt,
      };
    });

    const total = count ?? notices.length;
    return {
      notices,
      total,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    };
  } catch (err) {
    console.error('[success-stories] admission notices fetch failed:', err);
    return empty;
  }
}

export default async function SuccessStoriesPage() {
  const { notices, total, totalPages } = await loadInitialNotices();

  return (
    <SuccessStoriesClient
      initialNotices={notices}
      initialTotal={total}
      initialTotalPages={totalPages}
    />
  );
}

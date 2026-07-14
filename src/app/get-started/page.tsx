import { Suspense } from 'react';
import type { Metadata } from 'next';
import { GetStartedClient } from './GetStartedClient';
import { mapAdmissionNoticeFromDb } from '@/lib/admission-notices/mapper';
import { getSupabaseServer } from '@/lib/supabase-server';
import { getAdmissionNoticePublicUrl } from '@/lib/admission-notices/storage';
import type { AdmissionNotice, RawAdmissionNotice } from '@/lib/admission-notices/types';
import { SITE_URL } from '@/lib/site-url';

/**
 * /get-started — the public sales landing page for influencer
 * traffic (YouTube + TikTok). Designed to convert a cold video
 * viewer to a WhatsApp conversation in under 30 seconds.
 *
 * Server component responsibilities:
 *  - SEO metadata (title, description, OG image, canonical)
 *  - Pre-fetch the top 6 published admission notices (so the
 *    page renders with content even before client hydration)
 *  - Wrap the interactive island in <Suspense> (Next 16
 *    requires this for `useSearchParams`)
 *
 * Everything interactive (UTM capture, WhatsApp CTAs, lightbox,
 * video modal) lives in GetStartedClient.tsx.
 */

export const dynamic = 'force-dynamic';

const PAGE_TITLE = 'Get into a top Chinese university — SICA admission services';
const PAGE_DESCRIPTION =
  "Real students. Real offer letters. 90% success rate with our partner universities, or 30% of your fee back. DIY guidance from $50, full-service from $500. Chat with SICA on WhatsApp.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    // Phase 57: this page is the only canonical /get-started
    // surface (no per-locale variants). Cookie-based i18n
    // doesn't need hreflang here.
    canonical: `${SITE_URL}/get-started`,
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/get-started`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

interface RawAdmissionRow {
  id: string;
  student_name: string;
  university_name: string;
  program?: string | null;
  degree: RawAdmissionNotice['degree'];
  intake?: string | null;
  scholarship?: string | null;
  country?: string | null;
  image_path?: string;
  original_path: string;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Server-side fetch of the top 6 published admission notices.
 * Mirrors the shape of /api/admission-notices GET so the page
 * renders with real data before the client island hydrates.
 * RLS scopes the SELECT to is_published = TRUE, so the
 * unauthenticated service-role client never sees drafts.
 */
async function loadInitialNotices(): Promise<AdmissionNotice[]> {
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('admission_notices')
      .select(
        'id, student_name, university_name, program, degree, intake, scholarship, country, image_path, original_path, is_published, display_order, created_at, updated_at',
      )
      .eq('is_published', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(6);
    if (error || !data) return [];
    // The DB row's `image_path` is a storage key like
    // 'public/abc.jpg'. The page's <img> needs a public URL —
    // resolve it through getAdmissionNoticePublicUrl. The
    // mapper accepts a RawAdmissionNotice so we pass the
    // patched image_path through.
    return (data as RawAdmissionRow[]).map((raw) => {
      const publicUrl = raw.image_path
        ? getAdmissionNoticePublicUrl(raw.image_path) || raw.image_path
        : '';
      return mapAdmissionNoticeFromDb({
        ...raw,
        image_path: publicUrl,
      });
    });
  } catch (err) {
    // Fall back to empty — the page renders the empty state
    // copy. Failures are non-fatal for a marketing page.
    console.error('[get-started] admission notices fetch failed:', err);
    return [];
  }
}

export default async function GetStartedPage() {
  const initialNotices = await loadInitialNotices();
  return (
    // useSearchParams in GetStartedClient requires <Suspense>
    // (Next 16 App Router rule). The fallback is the full page
    // rendered with an empty UTM context — the page is static
    // enough that this won't be visible for more than a frame.
    <Suspense fallback={<GetStartedClient initialNotices={initialNotices} />}>
      <GetStartedClient initialNotices={initialNotices} />
    </Suspense>
  );
}

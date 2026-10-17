import { Suspense } from 'react';
import type { Metadata } from 'next';
import { GetStartedClient } from './GetStartedClient';
import { mapAdmissionNoticeFromDb } from '@/lib/admission-notices/mapper';
import { getSupabaseServer } from '@/lib/supabase-server';
import { getAdmissionNoticePublicUrl } from '@/lib/admission-notices/storage';
import type { AdmissionNotice, RawAdmissionNotice } from '@/lib/admission-notices/types';
import { buildLanguageAlternates } from '@/lib/alternates';
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
// Phase 147: the old meta description quoted package prices
// ($50/$700) and a refund percentage — ground rule 2 bans paid
// package prices from public pages, and the meta is public even on
// a noindexed page (link previews). Prices now live only in the
// sales conversation after the free consultation.
const PAGE_DESCRIPTION =
  'SICA admission services for international students: real students, real offer letters, end-to-end support from application to arrival. Start with a free 10-minute consultation.';

export async function generateMetadata(): Promise<Metadata> {
  return {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: await buildLanguageAlternates('/get-started'),
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
  // Phase 147 (Task 7): noindex — this page shows paid package
  // prices and refund terms, which must not appear in public search
  // results (SEO brief ground rule 2). The page stays reachable via
  // direct links for paid influencer traffic; removed from the
  // sitemap in the same phase. [verify] Jahid: revisit if the page
  // is ever rewritten price-free.
  robots: {
    index: false,
    follow: false,
  },
  };
}

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
    // (Next 16 App Router rule).
    //
    // The fallback used to be `<GetStartedClient ... />` — the FULL
    // page. Because the boundary suspends during SSR, Next streamed
    // the fallback into a `<template id="B:0">` AND then streamed the
    // real content — so the HTML carried the page twice.
    //
    // Two consequences, both verified on the live site 2026-10-17:
    //   - the page rendered TWO identical <h1> elements ("Get into a
    //     top Chinese university — without the chaos"), which is a
    //     genuine duplicate-heading defect, not a cosmetic one;
    //   - every byte of the page was transmitted twice, on a page
    //     that already weighs ~121 KB.
    //
    // The fallback is now a content-free skeleton: same visual shape,
    // no headings and no copy, so it cannot duplicate anything a
    // parser would read.
    <Suspense fallback={<GetStartedSkeleton />}>
      <GetStartedClient initialNotices={initialNotices} />
    </Suspense>
  );
}

/**
 * Content-free placeholder for the Suspense boundary above.
 *
 * Deliberately contains NO headings, NO text and NO links — only
 * sized blocks. The old fallback rendered the entire page, so the
 * streamed HTML carried two <h1>s and two copies of every word.
 */
function GetStartedSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]" aria-hidden="true">
      <section className="bg-gradient-to-br from-[#1B2A4A] to-[#2d4170] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
          <div className="mx-auto mb-4 h-6 w-48 rounded-full bg-white/10" />
          <div className="mx-auto mb-4 h-12 w-full max-w-xl rounded bg-white/10" />
          <div className="mx-auto mb-8 h-6 w-full max-w-2xl rounded bg-white/10" />
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <div className="h-12 w-40 rounded bg-white/10" />
            <div className="h-12 w-40 rounded bg-white/10" />
          </div>
        </div>
      </section>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="h-8 w-2/3 rounded bg-[#1B2A4A]/10" />
        <div className="h-40 w-full rounded bg-[#1B2A4A]/5" />
        <div className="h-40 w-full rounded bg-[#1B2A4A]/5" />
      </div>
    </div>
  );
}

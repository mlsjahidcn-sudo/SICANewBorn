import type { Metadata } from "next";
import { buildLanguageAlternates } from "@/lib/alternates";
import { Suspense } from 'react';
import ThankYouClient from './ThankYouClient';

export const metadata: Metadata = {
  alternates: buildLanguageAlternates('/thank-you'),
  robots: { index: false, follow: false },
};

/**
 * /thank-you — post-conversion confirmation page.
 *
 * Reached after the contact form (/contact) or assessment form
 * (/assessment) submits. Sets expectations (when you'll hear
 * back), offers multi-channel reach-out (WhatsApp / email /
 * schedule a call), surfaces social proof + related content.
 * Single biggest conversion-rate lift per the funnel audit
 * because the lead's last impression is the brand, not the
 * form.
 *
 * URL contract:
 *   ?source=contact|assessment        — which form was just submitted
 *                                       (affects the headline + body copy)
 *   ?interest=<slug>                  — for the "you were looking at
 *                                       this university" personalisation
 *                                       block when the lead came from
 *                                       a university detail page's
 *                                       "Apply" CTA (Phase 24 wired
 *                                       ?interest=<slug> into the
 *                                       redirect chain)
 *   ?ref=<row-uuid>                   — SICA-side reference for the
 *                                       row. We don't store the id on
 *                                       the client (privacy + tiny
 *                                       payload), but the page is
 *                                       ready to surface it if we
 *                                       add a server round-trip later.
 *
 * Server component wrapper so the page is indexable by search
 * engines (the default copy is bilingual and useful content)
 * + a client island for the search-params + copy-link state.
 * The Suspense boundary is required by Next.js when a child
 * client component uses useSearchParams — without it the
 * whole page becomes client-rendered.
 */
export default function ThankYouPage() {
  return (
    <Suspense fallback={<ThankYouSkeleton />}>
      <ThankYouClient />
    </Suspense>
  );
}

/**
 * Static skeleton shown during the Suspense fallback (first
 * paint before hydration). Mirrors the hero so the page
 * doesn't flash to a blank state. The actual content swaps
 * in after hydration with the personalized ?source-aware
 * copy.
 */
function ThankYouSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="bg-[#1B2A4A] py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="h-20 w-20 bg-white/10 mx-auto mb-6 animate-pulse" />
          <div className="h-10 w-2/3 mx-auto bg-white/10 mb-4 animate-pulse" />
          <div className="h-6 w-1/2 mx-auto bg-white/10 animate-pulse" />
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="h-32 bg-gray-200 animate-pulse" />
        <div className="h-32 bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
}

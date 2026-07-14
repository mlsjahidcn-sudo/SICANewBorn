'use client';

/**
 * GetStartedCta — a small, reusable link/button that points at
 * /get-started (the Phase 57 sales landing page).
 *
 * 3 visual variants for different surfaces:
 *  - 'hero'        : big primary button (for hero CTAs)
 *  - 'banner'      : inline banner for list-page top bars
 *  - 'inline'      : text link for "or compare our packages" links
 *
 * All variants accept an optional `university` / `program` prop
 * for future per-context deep-linking. For now the link just
 * points at /get-started (the GA event on the sales page picks
 * up the UTM + sets the tier in the WhatsApp pre-fill).
 */

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export interface GetStartedCtaProps {
  variant?: 'hero' | 'banner' | 'inline';
  /** Where the user came from — used in the click target's analytics. */
  location: string;
  /** Optional university / program context. Forwarded as `?interest=`
   *  / `?program=` query params so the sales page can show
   *  personalized copy. No-op until the sales page reads them. */
  university?: string;
  program?: string;
  /** Optional className passthrough so callers can position it
   *  within their own layout (e.g. flex-1, ml-4, etc.). */
  className?: string;
}

export function GetStartedCta({
  variant = 'inline',
  location,
  university,
  program,
  className = '',
}: GetStartedCtaProps) {
  const { t } = useI18n();
  const params = new URLSearchParams();
  if (university) params.set('interest', university);
  if (program) params.set('program', program);
  params.set('from', location);
  const href = `/get-started${params.toString() ? `?${params}` : ''}`;

  const labelKey =
    variant === 'hero'
      ? 'getStarted.heroCta'
      : variant === 'banner'
        ? 'getStarted.bannerCta'
        : 'getStarted.inlineCta';
  const label = t(labelKey);

  if (variant === 'hero') {
    return (
      <Link
        href={href}
        data-get-started={location}
        className={`inline-flex items-center justify-center gap-2 bg-[#9B1B30] hover:bg-[#7A1526] text-white font-semibold px-7 py-3 text-base transition-colors ${className}`}
      >
        <Sparkles className="h-5 w-5" />
        {label}
        <ArrowRight className="h-5 w-5" />
      </Link>
    );
  }

  if (variant === 'banner') {
    return (
      <Link
        href={href}
        data-get-started={location}
        className={`inline-flex items-center gap-2 border-2 border-[#9B1B30] text-[#9B1B30] hover:bg-[#9B1B30] hover:text-white px-4 py-2 text-sm font-semibold transition-colors ${className}`}
      >
        <Sparkles className="h-4 w-4" />
        {label}
        <ArrowRight className="h-4 w-4" />
      </Link>
    );
  }

  // 'inline' — a quiet text link for "or compare our packages" surfaces.
  return (
    <Link
      href={href}
      data-get-started={location}
      className={`inline-flex items-center gap-1 text-sm font-semibold text-[#9B1B30] hover:underline ${className}`}
    >
      <Sparkles className="h-3.5 w-3.5" />
      {label}
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}

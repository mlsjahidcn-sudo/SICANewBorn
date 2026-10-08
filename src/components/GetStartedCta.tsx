'use client';

/**
 * GetStartedCta — small CTA component used on list/detail pages.
 *
 * Phase 148: the destination is now `/counselling` (free 10-minute
 * consultation) instead of `/get-started`. `/get-started` is the
 * Phase 57 paid-package landing page; the Phase 148 spec removed all
 * public links to it (it remains noindexed for paid traffic that
 * reaches it via direct URL).
 *
 * 3 visual variants for different surfaces:
 *  - 'hero'   : big primary button (homepage / hero slots)
 *  - 'banner' : inline banner for list-page top bars
 *  - 'inline' : quiet text link
 *
 * The component name + API stayed the same so the 4 call sites
 * (universities list + detail, programs list + detail) need zero
 * diff — only the underlying href changed.
 */

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export interface GetStartedCtaProps {
  variant?: 'hero' | 'banner' | 'inline';
  /** Where the user came from — used in the click target's analytics
   *  and forwarded as `?from=` to the counselling wizard. */
  location: string;
  /** Optional university / program context. Forwarded as `?interest=`
   *  / `?program=` query params. */
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
  // Phase 148: was /get-started; /get-started is the paid-package
  // landing page and the spec requires no public surface links to
  // it. The free 10-minute consultation is the new conversion.
  const href = `/counselling${params.toString() ? `?${params}` : ''}`;

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
        data-counselling-from={location}
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
        data-counselling-from={location}
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
      data-counselling-from={location}
      className={`inline-flex items-center gap-1 text-sm font-semibold text-[#9B1B30] hover:underline ${className}`}
    >
      <Sparkles className="h-3.5 w-3.5" />
      {label}
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}
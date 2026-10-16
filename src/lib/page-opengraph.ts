/**
 * Shared Open Graph / Twitter card builder.
 *
 * ─────────────────────────────────────────────────────────────────
 * WHY THIS EXISTS (Phase 185)
 * ─────────────────────────────────────────────────────────────────
 * 16 pages that define their own <title> and description had no
 * `openGraph` block, so Next fell through to the root layout's defaults
 * and served the SITE title on all of them:
 *
 *     /programs     og:title → "SICA | Study in China - Your Gateway…"
 *     /universities og:title → "SICA | Study in China - Your Gateway…"
 *     /scholarships og:title → "SICA | Study in China - Your Gateway…"
 *
 * Three pages introducing themselves as "SICA" is a citation problem,
 * not a cosmetic one: answer engines and chat assistants quote the
 * Open Graph title when they select a source, so a page that never names
 * itself is a page that gets cited generically or not at all.
 *
 * The fix pattern already existed on /assessment. This just makes it
 * reusable so the next page added does not reintroduce the bug.
 */
import type { Metadata } from 'next';
import { SITE_URL } from './site-url';

interface PageOpenGraphInput {
  /** Page-specific title. Falls back to the site default. */
  title: string;
  /** Page-specific description. Falls back to the site default. */
  description: string;
  /**
   * Route path, e.g. '/programs'. Used to build an absolute og:url and
   * to select a per-route share image when one is configured.
   */
  path: string;
  /**
   * Absolute or root-relative share image. Defaults to the site
   * fallback so a page never emits an og:image-less card — several
   * social scrapers drop the preview entirely without one.
   */
  image?: string;
}

export function buildPageOpenGraph({
  title,
  description,
  path,
  image,
}: PageOpenGraphInput): {
  openGraph: NonNullable<Metadata['openGraph']>;
  twitter: NonNullable<Metadata['twitter']>;
} {
  const url = `${SITE_URL}${path}`;
  const imageUrl = image ?? `${SITE_URL}/og-default.png`;

  return {
    openGraph: {
      type: 'website',
      siteName: 'SICA',
      title,
      description,
      url,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

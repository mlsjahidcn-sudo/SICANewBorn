import type { Locale } from '../i18n-translations';

/**
 * Hub data for /guides. Each card links to a single long-form
 * guide. The "stats" on each card are short-form summaries that
 * the page can render in a tight grid.
 *
 * `category` separates process guides (the original /guides/*
 * pages that walk through an end-to-end workflow) from evergreen
 * listicle pages (Phase 39/40/41 "best of" + comparison + scholarship
 * deep-dives). The hub page groups cards by category.
 */
export interface GuideCard {
  slug: string;
  href: string;
  icon:
    | 'compass'
    | 'clipboard-list'
    | 'passport'
    | 'award'
    | 'wallet'
    | 'bed'
    | 'trophy'
    | 'briefcase'
    | 'cog'
    | 'map-pin'
    | 'tag'
    | 'activity'
    | 'building-2'
    | 'landmark'
    | 'calendar-clock'
    | 'graduation-cap'
    | 'scale'
    | 'file-check';
  category: 'process' | 'listicle';
  title: string;
  subtitle: string;
  readTime: string;
  highlight: string;
}

export type LocalizedGuideCards = Record<Locale, GuideCard[]>;

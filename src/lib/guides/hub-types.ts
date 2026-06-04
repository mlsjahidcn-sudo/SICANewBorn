import type { Locale } from '../i18n-translations';

/**
 * Hub data for /guides. Each card links to a single long-form
 * guide. The "stats" on each card are short-form summaries that
 * the page can render in a tight grid.
 */
export interface GuideCard {
  slug: string;
  href: string;
  icon: 'compass' | 'clipboard-list' | 'passport';
  title: string;
  subtitle: string;
  readTime: string;
  highlight: string;
}

export type LocalizedGuideCards = Record<Locale, GuideCard[]>;

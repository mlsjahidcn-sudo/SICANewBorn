/**
 * Long-form guide content for the SICA Guides section.
 *
 * Each module exports one object per guide keyed by locale. Pages
 * import from here, so editing copy in one place updates the
 * static page + the JSON-LD FAQ/HowTo schemas in lock-step.
 *
 * Authoring notes for SEO/GEO/AEO:
 * - H2s read as question-shaped phrases where possible (AEO)
 * - Each section ends with a 1-2 sentence declarative answer
 *   phrased like a snippet (AEO + GEO extractability)
 * - Bullet lists and tables are preferred over paragraphs (GEO)
 * - Sources and authority signals are inline so LLMs can cite
 */

import type { Locale } from '../i18n-translations';

export interface GuideFAQ {
  q: string;
  a: string;
}

export interface GuideStep {
  name: string;
  text: string;
}

export interface GuideSection {
  /** URL fragment used for the table-of-contents anchor. */
  id: string;
  h2: string;
  intro: string;
  /**
   * Inline content blocks. Each block type is rendered with a
   * small switch in the page component. We use a discriminated
   * union so authors can't mix structural fields accidentally.
   */
  blocks: GuideBlock[];
}

export type GuideBlock =
  | { type: 'p'; text: string }
  | { type: 'h3'; text: string; body: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'table'; caption: string; columns: string[]; rows: string[][] }
  | { type: 'callout'; tone: 'info' | 'success' | 'warning'; text: string };

export interface Guide {
  slug: string;
  /** Display H1 for the page hero. */
  title: string;
  /** Meta description (max ~155 chars). */
  description: string;
  /**
   * SEO title, used for <title> / og:title / twitter:title.
   *
   * The `title` above is the visible H1 — a headline, which can run to
   * 100+ characters. A search result truncates around 60, and a
   * truncated title reads as a fragment ("Best MBA Programs in China
   * for International"). So the metadata title is authored separately
   * and falls back to `title` when a guide has not needed one.
   *
   * Kept in the guide data rather than in each page.tsx so the two
   * never drift, and so a guide can be re-slugged without touching
   * its metadata.
   */
  seoTitle?: string;
  /**
   * SEO meta description, used for <meta name="description"> and the
   * og/twitter description. Falls back to `description`.
   */
  seoDescription?: string;
  /** Above-title eyebrow text. */
  eyebrow: string;
  /** Subtitle below H1. */
  subtitle: string;
  /** Hero stats (3 entries; rendered with a number + label). */
  stats: Array<{ value: string; label: string }>;
  /** 3-4 sentence direct-answer block at the top. Extracted by AEO/GEO. */
  quickAnswer: string;
  /** Bullet list of key facts shown in a sidebar card. */
  keyTakeaways: string[];
  /** Ordered list of H2 sections. */
  sections: GuideSection[];
  /** FAQ block rendered with FAQPage JSON-LD. */
  faqs: GuideFAQ[];
  /** Ordered list rendered as HowTo JSON-LD. */
  howToSteps: GuideStep[];
  /** Bottom CTA. */
  ctaTitle: string;
  ctaSubtitle: string;
  ctaApplyLabel: string;
  ctaContactLabel: string;
  /** Cross-link related guides. */
  related: Array<{ href: string; label: string; description: string }>;
  /**
   * Real publication date as `YYYY-MM-DD`, or OMITTED.
   *
   * Optional on purpose. This used to be a hardcoded `'2026-01-01'` in
   * the shared Article schema, which meant every guide on the site
   * claimed the same publication day — a pattern that makes the date
   * worthless to a reader and easily discounted by a crawler.
   *
   * Do NOT fill this with a guess. An absent date costs one recommended
   * (not required) field; a fabricated one is a false claim. Populate
   * it only when the real publication date is known.
   */
  publishedAt?: string;
  /**
   * Real last-content-change date as `YYYY-MM-DD`, or OMITTED.
   *
   * This was `new Date()` — which re-rendered as "today" on every single
   * build, so every guide claimed to have been edited the moment the
   * site was deployed, including the ones nobody had touched. A
   * freshness signal that is always fresh is the same as no signal.
   */
  updatedAt?: string;
}

export type LocalizedGuide = Record<Locale, Guide>;

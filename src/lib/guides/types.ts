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
}

export type LocalizedGuide = Record<Locale, Guide>;

/**
 * Sanitization + shaping for AI-generated chatbot FAQ answers (Phase 121).
 *
 * Mirrors blog-sanitize.ts's two defense layers, scaled down to the
 * FAQ shape:
 *   1. sanitizeMarkdown() — strip dangerous HTML before the row hits
 *      the DB. The chat renderer treats assistant text as plain
 *      markdown, so a leaked <script> would be inert, but we don't
 *      rely on that.
 *   2. scrubThirdPartyAgencies() — the S35 rule: the bot never names
 *      a competitor agency. The generator prompt forbids them; this
 *      catches leaks.
 */

import { extractJsonObject, sanitizeMarkdown, scrubThirdPartyAgencies } from '@/lib/ai/blog-sanitize';
import type { FaqCategory } from '@/lib/ai/faq-context';

const VALID_CATEGORIES: ReadonlyArray<FaqCategory> = [
  'general',
  'application',
  'visa',
  'scholarship',
  'life',
];

export const FAQ_CATEGORIES = VALID_CATEGORIES;

export interface NormalizedFaqPayload {
  question: string;
  answer: string;
  category: FaqCategory;
}

/**
 * Validate + shape the raw model output into the chatbot_faqs insert
 * payload. Throws on unusable output so the runner can retry the same
 * queue item. Category outside the closed set falls back to 'general'
 * rather than failing the row — a good answer with a wrong category
 * label is still worth an admin's review.
 */
export function normalizeFaqPayload(parsed: Record<string, unknown>): NormalizedFaqPayload {
  const question = typeof parsed.question === 'string' ? parsed.question.trim().slice(0, 500) : '';
  if (!question) throw new Error('Model returned no question');

  const rawAnswer = typeof parsed.answer === 'string' ? parsed.answer.trim() : '';
  if (!rawAnswer) throw new Error('Model returned no answer');
  const answer = sanitizeMarkdown(scrubThirdPartyAgencies(rawAnswer)).slice(0, 4_000);

  const category =
    typeof parsed.category === 'string' && (VALID_CATEGORIES as string[]).includes(parsed.category)
      ? (parsed.category as FaqCategory)
      : 'general';

  return { question, answer, category };
}

/**
 * Extract + normalize in one step: takes the model's freeform output,
 * pulls the JSON object out, parses, and validates. Returns null when
 * no JSON object is present at all (caller retries).
 */
export function extractAndNormalizeFaq(raw: string): NormalizedFaqPayload | null {
  const jsonStr = extractJsonObject(raw);
  if (!jsonStr) return null;
  try {
    const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
    return normalizeFaqPayload(parsed);
  } catch {
    return null;
  }
}

/**
 * Normalize a raw visitor question into the chatbot_faq_queue dedup
 * key: lowercase, trimmed, whitespace-collapsed. Must stay in sync
 * with the app-side upsert — the DB has a UNIQUE constraint on this
 * column, so any drift between writers surfaces as a 23505.
 */
export function normalizeQueueQuestion(question: string): string {
  return question.toLowerCase().trim().replace(/\s+/g, ' ').slice(0, 500);
}

const GREETING_RE =
  /^(hi+|hello+|hey+|yo|greetings|good\s*(morning|afternoon|evening|day)|how\s+are\s+you|你好|嗨|哈喽)\s*[!.?]*$/i;

/**
 * Gate for what deserves a queue slot. Greetings and sub-8-char
 * fragments ("cost?", " visa") are conversational noise — queuing
 * them would burn generator runs on nothing.
 */
export function isQueueWorthyQuestion(question: string): boolean {
  const trimmed = question.trim();
  if (trimmed.length < 8) return false;
  if (GREETING_RE.test(trimmed)) return false;
  return true;
}

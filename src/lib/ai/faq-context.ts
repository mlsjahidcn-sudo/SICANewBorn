/**
 * DB-backed FAQ source for the chatbot (Phase 121).
 *
 * Replaces the hardcoded `sicaFAQ` array in knowledge.ts as the
 * source for RAG FAQ injection. Active rows in `chatbot_faqs` are
 * served with the same 5-minute in-memory cache pattern as
 * live-data-context.ts:
 *
 *   - The cache is process-local (dev HMR / multiple workers each
 *     hold a copy — worst case is a few KB of stale text).
 *   - Admin FAQ writes call invalidateFaqCache() so edits go live
 *     immediately instead of after the TTL.
 *   - On any Supabase error (including "migration not applied yet")
 *     we fall back to the original static sicaFAQ array so the bot
 *     never goes dark. Same tradeoff as the live catalog: better a
 *     stale-but-correct answer than no answer.
 */

import { sicaFAQ, type FAQ } from '@/lib/ai/knowledge';
import { getSupabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';

const FAQ_CACHE_TTL_MS = 5 * 60 * 1000; // 5 min
const MAX_ACTIVE_FAQS = 100;

export type FaqCategory = FAQ['category'];

/** Shape served to the RAG builder — question/answer plus the metadata the admin UI and prompt builder need. */
export interface ActiveFaq {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
  priority: number;
}

interface FaqCacheEntry {
  fetchedAt: number;
  faqs: ActiveFaq[];
  source: 'live' | 'fallback';
}

let cache: FaqCacheEntry | null = null;

/** Drop the cached FAQ list (called by admin FAQ writes and the generator after inserting rows). */
export function invalidateFaqCache(): void {
  cache = null;
}

function staticFallback(): ActiveFaq[] {
  return sicaFAQ.map((faq, i) => ({
    id: `static-${i}`,
    question: faq.question,
    answer: faq.answer,
    category: faq.category,
    priority: 0,
  }));
}

/**
 * Read the active FAQ knowledge base. 'live' when the chatbot_faqs
 * table returned rows, 'fallback' when we're serving the hardcoded
 * list (Supabase down, table missing pre-migration, or zero active
 * rows — an all-retired knowledge base shouldn't blind the bot).
 */
export async function getActiveFaqs(): Promise<{ faqs: ActiveFaq[]; source: 'live' | 'fallback' }> {
  if (cache && Date.now() - cache.fetchedAt < FAQ_CACHE_TTL_MS) {
    return { faqs: cache.faqs, source: cache.source };
  }

  if (!isSupabaseServerConfigured()) {
    cache = { fetchedAt: Date.now(), faqs: staticFallback(), source: 'fallback' };
    return { faqs: cache.faqs, source: cache.source };
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    cache = { fetchedAt: Date.now(), faqs: staticFallback(), source: 'fallback' };
    return { faqs: cache.faqs, source: cache.source };
  }

  try {
    const { data, error } = await supabase
      .from('chatbot_faqs')
      .select('id, question, answer, category, priority')
      .eq('status', 'active')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(MAX_ACTIVE_FAQS);

    if (error) {
      console.error('[faq-context] active FAQ fetch failed, using static fallback:', error.message);
      cache = { fetchedAt: Date.now(), faqs: staticFallback(), source: 'fallback' };
      return { faqs: cache.faqs, source: cache.source };
    }

    const rows = (data ?? []) as Array<{
      id: string;
      question: string;
      answer: string;
      category: string;
      priority: number;
    }>;

    if (rows.length === 0) {
      cache = { fetchedAt: Date.now(), faqs: staticFallback(), source: 'fallback' };
      return { faqs: cache.faqs, source: cache.source };
    }

    const VALID: FaqCategory[] = ['general', 'application', 'visa', 'scholarship', 'life'];
    const faqs: ActiveFaq[] = rows.map((row) => ({
      id: row.id,
      question: row.question,
      answer: row.answer,
      category: (VALID as string[]).includes(row.category) ? (row.category as FaqCategory) : 'general',
      priority: Number.isFinite(row.priority) ? row.priority : 0,
    }));

    cache = { fetchedAt: Date.now(), faqs, source: 'live' };
    return { faqs, source: 'live' };
  } catch (err) {
    console.error('[faq-context] active FAQ fetch threw, using static fallback:', err);
    cache = { fetchedAt: Date.now(), faqs: staticFallback(), source: 'fallback' };
    return { faqs: cache.faqs, source: cache.source };
  }
}

/**
 * Keyword FAQ retrieval over the active knowledge base — same naive
 * substring match the original knowledge.ts searchFAQ used (no
 * embeddings; consistent with the rest of the RAG stack).
 * Higher-priority rows win when more than MAX_MATCHES hit.
 */
export async function searchFaqs(query: string, maxMatches = 3): Promise<ActiveFaq[]> {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];
  const { faqs } = await getActiveFaqs();
  return faqs
    .filter(
      (faq) =>
        faq.question.toLowerCase().includes(lowerQuery) ||
        faq.answer.toLowerCase().includes(lowerQuery),
    )
    .sort((a, b) => b.priority - a.priority)
    .slice(0, maxMatches);
}

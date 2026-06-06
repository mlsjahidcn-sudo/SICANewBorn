'use client';

/**
 * S37: "Latest news about this X" widget.
 *
 * Sits at the bottom of the university / program / scholarship
 * detail pages, linking the catalog back to recent news posts
 * that mention the entity. The reciprocal half of the S36
 * interlinking net (news posts already point to catalog; this
 * widget is how catalog pages point back to news).
 *
 * Why a client component + on-mount fetch: the host pages are
 * client components (interactive tabs, useState for the entity
 * itself). The widget does a small one-shot fetch when the
 * entity changes, caches the result in state, and renders
 * server-equivalent HTML. Loading state is a skeleton, error
 * state is silent (the catalog page is the primary content; if
 * the news query fails the visitor still gets a useful page).
 *
 * Why search terms, not an id: there is no FK from news_posts
 * to universities/programs/scholarships. The AI-generated posts
 * mention entities by name in the title/excerpt/content/tags,
 * so substring matching against a curated set of terms is the
 * right primitive. The API does the matching server-side.
 */
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Newspaper, ArrowRight, Calendar, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface NewsPost {
  id: string;
  slug: string;
  title_en: string;
  title_zh: string | null;
  excerpt_en: string | null;
  excerpt_zh: string | null;
  cover_image: string | null;
  category: string;
  tags: string[];
  published_at: string | null;
  read_time_minutes: number | null;
  matchedBy: string | null;
}

const CATEGORY_LABEL: Record<string, string> = {
  announcement: 'Announcement',
  partnership: 'Partnership',
  scholarship: 'Scholarship',
  university: 'University news',
  event: 'Event',
  guide: 'Study guide',
};

interface Props {
  /** Display name shown in the section header, e.g. "Tsinghua University" */
  label: string;
  /** Search terms — comma-separated, server-side OR-matched */
  terms: string;
  /** Optional category hint (e.g. 'scholarship' for a scholarship page) */
  category?: string;
  /** Optional id to exclude (so the same post doesn't link to itself) */
  excludeId?: string;
  /** Max posts to show. 1..10. */
  limit?: number;
  /** Locale for label rendering (en | zh). */
  locale?: 'en' | 'zh';
}

export function RelatedNews({
  label,
  terms,
  category,
  excludeId,
  limit = 4,
  locale = 'en',
}: Props) {
  const [posts, setPosts] = useState<NewsPost[] | null>(null);

  useEffect(() => {
    if (!terms) {
      setPosts([]);
      return;
    }
    let cancelled = false;
    setPosts(null);
    const params = new URLSearchParams();
    params.set('terms', terms);
    params.set('limit', String(limit));
    if (category) params.set('category', category);
    if (excludeId) params.set('exclude', excludeId);

    fetch(`/api/public/news-by-tag?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : { posts: [] }))
      .then((d) => {
        if (!cancelled) setPosts(d.posts || []);
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [terms, category, excludeId, limit]);

  // Loading state — three skeleton cards
  if (posts === null) {
    return (
      <section className="mt-10 pt-8 border-t border-gray-200">
        <h2 className="flex items-center gap-2 text-lg font-bold text-[#1B2A4A] mb-4">
          <Newspaper className="h-5 w-5" />
          {locale === 'en'
            ? `Latest news about ${label}`
            : `${label}的最新资讯`}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </section>
    );
  }

  // No matches — render nothing. Avoids empty boxes that hurt
  // the page visually. Catalog pages are the primary content;
  // a missing news widget isn't a regression.
  if (posts.length === 0) return null;

  return (
    <section className="mt-10 pt-8 border-t border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-[#1B2A4A]">
          <Newspaper className="h-5 w-5" />
          {locale === 'en'
            ? `Latest news about ${label}`
            : `${label}的最新资讯`}
        </h2>
        <Link
          href={`/news?q=${encodeURIComponent(label)}`}
          className="text-xs font-semibold text-[#9B1B30] hover:underline inline-flex items-center gap-1"
        >
          {locale === 'en' ? 'All news' : '全部资讯'}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((p) => {
          const href = `/news/${p.slug}`;
          return (
            <Link
              key={p.id}
              href={href}
              className="group block bg-white border border-gray-200 hover:border-[#9B1B30] transition-colors p-4"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#9B1B30] mb-1">
                {CATEGORY_LABEL[p.category] || p.category}
              </p>
              <h3 className="font-semibold text-sm text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors line-clamp-2 leading-snug">
                {p.title_en}
              </h3>
              {p.excerpt_en && (
                <p className="mt-2 text-xs text-gray-600 line-clamp-2 leading-relaxed">
                  {p.excerpt_en}
                </p>
              )}
              <div className="mt-3 flex items-center gap-3 text-[10px] text-gray-500">
                {p.published_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(p.published_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                )}
                {p.read_time_minutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {p.read_time_minutes} min
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

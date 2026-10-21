'use client';

/**
 * "Latest from SICA News" — a full-width strip below the footer's
 * main link grid.
 *
 * History: this used to be a sixth COLUMN of the footer's 6-column
 * grid (`FooterNews`). That was fragile — when `news_posts` was
 * empty the component returned `null`, which removed the column and
 * left the 6-col grid one cell short (Brand spans 2, so the row read
 * 5-of-6 with a hole next to it). Layout depended on database
 * content.
 *
 * Phase B (footer IA rework): the news widget became a full-width
 * strip BELOW the grid. A strip that collapses to zero height is
 * stable; a grid column that disappears is not. The grid is now
 * always 5 columns (Brand spans 2 + Explore + Get Started + Resources
 * + Portals) and never depends on what is in the news table.
 *
 * Why a client component: the host Footer is a client component (it
 * uses `useI18n` for the locale + a `useState` year). Mounting a
 * small client island inside it is simpler than refactoring Footer to
 * be a server component and threading server data through the layout
 * tree — and the payload is tiny (3 teasers of metadata, no body
 * text). SEO is unaffected: the detail pages themselves are RSC, and
 * this is chrome on every public page.
 *
 * Known cost: this is one client fetch per public-page load. It is
 * on the deferred list (see the Phase D notes in the footer plan) —
 * making it a server fetch requires the Footer to stop living inside
 * the client-only `ClientLayout`.
 */
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Newspaper, ArrowRight, Calendar } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface NewsTeaser {
  id: string;
  slug: string;
  title_en: string;
  title_zh: string | null;
  excerpt_en: string | null;
  category: string;
  published_at: string | null;
}

const categoryKeys: Record<string, string> = {
  announcement: 'news.category.announcement',
  partnership: 'news.category.partnership',
  scholarship: 'news.category.scholarship',
  university: 'news.category.university',
  event: 'news.category.event',
  guide: 'news.category.guide',
};

export function FooterNewsStrip() {
  const { t, locale } = useI18n();
  const [posts, setPosts] = useState<NewsTeaser[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    // limit=3 + no terms = "3 most recent published posts".
    // The endpoint handles both cases; we use terms=&limit=3 to
    // make the URL stable / shareable.
    fetch('/api/public/news-by-tag?limit=3')
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
  }, []);

  // No posts = no strip. Unlike the old column version this cannot
  // punch a hole in the grid — the strip simply isn't there.
  if (posts === null || posts.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1B2A4A] flex items-center gap-2">
          <Newspaper className="h-4 w-4 text-[#1B2A4A]" />
          {t('footer.latestNews')}
        </h3>
        <Link
          href="/news"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#9B1B30] hover:underline"
        >
          {t('footer.allNews')}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <Link key={p.id} href={`/news/${p.slug}`} className="group block">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9B1B30] mb-1">
              {t(categoryKeys[p.category] || 'news.category.announcement')}
            </p>
            <p className="text-sm text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors leading-snug line-clamp-2 font-medium">
              {locale === 'zh' && p.title_zh ? p.title_zh : p.title_en}
            </p>
            {p.published_at && (
              <p className="mt-1 text-[10px] text-gray-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(p.published_at).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

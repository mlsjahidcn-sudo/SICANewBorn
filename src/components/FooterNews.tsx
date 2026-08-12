'use client';

/**
 * S38: "Latest from SICA News" footer widget.
 *
 * Lives at the bottom of every public page (inside the global
 * Footer) and surfaces the 3 most recent published news posts.
 * One-shot on-mount fetch against /api/public/news-by-tag with
 * empty terms — that endpoint returns the most recent published
 * posts when no terms are provided, which is exactly what we
 * want for a global "latest news" strip.
 *
 * Why a client component: the host Footer is a client component
 * (uses useI18n + useState for the year). Mounting a small
 * client island inside it is simpler than refactoring Footer to
 * be a server component and threading server data through the
 * layout tree. The 3-card payload is tiny; SEO is not affected
 * because we only render metadata on a small piece of chrome,
 * and the news detail pages themselves are still RSC.
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

export function FooterNews() {
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

  // Don't render the section at all if the news table is empty.
  // The footer will simply skip this column. Avoids a half-rendered
  // "Latest News" header with no cards below it during the first
  // days of the site before any posts exist.
  if (posts === null || posts.length === 0) return null;

  return (
    <div>
      <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#1B2A4A] flex items-center gap-2">
        <Newspaper className="h-4 w-4" />
        {t('footer.latestNews')}
      </h4>
      <ul className="space-y-3">
        {posts.map((p) => (
          <li key={p.id}>
            <Link
              href={`/news/${p.slug}`}
              className="block group"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9B1B30] mb-0.5">
                {t(categoryKeys[p.category] || 'news.category.announcement')}
              </p>
              <p className="text-sm text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors leading-snug line-clamp-2 font-medium">
                {locale === 'zh' && p.title_zh ? p.title_zh : p.title_en}
              </p>
              {p.published_at && (
                <p className="mt-0.5 text-[10px] text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(p.published_at).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/news"
        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#9B1B30] hover:underline"
      >
        {t('footer.allNews')}
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

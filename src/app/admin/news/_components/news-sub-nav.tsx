'use client';

import Link from 'next/link';
import { Newspaper, Sparkles } from 'lucide-react';

/**
 * Sub-nav used by both /admin/news and /admin/news/automation so the
 * admin can flip between the post list and the automation dashboard
 * with a single click. Active state is passed in as a prop.
 *
 * Phase 135: extracted from src/app/admin/news/page.tsx into its
 * own file. Previously the component was defined inside the page
 * and re-exported so src/app/admin/news/automation/page.tsx could
 * import it — but a 'use client page' exporting a non-component
 * named symbol violates Next 16's stricter page-export validation
 * (webpack-build catches it; Turbopack silently tolerates it).
 */
export function NewsSubNav({ active }: { active: 'posts' | 'automation' }) {
  const base = 'inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors';
  const inactive = 'border-transparent text-gray-500 hover:text-[#1B2A4A] hover:border-gray-200';
  const activeCls = 'border-[#9B1B30] text-[#1B2A4A]';
  return (
    <div className="border-b border-gray-200 mb-6 flex items-center gap-1">
      <Link href="/admin/news" className={`${base} ${active === 'posts' ? activeCls : inactive}`}>
        <Newspaper className="w-4 h-4" />
        Posts
      </Link>
      <Link
        href="/admin/news/automation"
        className={`${base} ${active === 'automation' ? activeCls : inactive}`}
      >
        <Sparkles className="w-4 h-4" />
        Automation
      </Link>
    </div>
  );
}
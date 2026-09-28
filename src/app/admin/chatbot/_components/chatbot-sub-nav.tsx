'use client';

import { MessageSquare } from 'lucide-react';

/**
 * Shared sub-nav for the /admin/chatbot section (Phase 121).
 *
 * Phase 135: extracted from src/app/admin/chatbot/faqs/page.tsx into
 * its own file. Previously faqs/page.tsx and automation/page.tsx
 * shared the component via `import { ChatbotSubNav } from '../faqs/page'`,
 * but a 'use client page' exporting a non-component named symbol
 * violates Next 16's stricter page-export validation (webpack-build
 * catches it; Turbopack silently tolerates it). The same pattern
 * applies to NewsSubNav (src/app/admin/news/page.tsx +
 * src/app/admin/news/automation/page.tsx) — both fixed together.
 */
export function ChatbotSubNav({ active }: { active: 'faqs' | 'automation' }) {
  const tabs = [
    { key: 'faqs' as const, label: 'FAQs', href: '/admin/chatbot/faqs' },
    { key: 'automation' as const, label: 'Automation', href: '/admin/chatbot/automation' },
  ];
  return (
    <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
      {tabs.map((t) => (
        <a
          key={t.key}
          href={t.href}
          className={`inline-flex items-center gap-1.5 px-1 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            active === t.key
              ? 'border-[#9B1B30] text-[#9B1B30]'
              : 'border-transparent text-gray-500 hover:text-[#1B2A4A]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          {t.label}
        </a>
      ))}
    </div>
  );
}
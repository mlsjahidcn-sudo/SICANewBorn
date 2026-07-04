'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface FAQItem {
  question: string;
  answer: string;
}

/**
 * FAQ accordion with native <details>/<summary> for SEO + a small
 * JS enhancement for smooth single-open behavior.
 *
 * Server-renders the Q&A text inside the <details> so search
 * engines + LLMs see the content even with JS off (critical for
 * AEO: the text has to be in the HTML, not lazy-loaded).
 *
 * The parent page should embed the same Q&A in a JSON-LD FAQPage
 * schema block — this component renders only the visible markup.
 */
export function FAQ({ items, schemaId }: { items: FAQItem[]; schemaId?: string }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="space-y-2" id={schemaId}>
      {items.map((item, i) => {
        const open = openIdx === i;
        return (
          <details
            key={i}
            open={open}
            onToggle={(e) => {
              // Only one open at a time — when this <details> opens,
              // close any sibling that's also open. (The native
              // toggle event fires for both open AND close.)
              const target = e.currentTarget;
              if (target.open) {
                const parent = target.parentElement;
                if (parent) {
                  parent.querySelectorAll('details[open]').forEach((el) => {
                    if (el !== target) (el as HTMLDetailsElement).open = false;
                  });
                  setOpenIdx(i);
                }
              } else if (openIdx === i) {
                setOpenIdx(null);
              }
            }}
            className="group bg-white border-2 border-gray-200 hover:border-[#9B1B30]/40 transition-colors"
          >
            <summary className="flex items-center justify-between gap-4 cursor-pointer px-5 py-4 list-none [&::-webkit-details-marker]:hidden">
              <h3 className="font-semibold text-[#1B2A4A] text-base sm:text-lg leading-snug">
                {item.question}
              </h3>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-[#9B1B30] transition-transform ${
                  open ? 'rotate-180' : ''
                }`}
              />
            </summary>
            <div className="px-5 pb-5 text-[#374151] leading-relaxed text-sm sm:text-base">
              {item.answer}
            </div>
          </details>
        );
      })}
    </div>
  );
}
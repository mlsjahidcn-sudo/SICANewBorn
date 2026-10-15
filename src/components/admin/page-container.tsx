'use client';

/**
 * PageContainer — the admin portal's width scale.
 *
 * ## Why this exists
 *
 * Before Phase 174 the admin shell rendered `<main className="flex-1 p-6">`
 * with no width cap, and each page picked its own. In practice 24 of 59
 * admin pages had no width constraint at all, and the handful that did
 * used five unrelated values (`max-w-md` … `max-w-7xl`) with no rule
 * behind them. The result was bimodal and mostly wrong:
 *
 *   - Forms (news/new, universities/new, programs/new, leads/new, …) ran
 *     the full width of the content column. On a 1920px screen that's
 *     ~1616px for a single text input — a line length no one can read,
 *     and a 1500px-wide "Full name" box.
 *   - Data tables ran unbounded on ultrawide monitors.
 *
 * This component makes the choice explicit and keeps it to four values.
 * If you find yourself wanting a fifth, that's a design conversation,
 * not a new `max-w-[1537px]`.
 *
 * ## The scale
 *
 *   narrow   max-w-3xl (768px)   Forms, settings, wizards. One readable
 *                                measure per line; never a wide table.
 *   default  max-w-6xl (1152px)  Detail pages, mixed content. The
 *                                sensible default when unsure.
 *   wide     1600px              Dashboards and data tables — enough
 *                                columns before horizontal scroll.
 *   full     (none)              Rarely. Only when a page genuinely needs
 *                                to bleed (e.g. an embedded audit log).
 *
 * ## Usage
 *
 * ```tsx
 * export default function Page() {
 *   return (
 *     <PageContainer width="narrow">
 *       <PageHeader … />
 *       <form>…</form>
 *     </PageContainer>
 *   );
 * }
 * ```
 *
 * The header / body / sticky-action-bar triplet most admin pages already
 * have can be passed in via the named slots if you want them to stick to
 * the same measure — see the `header` and `footer` props.
 */
import type { ReactNode } from 'react';

export type PageWidth = 'narrow' | 'default' | 'wide' | 'full';

const WIDTH_CLASS: Record<PageWidth, string> = {
  narrow: 'max-w-3xl',
  default: 'max-w-6xl',
  // 1600px is deliberately a raw value: it's not on Tailwind's scale and
  // shouldn't be — it's a "don't sprawl on ultrawide" ceiling, not a
  // design token anyone should reach for by name.
  wide: 'max-w-[1600px]',
  full: '',
};

export interface PageContainerProps {
  children: ReactNode;
  /** Width tier from the scale above. Defaults to `default`. */
  width?: PageWidth;
  /** Centred (default) or left-aligned. Centred reads better for forms. */
  align?: 'center' | 'start';
  /** Sticks to the top of the scroll container. */
  stickyHeader?: boolean;
  className?: string;
}

export function PageContainer({
  children,
  width = 'default',
  align = 'center',
  stickyHeader = false,
  className = '',
}: PageContainerProps) {
  const widthClass = WIDTH_CLASS[width];
  const alignClass = align === 'center' && widthClass ? 'mx-auto' : '';

  return (
    <div
      className={[
        'w-full space-y-6',
        widthClass,
        alignClass,
        stickyHeader ? 'sticky top-0 z-10 bg-[#F3F4F6] pt-6 -mt-6' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

export default PageContainer;

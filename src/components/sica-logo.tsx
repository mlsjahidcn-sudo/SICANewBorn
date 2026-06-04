/**
 * SicaLogo — the official SICA wordmark + mark, used everywhere the
 * brand appears. A server component (no state, no events) so it
 * can be rendered in RSC pages and inline in the navigation.
 *
 * The SVG file is the source of truth; this component just chooses
 * which variant to use + clamps the rendered size. To swap the
 * brand mark, replace /public/sica-logo.svg and the change picks
 * up everywhere on the next build.
 *
 * Two variants:
 *  - "color"   (default) — full brand color. Use on white/light bg
 *    (header, sidebar, footer top bar, open pages).
 *  - "white" — wordmark only turned white; the mark stays intact.
 *    Use on dark backgrounds (navy footer, auth pages with a
 *    gradient bg, dark cards).
 *
 * The SVG is a 300x75 viewBox (4:1 wide). `height` defaults to
 * 32px which gives ~128px width — a comfortable size for header
 * and sidebar use. Override with the `className` prop for custom
 * sizes (e.g. h-10 for hero placement, h-6 for tight table rows).
 */
import Image from 'next/image';

type Variant = 'color' | 'white';

interface SicaLogoProps {
  variant?: Variant;
  className?: string;
  /** Optional aria-label override. Defaults to "SICA". */
  alt?: string;
  /** Render priority hint for Next/Image — true if the logo is
   * above the fold (header, hero). Defaults to true. */
  priority?: boolean;
}

const SOURCES: Record<Variant, string> = {
  color: '/sica-logo.svg',
  white: '/sica-logo-white.svg',
};

export function SicaLogo({
  variant = 'color',
  className = 'h-8 w-auto',
  alt = 'SICA',
  priority = true,
}: SicaLogoProps) {
  return (
    <Image
      src={SOURCES[variant]}
      alt={alt}
      width={300}
      height={75}
      priority={priority}
      className={className}
    />
  );
}

export default SicaLogo;

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * SICA loading circle.
 *
 * Variants:
 * - ring (default): three-quarter sharp-cornered ring rotating clockwise.
 *   Trailing 25% is muted (35% opacity) for a clear "trail" effect that
 *   reads as progress, not as a generic spinner. Matches the brand's
 *   no-rounded-corners + deep-blue icon convention.
 * - dual-ring: two counter-rotating rings (deep blue + gold accent).
 *   More "premium" feel — use for hero/full-page loads.
 * - dots: three vertical bars scaling up/down in sequence. Best for
 *   inline button states where a spinning ring feels heavy.
 * - bar: indeterminate horizontal progress bar. Use for slow data
 *   fetches where you want to telegraph "wait, not stuck".
 *
 * All variants inherit color from `currentColor` so they sit naturally
 * on dark (white text) or light (deep blue text) backgrounds.
 *
 * Sizes map to common UI placements:
 *   xs (12px) - inline with text
 *   sm (16px) - inside buttons
 *   md (24px) - default, tables and cards
 *   lg (32px) - section/page-level
 *   xl (48px) - hero / 404 / empty-state
 *
 * Pass `label` to render the ring with a caption underneath (e.g. for
 * `<FullPageLoader />`). The label respects the `size` for font weight.
 */
type SpinnerVariant = "ring" | "dual-ring" | "dots" | "bar"
type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl"

const sizeMap: Record<SpinnerSize, { box: string; stroke: string; bar: string; dot: string; text: string }> = {
  xs: { box: "h-3 w-3",  stroke: "border-[1.5px]", bar: "h-[2px]", dot: "h-1 w-1",  text: "text-[10px]" },
  sm: { box: "h-4 w-4",  stroke: "border-2",       bar: "h-[2px]", dot: "h-1.5 w-1.5", text: "text-xs" },
  md: { box: "h-6 w-6",  stroke: "border-[3px]",   bar: "h-[3px]", dot: "h-2 w-2",  text: "text-sm" },
  lg: { box: "h-8 w-8",  stroke: "border-4",       bar: "h-[3px]", dot: "h-2.5 w-2.5", text: "text-base" },
  xl: { box: "h-12 w-12", stroke: "border-[5px]",  bar: "h-1",     dot: "h-3 w-3",  text: "text-lg" },
}

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SpinnerVariant
  size?: SpinnerSize
  /** Optional caption rendered below the ring. */
  label?: string
  /** Visually hide the label (keep it for screen readers). */
  hideLabel?: boolean
}

function Spinner({
  className,
  variant = "ring",
  size = "md",
  label,
  hideLabel = false,
  ...props
}: SpinnerProps) {
  const s = sizeMap[size]

  return (
    <div
      role="status"
      aria-label={label ?? "Loading"}
      aria-live="polite"
      className={cn("inline-flex flex-col items-center justify-center gap-2 text-current", className)}
      {...props}
    >
      {variant === "ring" && (
        <div
          aria-hidden="true"
          className={cn(
            s.box,
            s.stroke,
            "rounded-none animate-spin",
            // Three-quarter arc: full border in current color at 35% opacity
            // (the "trail"), then a 25% segment in solid current color (the
            // "head"). The shape is a square (no rounded) to match the
            // brand's sharp-corner convention.
            "border-current/[0.18] border-t-current",
          )}
          style={{ animationDuration: "0.7s" }}
        />
      )}

      {variant === "dual-ring" && (
        <div
          aria-hidden="true"
          className={cn("relative", s.box)}
          style={{ animationDuration: "1.4s" }}
        >
          <div
            className={cn(
              "absolute inset-0 rounded-none border-[2px] border-current/20 animate-spin",
            )}
            style={{ animationDuration: "1.4s" }}
          />
          <div
            className={cn(
              "absolute inset-0 rounded-none border-[2px] border-transparent border-r-[#D4A853] animate-spin",
            )}
            style={{ animationDuration: "0.9s", animationDirection: "reverse" }}
          />
        </div>
      )}

      {variant === "dots" && (
        <div aria-hidden="true" className={cn("flex items-end gap-1", s.box)}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(s.dot, "bg-current animate-sica-dot-pulse")}
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>
      )}

      {variant === "bar" && (
        <div
          aria-hidden="true"
          className={cn("relative w-24 overflow-hidden bg-current/10", s.bar)}
        >
          <div
            className="absolute inset-y-0 left-0 w-1/3 bg-current animate-sica-bar-slide"
          />
        </div>
      )}

      {label && (
        <span
          className={cn(
            s.text,
            "font-medium tracking-wide",
            hideLabel && "sr-only",
          )}
        >
          {label}
        </span>
      )}
    </div>
  )
}

function FullPageLoader({
  label = "Loading…",
  size = "lg",
  variant = "dual-ring",
  className,
}: Pick<SpinnerProps, "label" | "size" | "variant" | "className">) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-[50vh] w-full flex-col items-center justify-center gap-4 text-[#1B2A4A]",
        className,
      )}
    >
      <Spinner variant={variant} size={size} />
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#4B5563]">
        {label}
      </p>
    </div>
  )
}

function InlineLoader({
  label,
  size = "sm",
  variant = "ring",
  className,
}: Pick<SpinnerProps, "label" | "size" | "variant" | "className">) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn("inline-flex items-center gap-2", className)}
    >
      <Spinner variant={variant} size={size} />
      {label && <span className="text-sm font-medium">{label}</span>}
    </span>
  )
}

export { Spinner, FullPageLoader, InlineLoader, type SpinnerVariant, type SpinnerSize }

/**
 * Phase 92: shared route-level loading skeleton for public catalog /
 * news routes. Before this, those routes had no loading.tsx — a slow
 * server render showed nothing until the page popped in, and any
 * thrown error fell through to the generic app-wide error screen.
 *
 * Server-safe (no hooks) so any loading.tsx can render it directly.
 * Shape mirrors the dark hero + content grid used by the catalog and
 * news detail layouts, in straight Tailwind (no client JS).
 */
export function RouteLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] animate-pulse" aria-busy="true" aria-live="polite">
      {/* Hero band */}
      <div className="bg-[#1B2A4A] px-6 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="h-4 w-44 bg-white/20" />
          <div className="h-9 w-2/3 max-w-xl bg-white/25" />
          <div className="h-4 w-1/2 max-w-md bg-white/10" />
        </div>
      </div>
      {/* Content grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-6 w-40 bg-gray-200" />
            <div className="h-4 w-full bg-gray-200" />
            <div className="h-4 w-5/6 bg-gray-200" />
            <div className="h-4 w-4/6 bg-gray-200" />
            <div className="h-40 w-full bg-gray-200 mt-6" />
          </div>
          <div className="space-y-4">
            <div className="h-32 w-full bg-gray-200" />
            <div className="h-40 w-full bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

import { RouteLoadingSkeleton } from '@/components/route-loading';

/**
 * PF-5: the program finder had no `loading.tsx`, so a filter change
 * flashed an empty grid before the client fetch resolved. This is the
 * Suspense fallback for the route (the in-page refresh is already
 * covered by the dimmed grid + spinner in programs-client.tsx).
 */
export default function Loading() {
  return <RouteLoadingSkeleton />;
}

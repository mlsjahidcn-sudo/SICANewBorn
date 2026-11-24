'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Enhanced Skeleton with shimmer effect. Note: this is just a passthrough
// to the base Skeleton — the `variant` prop is accepted but not used by
// the underlying component (CSS keyframes are global). Previous versions
// of this file referenced `ShimmerSkeleton` inside its own body, which
// caused an infinite render loop and "Maximum call stack size exceeded"
// on every page that used these skeletons. Keep this pointing at the
// base `Skeleton` component.
const ShimmerSkeleton = ({ className, ...props }: React.ComponentProps<typeof Skeleton>) => (
  <Skeleton className={className} {...props} />
);


// List Page Skeleton
export function ListPageSkeleton({ showStats = true }: { showStats?: boolean }) {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <ShimmerSkeleton className="h-8 w-48 mb-2" />
            <ShimmerSkeleton className="h-4 w-64" />
          </div>
          <ShimmerSkeleton className="h-9 w-36" />
        </div>
      </div>

      {/* Stats Cards */}
      {showStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="rounded-none">
              <CardHeader className="pb-2">
                <ShimmerSkeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <ShimmerSkeleton className="h-8 w-20 mb-2" />
                <div className="flex items-center gap-2">
                  <ShimmerSkeleton className="h-3 w-3" />
                  <ShimmerSkeleton className="h-3 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Search & Filter Bar */}
      <Card className="rounded-none">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <ShimmerSkeleton className="h-10 w-full sm:w-64" />
            <ShimmerSkeleton className="h-10 w-full sm:w-40" />
            <ShimmerSkeleton className="h-10 w-full sm:w-32" />
            <div className="flex gap-2 ml-auto">
              <ShimmerSkeleton className="h-10 w-24" />
              <ShimmerSkeleton className="h-10 w-28" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="rounded-none">
        <CardContent className="p-0">
          <div className="p-4 space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 px-4">
              {[...Array(6)].map((_, i) => (
                <ShimmerSkeleton key={i} className="h-4 w-20" />
              ))}
            </div>
            {/* Table Rows */}
            {[...Array(5)].map((_, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-6 gap-4 items-center px-4 py-3 border-t">
                {[...Array(6)].map((_, colIndex) => (
                  <ShimmerSkeleton key={colIndex} className="h-4 w-full" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Detail Page Skeleton — the partner application detail shell.
 *
 * Previously described a banner + 5-tab + two-column layout that no live
 * page had. Rewritten to match the actual tabbed detail page
 * (`partner/applications/[id]`): header row, a 4-tab bar, and a
 * two-column card grid.
 */
export function DetailPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header: back link + title/badges + actions */}
      <div className="flex items-center gap-4">
        <ShimmerSkeleton className="h-10 w-10" />
        <div className="flex-1 min-w-0 space-y-2">
          <ShimmerSkeleton className="h-7 w-56" />
          <ShimmerSkeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <ShimmerSkeleton className="h-9 w-24" />
          <ShimmerSkeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b">
        {[...Array(4)].map((_, i) => (
          <ShimmerSkeleton key={i} className="h-10 w-24" />
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-none">
          <CardHeader>
            <ShimmerSkeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <ShimmerSkeleton className="h-4 w-28" />
                <ShimmerSkeleton className="h-4 w-36" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="rounded-none">
          <CardHeader>
            <ShimmerSkeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <ShimmerSkeleton className="h-4 w-32" />
                <ShimmerSkeleton className="h-4 w-32" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

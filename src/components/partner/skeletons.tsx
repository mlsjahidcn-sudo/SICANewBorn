'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Enhanced Skeleton with shimmer effect
const ShimmerSkeleton = ({ className, ...props }: React.ComponentProps<typeof Skeleton>) => (
  <ShimmerSkeleton variant="shimmer" className={className} {...props} />
);

// Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <div>
          <ShimmerSkeleton className="h-8 w-48 mb-2" />
          <ShimmerSkeleton className="h-4 w-64" />
        </div>
        <ShimmerSkeleton className="h-9 w-32" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="rounded-none">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <ShimmerSkeleton className="h-4 w-24" />
                <ShimmerSkeleton className="h-4 w-4 rounded-full" />
              </div>
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Chart & Recent Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Skeleton */}
          <Card className="rounded-none">
            <CardHeader>
              <ShimmerSkeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <ShimmerSkeleton className="h-48 w-full" />
            </CardContent>
          </Card>

          {/* Recent Students & Applications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Students */}
            <Card className="rounded-none">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <ShimmerSkeleton className="h-5 w-28" />
                  <ShimmerSkeleton className="h-4 w-12" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <ShimmerSkeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <ShimmerSkeleton className="h-4 w-32" />
                      <ShimmerSkeleton className="h-3 w-24" />
                    </div>
                    <ShimmerSkeleton className="h-5 w-16" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Applications */}
            <Card className="rounded-none">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <ShimmerSkeleton className="h-5 w-40" />
                  <ShimmerSkeleton className="h-4 w-12" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <ShimmerSkeleton className="h-4 w-36" />
                      <ShimmerSkeleton className="h-5 w-20" />
                    </div>
                    <ShimmerSkeleton className="h-3 w-28" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column - Notifications & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="rounded-none">
            <CardHeader>
              <ShimmerSkeleton className="h-5 w-28" />
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <ShimmerSkeleton key={i} className="h-20 w-full" />
              ))}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="rounded-none">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <ShimmerSkeleton className="h-5 w-28" />
                <ShimmerSkeleton className="h-4 w-12" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <ShimmerSkeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <ShimmerSkeleton className="h-4 w-full" />
                    <ShimmerSkeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

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

// Detail Page Skeleton
export function DetailPageSkeleton() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <ShimmerSkeleton className="h-9 w-28" />
        <div className="flex gap-2">
          <ShimmerSkeleton className="h-9 w-24" />
          <ShimmerSkeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Banner */}
      <Card className="rounded-none mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <ShimmerSkeleton className="h-24 w-24 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <ShimmerSkeleton className="h-8 w-64" />
              <ShimmerSkeleton className="h-4 w-48" />
              <div className="flex gap-2">
                <ShimmerSkeleton className="h-5 w-20" />
                <ShimmerSkeleton className="h-5 w-24" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6">
        {[...Array(5)].map((_, i) => (
          <ShimmerSkeleton key={i} className="h-10 w-24" />
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Overview Cards */}
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
    </div>
  );
}

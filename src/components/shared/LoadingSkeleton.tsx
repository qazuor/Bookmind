/**
 * LoadingSkeleton Component (P6-007)
 *
 * Loading skeleton variants for different content types.
 */

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
}

/**
 * Card skeleton for grid view
 */
export function BookmarkCardSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-4 space-y-3", className)}>
      <Skeleton className="h-40 w-full rounded-md" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}

/**
 * List item skeleton for list view
 */
export function BookmarkListSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg border bg-card p-4",
        className,
      )}
    >
      <Skeleton className="h-12 w-12 rounded-md flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-12 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Grid of card skeletons
 */
export function BookmarkGridSkeleton({
  count = 6,
  className,
}: LoadingSkeletonProps & { count?: number }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <BookmarkCardSkeleton key={`card-skeleton-${i}`} />
      ))}
    </div>
  );
}

/**
 * List of list item skeletons
 */
export function BookmarkListSkeletons({
  count = 5,
  className,
}: LoadingSkeletonProps & { count?: number }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <BookmarkListSkeleton key={`list-skeleton-${i}`} />
      ))}
    </div>
  );
}

/**
 * Stat card skeleton
 */
export function StatCardSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-6", className)}>
      <Skeleton className="h-4 w-20 mb-2" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

/**
 * Category list skeleton
 */
export function CategoryListSkeleton({
  count = 5,
  className,
}: LoadingSkeletonProps & { count?: number }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`category-skeleton-${i}`}
          className="flex items-center gap-3 p-2"
        >
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-6" />
        </div>
      ))}
    </div>
  );
}

/**
 * Detail page skeleton
 */
export function BookmarkDetailSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <Skeleton className="h-64 w-full rounded-lg" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2 pt-4">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

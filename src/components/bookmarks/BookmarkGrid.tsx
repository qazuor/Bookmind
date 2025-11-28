/**
 * BookmarkGrid Component (P6-014)
 *
 * Grid layout for displaying bookmarks with loading and empty states.
 */

import { BookmarkGridSkeleton, EmptyState } from "@/components/shared";
import type { Bookmark } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { BookmarkCard } from "./BookmarkCard";

interface BookmarkGridProps {
  bookmarks: Bookmark[];
  isLoading?: boolean;
  onEdit?: (bookmark: Bookmark) => void;
  onDelete?: (bookmark: Bookmark) => void;
  onArchive?: (bookmark: Bookmark) => void;
  onToggleFavorite?: (bookmark: Bookmark) => void;
  onAddBookmark?: () => void;
  emptyStateType?: "bookmarks" | "search" | "custom";
  emptyMessage?: string;
  className?: string;
}

export function BookmarkGrid({
  bookmarks,
  isLoading = false,
  onEdit,
  onDelete,
  onArchive,
  onToggleFavorite,
  onAddBookmark,
  emptyStateType = "bookmarks",
  emptyMessage,
  className,
}: BookmarkGridProps) {
  if (isLoading) {
    return <BookmarkGridSkeleton count={6} className={className} />;
  }

  if (bookmarks.length === 0) {
    return (
      <EmptyState
        type={emptyStateType}
        description={emptyMessage}
        action={
          onAddBookmark
            ? { label: "Add Bookmark", onClick: onAddBookmark }
            : undefined
        }
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
        className,
      )}
    >
      {bookmarks.map((bookmark) => (
        <BookmarkCard
          key={bookmark.id}
          bookmark={bookmark}
          onEdit={onEdit}
          onDelete={onDelete}
          onArchive={onArchive}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}

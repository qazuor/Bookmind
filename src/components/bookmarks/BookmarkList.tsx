/**
 * BookmarkList Component (P6-015)
 *
 * List layout for displaying bookmarks with loading and empty states.
 */

import { ArchiveIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { BookmarkListSkeletons, EmptyState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Bookmark } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { BookmarkListItem } from "./BookmarkListItem";

interface BookmarkListProps {
  bookmarks: Bookmark[];
  isLoading?: boolean;
  onEdit?: (bookmark: Bookmark) => void;
  onDelete?: (bookmark: Bookmark) => void;
  onArchive?: (bookmark: Bookmark) => void;
  onToggleFavorite?: (bookmark: Bookmark) => void;
  onBulkDelete?: (bookmarks: Bookmark[]) => void;
  onBulkArchive?: (bookmarks: Bookmark[]) => void;
  onAddBookmark?: () => void;
  emptyStateType?: "bookmarks" | "search" | "custom";
  emptyMessage?: string;
  allowBulkSelect?: boolean;
  className?: string;
}

export function BookmarkList({
  bookmarks,
  isLoading = false,
  onEdit,
  onDelete,
  onArchive,
  onToggleFavorite,
  onBulkDelete,
  onBulkArchive,
  onAddBookmark,
  emptyStateType = "bookmarks",
  emptyMessage,
  allowBulkSelect = false,
  className,
}: BookmarkListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSelect = (bookmark: Bookmark, selected: boolean) => {
    const newSelected = new Set(selectedIds);
    if (selected) {
      newSelected.add(bookmark.id);
    } else {
      newSelected.delete(bookmark.id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(bookmarks.map((b) => b.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const selectedBookmarks = bookmarks.filter((b) => selectedIds.has(b.id));
  const allSelected =
    bookmarks.length > 0 && selectedIds.size === bookmarks.length;
  const someSelected =
    selectedIds.size > 0 && selectedIds.size < bookmarks.length;

  if (isLoading) {
    return <BookmarkListSkeletons count={5} className={className} />;
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
    <div className={cn("space-y-2", className)}>
      {/* Bulk actions bar */}
      {allowBulkSelect && (
        <div className="flex items-center gap-4 py-2 px-4 border-b">
          <Checkbox
            checked={allSelected}
            ref={(ref) => {
              if (ref) {
                (ref as unknown as HTMLInputElement).indeterminate =
                  someSelected;
              }
            }}
            onCheckedChange={handleSelectAll}
            aria-label="Select all"
          />
          <span className="text-sm text-muted-foreground">
            {selectedIds.size > 0
              ? `${selectedIds.size} selected`
              : `${bookmarks.length} bookmarks`}
          </span>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              {onBulkArchive && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkArchive(selectedBookmarks)}
                >
                  <ArchiveIcon className="mr-2 h-4 w-4" />
                  Archive
                </Button>
              )}
              {onBulkDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onBulkDelete(selectedBookmarks)}
                >
                  <TrashIcon className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* List items */}
      {bookmarks.map((bookmark) => (
        <BookmarkListItem
          key={bookmark.id}
          bookmark={bookmark}
          selected={selectedIds.has(bookmark.id)}
          onSelect={allowBulkSelect ? handleSelect : undefined}
          onEdit={onEdit}
          onDelete={onDelete}
          onArchive={onArchive}
          onToggleFavorite={onToggleFavorite}
          showCheckbox={allowBulkSelect}
        />
      ))}
    </div>
  );
}

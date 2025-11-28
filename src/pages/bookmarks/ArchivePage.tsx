/**
 * Archive Page (P7-011)
 *
 * View and manage archived bookmarks.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookmarkGrid } from "@/components/bookmarks/BookmarkGrid";
import { BookmarkList } from "@/components/bookmarks/BookmarkList";
import { DeleteDialog, EmptyState, ViewModeToggle } from "@/components/shared";
import { toastError, toastSuccess } from "@/components/shared/toast";
import {
  useArchivedBookmarks,
  useDeleteBookmark,
  useUnarchiveBookmark,
} from "@/hooks/use-bookmarks";
import type { Bookmark } from "@/lib/api-client";
import { useUIStore } from "@/stores/ui-store";

export function ArchivePage() {
  const navigate = useNavigate();
  const viewMode = useUIStore((state) => state.viewMode);
  const setViewMode = useUIStore((state) => state.setViewMode);

  const { data, isLoading } = useArchivedBookmarks();
  const { mutateAsync: unarchiveBookmark } = useUnarchiveBookmark();
  const { mutateAsync: deleteBookmark } = useDeleteBookmark();

  const [deleteTarget, setDeleteTarget] = useState<Bookmark | null>(null);

  const bookmarks = data?.data ?? [];

  const handleUnarchive = async (bookmark: Bookmark) => {
    try {
      await unarchiveBookmark(bookmark.id);
      toastSuccess("Bookmark restored from archive");
    } catch {
      toastError("Failed to restore bookmark");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBookmark(deleteTarget.id);
      toastSuccess("Bookmark deleted permanently");
      setDeleteTarget(null);
    } catch {
      toastError("Failed to delete bookmark");
    }
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Archive</h1>
          <p className="text-muted-foreground">
            {bookmarks.length} archived bookmarks
          </p>
        </div>
        <ViewModeToggle mode={viewMode} onModeChange={setViewMode} />
      </div>

      {isLoading ? (
        viewMode === "grid" ? (
          <BookmarkGrid bookmarks={[]} isLoading />
        ) : (
          <BookmarkList bookmarks={[]} isLoading />
        )
      ) : bookmarks.length === 0 ? (
        <EmptyState
          type="bookmarks"
          title="No archived bookmarks"
          description="Bookmarks you archive will appear here. They won't show up in your main list."
          action={{
            label: "Go to Bookmarks",
            onClick: () => navigate("/bookmarks"),
          }}
        />
      ) : viewMode === "grid" ? (
        <BookmarkGrid
          bookmarks={bookmarks}
          onArchive={handleUnarchive}
          onDelete={(bookmark: Bookmark) => setDeleteTarget(bookmark)}
        />
      ) : (
        <BookmarkList
          bookmarks={bookmarks}
          onArchive={handleUnarchive}
          onDelete={(bookmark: Bookmark) => setDeleteTarget(bookmark)}
        />
      )}

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        itemType="bookmark"
        itemName={deleteTarget?.title}
        onConfirm={handleDelete}
      />
    </div>
  );
}

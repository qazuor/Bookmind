/**
 * Bookmarks Page (P7-008)
 *
 * Main bookmarks list with search, filter, and sort capabilities.
 */

import { Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BookmarkGrid } from "@/components/bookmarks/BookmarkGrid";
import { BookmarkList } from "@/components/bookmarks/BookmarkList";
import {
  DeleteDialog,
  EmptyState,
  SearchBar,
  SortDropdown,
  type SortField,
  ViewModeToggle,
} from "@/components/shared";
import { toastError, toastSuccess } from "@/components/shared/toast";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useArchiveBookmark,
  useBookmarks,
  useDeleteBookmark,
  useToggleFavorite,
} from "@/hooks/use-bookmarks";
import { useCategories } from "@/hooks/use-categories";
import type { Bookmark } from "@/lib/api-client";
import { useUIStore } from "@/stores/ui-store";

export function BookmarksPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const viewMode = useUIStore((state) => state.viewMode);
  const setViewMode = useUIStore((state) => state.setViewMode);

  // State
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const [categoryId, setCategoryId] = useState(
    searchParams.get("category") ?? "",
  );
  const [sortBy, setSortBy] = useState<SortField>(
    (searchParams.get("sortBy") as SortField) ?? "createdAt",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrder") as "asc" | "desc") ?? "desc",
  );
  const [deleteTarget, setDeleteTarget] = useState<Bookmark | null>(null);

  // Queries
  const { data: categoriesData } = useCategories();
  const { data, isLoading } = useBookmarks({
    search: searchQuery || undefined,
    categoryId: categoryId || undefined,
    sortBy,
    sortOrder,
    isArchived: false,
  });

  // Mutations
  const { mutateAsync: deleteBookmark } = useDeleteBookmark();
  const { mutateAsync: archiveBookmark } = useArchiveBookmark();
  const { mutateAsync: toggleFavorite } = useToggleFavorite();

  const bookmarks = data?.data ?? [];
  const categories = categoriesData?.data ?? [];

  // Handlers
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      const params = new URLSearchParams(searchParams);
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("category", value);
    } else {
      params.delete("category");
    }
    setSearchParams(params);
  };

  const handleSort = (field: SortField, order: "asc" | "desc") => {
    setSortBy(field);
    setSortOrder(order);
    const params = new URLSearchParams(searchParams);
    params.set("sortBy", field);
    params.set("sortOrder", order);
    setSearchParams(params);
  };

  const handleEdit = (bookmark: Bookmark) => {
    navigate(`/bookmarks/${bookmark.id}`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBookmark(deleteTarget.id);
      toastSuccess("Bookmark deleted");
      setDeleteTarget(null);
    } catch {
      toastError("Failed to delete bookmark");
    }
  };

  const handleArchive = async (bookmark: Bookmark) => {
    try {
      await archiveBookmark(bookmark.id);
      toastSuccess("Bookmark archived");
    } catch {
      toastError("Failed to archive bookmark");
    }
  };

  const handleToggleFavorite = async (bookmark: Bookmark) => {
    try {
      await toggleFavorite({
        id: bookmark.id,
        isFavorite: !bookmark.isFavorite,
      });
      toastSuccess(
        bookmark.isFavorite ? "Removed from favorites" : "Added to favorites",
      );
    } catch {
      toastError("Failed to update bookmark");
    }
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bookmarks</h1>
          <p className="text-muted-foreground">
            {bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link to="/bookmarks/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Bookmark
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search bookmarks..."
          defaultValue={searchQuery}
          className="flex-1"
        />
        <div className="flex items-center gap-2">
          <Select value={categoryId} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: category.color ?? "#888" }}
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SortDropdown value={sortBy} order={sortOrder} onSort={handleSort} />
          <ViewModeToggle mode={viewMode} onModeChange={setViewMode} />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        viewMode === "grid" ? (
          <BookmarkGrid bookmarks={[]} isLoading />
        ) : (
          <BookmarkList bookmarks={[]} isLoading />
        )
      ) : bookmarks.length === 0 ? (
        <EmptyState
          type={searchQuery ? "search" : "bookmarks"}
          action={
            !searchQuery
              ? {
                  label: "Add Bookmark",
                  onClick: () => navigate("/bookmarks/new"),
                }
              : undefined
          }
        />
      ) : viewMode === "grid" ? (
        <BookmarkGrid
          bookmarks={bookmarks}
          onEdit={handleEdit}
          onDelete={(bookmark: Bookmark) => setDeleteTarget(bookmark)}
          onArchive={handleArchive}
          onToggleFavorite={handleToggleFavorite}
        />
      ) : (
        <BookmarkList
          bookmarks={bookmarks}
          onEdit={handleEdit}
          onDelete={(bookmark: Bookmark) => setDeleteTarget(bookmark)}
          onArchive={handleArchive}
          onToggleFavorite={handleToggleFavorite}
          allowBulkSelect
        />
      )}

      {/* Delete Dialog */}
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

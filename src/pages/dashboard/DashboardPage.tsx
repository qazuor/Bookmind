/**
 * Dashboard Page (P7-007)
 *
 * Main dashboard with overview stats and recent bookmarks.
 */

import {
  Archive,
  BookOpen,
  Folder,
  Heart,
  Plus,
  Tag,
  TrendingUp,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { BookmarkGrid } from "@/components/bookmarks/BookmarkGrid";
import { BookmarkList } from "@/components/bookmarks/BookmarkList";
import {
  EmptyState,
  StatCardSkeleton,
  ViewModeToggle,
} from "@/components/shared";
import { toastError, toastSuccess } from "@/components/shared/toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useArchiveBookmark,
  useBookmarks,
  useDeleteBookmark,
  useToggleFavorite,
} from "@/hooks/use-bookmarks";
import { useOverviewStats } from "@/hooks/use-stats";
import type { Bookmark } from "@/lib/api-client";
import { useUIStore } from "@/stores/ui-store";

export function DashboardPage() {
  const navigate = useNavigate();
  const viewMode = useUIStore((state) => state.viewMode);
  const setViewMode = useUIStore((state) => state.setViewMode);

  // Stats
  const { data: statsData, isLoading: statsLoading } = useOverviewStats();
  const stats = statsData?.data;

  // Recent bookmarks
  const { data: bookmarksData, isLoading: bookmarksLoading } = useBookmarks({
    limit: 8,
    sortBy: "createdAt",
    sortOrder: "desc",
    isArchived: false,
  });
  const recentBookmarks = bookmarksData?.data ?? [];

  // Mutations
  const { mutateAsync: deleteBookmark } = useDeleteBookmark();
  const { mutateAsync: archiveBookmark } = useArchiveBookmark();
  const { mutateAsync: toggleFavorite } = useToggleFavorite();

  const handleEdit = (bookmark: Bookmark) => {
    navigate(`/bookmarks/${bookmark.id}`);
  };

  const handleDelete = async (bookmark: Bookmark) => {
    try {
      await deleteBookmark(bookmark.id);
      toastSuccess("Bookmark deleted");
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
    } catch {
      toastError("Failed to update bookmark");
    }
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your bookmarks.
          </p>
        </div>
        <Button asChild>
          <Link to="/bookmarks/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Bookmark
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Bookmarks
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalBookmarks ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Your bookmark library
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Collections
                </CardTitle>
                <Folder className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalCollections ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Organized collections
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Favorites</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.favoriteCount ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Your favorite bookmarks
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tags</CardTitle>
                <Tag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalTags ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Unique tags used
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent Bookmarks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Bookmarks</CardTitle>
            <CardDescription>Your latest saved bookmarks.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <ViewModeToggle mode={viewMode} onModeChange={setViewMode} />
            <Button variant="outline" size="sm" asChild>
              <Link to="/bookmarks">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {bookmarksLoading ? (
            viewMode === "grid" ? (
              <BookmarkGrid bookmarks={[]} isLoading />
            ) : (
              <BookmarkList bookmarks={[]} isLoading />
            )
          ) : recentBookmarks.length === 0 ? (
            <EmptyState
              type="bookmarks"
              action={{
                label: "Add your first bookmark",
                onClick: () => navigate("/bookmarks/new"),
              }}
            />
          ) : viewMode === "grid" ? (
            <BookmarkGrid
              bookmarks={recentBookmarks}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onArchive={handleArchive}
              onToggleFavorite={handleToggleFavorite}
            />
          ) : (
            <BookmarkList
              bookmarks={recentBookmarks}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onArchive={handleArchive}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/collections">
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center gap-2">
              <Folder className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Collections</CardTitle>
            </CardHeader>
          </Card>
        </Link>
        <Link to="/archive">
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center gap-2">
              <Archive className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Archive</CardTitle>
            </CardHeader>
          </Card>
        </Link>
        <Link to="/tags">
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Tags</CardTitle>
            </CardHeader>
          </Card>
        </Link>
        <Link to="/stats">
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Statistics</CardTitle>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}

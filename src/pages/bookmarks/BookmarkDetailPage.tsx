/**
 * Bookmark Detail Page (P7-009)
 *
 * View and edit a single bookmark with full details.
 */

import {
  Archive,
  ArrowLeft,
  Calendar,
  Edit2,
  ExternalLink,
  Eye,
  Heart,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BookmarkForm } from "@/components/bookmarks/BookmarkForm";
import { DeleteDialog } from "@/components/shared";
import { toastError, toastSuccess } from "@/components/shared/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookmark } from "@/hooks/use-bookmark";
import {
  useArchiveBookmark,
  useDeleteBookmark,
  useToggleFavorite,
  useUnarchiveBookmark,
  useUpdateBookmark,
} from "@/hooks/use-bookmarks";
import type { UpdateBookmarkInput } from "@/lib/api-client";

export function BookmarkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: bookmarkResponse, isLoading, error } = useBookmark(id ?? "");
  const { mutateAsync: updateBookmark, isPending: isUpdating } =
    useUpdateBookmark();
  const { mutateAsync: deleteBookmark } = useDeleteBookmark();
  const { mutateAsync: archiveBookmark } = useArchiveBookmark();
  const { mutateAsync: unarchiveBookmark } = useUnarchiveBookmark();
  const { mutateAsync: toggleFavorite } = useToggleFavorite();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const bookmark = bookmarkResponse?.data;

  const handleUpdate = async (data: UpdateBookmarkInput) => {
    if (!id) return;
    try {
      await updateBookmark({ id, input: data });
      toastSuccess("Bookmark updated");
      setIsEditing(false);
    } catch {
      toastError("Failed to update bookmark");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteBookmark(id);
      toastSuccess("Bookmark deleted");
      navigate("/bookmarks");
    } catch {
      toastError("Failed to delete bookmark");
    }
  };

  const handleArchiveToggle = async () => {
    if (!(id && bookmark)) return;
    try {
      if (bookmark.isArchived) {
        await unarchiveBookmark(id);
        toastSuccess("Bookmark restored");
      } else {
        await archiveBookmark(id);
        toastSuccess("Bookmark archived");
      }
    } catch {
      toastError("Failed to update bookmark");
    }
  };

  const handleFavoriteToggle = async () => {
    if (!(id && bookmark)) return;
    try {
      await toggleFavorite({ id, isFavorite: !bookmark.isFavorite });
      toastSuccess(
        bookmark.isFavorite ? "Removed from favorites" : "Added to favorites",
      );
    } catch {
      toastError("Failed to update bookmark");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !bookmark) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Bookmark not found</p>
            <Button asChild className="mt-4">
              <Link to="/bookmarks">Back to Bookmarks</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/bookmarks">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{bookmark.title}</h1>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
          >
            {new URL(bookmark.url).hostname}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleFavoriteToggle}>
            <Heart
              className={`h-4 w-4 ${bookmark.isFavorite ? "fill-red-500 text-red-500" : ""}`}
            />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 md:col-span-2">
          {/* Preview */}
          {bookmark.ogImage && (
            <Card>
              <CardContent className="p-0">
                <img
                  src={bookmark.ogImage}
                  alt={bookmark.title}
                  className="w-full rounded-t-lg object-cover"
                  style={{ maxHeight: "300px" }}
                />
              </CardContent>
            </Card>
          )}

          {/* Description */}
          {bookmark.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{bookmark.description}</p>
              </CardContent>
            </Card>
          )}

          {/* AI Summary */}
          {bookmark.aiSummary && (
            <Card>
              <CardHeader>
                <CardTitle>AI Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{bookmark.aiSummary}</p>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {bookmark.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {bookmark.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Created {new Date(bookmark.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span>{bookmark.visitCount} visits</span>
              </div>
              {bookmark.category && (
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor: bookmark.category.color ?? "#888",
                    }}
                  />
                  <span className="text-sm">{bookmark.category.name}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          {bookmark.tags && bookmark.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {bookmark.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      style={{
                        backgroundColor: tag.color
                          ? `${tag.color}20`
                          : undefined,
                        color: tag.color ?? undefined,
                      }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" asChild>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit Site
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleArchiveToggle}
              >
                <Archive className="mr-2 h-4 w-4" />
                {bookmark.isArchived ? "Restore" : "Archive"}
              </Button>
              <Button
                variant="outline"
                className="w-full text-destructive hover:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Bookmark</DialogTitle>
            <DialogDescription>
              Make changes to your bookmark.
            </DialogDescription>
          </DialogHeader>
          <BookmarkForm
            bookmark={bookmark}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            isLoading={isUpdating}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        itemType="bookmark"
        itemName={bookmark.title}
        onConfirm={handleDelete}
      />
    </div>
  );
}

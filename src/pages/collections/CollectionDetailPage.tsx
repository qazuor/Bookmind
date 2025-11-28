/**
 * Collection Detail Page (P7-012)
 *
 * View and manage a single collection with its bookmarks.
 */

import {
  ArrowLeft,
  Edit2,
  Link as LinkIcon,
  Share2,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BookmarkGrid } from "@/components/bookmarks/BookmarkGrid";
import { BookmarkList } from "@/components/bookmarks/BookmarkList";
import { CollectionForm } from "@/components/collections/CollectionForm";
import { DeleteDialog, EmptyState, ViewModeToggle } from "@/components/shared";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookmarks } from "@/hooks/use-bookmarks";
import {
  useCollection,
  useDeleteCollection,
  useShareCollection,
  useUnshareCollection,
  useUpdateCollection,
} from "@/hooks/use-collections";
import type { Bookmark, UpdateCollectionInput } from "@/lib/api-client";
import { useUIStore } from "@/stores/ui-store";

export function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const viewMode = useUIStore((state) => state.viewMode);
  const setViewMode = useUIStore((state) => state.setViewMode);

  // Queries
  const { data: collectionResponse, isLoading: collectionLoading } =
    useCollection(id ?? "");
  const { data: bookmarksData, isLoading: bookmarksLoading } = useBookmarks({
    collectionId: id,
  });

  // Mutations
  const { mutateAsync: updateCollection, isPending: isUpdating } =
    useUpdateCollection();
  const { mutateAsync: deleteCollection } = useDeleteCollection();
  const { mutateAsync: shareCollection } = useShareCollection();
  const { mutateAsync: unshareCollection } = useUnshareCollection();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const collection = collectionResponse?.data;
  const bookmarks = bookmarksData?.data ?? [];

  const handleUpdate = async (data: { name: string; description?: string }) => {
    if (!id) return;
    try {
      await updateCollection({ id, input: data as UpdateCollectionInput });
      toastSuccess("Collection updated");
      setIsEditing(false);
    } catch {
      toastError("Failed to update collection");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteCollection(id);
      toastSuccess("Collection deleted");
      navigate("/collections");
    } catch {
      toastError("Failed to delete collection");
    }
  };

  const handleShareToggle = async () => {
    if (!(id && collection)) return;
    try {
      if (collection.isShared) {
        await unshareCollection(id);
        toastSuccess("Collection is now private");
      } else {
        await shareCollection(id);
        toastSuccess("Collection is now shared");
      }
    } catch {
      toastError("Failed to update sharing");
    }
  };

  const copyShareLink = () => {
    if (!collection?.shareToken) return;
    const url = `${window.location.origin}/share/c/${collection.shareToken}`;
    navigator.clipboard.writeText(url);
    toastSuccess("Share link copied to clipboard");
  };

  if (collectionLoading) {
    return (
      <div className="container mx-auto max-w-4xl space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Collection not found</p>
            <Button asChild className="mt-4">
              <Link to="/collections">Back to Collections</Link>
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
          <Link to="/collections">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{collection.name}</h1>
          {collection.description && (
            <p className="text-muted-foreground">{collection.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {collection.isShared && (
            <Button variant="outline" size="sm" onClick={copyShareLink}>
              <LinkIcon className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleShareToggle}>
            <Share2 className="mr-2 h-4 w-4" />
            {collection.isShared ? "Unshare" : "Share"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Collection Info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Bookmarks</CardTitle>
            <CardDescription>
              {bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""} in
              this collection
            </CardDescription>
          </div>
          <ViewModeToggle mode={viewMode} onModeChange={setViewMode} />
        </CardHeader>
        <CardContent>
          {bookmarksLoading ? (
            viewMode === "grid" ? (
              <BookmarkGrid bookmarks={[]} isLoading />
            ) : (
              <BookmarkList bookmarks={[]} isLoading />
            )
          ) : bookmarks.length === 0 ? (
            <EmptyState
              type="bookmarks"
              title="No bookmarks in this collection"
              description="Add bookmarks to this collection to see them here."
              action={{
                label: "Add Bookmark",
                onClick: () => navigate("/bookmarks/new"),
              }}
            />
          ) : viewMode === "grid" ? (
            <BookmarkGrid
              bookmarks={bookmarks}
              onEdit={(bookmark: Bookmark) =>
                navigate(`/bookmarks/${bookmark.id}`)
              }
            />
          ) : (
            <BookmarkList
              bookmarks={bookmarks}
              onEdit={(bookmark: Bookmark) =>
                navigate(`/bookmarks/${bookmark.id}`)
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
            <DialogDescription>
              Make changes to your collection.
            </DialogDescription>
          </DialogHeader>
          <CollectionForm
            collection={collection}
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
        itemType="collection"
        itemName={collection.name}
        onConfirm={handleDelete}
      />
    </div>
  );
}

/**
 * New Bookmark Page (P7-010)
 *
 * Create a new bookmark with full form.
 */

import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { BookmarkForm } from "@/components/bookmarks/BookmarkForm";
import { toastError, toastSuccess } from "@/components/shared/toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCreateBookmark } from "@/hooks/use-bookmarks";
import type {
  CreateBookmarkInput,
  UpdateBookmarkInput,
} from "@/lib/api-client";

export function NewBookmarkPage() {
  const navigate = useNavigate();
  const { mutateAsync: createBookmark, isPending } = useCreateBookmark();

  const handleSubmit = async (
    data: CreateBookmarkInput | UpdateBookmarkInput,
  ) => {
    try {
      // For new bookmarks, url is required
      const result = await createBookmark(data as CreateBookmarkInput);
      toastSuccess("Bookmark created!");
      navigate(`/bookmarks/${result.data.id}`);
    } catch {
      toastError("Failed to create bookmark");
    }
  };

  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/bookmarks">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Bookmark</h1>
          <p className="text-muted-foreground">
            Add a new bookmark to your collection.
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Bookmark Details</CardTitle>
          <CardDescription>
            Enter the URL and we'll automatically fetch the title and
            description.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BookmarkForm
            onSubmit={handleSubmit}
            onCancel={() => navigate("/bookmarks")}
            isLoading={isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}

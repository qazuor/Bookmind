/**
 * Shared Collection Page (P7-006)
 *
 * Public view of a shared collection.
 */

import {
  BookmarkIcon,
  ExternalLink,
  Folder,
  Grid,
  List,
  User,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Toggle } from "@/components/ui/toggle";
import { useSharedCollection } from "@/hooks/use-collections";

type ViewMode = "grid" | "list";

interface SharedBookmark {
  id: string;
  url: string;
  title: string;
  description?: string;
  favicon?: string;
  ogImage?: string;
  createdAt: string;
  tags?: Array<{ id: string; name: string; color?: string }>;
}

export function SharedCollectionPage() {
  const { token } = useParams<{ token: string }>();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const { data, isLoading, error } = useSharedCollection(token ?? "");

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl space-y-6 p-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-6 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={`shared-collection-skeleton-${i}`}
              className="h-48 w-full"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto flex min-h-[50vh] max-w-4xl flex-col items-center justify-center p-6">
        <Folder className="h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Collection Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          This collection may have been removed or the link may be invalid.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  const { collection, bookmarks, owner } = data.data;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto max-w-4xl p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Folder className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{collection.name}</h1>
              {collection.description && (
                <p className="text-muted-foreground">
                  {collection.description}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Shared by {owner.displayName ?? owner.username}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookmarkIcon className="h-4 w-4" />
              <span>{bookmarks.length} bookmarks</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto max-w-4xl p-6">
        {/* View Toggle */}
        <div className="mb-6 flex justify-end">
          <div className="flex items-center gap-1">
            <Toggle
              size="sm"
              pressed={viewMode === "grid"}
              onPressedChange={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <Grid className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={viewMode === "list"}
              onPressedChange={() => setViewMode("list")}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Toggle>
          </div>
        </div>

        {/* Bookmarks */}
        {bookmarks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookmarkIcon className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                No bookmarks in this collection yet.
              </p>
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bookmarks.map((bookmark: SharedBookmark) => (
              <Card key={bookmark.id} className="overflow-hidden">
                {bookmark.ogImage && (
                  <img
                    src={bookmark.ogImage}
                    alt=""
                    className="h-32 w-full object-cover"
                  />
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-1 text-base">
                    {bookmark.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-1">
                    {new URL(bookmark.url).hostname}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {bookmark.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {bookmark.description}
                    </p>
                  )}
                  {bookmark.tags && bookmark.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {bookmark.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <Button asChild size="sm" className="mt-4 w-full">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-3 w-3" />
                      Visit
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {bookmarks.map((bookmark: SharedBookmark) => (
              <Card key={bookmark.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  {bookmark.favicon && (
                    <img
                      src={bookmark.favicon}
                      alt=""
                      className="h-8 w-8 rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{bookmark.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {bookmark.url}
                    </p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-background mt-12">
        <div className="container mx-auto max-w-4xl p-6 text-center text-sm text-muted-foreground">
          <p>
            Shared via{" "}
            <Link to="/" className="font-medium text-primary hover:underline">
              BookMind
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

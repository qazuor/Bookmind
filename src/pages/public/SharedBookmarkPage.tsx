/**
 * Shared Bookmark Page (P7-005)
 *
 * Single public bookmark page at /share/[bookmarkId].
 */

import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ExternalLink,
  Folder,
  Tag,
} from "lucide-react";
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

export function SharedBookmarkPage() {
  const { bookmarkId } = useParams<{ bookmarkId: string }>();

  // TODO: Replace with actual data fetching using useQuery
  const isLoading = false;
  const notFound = false;

  const bookmark = {
    id: bookmarkId,
    title: "Example Shared Bookmark",
    url: "https://example.com/article",
    description:
      "This is an example of a shared bookmark with a detailed description.",
    summary:
      "AI-generated summary: This article discusses various topics related to web development and best practices.",
    category: { name: "Technology", color: "#3b82f6" },
    tags: [
      { id: "1", name: "web" },
      { id: "2", name: "development" },
      { id: "3", name: "tutorial" },
    ],
    createdAt: new Date().toISOString(),
    owner: {
      name: "John Doe",
      username: "johndoe",
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto flex h-16 items-center px-4">
            <Link to="/" className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">BookMind</span>
            </Link>
          </div>
        </header>
        <main className="container mx-auto max-w-3xl px-4 py-12">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="mt-4 h-4 w-1/2" />
          <Skeleton className="mt-8 h-32 w-full" />
        </main>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto flex h-16 items-center px-4">
            <Link to="/" className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">BookMind</span>
            </Link>
          </div>
        </header>
        <main className="container mx-auto max-w-3xl px-4 py-12 text-center">
          <h1 className="text-2xl font-bold">Bookmark Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            This bookmark doesn't exist or is no longer public.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Go Home</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">BookMind</span>
          </Link>

          <Button variant="ghost" asChild>
            <Link to="/">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      {/* Bookmark Content */}
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-2xl">{bookmark.title}</CardTitle>
                <CardDescription className="mt-2 flex items-center gap-2">
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-primary hover:underline"
                  >
                    {bookmark.url}
                  </a>
                </CardDescription>
              </div>
              <Button variant="outline" size="icon" asChild>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Description */}
            {bookmark.description && (
              <div>
                <h3 className="font-medium">Description</h3>
                <p className="mt-1 text-muted-foreground">
                  {bookmark.description}
                </p>
              </div>
            )}

            {/* AI Summary */}
            {bookmark.summary && (
              <div className="rounded-md bg-muted p-4">
                <h3 className="font-medium">AI Summary</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {bookmark.summary}
                </p>
              </div>
            )}

            {/* Category */}
            {bookmark.category && (
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-muted-foreground" />
                <Badge
                  variant="secondary"
                  style={{ backgroundColor: `${bookmark.category.color}20` }}
                >
                  {bookmark.category.name}
                </Badge>
              </div>
            )}

            {/* Tags */}
            {bookmark.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-wrap gap-2">
                  {bookmark.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 border-t pt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(bookmark.createdAt).toLocaleDateString()}
              </span>
              {bookmark.owner && (
                <span>
                  Shared by{" "}
                  <Link
                    to={`/u/${bookmark.owner.username}`}
                    className="text-primary hover:underline"
                  >
                    @{bookmark.owner.username}
                  </Link>
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            Want to save and organize your own bookmarks?
          </p>
          <Button asChild className="mt-4">
            <Link to="/signup">Create Free Account</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

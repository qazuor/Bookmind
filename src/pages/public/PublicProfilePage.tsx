/**
 * Public Profile Page (P7-004)
 *
 * Public user profile page at /u/[username].
 */

import { BookOpen, ChevronLeft, ExternalLink, Globe, User } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();

  // TODO: Replace with actual data fetching using useQuery
  const isLoading = false;
  const user = {
    name: username || "User",
    username: username || "user",
    bio: "Bookmark enthusiast and knowledge collector.",
    avatar: null as string | null,
    publicBookmarksCount: 42,
  };

  const publicBookmarks = [
    {
      id: "1",
      title: "Example Bookmark",
      url: "https://example.com",
      description: "An example bookmark description",
    },
    {
      id: "2",
      title: "Another Bookmark",
      url: "https://another.example.com",
      description: "Another example description",
    },
  ];

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
        <main className="container mx-auto max-w-4xl px-4 py-12">
          <div className="flex items-start gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
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

      {/* Profile Header */}
      <main className="container mx-auto max-w-4xl px-4 py-12">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatar || undefined} alt={user.name} />
            <AvatarFallback>
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>

          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">@{user.username}</p>
            {user.bio && <p className="mt-2 max-w-md">{user.bio}</p>}
            <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
              <span className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                {user.publicBookmarksCount} public bookmarks
              </span>
            </div>
          </div>
        </div>

        {/* Public Bookmarks */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold">Public Bookmarks</h2>

          {publicBookmarks.length === 0 ? (
            <p className="mt-4 text-muted-foreground">
              This user has no public bookmarks.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {publicBookmarks.map((bookmark) => (
                <Card key={bookmark.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <a
                          href={bookmark.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline"
                        >
                          {bookmark.title}
                        </a>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {bookmark.url}
                        </p>
                        {bookmark.description && (
                          <p className="mt-2 text-sm">{bookmark.description}</p>
                        )}
                      </div>
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

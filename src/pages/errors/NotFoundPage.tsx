/**
 * 404 Not Found Page (P7-016)
 *
 * Displayed when a route is not found.
 */

import { FileQuestion, Home, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        <FileQuestion className="mx-auto h-24 w-24 text-muted-foreground" />

        <h1 className="mt-6 text-6xl font-bold text-foreground">404</h1>

        <h2 className="mt-4 text-2xl font-semibold text-foreground">
          Page Not Found
        </h2>

        <p className="mt-2 max-w-md text-muted-foreground">
          The page you're looking for doesn't exist or has been moved. Let's get
          you back on track.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>

          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>

          <Button variant="ghost" asChild>
            <Link to="/search">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          Lost? Try these popular pages:
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-4">
          <Link
            to="/bookmarks"
            className="text-sm text-primary hover:underline"
          >
            Bookmarks
          </Link>
          <Link
            to="/collections"
            className="text-sm text-primary hover:underline"
          >
            Collections
          </Link>
          <Link
            to="/categories"
            className="text-sm text-primary hover:underline"
          >
            Categories
          </Link>
          <Link to="/tags" className="text-sm text-primary hover:underline">
            Tags
          </Link>
        </div>
      </div>
    </div>
  );
}

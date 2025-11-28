/**
 * Error Page (P7-017)
 *
 * Generic error page displayed when an error occurs.
 */

import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function ErrorPage() {
  const error = useRouteError();

  let errorMessage = "An unexpected error occurred";
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || errorMessage;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        <AlertTriangle className="mx-auto h-24 w-24 text-destructive" />

        <h1 className="mt-6 text-6xl font-bold text-foreground">
          {errorStatus}
        </h1>

        <h2 className="mt-4 text-2xl font-semibold text-foreground">
          Something Went Wrong
        </h2>

        <p className="mt-2 max-w-md text-muted-foreground">{errorMessage}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>

          <Button variant="outline" asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>

        {import.meta.env.DEV && error instanceof Error && error.stack && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Error Details (Development Only)
            </summary>
            <pre className="mt-2 max-w-2xl overflow-auto rounded-md bg-muted p-4 text-xs">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

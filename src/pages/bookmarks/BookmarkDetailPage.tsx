/**
 * Bookmark Detail Page
 *
 * Displays detailed view of a single bookmark with editing capabilities.
 */

import { useParams } from "react-router-dom";

export function BookmarkDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">Bookmark Details</h1>
      <p className="mt-2 text-muted-foreground">Viewing bookmark: {id}</p>
    </div>
  );
}

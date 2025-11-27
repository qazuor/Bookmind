/**
 * Collection Detail Page
 *
 * Displays bookmarks within a specific collection.
 */

import { useParams } from "react-router-dom";

export function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">Collection Details</h1>
      <p className="mt-2 text-muted-foreground">Viewing collection: {id}</p>
    </div>
  );
}

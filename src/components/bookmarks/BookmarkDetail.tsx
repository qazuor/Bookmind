/**
 * BookmarkDetail Component (P6-017)
 *
 * Full bookmark view with all details, AI summary, and actions.
 */

import { format, formatDistanceToNow } from "date-fns";
import {
  ArchiveIcon,
  CalendarIcon,
  ClockIcon,
  ExternalLinkIcon,
  EyeIcon,
  FolderIcon,
  GlobeIcon,
  HashIcon,
  PencilIcon,
  RefreshCwIcon,
  SparklesIcon,
  StarIcon,
  TagIcon,
  TrashIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  BookmarkDetailSkeleton,
  Favicon,
  OptimizedImage,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Bookmark } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface BookmarkDetailProps {
  bookmark: Bookmark | null;
  isLoading?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onToggleFavorite?: () => void;
  onRegenerateAI?: () => void;
  isRegeneratingAI?: boolean;
  className?: string;
}

export function BookmarkDetail({
  bookmark,
  isLoading = false,
  onEdit,
  onDelete,
  onArchive,
  onToggleFavorite,
  onRegenerateAI,
  isRegeneratingAI = false,
  className,
}: BookmarkDetailProps) {
  if (isLoading) {
    return <BookmarkDetailSkeleton className={className} />;
  }

  if (!bookmark) {
    return (
      <div className={cn("text-center py-12", className)}>
        <p className="text-muted-foreground">Bookmark not found</p>
      </div>
    );
  }

  const createdDate = new Date(bookmark.createdAt);
  const updatedDate = new Date(bookmark.updatedAt);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with image */}
      <div className="space-y-4">
        {bookmark.ogImage && (
          <OptimizedImage
            src={bookmark.ogImage}
            alt={bookmark.title}
            aspectRatio="video"
            className="rounded-lg"
          />
        )}

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Favicon src={bookmark.favicon} alt={bookmark.title} size="md" />
              <h1 className="text-2xl font-bold">{bookmark.title}</h1>
              {bookmark.isFavorite && (
                <StarIcon className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              )}
            </div>

            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              <GlobeIcon className="h-4 w-4" />
              {new URL(bookmark.url).hostname}
              <ExternalLinkIcon className="h-3 w-3" />
            </a>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(bookmark.url, "_blank")}
            >
              <ExternalLinkIcon className="mr-2 h-4 w-4" />
              Open
            </Button>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <PencilIcon className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        {onToggleFavorite && (
          <Button
            variant={bookmark.isFavorite ? "secondary" : "outline"}
            size="sm"
            onClick={onToggleFavorite}
          >
            <StarIcon
              className={cn(
                "mr-2 h-4 w-4",
                bookmark.isFavorite && "fill-current",
              )}
            />
            {bookmark.isFavorite ? "Unfavorite" : "Favorite"}
          </Button>
        )}
        {onArchive && (
          <Button variant="outline" size="sm" onClick={onArchive}>
            <ArchiveIcon className="mr-2 h-4 w-4" />
            {bookmark.isArchived ? "Unarchive" : "Archive"}
          </Button>
        )}
        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            Delete
          </Button>
        )}
      </div>

      <Separator />

      {/* Description */}
      {bookmark.description && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Description
          </h2>
          <p className="text-sm">{bookmark.description}</p>
        </div>
      )}

      {/* AI Summary */}
      {(bookmark.aiSummary || onRegenerateAI) && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <SparklesIcon className="h-4 w-4 text-primary" />
                AI Summary
              </CardTitle>
              {onRegenerateAI && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRegenerateAI}
                  disabled={isRegeneratingAI}
                >
                  <RefreshCwIcon
                    className={cn(
                      "h-4 w-4",
                      isRegeneratingAI && "animate-spin",
                    )}
                  />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {bookmark.aiSummary ? (
              <p className="text-sm">{bookmark.aiSummary}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No AI summary yet. Click refresh to generate.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {bookmark.notes && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">Notes</h2>
          <p className="text-sm whitespace-pre-wrap">{bookmark.notes}</p>
        </div>
      )}

      <Separator />

      {/* Organization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <HashIcon className="h-4 w-4" />
            Category
          </h2>
          {bookmark.category ? (
            <Link to={`/bookmarks?category=${bookmark.category.id}`}>
              <Badge
                variant="secondary"
                style={{
                  backgroundColor: bookmark.category.color
                    ? `${bookmark.category.color}20`
                    : undefined,
                  color: bookmark.category.color ?? undefined,
                }}
              >
                {bookmark.category.name}
              </Badge>
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">No category</p>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <TagIcon className="h-4 w-4" />
            Tags
          </h2>
          {bookmark.tags && bookmark.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {bookmark.tags.map((tag) => (
                <Link key={tag.id} to={`/bookmarks?tag=${tag.id}`}>
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: tag.color ?? undefined,
                      color: tag.color ?? undefined,
                    }}
                  >
                    {tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No tags</p>
          )}
        </div>

        {/* Collections */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <FolderIcon className="h-4 w-4" />
            Collections
          </h2>
          {bookmark.collections && bookmark.collections.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {bookmark.collections.map((collection) => (
                <Link key={collection.id} to={`/collections/${collection.id}`}>
                  <Badge variant="outline">{collection.name}</Badge>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No collections</p>
          )}
        </div>

        {/* Visibility */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <EyeIcon className="h-4 w-4" />
            Visibility
          </h2>
          <Badge variant={bookmark.isPublic ? "default" : "secondary"}>
            {bookmark.isPublic ? "Public" : "Private"}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Metadata */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <CalendarIcon className="h-4 w-4" />
          <span>Created {format(createdDate, "MMM d, yyyy")}</span>
        </div>
        <div className="flex items-center gap-1">
          <ClockIcon className="h-4 w-4" />
          <span>
            Updated {formatDistanceToNow(updatedDate, { addSuffix: true })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <EyeIcon className="h-4 w-4" />
          <span>{bookmark.visitCount} visits</span>
        </div>
      </div>
    </div>
  );
}

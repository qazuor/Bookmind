/**
 * BookmarkCard Component (P6-012)
 *
 * Grid view card for displaying a single bookmark.
 */

import {
  ArchiveIcon,
  ExternalLinkIcon,
  MoreVerticalIcon,
  PencilIcon,
  StarIcon,
  TrashIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Favicon, OptimizedImage } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Bookmark } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface BookmarkCardProps {
  bookmark: Bookmark;
  onEdit?: (bookmark: Bookmark) => void;
  onDelete?: (bookmark: Bookmark) => void;
  onArchive?: (bookmark: Bookmark) => void;
  onToggleFavorite?: (bookmark: Bookmark) => void;
  className?: string;
}

export function BookmarkCard({
  bookmark,
  onEdit,
  onDelete,
  onArchive,
  onToggleFavorite,
  className,
}: BookmarkCardProps) {
  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(bookmark.url, "_blank", "noopener,noreferrer");
  };

  return (
    <Card className={cn("group overflow-hidden", className)}>
      {/* Image */}
      <Link to={`/bookmarks/${bookmark.id}`}>
        <OptimizedImage
          src={bookmark.ogImage}
          alt={bookmark.title}
          aspectRatio="video"
          className="cursor-pointer transition-opacity group-hover:opacity-90"
        />
      </Link>

      <CardContent className="p-4">
        {/* Title and favicon */}
        <div className="flex items-start gap-2 mb-2">
          <Favicon src={bookmark.favicon} alt={bookmark.title} size="sm" />
          <Link
            to={`/bookmarks/${bookmark.id}`}
            className="flex-1 min-w-0 hover:underline"
          >
            <h3 className="font-medium text-sm line-clamp-2">
              {bookmark.title}
            </h3>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExternalClick}>
                <ExternalLinkIcon className="mr-2 h-4 w-4" />
                Open in new tab
              </DropdownMenuItem>
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(bookmark)}>
                  <PencilIcon className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onToggleFavorite && (
                <DropdownMenuItem onClick={() => onToggleFavorite(bookmark)}>
                  <StarIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      bookmark.isFavorite && "fill-current",
                    )}
                  />
                  {bookmark.isFavorite ? "Unfavorite" : "Favorite"}
                </DropdownMenuItem>
              )}
              {onArchive && (
                <DropdownMenuItem onClick={() => onArchive(bookmark)}>
                  <ArchiveIcon className="mr-2 h-4 w-4" />
                  {bookmark.isArchived ? "Unarchive" : "Archive"}
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(bookmark)}
                    className="text-destructive focus:text-destructive"
                  >
                    <TrashIcon className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        {bookmark.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {bookmark.description}
          </p>
        )}

        {/* URL */}
        <p className="text-xs text-muted-foreground truncate mb-3">
          {new URL(bookmark.url).hostname}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-wrap gap-1.5">
        {/* Category */}
        {bookmark.category && (
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
        )}
        {/* Tags */}
        {bookmark.tags?.slice(0, 3).map((tag) => (
          <Badge
            key={tag.id}
            variant="outline"
            style={{
              borderColor: tag.color ?? undefined,
              color: tag.color ?? undefined,
            }}
          >
            {tag.name}
          </Badge>
        ))}
        {bookmark.tags && bookmark.tags.length > 3 && (
          <Badge variant="outline">+{bookmark.tags.length - 3}</Badge>
        )}
      </CardFooter>
    </Card>
  );
}

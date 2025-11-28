/**
 * BookmarkListItem Component (P6-013)
 *
 * List view row for displaying a single bookmark.
 */

import { formatDistanceToNow } from "date-fns";
import {
  ArchiveIcon,
  ExternalLinkIcon,
  MoreVerticalIcon,
  PencilIcon,
  StarIcon,
  TrashIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Favicon } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Bookmark } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface BookmarkListItemProps {
  bookmark: Bookmark;
  selected?: boolean;
  onSelect?: (bookmark: Bookmark, selected: boolean) => void;
  onEdit?: (bookmark: Bookmark) => void;
  onDelete?: (bookmark: Bookmark) => void;
  onArchive?: (bookmark: Bookmark) => void;
  onToggleFavorite?: (bookmark: Bookmark) => void;
  showCheckbox?: boolean;
  className?: string;
}

export function BookmarkListItem({
  bookmark,
  selected = false,
  onSelect,
  onEdit,
  onDelete,
  onArchive,
  onToggleFavorite,
  showCheckbox = false,
  className,
}: BookmarkListItemProps) {
  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(bookmark.url, "_blank", "noopener,noreferrer");
  };

  const createdDate = new Date(bookmark.createdAt);
  const timeAgo = formatDistanceToNow(createdDate, { addSuffix: true });

  return (
    <div
      className={cn(
        "group flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors",
        selected && "bg-muted",
        className,
      )}
    >
      {/* Checkbox for bulk selection */}
      {showCheckbox && onSelect && (
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelect(bookmark, !!checked)}
          aria-label={`Select ${bookmark.title}`}
        />
      )}

      {/* Favicon */}
      <Favicon src={bookmark.favicon} alt={bookmark.title} size="md" />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Link
            to={`/bookmarks/${bookmark.id}`}
            className="font-medium text-sm hover:underline truncate"
          >
            {bookmark.title}
          </Link>
          {bookmark.isFavorite && (
            <StarIcon className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate">{new URL(bookmark.url).hostname}</span>
          <span>·</span>
          <span className="flex-shrink-0">{timeAgo}</span>
        </div>
      </div>

      {/* Tags/Category */}
      <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
        {bookmark.category && (
          <Badge
            variant="secondary"
            className="text-xs"
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
        {bookmark.tags?.slice(0, 2).map((tag) => (
          <Badge
            key={tag.id}
            variant="outline"
            className="text-xs"
            style={{
              borderColor: tag.color ?? undefined,
              color: tag.color ?? undefined,
            }}
          >
            {tag.name}
          </Badge>
        ))}
        {bookmark.tags && bookmark.tags.length > 2 && (
          <Badge variant="outline" className="text-xs">
            +{bookmark.tags.length - 2}
          </Badge>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleExternalClick}
          aria-label="Open in new tab"
        >
          <ExternalLinkIcon className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
    </div>
  );
}

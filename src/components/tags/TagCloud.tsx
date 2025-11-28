/**
 * TagCloud Component (P6-029)
 *
 * Visual tag cloud with weighted sizes based on usage.
 */

import { TagIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tag } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface TagWithCount extends Tag {
  bookmarkCount?: number;
}

interface TagCloudProps {
  tags: TagWithCount[];
  isLoading?: boolean;
  onTagClick?: (tag: Tag) => void;
  selectedId?: string;
  minSize?: number;
  maxSize?: number;
  showCard?: boolean;
  className?: string;
}

export function TagCloud({
  tags,
  isLoading = false,
  onTagClick,
  selectedId,
  minSize = 12,
  maxSize = 24,
  showCard = false,
  className,
}: TagCloudProps) {
  if (isLoading) {
    return <TagCloudSkeleton showCard={showCard} className={className} />;
  }

  if (tags.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <TagIcon className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">No tags yet</p>
      </div>
    );
  }

  // Calculate font sizes based on bookmark counts
  const counts = tags.map((t) => t.bookmarkCount ?? 0);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);
  const range = maxCount - minCount || 1;

  const getFontSize = (count: number) => {
    const normalized = (count - minCount) / range;
    return minSize + normalized * (maxSize - minSize);
  };

  const content = (
    <div className="flex flex-wrap gap-2 justify-center">
      {tags.map((tag) => {
        const fontSize = getFontSize(tag.bookmarkCount ?? 0);
        const isSelected = selectedId === tag.id;

        const tagElement = (
          <span
            key={tag.id}
            role={onTagClick ? "button" : undefined}
            tabIndex={onTagClick ? 0 : undefined}
            className={cn(
              "inline-block px-2 py-1 rounded-md transition-all cursor-pointer",
              "hover:opacity-80",
              isSelected && "ring-2 ring-primary",
            )}
            style={{
              fontSize: `${fontSize}px`,
              color: tag.color ?? undefined,
              backgroundColor: tag.color
                ? `${tag.color}10`
                : "hsl(var(--muted))",
            }}
            onClick={onTagClick ? () => onTagClick(tag) : undefined}
            onKeyDown={
              onTagClick
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onTagClick(tag);
                    }
                  }
                : undefined
            }
          >
            {tag.name}
          </span>
        );

        if (onTagClick) {
          return tagElement;
        }

        return (
          <Link
            key={tag.id}
            to={`/bookmarks?tag=${tag.id}`}
            className="hover:no-underline"
          >
            {tagElement}
          </Link>
        );
      })}
    </div>
  );

  if (showCard) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TagIcon className="h-4 w-4" />
            Tags
          </CardTitle>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    );
  }

  return <div className={className}>{content}</div>;
}

/**
 * TagCloudSkeleton - Loading state
 */
function TagCloudSkeleton({
  showCard,
  className,
}: {
  showCard?: boolean;
  className?: string;
}) {
  const content = (
    <div className="flex flex-wrap gap-2 justify-center">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-6"
          style={{ width: `${60 + Math.random() * 40}px` }}
        />
      ))}
    </div>
  );

  if (showCard) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-16" />
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    );
  }

  return <div className={className}>{content}</div>;
}

/**
 * TagList - Simple list view of tags with counts
 */
interface TagListViewProps {
  tags: TagWithCount[];
  isLoading?: boolean;
  onTagClick?: (tag: Tag) => void;
  onEdit?: (tag: Tag) => void;
  onDelete?: (tag: Tag) => void;
  selectedId?: string;
  className?: string;
}

export function TagListView({
  tags,
  isLoading = false,
  onTagClick,
  selectedId,
  className,
}: TagListViewProps) {
  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-8" />
          </div>
        ))}
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <TagIcon className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">No tags yet</p>
      </div>
    );
  }

  // Sort by count descending
  const sortedTags = [...tags].sort(
    (a, b) => (b.bookmarkCount ?? 0) - (a.bookmarkCount ?? 0),
  );

  return (
    <div className={cn("space-y-1", className)}>
      {sortedTags.map((tag) => {
        const isSelected = selectedId === tag.id;

        const content = (
          <div
            role={onTagClick ? "button" : undefined}
            tabIndex={onTagClick ? 0 : undefined}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md transition-colors cursor-pointer",
              "hover:bg-accent hover:text-accent-foreground",
              isSelected && "bg-accent text-accent-foreground",
            )}
            onClick={onTagClick ? () => onTagClick(tag) : undefined}
            onKeyDown={
              onTagClick
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onTagClick(tag);
                    }
                  }
                : undefined
            }
          >
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: tag.color ?? "#888" }}
            />
            <span className="flex-1 text-sm truncate">{tag.name}</span>
            {tag.bookmarkCount !== undefined && (
              <span className="text-xs text-muted-foreground">
                {tag.bookmarkCount}
              </span>
            )}
          </div>
        );

        if (onTagClick) {
          return <div key={tag.id}>{content}</div>;
        }

        return (
          <Link key={tag.id} to={`/bookmarks?tag=${tag.id}`}>
            {content}
          </Link>
        );
      })}
    </div>
  );
}

/**
 * TagFilterBar - Horizontal scrollable tag filter
 */
interface TagFilterBarProps {
  tags: TagWithCount[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  showCounts?: boolean;
  className?: string;
}

export function TagFilterBar({
  tags,
  selectedIds,
  onChange,
  showCounts = true,
  className,
}: TagFilterBarProps) {
  const toggleTag = (tagId: string) => {
    if (selectedIds.includes(tagId)) {
      onChange(selectedIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedIds, tagId]);
    }
  };

  // Sort: selected first, then by count
  const sortedTags = [...tags].sort((a, b) => {
    const aSelected = selectedIds.includes(a.id) ? 1 : 0;
    const bSelected = selectedIds.includes(b.id) ? 1 : 0;
    if (aSelected !== bSelected) return bSelected - aSelected;
    return (b.bookmarkCount ?? 0) - (a.bookmarkCount ?? 0);
  });

  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-2", className)}>
      {sortedTags.map((tag) => {
        const isSelected = selectedIds.includes(tag.id);
        return (
          <Button
            key={tag.id}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => toggleTag(tag.id)}
            className="shrink-0 gap-1"
            style={
              isSelected && tag.color
                ? {
                    backgroundColor: tag.color,
                    borderColor: tag.color,
                  }
                : tag.color
                  ? {
                      borderColor: tag.color,
                      color: tag.color,
                    }
                  : undefined
            }
          >
            {tag.name}
            {showCounts && tag.bookmarkCount !== undefined && (
              <span className="opacity-75">({tag.bookmarkCount})</span>
            )}
          </Button>
        );
      })}
    </div>
  );
}

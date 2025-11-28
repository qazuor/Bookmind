/**
 * TagBadge Component (P6-028)
 *
 * Colored badge for displaying tags.
 */

import { TagIcon, XIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TagBadgeProps {
  tag: {
    id: string;
    name: string;
    color?: string | null;
  };
  showIcon?: boolean;
  linkTo?: boolean;
  onRemove?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TagBadge({
  tag,
  showIcon = false,
  linkTo = false,
  onRemove,
  size = "md",
  className,
}: TagBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0",
    md: "text-xs px-2 py-0.5",
    lg: "text-sm px-2.5 py-1",
  };

  const iconSizes = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-3.5 w-3.5",
  };

  const content = (
    <Badge
      variant="outline"
      className={cn("gap-1", sizeClasses[size], onRemove && "pr-1", className)}
      style={{
        borderColor: tag.color ?? undefined,
        color: tag.color ?? undefined,
        backgroundColor: tag.color ? `${tag.color}10` : undefined,
      }}
    >
      {showIcon && <TagIcon className={iconSizes[size]} />}
      {tag.name}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:opacity-75 focus:outline-none"
        >
          <XIcon className={iconSizes[size]} />
        </button>
      )}
    </Badge>
  );

  if (linkTo) {
    return (
      <Link to={`/bookmarks?tag=${tag.id}`} className="hover:opacity-80">
        {content}
      </Link>
    );
  }

  return content;
}

/**
 * TagList - List of tag badges
 */
interface TagListProps {
  tags: Array<{
    id: string;
    name: string;
    color?: string | null;
  }>;
  showIcon?: boolean;
  linkTo?: boolean;
  onRemove?: (tagId: string) => void;
  size?: "sm" | "md" | "lg";
  maxVisible?: number;
  className?: string;
}

export function TagList({
  tags,
  showIcon = false,
  linkTo = false,
  onRemove,
  size = "md",
  maxVisible,
  className,
}: TagListProps) {
  const visibleTags = maxVisible ? tags.slice(0, maxVisible) : tags;
  const hiddenCount = maxVisible ? Math.max(0, tags.length - maxVisible) : 0;

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {visibleTags.map((tag) => (
        <TagBadge
          key={tag.id}
          tag={tag}
          showIcon={showIcon}
          linkTo={linkTo}
          onRemove={onRemove ? () => onRemove(tag.id) : undefined}
          size={size}
        />
      ))}
      {hiddenCount > 0 && (
        <Badge variant="secondary" className={cn(sizeClassesForHidden[size])}>
          +{hiddenCount}
        </Badge>
      )}
    </div>
  );
}

const sizeClassesForHidden = {
  sm: "text-xs px-1.5 py-0",
  md: "text-xs px-2 py-0.5",
  lg: "text-sm px-2.5 py-1",
};

/**
 * TagDot - Minimal dot representation of a tag
 */
interface TagDotProps {
  tag: {
    id: string;
    name: string;
    color?: string | null;
  };
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  className?: string;
}

export function TagDot({ tag, size = "md", className }: TagDotProps) {
  const dotSizes = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
  };

  return (
    <div
      className={cn("rounded-full", dotSizes[size], className)}
      style={{ backgroundColor: tag.color ?? "#888" }}
      title={tag.name}
    />
  );
}

/**
 * TagDotList - Row of tag dots
 */
interface TagDotListProps {
  tags: Array<{
    id: string;
    name: string;
    color?: string | null;
  }>;
  size?: "sm" | "md" | "lg";
  maxVisible?: number;
  className?: string;
}

export function TagDotList({
  tags,
  size = "md",
  maxVisible = 5,
  className,
}: TagDotListProps) {
  const visibleTags = tags.slice(0, maxVisible);
  const hiddenCount = Math.max(0, tags.length - maxVisible);

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {visibleTags.map((tag) => (
        <TagDot key={tag.id} tag={tag} size={size} />
      ))}
      {hiddenCount > 0 && (
        <span className="text-xs text-muted-foreground">+{hiddenCount}</span>
      )}
    </div>
  );
}

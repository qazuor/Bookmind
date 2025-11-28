/**
 * CategoryBadge Component (P6-023)
 *
 * Colored badge for displaying category.
 */

import { HashIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  category: {
    id: string;
    name: string;
    color?: string | null;
  };
  showIcon?: boolean;
  linkTo?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function CategoryBadge({
  category,
  showIcon = false,
  linkTo = false,
  size = "md",
  className,
}: CategoryBadgeProps) {
  const content = (
    <Badge
      variant="secondary"
      className={cn("gap-1", size === "sm" && "text-xs px-1.5 py-0", className)}
      style={{
        backgroundColor: category.color ? `${category.color}20` : undefined,
        color: category.color ?? undefined,
        borderColor: category.color ?? undefined,
      }}
    >
      {showIcon && (
        <HashIcon className={cn("h-3 w-3", size === "sm" && "h-2.5 w-2.5")} />
      )}
      {category.name}
    </Badge>
  );

  if (linkTo) {
    return (
      <Link
        to={`/bookmarks?category=${category.id}`}
        className="hover:opacity-80"
      >
        {content}
      </Link>
    );
  }

  return content;
}

/**
 * EmptyState Component (P6-008)
 *
 * Empty state display with icon, message, and optional action.
 */

import {
  BookmarkIcon,
  FolderIcon,
  HashIcon,
  SearchIcon,
  TagIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateType =
  | "bookmarks"
  | "categories"
  | "collections"
  | "tags"
  | "search"
  | "custom";

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  className?: string;
}

const defaultContent: Record<
  Exclude<EmptyStateType, "custom">,
  { icon: React.ReactNode; title: string; description: string }
> = {
  bookmarks: {
    icon: <BookmarkIcon className="h-12 w-12 text-muted-foreground/50" />,
    title: "No bookmarks yet",
    description: "Save your first bookmark to get started organizing your web.",
  },
  categories: {
    icon: <HashIcon className="h-12 w-12 text-muted-foreground/50" />,
    title: "No categories",
    description: "Create categories to organize your bookmarks by topic.",
  },
  collections: {
    icon: <FolderIcon className="h-12 w-12 text-muted-foreground/50" />,
    title: "No collections",
    description: "Create collections to group related bookmarks together.",
  },
  tags: {
    icon: <TagIcon className="h-12 w-12 text-muted-foreground/50" />,
    title: "No tags",
    description: "Add tags to your bookmarks for easy filtering.",
  },
  search: {
    icon: <SearchIcon className="h-12 w-12 text-muted-foreground/50" />,
    title: "No results found",
    description: "Try adjusting your search terms or filters.",
  },
};

export function EmptyState({
  type = "bookmarks",
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  const content = type !== "custom" ? defaultContent[type] : null;
  const displayIcon = icon ?? content?.icon;
  const displayTitle = title ?? content?.title ?? "Nothing here";
  const displayDescription =
    description ?? content?.description ?? "No items to display.";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className,
      )}
    >
      {displayIcon && <div className="mb-4">{displayIcon}</div>}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {displayTitle}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {displayDescription}
      </p>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}

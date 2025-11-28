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
import { useI18n } from "@/hooks/use-i18n";
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

const defaultIcons: Record<
  Exclude<EmptyStateType, "custom">,
  React.ReactNode
> = {
  bookmarks: <BookmarkIcon className="h-12 w-12 text-muted-foreground/50" />,
  categories: <HashIcon className="h-12 w-12 text-muted-foreground/50" />,
  collections: <FolderIcon className="h-12 w-12 text-muted-foreground/50" />,
  tags: <TagIcon className="h-12 w-12 text-muted-foreground/50" />,
  search: <SearchIcon className="h-12 w-12 text-muted-foreground/50" />,
};

type TranslationKeys = Record<
  Exclude<EmptyStateType, "custom">,
  { titleKey: string; descriptionKey: string }
>;

const translationKeys: TranslationKeys = {
  bookmarks: {
    titleKey: "bookmarks.empty.title",
    descriptionKey: "bookmarks.empty.description",
  },
  categories: {
    titleKey: "categories.empty.title",
    descriptionKey: "categories.empty.description",
  },
  collections: {
    titleKey: "collections.empty.title",
    descriptionKey: "collections.empty.description",
  },
  tags: {
    titleKey: "tags.empty.title",
    descriptionKey: "tags.empty.description",
  },
  search: {
    titleKey: "search.noResults",
    descriptionKey: "bookmarks.searchEmpty.description",
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
  const { t } = useI18n();

  const keys = type !== "custom" ? translationKeys[type] : null;
  const displayIcon = icon ?? (type !== "custom" ? defaultIcons[type] : null);
  const displayTitle =
    title ?? (keys ? t(keys.titleKey) : t("common.noResults"));
  const displayDescription =
    description ?? (keys ? t(keys.descriptionKey) : t("common.noResults"));

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

/**
 * CategoryList Component (P6-021)
 *
 * List of categories with counts and actions.
 */

import {
  HashIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { CategoryListSkeleton, EmptyState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Category } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface CategoryWithCount extends Category {
  bookmarkCount?: number;
}

interface CategoryListProps {
  categories: CategoryWithCount[];
  isLoading?: boolean;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
  onCreate?: () => void;
  selectedId?: string;
  showCounts?: boolean;
  compact?: boolean;
  className?: string;
}

export function CategoryList({
  categories,
  isLoading = false,
  onEdit,
  onDelete,
  onCreate,
  selectedId,
  showCounts = true,
  compact = false,
  className,
}: CategoryListProps) {
  if (isLoading) {
    return <CategoryListSkeleton className={className} />;
  }

  if (categories.length === 0) {
    return (
      <EmptyState
        type="categories"
        action={
          onCreate ? { label: "Create Category", onClick: onCreate } : undefined
        }
        className={className}
      />
    );
  }

  if (compact) {
    return (
      <div className={cn("space-y-1", className)}>
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/bookmarks?category=${category.id}`}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              selectedId === category.id && "bg-accent text-accent-foreground",
            )}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: category.color ?? "#888" }}
              />
              <span className="truncate">{category.name}</span>
            </div>
            {showCounts && category.bookmarkCount !== undefined && (
              <span className="text-xs text-muted-foreground">
                {category.bookmarkCount}
              </span>
            )}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <HashIcon className="h-4 w-4" />
            Categories
          </CardTitle>
          {onCreate && (
            <Button variant="ghost" size="sm" onClick={onCreate}>
              <PlusIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className={cn(
                  "flex items-center justify-between p-2 rounded-md transition-colors",
                  "hover:bg-accent/50",
                  selectedId === category.id && "bg-accent",
                )}
              >
                <Link
                  to={`/bookmarks?category=${category.id}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: category.color ?? "#888" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {category.name}
                    </p>
                  </div>
                  {showCounts && category.bookmarkCount !== undefined && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      {category.bookmarkCount} bookmarks
                    </span>
                  )}
                </Link>

                {(onEdit || onDelete) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(category)}>
                          <PencilIcon className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onEdit && onDelete && <DropdownMenuSeparator />}
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(category)}
                          className="text-destructive focus:text-destructive"
                        >
                          <TrashIcon className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

/**
 * CategoryGrid - Grid view for categories page
 */
interface CategoryGridProps {
  categories: CategoryWithCount[];
  isLoading?: boolean;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
  onCreate?: () => void;
  className?: string;
}

export function CategoryGrid({
  categories,
  isLoading = false,
  onEdit,
  onDelete,
  onCreate,
  className,
}: CategoryGridProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
          className,
        )}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <EmptyState
        type="categories"
        action={
          onCreate ? { label: "Create Category", onClick: onCreate } : undefined
        }
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
        className,
      )}
    >
      {categories.map((category) => (
        <Card
          key={category.id}
          className="group hover:shadow-md transition-shadow"
        >
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <Link
                to={`/bookmarks?category=${category.id}`}
                className="flex items-center gap-3 flex-1 min-w-0"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${category.color ?? "#888"}20` }}
                >
                  <HashIcon
                    className="h-5 w-5"
                    style={{ color: category.color ?? "#888" }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{category.name}</p>
                  {category.bookmarkCount !== undefined && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {category.bookmarkCount} bookmark
                      {category.bookmarkCount !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </Link>

              {(onEdit || onDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(category)}>
                        <PencilIcon className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onEdit && onDelete && <DropdownMenuSeparator />}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(category)}
                        className="text-destructive focus:text-destructive"
                      >
                        <TrashIcon className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

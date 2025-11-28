/**
 * CollectionTree Component (P6-024)
 *
 * Hierarchical tree view for collections with expand/collapse.
 */

import {
  ChevronRightIcon,
  FolderIcon,
  FolderOpenIcon,
  LinkIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  ShareIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
import { Skeleton } from "@/components/ui/skeleton";
import type { Collection } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface CollectionTreeProps {
  collections: Collection[];
  isLoading?: boolean;
  onEdit?: (collection: Collection) => void;
  onDelete?: (collection: Collection) => void;
  onCreate?: (parentId?: string) => void;
  onShare?: (collection: Collection) => void;
  selectedId?: string;
  showCounts?: boolean;
  compact?: boolean;
  className?: string;
}

export function CollectionTree({
  collections,
  isLoading = false,
  onEdit,
  onDelete,
  onCreate,
  onShare,
  selectedId,
  showCounts = true,
  compact = false,
  className,
}: CollectionTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (isLoading) {
    return <CollectionTreeSkeleton className={className} />;
  }

  if (collections.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <FolderIcon className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">No collections yet</p>
        {onCreate && (
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => onCreate()}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Collection
          </Button>
        )}
      </div>
    );
  }

  if (compact) {
    return (
      <div className={cn("space-y-1", className)}>
        {collections.map((collection) => (
          <CollectionTreeItem
            key={collection.id}
            collection={collection}
            depth={0}
            expandedIds={expandedIds}
            onToggle={toggleExpand}
            selectedId={selectedId}
            showCounts={showCounts}
            compact
            onEdit={onEdit}
            onDelete={onDelete}
            onCreate={onCreate}
            onShare={onShare}
          />
        ))}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FolderIcon className="h-4 w-4" />
            Collections
          </CardTitle>
          {onCreate && (
            <Button variant="ghost" size="sm" onClick={() => onCreate()}>
              <PlusIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-1">
            {collections.map((collection) => (
              <CollectionTreeItem
                key={collection.id}
                collection={collection}
                depth={0}
                expandedIds={expandedIds}
                onToggle={toggleExpand}
                selectedId={selectedId}
                showCounts={showCounts}
                onEdit={onEdit}
                onDelete={onDelete}
                onCreate={onCreate}
                onShare={onShare}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

/**
 * CollectionTreeItem - Single item in the tree
 */
interface CollectionTreeItemProps {
  collection: Collection;
  depth: number;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  selectedId?: string;
  showCounts?: boolean;
  compact?: boolean;
  onEdit?: (collection: Collection) => void;
  onDelete?: (collection: Collection) => void;
  onCreate?: (parentId?: string) => void;
  onShare?: (collection: Collection) => void;
}

function CollectionTreeItem({
  collection,
  depth,
  expandedIds,
  onToggle,
  selectedId,
  showCounts = true,
  compact = false,
  onEdit,
  onDelete,
  onCreate,
  onShare,
}: CollectionTreeItemProps) {
  const location = useLocation();
  const hasChildren = collection.children && collection.children.length > 0;
  const isExpanded = expandedIds.has(collection.id);
  const isSelected =
    selectedId === collection.id ||
    location.pathname === `/collections/${collection.id}`;

  const content = (
    <div
      className={cn(
        "flex items-center justify-between group rounded-md transition-colors",
        compact ? "px-2 py-1.5" : "p-2",
        "hover:bg-accent/50",
        isSelected && "bg-accent",
      )}
      style={{ paddingLeft: `${depth * 16 + (compact ? 8 : 8)}px` }}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Expand/collapse button */}
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggle(collection.id);
            }}
            className="p-0.5 hover:bg-accent rounded"
          >
            <ChevronRightIcon
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                isExpanded && "rotate-90",
              )}
            />
          </button>
        ) : (
          <span className="w-5" />
        )}

        {/* Folder icon */}
        {isExpanded ? (
          <FolderOpenIcon className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <FolderIcon className="h-4 w-4 text-muted-foreground shrink-0" />
        )}

        {/* Name */}
        <Link
          to={`/collections/${collection.id}`}
          className="text-sm truncate flex-1 hover:underline"
        >
          {collection.name}
        </Link>

        {/* Share indicator */}
        {collection.isShared && (
          <LinkIcon className="h-3 w-3 text-muted-foreground shrink-0" />
        )}

        {/* Count */}
        {showCounts && collection.bookmarkCount !== undefined && (
          <span className="text-xs text-muted-foreground shrink-0">
            {collection.bookmarkCount}
          </span>
        )}
      </div>

      {/* Actions menu */}
      {(onEdit || onDelete || onCreate || onShare) && !compact && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onCreate && (
              <DropdownMenuItem onClick={() => onCreate(collection.id)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add subcollection
              </DropdownMenuItem>
            )}
            {onShare && (
              <DropdownMenuItem onClick={() => onShare(collection)}>
                <ShareIcon className="mr-2 h-4 w-4" />
                {collection.isShared ? "Manage sharing" : "Share"}
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(collection)}>
                <PencilIcon className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            {(onCreate || onShare || onEdit) && onDelete && (
              <DropdownMenuSeparator />
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(collection)}
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
  );

  return (
    <>
      {content}
      {hasChildren && isExpanded && (
        <div className="relative">
          {/* Tree line */}
          <div
            className="absolute left-0 top-0 bottom-0 border-l border-border"
            style={{ marginLeft: `${depth * 16 + 18}px` }}
          />
          {collection.children?.map((child) => (
            <CollectionTreeItem
              key={child.id}
              collection={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              onToggle={onToggle}
              selectedId={selectedId}
              showCounts={showCounts}
              compact={compact}
              onEdit={onEdit}
              onDelete={onDelete}
              onCreate={onCreate}
              onShare={onShare}
            />
          ))}
        </div>
      )}
    </>
  );
}

/**
 * CollectionTreeSkeleton - Loading state
 */
function CollectionTreeSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={`tree-skeleton-${i}`} className="flex items-center gap-2 p-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
}

/**
 * CollectionBreadcrumb - Breadcrumb for collection path
 */
interface CollectionBreadcrumbProps {
  collections: Collection[];
  currentId: string;
  className?: string;
}

export function CollectionBreadcrumb({
  collections,
  currentId,
  className,
}: CollectionBreadcrumbProps) {
  // Build path from root to current
  const buildPath = (id: string, tree: Collection[]): Collection[] => {
    for (const collection of tree) {
      if (collection.id === id) {
        return [collection];
      }
      if (collection.children) {
        const childPath = buildPath(id, collection.children);
        if (childPath.length > 0) {
          return [collection, ...childPath];
        }
      }
    }
    return [];
  };

  const path = buildPath(currentId, collections);

  if (path.length === 0) return null;

  return (
    <nav className={cn("flex items-center gap-1 text-sm", className)}>
      <Link
        to="/collections"
        className="text-muted-foreground hover:text-foreground"
      >
        Collections
      </Link>
      {path.map((collection, index) => (
        <span key={collection.id} className="flex items-center gap-1">
          <span className="text-muted-foreground">/</span>
          {index === path.length - 1 ? (
            <span className="font-medium">{collection.name}</span>
          ) : (
            <Link
              to={`/collections/${collection.id}`}
              className="text-muted-foreground hover:text-foreground"
            >
              {collection.name}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

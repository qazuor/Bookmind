/**
 * Sidebar Component (P6-003)
 *
 * Navigation sidebar with categories, collections, and quick actions.
 * Collapsible on desktop, sheet on mobile.
 */

import {
  ArchiveIcon,
  BookmarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FolderIcon,
  HashIcon,
  HomeIcon,
  PlusIcon,
  StarIcon,
  TagIcon,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/use-categories";
import { useCollectionTree } from "@/hooks/use-collections";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

interface CollectionTreeItem {
  id: string;
  name: string;
  parentId: string | null;
  bookmarkCount: number;
  children: CollectionTreeItem[];
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
  active?: boolean;
}

function NavItem({ href, icon, label, count, active }: NavItemProps) {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">{count}</span>
      )}
    </Link>
  );
}

function CollectionNode({
  collection,
  level = 0,
}: {
  collection: CollectionTreeItem;
  level?: number;
}) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(level === 0);
  const isActive = location.pathname === `/collections/${collection.id}`;
  const hasChildren = collection.children.length > 0;

  if (hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-muted-foreground hover:text-foreground",
            )}
            style={{ paddingLeft: `${level * 12 + 12}px` }}
          >
            {isOpen ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
            <FolderIcon className="h-4 w-4" />
            <span className="flex-1 text-left">{collection.name}</span>
            <span className="text-xs text-muted-foreground">
              {collection.bookmarkCount}
            </span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Link
            to={`/collections/${collection.id}`}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted text-muted-foreground hover:text-foreground",
            )}
            style={{ paddingLeft: `${(level + 1) * 12 + 12}px` }}
          >
            <span className="text-xs">View all</span>
          </Link>
          {collection.children.map((child) => (
            <CollectionNode
              key={child.id}
              collection={child}
              level={level + 1}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Link
      to={`/collections/${collection.id}`}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted text-muted-foreground hover:text-foreground",
      )}
      style={{ paddingLeft: `${level * 12 + 12}px` }}
    >
      <FolderIcon className="h-4 w-4" />
      <span className="flex-1">{collection.name}</span>
      <span className="text-xs text-muted-foreground">
        {collection.bookmarkCount}
      </span>
    </Link>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={`sidebar-skeleton-${i}`} className="h-8 w-full" />
      ))}
    </div>
  );
}

export function Sidebar() {
  const location = useLocation();
  const { sidebarOpen, openModal } = useUIStore();
  const { data: categoriesData, isLoading: loadingCategories } =
    useCategories();
  const { data: collectionsData, isLoading: loadingCollections } =
    useCollectionTree();

  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [collectionsExpanded, setCollectionsExpanded] = useState(true);

  if (!sidebarOpen) {
    return null;
  }

  const categories = categoriesData?.data ?? [];
  const collections = (collectionsData?.data ?? []) as CollectionTreeItem[];

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-background">
      <ScrollArea className="flex-1">
        <div className="space-y-4 py-4">
          {/* Quick Links */}
          <div className="px-3 py-2">
            <h3 className="mb-2 px-4 text-xs font-semibold uppercase text-muted-foreground">
              Quick Links
            </h3>
            <nav className="space-y-1">
              <NavItem
                href="/"
                icon={<HomeIcon className="h-4 w-4" />}
                label="Dashboard"
                active={location.pathname === "/"}
              />
              <NavItem
                href="/bookmarks"
                icon={<BookmarkIcon className="h-4 w-4" />}
                label="All Bookmarks"
                active={location.pathname === "/bookmarks"}
              />
              <NavItem
                href="/bookmarks?filter=pinned"
                icon={<StarIcon className="h-4 w-4" />}
                label="Favorites"
                active={location.search.includes("filter=pinned")}
              />
              <NavItem
                href="/bookmarks?filter=archived"
                icon={<ArchiveIcon className="h-4 w-4" />}
                label="Archive"
                active={location.search.includes("filter=archived")}
              />
            </nav>
          </div>

          {/* Categories */}
          <div className="px-3 py-2">
            <Collapsible
              open={categoriesExpanded}
              onOpenChange={setCategoriesExpanded}
            >
              <div className="flex items-center justify-between px-4 mb-2">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-xs font-semibold uppercase text-muted-foreground hover:text-foreground"
                  >
                    {categoriesExpanded ? (
                      <ChevronDownIcon className="h-3 w-3" />
                    ) : (
                      <ChevronRightIcon className="h-3 w-3" />
                    )}
                    Categories
                  </button>
                </CollapsibleTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => openModal("create-category")}
                  aria-label="Create category"
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
              <CollapsibleContent>
                <nav className="space-y-1">
                  {loadingCategories ? (
                    <SidebarSkeleton />
                  ) : categories.length === 0 ? (
                    <p className="px-4 py-2 text-sm text-muted-foreground">
                      No categories yet
                    </p>
                  ) : (
                    categories.map((category) => (
                      <NavItem
                        key={category.id}
                        href={`/bookmarks?category=${category.id}`}
                        icon={
                          <HashIcon
                            className="h-4 w-4"
                            style={{ color: category.color ?? undefined }}
                          />
                        }
                        label={category.name}
                        active={location.search.includes(
                          `category=${category.id}`,
                        )}
                      />
                    ))
                  )}
                </nav>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Collections */}
          <div className="px-3 py-2">
            <Collapsible
              open={collectionsExpanded}
              onOpenChange={setCollectionsExpanded}
            >
              <div className="flex items-center justify-between px-4 mb-2">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-xs font-semibold uppercase text-muted-foreground hover:text-foreground"
                  >
                    {collectionsExpanded ? (
                      <ChevronDownIcon className="h-3 w-3" />
                    ) : (
                      <ChevronRightIcon className="h-3 w-3" />
                    )}
                    Collections
                  </button>
                </CollapsibleTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => openModal("create-collection")}
                  aria-label="Create collection"
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
              <CollapsibleContent>
                <nav className="space-y-1">
                  {loadingCollections ? (
                    <SidebarSkeleton />
                  ) : collections.length === 0 ? (
                    <p className="px-4 py-2 text-sm text-muted-foreground">
                      No collections yet
                    </p>
                  ) : (
                    collections.map((collection) => (
                      <CollectionNode
                        key={collection.id}
                        collection={collection}
                      />
                    ))
                  )}
                </nav>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Tags link */}
          <div className="px-3 py-2">
            <h3 className="mb-2 px-4 text-xs font-semibold uppercase text-muted-foreground">
              Organization
            </h3>
            <nav className="space-y-1">
              <NavItem
                href="/tags"
                icon={<TagIcon className="h-4 w-4" />}
                label="All Tags"
                active={location.pathname === "/tags"}
              />
            </nav>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}

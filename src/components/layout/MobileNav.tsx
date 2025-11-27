/**
 * MobileNav Component (P6-004)
 *
 * Mobile navigation with sheet sidebar and bottom navigation bar.
 */

import {
  ArchiveIcon,
  BookmarkIcon,
  FolderIcon,
  HashIcon,
  HomeIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  StarIcon,
  TagIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavLink({ href, icon, label, active, onClick }: NavLinkProps) {
  return (
    <Link
      to={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted text-muted-foreground",
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function MobileSheetSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={`mobile-skeleton-${i}`} className="h-8 w-full" />
      ))}
    </div>
  );
}

/**
 * Mobile sidebar sheet
 */
export function MobileSidebar() {
  const location = useLocation();
  const { mobileNavOpen, setMobileNavOpen, openModal } = useUIStore();
  const { data: categoriesData, isLoading: loadingCategories } =
    useCategories();
  const { data: collectionsData, isLoading: loadingCollections } =
    useCollectionTree();

  const categories = categoriesData?.data ?? [];
  const collections = (collectionsData?.data ?? []) as CollectionTreeItem[];

  const closeNav = () => setMobileNavOpen(false);

  return (
    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center gap-2">
            <BookmarkIcon className="h-5 w-5 text-primary" />
            BookMind
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-65px)]">
          <div className="space-y-4 p-4">
            {/* Quick Links */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                Quick Links
              </h3>
              <nav className="space-y-1">
                <NavLink
                  href="/"
                  icon={<HomeIcon className="h-4 w-4" />}
                  label="Dashboard"
                  active={location.pathname === "/"}
                  onClick={closeNav}
                />
                <NavLink
                  href="/bookmarks"
                  icon={<BookmarkIcon className="h-4 w-4" />}
                  label="All Bookmarks"
                  active={location.pathname === "/bookmarks"}
                  onClick={closeNav}
                />
                <NavLink
                  href="/bookmarks?filter=pinned"
                  icon={<StarIcon className="h-4 w-4" />}
                  label="Favorites"
                  active={location.search.includes("filter=pinned")}
                  onClick={closeNav}
                />
                <NavLink
                  href="/bookmarks?filter=archived"
                  icon={<ArchiveIcon className="h-4 w-4" />}
                  label="Archive"
                  active={location.search.includes("filter=archived")}
                  onClick={closeNav}
                />
              </nav>
            </div>

            {/* Categories */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                  Categories
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    closeNav();
                    openModal("create-category");
                  }}
                  aria-label="Create category"
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
              <nav className="space-y-1">
                {loadingCategories ? (
                  <MobileSheetSkeleton />
                ) : categories.length === 0 ? (
                  <p className="py-2 text-sm text-muted-foreground">
                    No categories yet
                  </p>
                ) : (
                  categories.map((category) => (
                    <NavLink
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
                      onClick={closeNav}
                    />
                  ))
                )}
              </nav>
            </div>

            {/* Collections */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                  Collections
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    closeNav();
                    openModal("create-collection");
                  }}
                  aria-label="Create collection"
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
              <nav className="space-y-1">
                {loadingCollections ? (
                  <MobileSheetSkeleton />
                ) : collections.length === 0 ? (
                  <p className="py-2 text-sm text-muted-foreground">
                    No collections yet
                  </p>
                ) : (
                  collections.map((collection) => (
                    <NavLink
                      key={collection.id}
                      href={`/collections/${collection.id}`}
                      icon={<FolderIcon className="h-4 w-4" />}
                      label={collection.name}
                      active={
                        location.pathname === `/collections/${collection.id}`
                      }
                      onClick={closeNav}
                    />
                  ))
                )}
              </nav>
            </div>

            {/* Tags */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                Organization
              </h3>
              <nav className="space-y-1">
                <NavLink
                  href="/tags"
                  icon={<TagIcon className="h-4 w-4" />}
                  label="All Tags"
                  active={location.pathname === "/tags"}
                  onClick={closeNav}
                />
              </nav>
            </div>

            {/* Settings */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                Account
              </h3>
              <nav className="space-y-1">
                <NavLink
                  href="/settings"
                  icon={<SettingsIcon className="h-4 w-4" />}
                  label="Settings"
                  active={location.pathname === "/settings"}
                  onClick={closeNav}
                />
              </nav>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

interface BottomNavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function BottomNavItem({ href, icon, label, active }: BottomNavItemProps) {
  return (
    <Link
      to={href}
      className={cn(
        "flex flex-col items-center gap-1 p-2 text-xs transition-colors",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

/**
 * Bottom navigation bar for mobile
 */
export function BottomNav() {
  const location = useLocation();
  const { openModal } = useUIStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t bg-background py-2 md:hidden">
      <BottomNavItem
        href="/"
        icon={<HomeIcon className="h-5 w-5" />}
        label="Home"
        active={location.pathname === "/"}
      />
      <BottomNavItem
        href="/search"
        icon={<SearchIcon className="h-5 w-5" />}
        label="Search"
        active={location.pathname === "/search"}
      />
      <Button
        variant="default"
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg -mt-6"
        onClick={() => openModal("create-bookmark")}
        aria-label="Add bookmark"
      >
        <PlusIcon className="h-6 w-6" />
      </Button>
      <BottomNavItem
        href="/bookmarks"
        icon={<BookmarkIcon className="h-5 w-5" />}
        label="Bookmarks"
        active={location.pathname === "/bookmarks"}
      />
      <BottomNavItem
        href="/settings"
        icon={<SettingsIcon className="h-5 w-5" />}
        label="Settings"
        active={location.pathname === "/settings"}
      />
    </nav>
  );
}

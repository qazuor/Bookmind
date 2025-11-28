/**
 * CommandPalette Component (P6-033)
 *
 * Global command palette with keyboard shortcuts (Cmd+K).
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
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Favicon } from "@/components/shared";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import type { Bookmark, Category, Collection, Tag } from "@/lib/api-client";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recentBookmarks?: Bookmark[];
  categories?: Category[];
  tags?: Tag[];
  collections?: Collection[];
  onCreateBookmark?: () => void;
  onCreateCategory?: () => void;
  onCreateCollection?: () => void;
  onSearch?: (query: string) => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  recentBookmarks = [],
  categories = [],
  tags = [],
  collections = [],
  onCreateBookmark,
  onCreateCategory,
  onCreateCollection,
  onSearch,
}: CommandPaletteProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // Reset search when closed
  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  const handleSelect = useCallback(
    (callback: () => void) => {
      onOpenChange(false);
      callback();
    },
    [onOpenChange],
  );

  const handleSearch = () => {
    if (search.trim()) {
      onOpenChange(false);
      if (onSearch) {
        onSearch(search);
      } else {
        navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      }
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search bookmarks, navigate, or type a command..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>
          <div className="py-6 text-center text-sm">
            <p className="text-muted-foreground">No results found.</p>
            {search.trim() && (
              <button
                type="button"
                onClick={handleSearch}
                className="mt-2 text-primary hover:underline"
              >
                Search for &quot;{search}&quot;
              </button>
            )}
          </div>
        </CommandEmpty>

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          {onCreateBookmark && (
            <CommandItem onSelect={() => handleSelect(onCreateBookmark)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add new bookmark
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
          )}
          <CommandItem onSelect={() => handleSelect(() => navigate("/search"))}>
            <SearchIcon className="mr-2 h-4 w-4" />
            Search bookmarks
            <CommandShortcut>⌘/</CommandShortcut>
          </CommandItem>
          {onCreateCategory && (
            <CommandItem onSelect={() => handleSelect(onCreateCategory)}>
              <HashIcon className="mr-2 h-4 w-4" />
              Create category
            </CommandItem>
          )}
          {onCreateCollection && (
            <CommandItem onSelect={() => handleSelect(onCreateCollection)}>
              <FolderIcon className="mr-2 h-4 w-4" />
              Create collection
            </CommandItem>
          )}
        </CommandGroup>

        <CommandSeparator />

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => handleSelect(() => navigate("/"))}>
            <HomeIcon className="mr-2 h-4 w-4" />
            Dashboard
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => navigate("/bookmarks"))}
          >
            <BookmarkIcon className="mr-2 h-4 w-4" />
            All Bookmarks
          </CommandItem>
          <CommandItem
            onSelect={() =>
              handleSelect(() => navigate("/bookmarks?favorite=true"))
            }
          >
            <StarIcon className="mr-2 h-4 w-4" />
            Favorites
          </CommandItem>
          <CommandItem
            onSelect={() =>
              handleSelect(() => navigate("/bookmarks?archived=true"))
            }
          >
            <ArchiveIcon className="mr-2 h-4 w-4" />
            Archive
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => navigate("/categories"))}
          >
            <HashIcon className="mr-2 h-4 w-4" />
            Categories
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => navigate("/collections"))}
          >
            <FolderIcon className="mr-2 h-4 w-4" />
            Collections
          </CommandItem>
          <CommandItem onSelect={() => handleSelect(() => navigate("/tags"))}>
            <TagIcon className="mr-2 h-4 w-4" />
            Tags
          </CommandItem>
          <CommandItem
            onSelect={() => handleSelect(() => navigate("/settings"))}
          >
            <SettingsIcon className="mr-2 h-4 w-4" />
            Settings
          </CommandItem>
        </CommandGroup>

        {/* Recent Bookmarks */}
        {recentBookmarks.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent Bookmarks">
              {recentBookmarks.slice(0, 5).map((bookmark) => (
                <CommandItem
                  key={bookmark.id}
                  onSelect={() =>
                    handleSelect(() => navigate(`/bookmarks/${bookmark.id}`))
                  }
                  className="gap-2"
                >
                  <Favicon
                    src={bookmark.favicon}
                    alt={bookmark.title}
                    size="sm"
                  />
                  <span className="flex-1 truncate">{bookmark.title}</span>
                  {bookmark.isFavorite && (
                    <StarIcon className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Categories */}
        {categories.length > 0 && search && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Categories">
              {categories
                .filter((c) =>
                  c.name.toLowerCase().includes(search.toLowerCase()),
                )
                .slice(0, 5)
                .map((category) => (
                  <CommandItem
                    key={category.id}
                    onSelect={() =>
                      handleSelect(() =>
                        navigate(`/bookmarks?category=${category.id}`),
                      )
                    }
                  >
                    <div
                      className="mr-2 h-3 w-3 rounded-full"
                      style={{ backgroundColor: category.color ?? "#888" }}
                    />
                    {category.name}
                  </CommandItem>
                ))}
            </CommandGroup>
          </>
        )}

        {/* Tags */}
        {tags.length > 0 && search && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Tags">
              {tags
                .filter((t) =>
                  t.name.toLowerCase().includes(search.toLowerCase()),
                )
                .slice(0, 5)
                .map((tag) => (
                  <CommandItem
                    key={tag.id}
                    onSelect={() =>
                      handleSelect(() => navigate(`/bookmarks?tag=${tag.id}`))
                    }
                  >
                    <TagIcon
                      className="mr-2 h-4 w-4"
                      style={{ color: tag.color ?? undefined }}
                    />
                    {tag.name}
                  </CommandItem>
                ))}
            </CommandGroup>
          </>
        )}

        {/* Collections */}
        {collections.length > 0 && search && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Collections">
              {collections
                .filter((c) =>
                  c.name.toLowerCase().includes(search.toLowerCase()),
                )
                .slice(0, 5)
                .map((collection) => (
                  <CommandItem
                    key={collection.id}
                    onSelect={() =>
                      handleSelect(() =>
                        navigate(`/collections/${collection.id}`),
                      )
                    }
                  >
                    <FolderIcon className="mr-2 h-4 w-4" />
                    {collection.name}
                  </CommandItem>
                ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

/**
 * useCommandPalette - Hook to manage command palette state
 */
export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    open,
    setOpen,
    toggle: () => setOpen((prev) => !prev),
  };
}

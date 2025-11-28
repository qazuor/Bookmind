/**
 * TagInput Component (P6-027)
 *
 * Autocomplete input for selecting/creating tags.
 */

import { CheckIcon, PlusIcon, TagIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Tag } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface TagInputProps {
  /** All available tags */
  availableTags: Tag[];
  /** Currently selected tag IDs */
  selectedIds: string[];
  /** Callback when selection changes */
  onChange: (ids: string[]) => void;
  /** Callback to create a new tag */
  onCreateTag?: (name: string) => Promise<Tag>;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Max tags to select */
  maxTags?: number;
  /** Show color dots */
  showColors?: boolean;
  /** Class name */
  className?: string;
}

export function TagInput({
  availableTags,
  selectedIds,
  onChange,
  onCreateTag,
  placeholder = "Add tags...",
  disabled = false,
  maxTags,
  showColors = true,
  className,
}: TagInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedTags = availableTags.filter((tag) =>
    selectedIds.includes(tag.id),
  );
  const unselectedTags = availableTags.filter(
    (tag) => !selectedIds.includes(tag.id),
  );

  // Filter tags based on search
  const filteredTags = unselectedTags.filter((tag) =>
    tag.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Check if we should show "create" option
  const exactMatch = availableTags.some(
    (tag) => tag.name.toLowerCase() === search.toLowerCase(),
  );
  const canCreate = onCreateTag && search.trim() && !exactMatch;
  const canAddMore = !maxTags || selectedIds.length < maxTags;

  const handleSelect = useCallback(
    (tagId: string) => {
      if (!canAddMore) return;
      onChange([...selectedIds, tagId]);
      setSearch("");
    },
    [selectedIds, onChange, canAddMore],
  );

  const handleRemove = useCallback(
    (tagId: string) => {
      onChange(selectedIds.filter((id) => id !== tagId));
    },
    [selectedIds, onChange],
  );

  const handleCreate = async () => {
    if (!(onCreateTag && search.trim()) || isCreating) return;

    setIsCreating(true);
    try {
      const newTag = await onCreateTag(search.trim());
      onChange([...selectedIds, newTag.id]);
      setSearch("");
      setOpen(false);
    } catch {
      // Error handled by parent
    } finally {
      setIsCreating(false);
    }
  };

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="gap-1 pr-1"
              style={
                showColors
                  ? {
                      backgroundColor: tag.color ? `${tag.color}20` : undefined,
                      color: tag.color ?? undefined,
                      borderColor: tag.color ?? undefined,
                    }
                  : undefined
              }
            >
              {tag.name}
              <button
                type="button"
                onClick={() => handleRemove(tag.id)}
                className="ml-1 hover:opacity-75 focus:outline-none"
                disabled={disabled}
              >
                <XIcon className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input with popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setOpen(true)}
              placeholder={placeholder}
              disabled={disabled || !canAddMore}
              className="pl-9"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[300px]" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search tags..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {filteredTags.length === 0 && !canCreate && (
                <CommandEmpty>No tags found.</CommandEmpty>
              )}
              {filteredTags.length > 0 && (
                <CommandGroup heading="Available tags">
                  {filteredTags.map((tag) => (
                    <CommandItem
                      key={tag.id}
                      value={tag.id}
                      onSelect={() => handleSelect(tag.id)}
                      className="flex items-center gap-2"
                    >
                      {showColors && (
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: tag.color ?? "#888" }}
                        />
                      )}
                      <span className="flex-1">{tag.name}</span>
                      {selectedIds.includes(tag.id) && (
                        <CheckIcon className="h-4 w-4 text-primary" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {canCreate && (
                <CommandGroup heading="Create new">
                  <CommandItem
                    onSelect={handleCreate}
                    className="flex items-center gap-2"
                    disabled={isCreating}
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Create &quot;{search.trim()}&quot;</span>
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Max tags indicator */}
      {maxTags && (
        <p className="text-xs text-muted-foreground">
          {selectedIds.length}/{maxTags} tags selected
        </p>
      )}
    </div>
  );
}

/**
 * TagSelect - Simple tag multi-select without autocomplete
 */
interface TagSelectProps {
  availableTags: Tag[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  className?: string;
}

export function TagSelect({
  availableTags,
  selectedIds,
  onChange,
  disabled = false,
  className,
}: TagSelectProps) {
  const toggleTag = (tagId: string) => {
    if (selectedIds.includes(tagId)) {
      onChange(selectedIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedIds, tagId]);
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {availableTags.map((tag) => {
        const isSelected = selectedIds.includes(tag.id);
        return (
          <Button
            key={tag.id}
            type="button"
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => toggleTag(tag.id)}
            disabled={disabled}
            className="gap-1"
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
            {isSelected && <CheckIcon className="h-3 w-3" />}
          </Button>
        );
      })}
    </div>
  );
}

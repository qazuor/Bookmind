/**
 * FilterPanel Component (P6-031)
 *
 * Filter panel for bookmarks with categories, tags, and date filters.
 */

import { format } from "date-fns";
import {
  ArchiveIcon,
  CalendarIcon,
  ChevronDownIcon,
  FilterIcon,
  FolderIcon,
  HashIcon,
  StarIcon,
  TagIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Category, Collection, Tag } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export interface BookmarkFilters {
  categoryIds?: string[];
  tagIds?: string[];
  collectionIds?: string[];
  isFavorite?: boolean;
  isArchived?: boolean;
  isPublic?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

interface FilterPanelProps {
  filters: BookmarkFilters;
  onChange: (filters: BookmarkFilters) => void;
  categories?: Category[];
  tags?: Tag[];
  collections?: Collection[];
  className?: string;
}

export function FilterPanel({
  filters,
  onChange,
  categories = [],
  tags = [],
  collections = [],
  className,
}: FilterPanelProps) {
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [tagOpen, setTagOpen] = useState(true);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  const activeFilterCount = countActiveFilters(filters);

  const toggleCategory = (id: string) => {
    const current = filters.categoryIds ?? [];
    onChange({
      ...filters,
      categoryIds: current.includes(id)
        ? current.filter((c) => c !== id)
        : [...current, id],
    });
  };

  const toggleTag = (id: string) => {
    const current = filters.tagIds ?? [];
    onChange({
      ...filters,
      tagIds: current.includes(id)
        ? current.filter((t) => t !== id)
        : [...current, id],
    });
  };

  const toggleCollection = (id: string) => {
    const current = filters.collectionIds ?? [];
    onChange({
      ...filters,
      collectionIds: current.includes(id)
        ? current.filter((c) => c !== id)
        : [...current, id],
    });
  };

  const clearFilters = () => {
    onChange({});
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <FilterIcon className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </h3>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-4 pr-4">
          {/* Categories */}
          {categories.length > 0 && (
            <FilterSection
              title="Categories"
              icon={<HashIcon className="h-4 w-4" />}
              open={categoryOpen}
              onOpenChange={setCategoryOpen}
              count={filters.categoryIds?.length}
            >
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`cat-${category.id}`}
                      checked={filters.categoryIds?.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <Label
                      htmlFor={`cat-${category.id}`}
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: category.color ?? "#888" }}
                      />
                      <span className="text-sm">{category.name}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </FilterSection>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <FilterSection
              title="Tags"
              icon={<TagIcon className="h-4 w-4" />}
              open={tagOpen}
              onOpenChange={setTagOpen}
              count={filters.tagIds?.length}
            >
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const isSelected = filters.tagIds?.includes(tag.id);
                  return (
                    <Badge
                      key={tag.id}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag.id)}
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
                    </Badge>
                  );
                })}
              </div>
            </FilterSection>
          )}

          {/* Collections */}
          {collections.length > 0 && (
            <FilterSection
              title="Collections"
              icon={<FolderIcon className="h-4 w-4" />}
              open={collectionOpen}
              onOpenChange={setCollectionOpen}
              count={filters.collectionIds?.length}
            >
              <div className="space-y-2">
                {collections.map((collection) => (
                  <div key={collection.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`col-${collection.id}`}
                      checked={filters.collectionIds?.includes(collection.id)}
                      onCheckedChange={() => toggleCollection(collection.id)}
                    />
                    <Label
                      htmlFor={`col-${collection.id}`}
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <FolderIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">{collection.name}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </FilterSection>
          )}

          {/* Status filters */}
          <FilterSection
            title="Status"
            icon={<StarIcon className="h-4 w-4" />}
            open={statusOpen}
            onOpenChange={setStatusOpen}
            count={
              (filters.isFavorite ? 1 : 0) +
              (filters.isArchived ? 1 : 0) +
              (filters.isPublic ? 1 : 0)
            }
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="filter-favorite"
                  checked={filters.isFavorite ?? false}
                  onCheckedChange={(checked) =>
                    onChange({
                      ...filters,
                      isFavorite: checked === true ? true : undefined,
                    })
                  }
                />
                <Label
                  htmlFor="filter-favorite"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <StarIcon className="h-3.5 w-3.5 text-yellow-500" />
                  <span className="text-sm">Favorites only</span>
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="filter-archived"
                  checked={filters.isArchived ?? false}
                  onCheckedChange={(checked) =>
                    onChange({
                      ...filters,
                      isArchived: checked === true ? true : undefined,
                    })
                  }
                />
                <Label
                  htmlFor="filter-archived"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <ArchiveIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm">Show archived</span>
                </Label>
              </div>
            </div>
          </FilterSection>

          {/* Date filters */}
          <FilterSection
            title="Date Range"
            icon={<CalendarIcon className="h-4 w-4" />}
            open={dateOpen}
            onOpenChange={setDateOpen}
            count={filters.dateFrom || filters.dateTo ? 1 : 0}
          >
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">From</Label>
                <DatePicker
                  date={filters.dateFrom}
                  onChange={(date) => onChange({ ...filters, dateFrom: date })}
                  placeholder="Start date"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">To</Label>
                <DatePicker
                  date={filters.dateTo}
                  onChange={(date) => onChange({ ...filters, dateTo: date })}
                  placeholder="End date"
                />
              </div>
            </div>
          </FilterSection>
        </div>
      </ScrollArea>
    </div>
  );
}

/**
 * FilterSection - Collapsible section
 */
interface FilterSectionProps {
  title: string;
  icon: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count?: number;
  children: React.ReactNode;
}

function FilterSection({
  title,
  icon,
  open,
  onOpenChange,
  count,
  children,
}: FilterSectionProps) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-accent rounded-md">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-sm">{title}</span>
          {count !== undefined && count > 0 && (
            <Badge variant="secondary" className="text-xs">
              {count}
            </Badge>
          )}
        </div>
        <ChevronDownIcon
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 pl-2">{children}</CollapsibleContent>
    </Collapsible>
  );
}

/**
 * DatePicker - Simple date picker
 */
interface DatePickerProps {
  date?: Date;
  onChange: (date?: Date) => void;
  placeholder?: string;
}

function DatePicker({ date, onChange, placeholder }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : (placeholder ?? "Pick a date")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

/**
 * FilterSheet - Mobile filter sheet
 */
interface FilterSheetProps {
  filters: BookmarkFilters;
  onChange: (filters: BookmarkFilters) => void;
  categories?: Category[];
  tags?: Tag[];
  collections?: Collection[];
  trigger?: React.ReactNode;
}

export function FilterSheet({
  filters,
  onChange,
  categories,
  tags,
  collections,
  trigger,
}: FilterSheetProps) {
  const [open, setOpen] = useState(false);
  const activeFilterCount = countActiveFilters(filters);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-2">
            <FilterIcon className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount}</Badge>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>
            Filter your bookmarks by category, tags, and more.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <FilterPanel
            filters={filters}
            onChange={onChange}
            categories={categories}
            tags={tags}
            collections={collections}
          />
        </div>
        <SheetFooter>
          <Button onClick={() => setOpen(false)} className="w-full">
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/**
 * ActiveFilters - Show active filters as chips
 */
interface ActiveFiltersProps {
  filters: BookmarkFilters;
  onChange: (filters: BookmarkFilters) => void;
  categories?: Category[];
  tags?: Tag[];
  collections?: Collection[];
  className?: string;
}

export function ActiveFilters({
  filters,
  onChange,
  categories = [],
  tags = [],
  collections = [],
  className,
}: ActiveFiltersProps) {
  const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];

  // Category chips
  filters.categoryIds?.forEach((id) => {
    const category = categories.find((c) => c.id === id);
    if (category) {
      chips.push({
        key: `cat-${id}`,
        label: category.name,
        onRemove: () =>
          onChange({
            ...filters,
            categoryIds: filters.categoryIds?.filter((c) => c !== id),
          }),
      });
    }
  });

  // Tag chips
  filters.tagIds?.forEach((id) => {
    const tag = tags.find((t) => t.id === id);
    if (tag) {
      chips.push({
        key: `tag-${id}`,
        label: tag.name,
        onRemove: () =>
          onChange({
            ...filters,
            tagIds: filters.tagIds?.filter((t) => t !== id),
          }),
      });
    }
  });

  // Collection chips
  filters.collectionIds?.forEach((id) => {
    const collection = collections.find((c) => c.id === id);
    if (collection) {
      chips.push({
        key: `col-${id}`,
        label: collection.name,
        onRemove: () =>
          onChange({
            ...filters,
            collectionIds: filters.collectionIds?.filter((c) => c !== id),
          }),
      });
    }
  });

  // Status chips
  if (filters.isFavorite) {
    chips.push({
      key: "favorite",
      label: "Favorites",
      onRemove: () => onChange({ ...filters, isFavorite: undefined }),
    });
  }
  if (filters.isArchived) {
    chips.push({
      key: "archived",
      label: "Archived",
      onRemove: () => onChange({ ...filters, isArchived: undefined }),
    });
  }

  // Date chips
  if (filters.dateFrom || filters.dateTo) {
    const label =
      filters.dateFrom && filters.dateTo
        ? `${format(filters.dateFrom, "MMM d")} - ${format(filters.dateTo, "MMM d")}`
        : filters.dateFrom
          ? `From ${format(filters.dateFrom, "MMM d")}`
          : `Until ${format(filters.dateTo!, "MMM d")}`;
    chips.push({
      key: "date",
      label,
      onRemove: () =>
        onChange({ ...filters, dateFrom: undefined, dateTo: undefined }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {chips.map((chip) => (
        <Badge key={chip.key} variant="secondary" className="gap-1 pr-1">
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            className="ml-1 hover:opacity-75"
          >
            <XIcon className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {chips.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({})}
          className="h-6 px-2 text-xs"
        >
          Clear all
        </Button>
      )}
    </div>
  );
}

function countActiveFilters(filters: BookmarkFilters): number {
  let count = 0;
  if (filters.categoryIds?.length) count += filters.categoryIds.length;
  if (filters.tagIds?.length) count += filters.tagIds.length;
  if (filters.collectionIds?.length) count += filters.collectionIds.length;
  if (filters.isFavorite) count++;
  if (filters.isArchived) count++;
  if (filters.isPublic) count++;
  if (filters.dateFrom || filters.dateTo) count++;
  return count;
}

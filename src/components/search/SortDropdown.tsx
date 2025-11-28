/**
 * SortDropdown Component (P6-032)
 *
 * Dropdown for sorting bookmarks.
 */

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  ClockIcon,
  SortAscIcon,
  StarIcon,
  TypeIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SortField =
  | "createdAt"
  | "updatedAt"
  | "title"
  | "visitCount"
  | "isFavorite";

export type SortDirection = "asc" | "desc";

export interface SortOption {
  field: SortField;
  direction: SortDirection;
}

const SORT_OPTIONS: Array<{
  field: SortField;
  label: string;
  icon: React.ReactNode;
  defaultDirection: SortDirection;
}> = [
  {
    field: "createdAt",
    label: "Date Added",
    icon: <CalendarIcon className="h-4 w-4" />,
    defaultDirection: "desc",
  },
  {
    field: "updatedAt",
    label: "Last Updated",
    icon: <ClockIcon className="h-4 w-4" />,
    defaultDirection: "desc",
  },
  {
    field: "title",
    label: "Title",
    icon: <TypeIcon className="h-4 w-4" />,
    defaultDirection: "asc",
  },
  {
    field: "visitCount",
    label: "Most Visited",
    icon: <StarIcon className="h-4 w-4" />,
    defaultDirection: "desc",
  },
];

interface SortDropdownProps {
  value: SortOption;
  onChange: (option: SortOption) => void;
  className?: string;
}

export function SortDropdown({
  value,
  onChange,
  className,
}: SortDropdownProps) {
  const currentOption = SORT_OPTIONS.find((o) => o.field === value.field);

  const toggleDirection = () => {
    onChange({
      field: value.field,
      direction: value.direction === "asc" ? "desc" : "asc",
    });
  };

  const selectField = (field: SortField) => {
    const option = SORT_OPTIONS.find((o) => o.field === field);
    onChange({
      field,
      direction: option?.defaultDirection ?? "desc",
    });
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <SortAscIcon className="h-4 w-4" />
            <span className="hidden sm:inline">
              {currentOption?.label ?? "Sort"}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {SORT_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.field}
              onClick={() => selectField(option.field)}
              className={cn(
                "gap-2",
                value.field === option.field && "bg-accent",
              )}
            >
              {option.icon}
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="sm"
        onClick={toggleDirection}
        className="px-2"
        title={value.direction === "asc" ? "Ascending" : "Descending"}
      >
        {value.direction === "asc" ? (
          <ArrowUpIcon className="h-4 w-4" />
        ) : (
          <ArrowDownIcon className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

/**
 * SortSelect - Simple select variant
 */
interface SortSelectProps {
  value: SortOption;
  onChange: (option: SortOption) => void;
  className?: string;
}

export function SortSelect({ value, onChange, className }: SortSelectProps) {
  const handleChange = (combined: string) => {
    const [field, direction] = combined.split("-") as [
      SortField,
      SortDirection,
    ];
    onChange({ field, direction });
  };

  const combinedValue = `${value.field}-${value.direction}`;

  return (
    <Select value={combinedValue} onValueChange={handleChange}>
      <SelectTrigger className={cn("w-[180px]", className)}>
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <>
            <SelectItem
              key={`${option.field}-asc`}
              value={`${option.field}-asc`}
            >
              {option.label} (A-Z)
            </SelectItem>
            <SelectItem
              key={`${option.field}-desc`}
              value={`${option.field}-desc`}
            >
              {option.label} (Z-A)
            </SelectItem>
          </>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * SortToggle - Minimal sort toggle for list headers
 */
interface SortToggleProps {
  field: SortField;
  currentSort: SortOption;
  onChange: (option: SortOption) => void;
  label: string;
  className?: string;
}

export function SortToggle({
  field,
  currentSort,
  onChange,
  label,
  className,
}: SortToggleProps) {
  const isActive = currentSort.field === field;

  const handleClick = () => {
    if (isActive) {
      // Toggle direction
      onChange({
        field,
        direction: currentSort.direction === "asc" ? "desc" : "asc",
      });
    } else {
      // Set new field with default direction
      const option = SORT_OPTIONS.find((o) => o.field === field);
      onChange({
        field,
        direction: option?.defaultDirection ?? "desc",
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex items-center gap-1 text-sm font-medium transition-colors",
        isActive
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {label}
      {isActive &&
        (currentSort.direction === "asc" ? (
          <ArrowUpIcon className="h-3 w-3" />
        ) : (
          <ArrowDownIcon className="h-3 w-3" />
        ))}
    </button>
  );
}

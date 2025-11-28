/**
 * SortDropdown Component (P6-012)
 *
 * Dropdown for selecting sort field and order.
 */

import { ArrowDownAZ, ArrowUpAZ, Check, SortAsc } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type SortField = "createdAt" | "updatedAt" | "title" | "visitCount";
export type SortOrder = "asc" | "desc";

export interface SortOption {
  value: SortField;
  label: string;
}

export interface SortDropdownProps {
  value: SortField;
  order: SortOrder;
  onSort: (field: SortField, order: SortOrder) => void;
  options?: SortOption[];
  className?: string;
}

const defaultOptions: SortOption[] = [
  { value: "createdAt", label: "Date Created" },
  { value: "updatedAt", label: "Date Updated" },
  { value: "title", label: "Title" },
  { value: "visitCount", label: "Visit Count" },
];

export function SortDropdown({
  value,
  order,
  onSort,
  options = defaultOptions,
  className,
}: SortDropdownProps) {
  const currentOption = options.find((o) => o.value === value);

  const toggleOrder = () => {
    onSort(value, order === "asc" ? "desc" : "asc");
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <SortAsc className="h-4 w-4" />
            {currentOption?.label ?? "Sort"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onSort(option.value, order)}
              className="gap-2"
            >
              {option.value === value && <Check className="h-4 w-4" />}
              {option.value !== value && <span className="w-4" />}
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="outline" size="sm" onClick={toggleOrder}>
        {order === "asc" ? (
          <ArrowUpAZ className="h-4 w-4" />
        ) : (
          <ArrowDownAZ className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

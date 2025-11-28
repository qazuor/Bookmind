/**
 * ViewModeToggle Component (P6-018)
 *
 * Toggle between grid and list view modes.
 */

import { GridIcon, ListIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUIStore, type ViewMode } from "@/stores/ui-store";

interface ViewModeToggleProps {
  className?: string;
}

export function ViewModeToggle({ className }: ViewModeToggleProps) {
  const { viewMode, setViewMode } = useUIStore();

  return (
    <div className={cn("flex items-center rounded-lg border p-1", className)}>
      <Button
        variant={viewMode === "grid" ? "secondary" : "ghost"}
        size="sm"
        className="h-8 px-3"
        onClick={() => setViewMode("grid")}
        aria-label="Grid view"
        aria-pressed={viewMode === "grid"}
      >
        <GridIcon className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "list" ? "secondary" : "ghost"}
        size="sm"
        className="h-8 px-3"
        onClick={() => setViewMode("list")}
        aria-label="List view"
        aria-pressed={viewMode === "list"}
      >
        <ListIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}

/**
 * Controlled version of ViewModeToggle
 */
interface ControlledViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
}

export function ControlledViewModeToggle({
  viewMode,
  onViewModeChange,
  className,
}: ControlledViewModeToggleProps) {
  return (
    <div className={cn("flex items-center rounded-lg border p-1", className)}>
      <Button
        variant={viewMode === "grid" ? "secondary" : "ghost"}
        size="sm"
        className="h-8 px-3"
        onClick={() => onViewModeChange("grid")}
        aria-label="Grid view"
        aria-pressed={viewMode === "grid"}
      >
        <GridIcon className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "list" ? "secondary" : "ghost"}
        size="sm"
        className="h-8 px-3"
        onClick={() => onViewModeChange("list")}
        aria-label="List view"
        aria-pressed={viewMode === "list"}
      >
        <ListIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}

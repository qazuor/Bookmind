/**
 * ViewModeToggle Component (P6-010)
 *
 * Toggle between grid and list view modes.
 */

import { Grid, List } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import type { ViewMode } from "@/stores/ui-store";

export interface ViewModeToggleProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  className?: string;
}

export function ViewModeToggle({
  mode,
  onModeChange,
  className,
}: ViewModeToggleProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Toggle
        size="sm"
        pressed={mode === "grid"}
        onPressedChange={() => onModeChange("grid")}
        aria-label="Grid view"
      >
        <Grid className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={mode === "list"}
        onPressedChange={() => onModeChange("list")}
        aria-label="List view"
      >
        <List className="h-4 w-4" />
      </Toggle>
    </div>
  );
}

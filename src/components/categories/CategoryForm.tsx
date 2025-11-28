/**
 * CategoryForm Component (P6-022)
 *
 * Form for creating and editing categories.
 */

import { useForm } from "@tanstack/react-form";
import { HashIcon, LoaderIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category } from "@/lib/api-client";
import { cn } from "@/lib/utils";

// Predefined color palette
const COLOR_PALETTE = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#64748b", // slate
];

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: { name: string; color?: string }) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function CategoryForm({
  category,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}: CategoryFormProps) {
  const form = useForm({
    defaultValues: {
      name: category?.name ?? "",
      color: category?.color ?? "#3b82f6",
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        name: value.name,
        color: value.color || undefined,
      });
    },
  });

  const isEditMode = !!category;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className={cn("space-y-6", className)}
    >
      {/* Preview */}
      <form.Subscribe
        selector={(state) => [state.values.name, state.values.color]}
      >
        {([name, color]) => (
          <div className="flex items-center justify-center py-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <HashIcon
                className="h-8 w-8"
                style={{ color: color ?? "#888" }}
              />
            </div>
            <div className="ml-4">
              <p className="font-medium">{name || "Category Name"}</p>
              <p className="text-sm text-muted-foreground">Preview</p>
            </div>
          </div>
        )}
      </form.Subscribe>

      {/* Name */}
      <form.Field
        name="name"
        validators={{
          onChange: ({ value }) => {
            if (!value) return "Name is required";
            if (value.length > 50) return "Name must be 50 characters or less";
            return undefined;
          },
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Name *</Label>
            <Input
              id={field.name}
              placeholder="e.g., Development, Design, Marketing"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              disabled={isLoading}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors.join(", ")}
              </p>
            )}
          </div>
        )}
      </form.Field>

      {/* Color */}
      <form.Field name="color">
        {(field) => (
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => field.handleChange(color)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all",
                    "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2",
                    field.state.value === color &&
                      "ring-2 ring-offset-2 ring-primary",
                  )}
                  style={{ backgroundColor: color }}
                  disabled={isLoading}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Input
                type="color"
                value={field.state.value ?? "#3b82f6"}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-12 h-8 p-0 border-0"
                disabled={isLoading}
              />
              <Input
                type="text"
                value={field.state.value ?? ""}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="#3b82f6"
                className="w-24 font-mono text-sm"
                disabled={isLoading}
              />
              <span className="text-sm text-muted-foreground">
                Custom color
              </span>
            </div>
          </div>
        )}
      </form.Field>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? "Update Category" : "Create Category"}
        </Button>
      </div>
    </form>
  );
}

/**
 * CategoryFormDialog - Dialog wrapper for CategoryForm
 */
interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
  onSubmit: (data: { name: string; color?: string }) => Promise<void>;
  isLoading?: boolean;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSubmit,
  isLoading = false,
}: CategoryFormDialogProps) {
  const isEditMode = !!category;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Category" : "Create Category"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Make changes to your category."
              : "Add a new category to organize your bookmarks."}
          </DialogDescription>
        </DialogHeader>
        <CategoryForm
          category={category}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}

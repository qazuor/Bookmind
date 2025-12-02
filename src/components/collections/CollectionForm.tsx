/**
 * CollectionForm Component (P6-025)
 *
 * Form for creating and editing collections.
 */

import { useForm } from "@tanstack/react-form";
import { FolderIcon, LoaderIcon } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Collection } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface CollectionFormProps {
  collection?: Collection;
  collections?: Collection[];
  defaultParentId?: string;
  onSubmit: (data: {
    name: string;
    description?: string;
    parentId?: string;
  }) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function CollectionForm({
  collection,
  collections = [],
  defaultParentId,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}: CollectionFormProps) {
  const form = useForm({
    defaultValues: {
      name: collection?.name ?? "",
      description: collection?.description ?? "",
      parentId: collection?.parentId ?? defaultParentId ?? "",
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        name: value.name,
        description: value.description || undefined,
        parentId: value.parentId || undefined,
      });
    },
  });

  const isEditMode = !!collection;

  // Flatten collections tree for parent select (excluding current collection and its children)
  const flattenCollections = (
    items: Collection[],
    excludeId?: string,
    depth = 0,
  ): Array<{ id: string; name: string; depth: number }> => {
    const result: Array<{ id: string; name: string; depth: number }> = [];
    for (const item of items) {
      if (item.id !== excludeId) {
        result.push({ id: item.id, name: item.name, depth });
        if (item.children) {
          result.push(
            ...flattenCollections(item.children, excludeId, depth + 1),
          );
        }
      }
    }
    return result;
  };

  const availableParents = flattenCollections(collections, collection?.id);

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
      <form.Subscribe selector={(state) => state.values.name}>
        {(name) => (
          <div className="flex items-center justify-center py-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <FolderIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="ml-4">
              <p className="font-medium">{name || "Collection Name"}</p>
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
            if (value.length > 100)
              return "Name must be 100 characters or less";
            return undefined;
          },
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Name *</Label>
            <Input
              id={field.name}
              placeholder="e.g., Web Development, Research, Recipes"
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

      {/* Description */}
      <form.Field name="description">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Description</Label>
            <Textarea
              id={field.name}
              placeholder="What will this collection contain?"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>
        )}
      </form.Field>

      {/* Parent Collection */}
      {availableParents.length > 0 && (
        <form.Field name="parentId">
          {(field) => (
            <div className="space-y-2">
              <Label>Parent Collection</Label>
              <Select
                value={field.state.value || "__none__"}
                onValueChange={(v) =>
                  field.handleChange(v === "__none__" ? "" : v)
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None (root level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None (root level)</SelectItem>
                  {availableParents.map((parent) => (
                    <SelectItem key={parent.id} value={parent.id}>
                      <span style={{ paddingLeft: `${parent.depth * 12}px` }}>
                        {parent.depth > 0 && "└ "}
                        {parent.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Organize collections into a hierarchy
              </p>
            </div>
          )}
        </form.Field>
      )}

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
          {isEditMode ? "Update Collection" : "Create Collection"}
        </Button>
      </div>
    </form>
  );
}

/**
 * CollectionFormDialog - Dialog wrapper for CollectionForm
 */
interface CollectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection?: Collection;
  collections?: Collection[];
  defaultParentId?: string;
  onSubmit: (data: {
    name: string;
    description?: string;
    parentId?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function CollectionFormDialog({
  open,
  onOpenChange,
  collection,
  collections,
  defaultParentId,
  onSubmit,
  isLoading = false,
}: CollectionFormDialogProps) {
  const isEditMode = !!collection;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Collection" : "Create Collection"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Make changes to your collection."
              : "Create a new collection to organize your bookmarks."}
          </DialogDescription>
        </DialogHeader>
        <CollectionForm
          collection={collection}
          collections={collections}
          defaultParentId={defaultParentId}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}

/**
 * BookmarkForm Component (P6-016)
 *
 * Form for creating and editing bookmarks using TanStack Form.
 */

import { useForm } from "@tanstack/react-form";
import { LoaderIcon, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useCategories } from "@/hooks/use-categories";
import { useCollections } from "@/hooks/use-collections";
import { useTags } from "@/hooks/use-tags";
import type {
  Bookmark,
  CreateBookmarkInput,
  UpdateBookmarkInput,
} from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface BookmarkFormProps {
  bookmark?: Bookmark;
  onSubmit: (data: CreateBookmarkInput | UpdateBookmarkInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function BookmarkForm({
  bookmark,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}: BookmarkFormProps) {
  const { data: categoriesData } = useCategories();
  const { data: tagsData } = useTags();
  const { data: collectionsData } = useCollections();

  const categories = categoriesData?.data ?? [];
  const tags = tagsData?.data ?? [];
  const collections = collectionsData?.data ?? [];

  const form = useForm({
    defaultValues: {
      url: bookmark?.url ?? "",
      title: bookmark?.title ?? "",
      description: bookmark?.description ?? "",
      notes: bookmark?.notes ?? "",
      categoryId: bookmark?.categoryId ?? "",
      isPublic: bookmark?.isPublic ?? false,
      isFavorite: bookmark?.isFavorite ?? false,
      tagIds: bookmark?.tags?.map((t) => t.id) ?? ([] as string[]),
      collectionIds:
        bookmark?.collections?.map((c) => c.id) ?? ([] as string[]),
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        url: value.url,
        title: value.title,
        description: value.description || undefined,
        notes: value.notes || undefined,
        categoryId: value.categoryId || undefined,
        isPublic: value.isPublic,
        isFavorite: value.isFavorite,
        tagIds: value.tagIds.length > 0 ? value.tagIds : undefined,
        collectionIds:
          value.collectionIds.length > 0 ? value.collectionIds : undefined,
      });
    },
  });

  const isEditMode = !!bookmark;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className={cn("space-y-6", className)}
    >
      {/* URL */}
      <form.Field
        name="url"
        validators={{
          onChange: ({ value }) => {
            if (!value) return "URL is required";
            try {
              new URL(value);
            } catch {
              return "Please enter a valid URL";
            }
            return undefined;
          },
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>URL *</Label>
            <Input
              id={field.name}
              type="url"
              placeholder="https://example.com"
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

      {/* Title */}
      <form.Field
        name="title"
        validators={{
          onChange: ({ value }) => {
            if (!value) return "Title is required";
            if (value.length > 255)
              return "Title must be 255 characters or less";
            return undefined;
          },
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Title *</Label>
            <Input
              id={field.name}
              placeholder="Bookmark title"
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
              placeholder="Brief description..."
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>
        )}
      </form.Field>

      {/* Notes */}
      <form.Field name="notes">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Notes</Label>
            <Textarea
              id={field.name}
              placeholder="Your personal notes..."
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              disabled={isLoading}
              rows={4}
            />
          </div>
        )}
      </form.Field>

      {/* Category */}
      <form.Field name="categoryId">
        {(field) => (
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={field.state.value}
              onValueChange={field.handleChange}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No category</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color ?? "#888" }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </form.Field>

      {/* Tags */}
      <form.Field name="tagIds">
        {(field) => (
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {field.state.value.map((tagId) => {
                const tag = tags.find((t) => t.id === tagId);
                if (!tag) return null;
                return (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="gap-1"
                    style={{
                      backgroundColor: tag.color ? `${tag.color}20` : undefined,
                      color: tag.color ?? undefined,
                    }}
                  >
                    {tag.name}
                    <button
                      type="button"
                      onClick={() =>
                        field.handleChange(
                          field.state.value.filter((id) => id !== tagId),
                        )
                      }
                      className="ml-1 hover:opacity-75"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
            <Select
              value=""
              onValueChange={(value) => {
                if (value && !field.state.value.includes(value)) {
                  field.handleChange([...field.state.value, value]);
                }
              }}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Add tags..." />
              </SelectTrigger>
              <SelectContent>
                {tags
                  .filter((tag) => !field.state.value.includes(tag.id))
                  .map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color ?? "#888" }}
                        />
                        {tag.name}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </form.Field>

      {/* Collections */}
      <form.Field name="collectionIds">
        {(field) => (
          <div className="space-y-2">
            <Label>Collections</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {field.state.value.map((collectionId) => {
                const collection = collections.find(
                  (c) => c.id === collectionId,
                );
                if (!collection) return null;
                return (
                  <Badge
                    key={collection.id}
                    variant="outline"
                    className="gap-1"
                  >
                    {collection.name}
                    <button
                      type="button"
                      onClick={() =>
                        field.handleChange(
                          field.state.value.filter((id) => id !== collectionId),
                        )
                      }
                      className="ml-1 hover:opacity-75"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
            <Select
              value=""
              onValueChange={(value) => {
                if (value && !field.state.value.includes(value)) {
                  field.handleChange([...field.state.value, value]);
                }
              }}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Add to collections..." />
              </SelectTrigger>
              <SelectContent>
                {collections
                  .filter((c) => !field.state.value.includes(c.id))
                  .map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </form.Field>

      {/* Visibility options */}
      <div className="flex flex-col gap-4">
        <form.Field name="isPublic">
          {(field) => (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={field.name}
                checked={field.state.value}
                onCheckedChange={(checked) => field.handleChange(!!checked)}
                disabled={isLoading}
              />
              <Label htmlFor={field.name} className="font-normal">
                Make this bookmark public
              </Label>
            </div>
          )}
        </form.Field>

        <form.Field name="isFavorite">
          {(field) => (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={field.name}
                checked={field.state.value}
                onCheckedChange={(checked) => field.handleChange(!!checked)}
                disabled={isLoading}
              />
              <Label htmlFor={field.name} className="font-normal">
                Add to favorites
              </Label>
            </div>
          )}
        </form.Field>
      </div>

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
          {isEditMode ? "Update Bookmark" : "Create Bookmark"}
        </Button>
      </div>
    </form>
  );
}

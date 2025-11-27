import { z } from "zod";

// Color validation (hex color) - optional for tags
const colorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color format")
  .nullable()
  .optional();

// Create tag schema
export const createTagSchema = z.object({
  name: z
    .string()
    .min(1, "Tag name is required")
    .max(30, "Tag name must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9\-_\s]+$/,
      "Tag name can only contain letters, numbers, hyphens, underscores, and spaces",
    )
    .transform((val) => val.toLowerCase().trim()),
  color: colorSchema,
});

// Update tag schema
export const updateTagSchema = z.object({
  name: z
    .string()
    .min(1, "Tag name is required")
    .max(30, "Tag name must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9\-_\s]+$/,
      "Tag name can only contain letters, numbers, hyphens, underscores, and spaces",
    )
    .transform((val) => val.toLowerCase().trim())
    .optional(),
  color: colorSchema,
});

// Tag autocomplete query
export const tagAutocompleteSchema = z.object({
  query: z.string().min(1).max(30),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

// Tag response schema
export const tagResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  color: z.string().nullable(),
  bookmarkCount: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Tag cloud item (for visualization)
export const tagCloudItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  color: z.string().nullable(),
  count: z.number(),
  weight: z.number().min(0).max(1), // Normalized weight for sizing
});

// Bulk tag operations
export const bulkTagSchema = z.object({
  tagIds: z
    .array(z.string().uuid("Invalid tag ID"))
    .min(1, "At least one tag is required"),
});

// Types inferred from schemas
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
export type TagAutocompleteInput = z.infer<typeof tagAutocompleteSchema>;
export type TagResponse = z.infer<typeof tagResponseSchema>;
export type TagCloudItem = z.infer<typeof tagCloudItemSchema>;
export type BulkTagInput = z.infer<typeof bulkTagSchema>;

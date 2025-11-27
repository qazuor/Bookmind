import { z } from "zod";

// URL validation with sanitization
const urlSchema = z
  .string()
  .url("Invalid URL")
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return ["http:", "https:"].includes(parsed.protocol);
      } catch {
        return false;
      }
    },
    { message: "URL must use http or https protocol" },
  );

// Base bookmark fields
const bookmarkBase = {
  url: urlSchema,
  title: z
    .string()
    .min(1, "Title is required")
    .max(500, "Title must be less than 500 characters"),
  description: z
    .string()
    .max(2000, "Description must be less than 2000 characters")
    .optional(),
  notes: z
    .string()
    .max(5000, "Notes must be less than 5000 characters")
    .optional(),
  categoryId: z.string().uuid("Invalid category ID").optional(),
  isPublic: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  tagIds: z.array(z.string().uuid("Invalid tag ID")).default([]),
  collectionIds: z.array(z.string().uuid("Invalid collection ID")).default([]),
};

// Create bookmark schema
export const createBookmarkSchema = z.object({
  url: bookmarkBase.url,
  title: bookmarkBase.title.optional(), // Will be auto-extracted if not provided
  description: bookmarkBase.description,
  notes: bookmarkBase.notes,
  categoryId: bookmarkBase.categoryId,
  isPublic: bookmarkBase.isPublic,
  isPinned: bookmarkBase.isPinned,
  tagIds: bookmarkBase.tagIds,
  collectionIds: bookmarkBase.collectionIds,
});

// Update bookmark schema
export const updateBookmarkSchema = z.object({
  url: bookmarkBase.url.optional(),
  title: bookmarkBase.title.optional(),
  description: bookmarkBase.description,
  notes: bookmarkBase.notes,
  categoryId: bookmarkBase.categoryId,
  isPublic: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  tagIds: bookmarkBase.tagIds.optional(),
  collectionIds: bookmarkBase.collectionIds.optional(),
});

// Bookmark filters for listing
export const bookmarkFiltersSchema = z.object({
  categoryId: z.string().uuid().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  collectionId: z.string().uuid().optional(),
  isPublic: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  search: z.string().max(200).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum(["createdAt", "updatedAt", "title", "url"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Combined list bookmarks schema
export const listBookmarksSchema =
  bookmarkFiltersSchema.merge(paginationSchema);

// Bookmark response schema
export const bookmarkResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  url: z.string().url(),
  title: z.string(),
  description: z.string().nullable(),
  notes: z.string().nullable(),
  favicon: z.string().nullable(),
  ogImage: z.string().nullable(),
  categoryId: z.string().uuid().nullable(),
  isPublic: z.boolean(),
  isPinned: z.boolean(),
  isArchived: z.boolean(),
  // AI fields
  aiSummary: z.string().nullable(),
  aiTags: z.array(z.string()).nullable(),
  aiCategory: z.string().nullable(),
  aiProcessedAt: z.date().nullable(),
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  // Relations (optional, populated when needed)
  category: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      color: z.string(),
      icon: z.string().nullable(),
    })
    .nullable()
    .optional(),
  tags: z
    .array(
      z.object({
        id: z.string().uuid(),
        name: z.string(),
        color: z.string().nullable(),
      }),
    )
    .optional(),
  collections: z
    .array(
      z.object({
        id: z.string().uuid(),
        name: z.string(),
      }),
    )
    .optional(),
});

// Paginated response
export const paginatedBookmarksSchema = z.object({
  data: z.array(bookmarkResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
  }),
});

// Types inferred from schemas
export type CreateBookmarkInput = z.infer<typeof createBookmarkSchema>;
export type UpdateBookmarkInput = z.infer<typeof updateBookmarkSchema>;
export type BookmarkFilters = z.infer<typeof bookmarkFiltersSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type ListBookmarksInput = z.infer<typeof listBookmarksSchema>;
export type BookmarkResponse = z.infer<typeof bookmarkResponseSchema>;
export type PaginatedBookmarks = z.infer<typeof paginatedBookmarksSchema>;

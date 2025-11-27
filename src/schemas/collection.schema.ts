import { z } from "zod";

// Create collection schema
export const createCollectionSchema = z.object({
  name: z
    .string()
    .min(1, "Collection name is required")
    .max(100, "Collection name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  parentId: z
    .string()
    .uuid("Invalid parent collection ID")
    .nullable()
    .optional(),
  isPublic: z.boolean().default(false),
});

// Update collection schema
export const updateCollectionSchema = z.object({
  name: z
    .string()
    .min(1, "Collection name is required")
    .max(100, "Collection name must be less than 100 characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  parentId: z
    .string()
    .uuid("Invalid parent collection ID")
    .nullable()
    .optional(),
  isPublic: z.boolean().optional(),
});

// Add/remove bookmarks from collection
export const collectionBookmarksSchema = z.object({
  bookmarkIds: z
    .array(z.string().uuid("Invalid bookmark ID"))
    .min(1, "At least one bookmark is required"),
});

// Collection share schema
export const collectionShareSchema = z.object({
  expiresAt: z.coerce.date().optional(),
});

// Base collection response (without recursive children)
const collectionBaseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  parentId: z.string().uuid().nullable(),
  isPublic: z.boolean(),
  shareToken: z.string().nullable(),
  shareExpiresAt: z.date().nullable(),
  bookmarkCount: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Collection response type (manually defined for recursion)
export type CollectionResponse = z.infer<typeof collectionBaseSchema> & {
  children?: CollectionResponse[];
};

// Collection response schema (for runtime validation, no recursion)
export const collectionResponseSchema = collectionBaseSchema;

// Base tree schema (without recursive children)
const collectionTreeBaseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  parentId: z.string().uuid().nullable(),
  bookmarkCount: z.number(),
});

// Collection tree type (manually defined for recursion)
export type CollectionTree = z.infer<typeof collectionTreeBaseSchema> & {
  children: CollectionTree[];
};

// Collection tree schema (for runtime validation, no recursion)
export const collectionTreeSchema = collectionTreeBaseSchema;

// Shared collection response (public view)
export const sharedCollectionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  bookmarkCount: z.number(),
  owner: z.object({
    username: z.string(),
    name: z.string().nullable(),
    avatarUrl: z.string().nullable(),
  }),
  bookmarks: z.array(
    z.object({
      id: z.string().uuid(),
      url: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      favicon: z.string().nullable(),
      ogImage: z.string().nullable(),
    }),
  ),
});

// Types inferred from schemas
export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
export type CollectionBookmarksInput = z.infer<
  typeof collectionBookmarksSchema
>;
export type CollectionShareInput = z.infer<typeof collectionShareSchema>;
export type SharedCollection = z.infer<typeof sharedCollectionSchema>;

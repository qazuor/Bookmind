import { z } from "zod";

// Text search query schema
export const searchQuerySchema = z.object({
  q: z
    .string()
    .min(1, "Search query is required")
    .max(200, "Search query must be less than 200 characters")
    .transform((val) => val.trim()),
  // Optional filters
  categoryId: z.string().uuid().optional(),
  tagIds: z
    .string()
    .transform((val) => val.split(",").filter(Boolean))
    .pipe(z.array(z.string().uuid()))
    .optional(),
  collectionId: z.string().uuid().optional(),
  isPublic: z.coerce.boolean().optional(),
  isArchived: z.coerce.boolean().optional(),
  // Date range
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  // Pagination
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// Semantic search query schema (AI-powered)
export const semanticSearchSchema = z.object({
  query: z
    .string()
    .min(3, "Query must be at least 3 characters")
    .max(500, "Query must be less than 500 characters"),
  // Optional context filters
  categoryId: z.string().uuid().optional(),
  collectionId: z.string().uuid().optional(),
  // Number of results
  limit: z.coerce.number().int().min(1).max(20).default(10),
  // Minimum relevance threshold (0-1)
  threshold: z.coerce.number().min(0).max(1).default(0.5),
});

// Search result schema
export const searchResultSchema = z.object({
  id: z.string().uuid(),
  url: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  favicon: z.string().nullable(),
  ogImage: z.string().nullable(),
  // Match info
  matchType: z.enum(["title", "url", "description", "notes", "tags", "ai"]),
  matchHighlight: z.string().optional(), // Highlighted snippet
  relevanceScore: z.number().min(0).max(1).optional(), // For semantic search
  // Relations
  category: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      color: z.string(),
    })
    .nullable(),
  tags: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
    }),
  ),
  createdAt: z.date(),
});

// Search results response
export const searchResultsSchema = z.object({
  data: z.array(searchResultSchema),
  meta: z.object({
    query: z.string(),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
    searchType: z.enum(["text", "semantic"]),
    processingTime: z.number(), // ms
  }),
});

// Search suggestions (for autocomplete)
export const searchSuggestionSchema = z.object({
  type: z.enum(["bookmark", "tag", "collection", "category"]),
  id: z.string().uuid(),
  text: z.string(),
  icon: z.string().optional(),
});

export const searchSuggestionsSchema = z.object({
  query: z.string().min(1).max(50),
  limit: z.coerce.number().int().min(1).max(10).default(5),
});

// Types inferred from schemas
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
export type SemanticSearchInput = z.infer<typeof semanticSearchSchema>;
export type SearchResult = z.infer<typeof searchResultSchema>;
export type SearchResults = z.infer<typeof searchResultsSchema>;
export type SearchSuggestion = z.infer<typeof searchSuggestionSchema>;
export type SearchSuggestionsInput = z.infer<typeof searchSuggestionsSchema>;

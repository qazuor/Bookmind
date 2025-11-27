import { z } from "zod";

// Export format enum
export const exportFormatSchema = z.enum(["html", "json", "csv"]);

// Export options schema
export const exportOptionsSchema = z.object({
  format: exportFormatSchema,
  // Filter options
  categoryId: z.string().uuid().optional(),
  collectionId: z.string().uuid().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  isArchived: z.boolean().optional(),
  // Date range
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  // Include options
  includeNotes: z.boolean().default(true),
  includeAiSummary: z.boolean().default(true),
  includeTags: z.boolean().default(true),
  includeCollections: z.boolean().default(false),
});

// Import schema (for HTML bookmark files)
export const importOptionsSchema = z.object({
  file: z.instanceof(File).optional(), // For browser
  content: z.string().optional(), // For server
  // Import behavior
  duplicateHandling: z.enum(["skip", "update", "create"]).default("skip"),
  defaultCategoryId: z.string().uuid().optional(),
  importTags: z.boolean().default(true),
  importFolders: z.boolean().default(true), // Import folders as collections
});

// Export result schema
export const exportResultSchema = z.object({
  filename: z.string(),
  format: exportFormatSchema,
  size: z.number(), // bytes
  bookmarkCount: z.number(),
  exportedAt: z.date(),
  // Download info
  downloadUrl: z.string().url().optional(),
  expiresAt: z.date().optional(),
});

// Import result schema
export const importResultSchema = z.object({
  total: z.number(),
  imported: z.number(),
  skipped: z.number(),
  failed: z.number(),
  errors: z.array(
    z.object({
      url: z.string(),
      reason: z.string(),
    }),
  ),
  importedAt: z.date(),
});

// CSV column mapping (for flexible CSV import)
export const csvColumnMappingSchema = z.object({
  url: z.string().default("url"),
  title: z.string().default("title"),
  description: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(), // Column containing comma-separated tags
  category: z.string().optional(),
  isPublic: z.string().optional(),
  createdAt: z.string().optional(),
});

// Types inferred from schemas
export type ExportFormat = z.infer<typeof exportFormatSchema>;
export type ExportOptions = z.infer<typeof exportOptionsSchema>;
export type ImportOptions = z.infer<typeof importOptionsSchema>;
export type ExportResult = z.infer<typeof exportResultSchema>;
export type ImportResult = z.infer<typeof importResultSchema>;
export type CsvColumnMapping = z.infer<typeof csvColumnMappingSchema>;

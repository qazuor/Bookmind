import { z } from "zod";

// Color validation (hex color)
const colorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color format")
  .default("#6366f1");

// Icon validation (lucide icon name)
const iconSchema = z
  .string()
  .max(50, "Icon name must be less than 50 characters")
  .optional();

// Create category schema
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(50, "Category name must be less than 50 characters"),
  color: colorSchema,
  icon: iconSchema,
  description: z
    .string()
    .max(200, "Description must be less than 200 characters")
    .optional(),
});

// Update category schema
export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(50, "Category name must be less than 50 characters")
    .optional(),
  color: colorSchema.optional(),
  icon: iconSchema,
  description: z
    .string()
    .max(200, "Description must be less than 200 characters")
    .optional(),
});

// Category response schema
export const categoryResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  color: z.string(),
  icon: z.string().nullable(),
  description: z.string().nullable(),
  isDefault: z.boolean(),
  bookmarkCount: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Default categories (created on signup)
export const defaultCategories = [
  { name: "Technology", color: "#3b82f6", icon: "cpu" },
  { name: "Design", color: "#ec4899", icon: "palette" },
  { name: "Business", color: "#10b981", icon: "briefcase" },
  { name: "News", color: "#f59e0b", icon: "newspaper" },
  { name: "Entertainment", color: "#8b5cf6", icon: "film" },
  { name: "Education", color: "#06b6d4", icon: "graduation-cap" },
  { name: "Other", color: "#6b7280", icon: "folder" },
] as const;

// Types inferred from schemas
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryResponse = z.infer<typeof categoryResponseSchema>;

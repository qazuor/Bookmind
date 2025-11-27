/**
 * Categories Service
 *
 * Business logic for category CRUD operations.
 */

import { and, count, eq, sql } from "drizzle-orm";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/schemas/category.schema";
import { defaultCategories } from "@/schemas/category.schema";
import { db } from "../db";
import {
  bookmarks,
  type Category,
  categories,
  type NewCategory,
} from "../db/schema";

/**
 * Get all categories for a user
 */
export async function getUserCategories(userId: string): Promise<Category[]> {
  return db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(categories.name);
}

/**
 * Get categories with bookmark counts
 */
export async function getUserCategoriesWithCounts(
  userId: string,
): Promise<(Category & { bookmarkCount: number })[]> {
  const result = await db
    .select({
      id: categories.id,
      userId: categories.userId,
      name: categories.name,
      color: categories.color,
      icon: categories.icon,
      description: categories.description,
      isDefault: categories.isDefault,
      createdAt: categories.createdAt,
      updatedAt: categories.updatedAt,
      bookmarkCount: count(bookmarks.id),
    })
    .from(categories)
    .leftJoin(
      bookmarks,
      and(
        eq(bookmarks.categoryId, categories.id),
        eq(bookmarks.userId, userId),
      ),
    )
    .where(eq(categories.userId, userId))
    .groupBy(categories.id)
    .orderBy(categories.name);

  return result.map((row) => ({
    ...row,
    bookmarkCount: Number(row.bookmarkCount),
  }));
}

/**
 * Get a single category by ID
 */
export async function getCategoryById(
  categoryId: string,
  userId: string,
): Promise<Category | null> {
  const result = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Create a new category
 */
export async function createCategory(
  userId: string,
  input: CreateCategoryInput,
): Promise<Category> {
  const newCategory: NewCategory = {
    userId,
    name: input.name,
    color: input.color,
    icon: input.icon ?? null,
    description: input.description ?? null,
    isDefault: false,
  };

  const result = await db.insert(categories).values(newCategory).returning();

  return result[0]!;
}

/**
 * Update a category
 */
export async function updateCategory(
  categoryId: string,
  userId: string,
  input: UpdateCategoryInput,
): Promise<Category | null> {
  const result = await db
    .update(categories)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .returning();

  return result[0] ?? null;
}

/**
 * Delete a category
 * Bookmarks in this category will have their categoryId set to null
 */
export async function deleteCategory(
  categoryId: string,
  userId: string,
): Promise<boolean> {
  // First, check if category exists and is not a default category
  const category = await getCategoryById(categoryId, userId);
  if (!category) {
    return false;
  }

  if (category.isDefault) {
    throw new Error("Cannot delete default category");
  }

  // Update bookmarks to remove category reference
  await db
    .update(bookmarks)
    .set({ categoryId: null, updatedAt: new Date() })
    .where(
      and(eq(bookmarks.categoryId, categoryId), eq(bookmarks.userId, userId)),
    );

  // Delete the category
  const result = await db
    .delete(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .returning();

  return result.length > 0;
}

/**
 * Create default categories for a new user
 */
export async function createDefaultCategories(
  userId: string,
): Promise<Category[]> {
  const categoriesToInsert: NewCategory[] = defaultCategories.map((cat) => ({
    userId,
    name: cat.name,
    color: cat.color,
    icon: cat.icon,
    description: null,
    isDefault: true,
  }));

  const result = await db
    .insert(categories)
    .values(categoriesToInsert)
    .returning();

  return result;
}

/**
 * Check if user has any categories
 */
export async function userHasCategories(userId: string): Promise<boolean> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(categories)
    .where(eq(categories.userId, userId));

  return Number(result[0]?.count ?? 0) > 0;
}

/**
 * Get or create default categories for user
 * Creates them if they don't exist
 */
export async function ensureUserHasCategories(
  userId: string,
): Promise<Category[]> {
  const hasCategories = await userHasCategories(userId);

  if (!hasCategories) {
    await createDefaultCategories(userId);
  }

  return getUserCategories(userId);
}

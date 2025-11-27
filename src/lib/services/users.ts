/**
 * Users Service
 *
 * Business logic for user profile operations.
 */

import { and, eq } from "drizzle-orm";
import type { UpdateProfileInput } from "@/schemas/user.schema";
import { db } from "../db";
import { type User, users } from "../db/schema";

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Get user by username
 */
export async function getUserByUsername(
  username: string,
): Promise<User | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.username, username.toLowerCase()))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<User | null> {
  // Prepare update data
  const updateData: Partial<User> = {
    updatedAt: new Date(),
  };

  if (input.name !== undefined) {
    updateData.name = input.name;
  }

  if (input.username !== undefined) {
    updateData.username = input.username.toLowerCase();
  }

  if (input.bio !== undefined) {
    updateData.bio = input.bio;
  }

  if (input.avatarUrl !== undefined) {
    updateData.image = input.avatarUrl;
  }

  const result = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, userId))
    .returning();

  return result[0] ?? null;
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  userId: string,
  preferences: {
    language?: string;
    theme?: string;
    defaultVisibility?: string;
    emailNotifications?: boolean;
  },
): Promise<User | null> {
  const result = await db
    .update(users)
    .set({
      ...preferences,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return result[0] ?? null;
}

/**
 * Check if username is available
 */
export async function isUsernameAvailable(
  username: string,
  excludeUserId?: string,
): Promise<boolean> {
  const conditions = [eq(users.username, username.toLowerCase())];

  const result = await db
    .select({ id: users.id })
    .from(users)
    .where(and(...conditions))
    .limit(1);

  // If no user found, username is available
  if (result.length === 0) return true;

  // If found user is the same as excluded user, it's available (for updates)
  if (excludeUserId && result[0]?.id === excludeUserId) return true;

  return false;
}

/**
 * Get public user profile (limited info)
 */
export async function getPublicUserProfile(username: string): Promise<{
  username: string;
  name: string | null;
  bio: string | null;
  image: string | null;
  createdAt: Date;
} | null> {
  const result = await db
    .select({
      username: users.username,
      name: users.name,
      bio: users.bio,
      image: users.image,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.username, username.toLowerCase()))
    .limit(1);

  if (!result[0]?.username) {
    return null;
  }

  return {
    username: result[0].username,
    name: result[0].name,
    bio: result[0].bio,
    image: result[0].image,
    createdAt: result[0].createdAt,
  };
}

import { z } from "zod";

// Base user fields
const userBase = {
  email: z.string().email("Invalid email address"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens",
    )
    .optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  avatarUrl: z.string().url("Invalid avatar URL").optional(),
  language: z.enum(["en", "es"]).default("en"),
  theme: z.enum(["light", "dark", "system"]).default("system"),
};

// Create user schema (for signup)
export const createUserSchema = z.object({
  email: userBase.email,
  name: userBase.name,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one lowercase letter, one uppercase letter, and one number",
    ),
});

// Update user profile schema
export const updateUserSchema = z.object({
  name: userBase.name,
  username: userBase.username,
  bio: userBase.bio,
  avatarUrl: userBase.avatarUrl,
  language: userBase.language,
  theme: userBase.theme,
});

// Update profile schema (same as update user but optional fields)
export const updateProfileSchema = z.object({
  name: userBase.name,
  username: userBase.username,
  bio: userBase.bio,
  avatarUrl: userBase.avatarUrl.nullable(),
});

// User preferences schema
export const userPreferencesSchema = z.object({
  language: userBase.language,
  theme: userBase.theme,
  defaultVisibility: z.enum(["public", "private"]).default("private"),
  emailNotifications: z.boolean().default(true),
});

// User response schema (what we return from API)
export const userResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  username: z.string().nullable(),
  bio: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  language: z.enum(["en", "es"]),
  theme: z.enum(["light", "dark", "system"]),
  emailVerified: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Public user profile (visible to others)
export const publicUserSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  name: z.string().nullable(),
  bio: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  createdAt: z.date(),
});

// Types inferred from schemas
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type PublicUser = z.infer<typeof publicUserSchema>;

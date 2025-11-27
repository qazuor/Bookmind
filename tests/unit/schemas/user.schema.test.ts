import { describe, expect, it } from "vitest";
import {
  createUserSchema,
  publicUserSchema,
  updateUserSchema,
  userPreferencesSchema,
  userResponseSchema,
} from "@/schemas/user.schema";

describe("User Schemas", () => {
  describe("createUserSchema", () => {
    it("should validate a valid user creation input", () => {
      const validInput = {
        email: "test@example.com",
        password: "Password123",
        name: "John Doe",
      };
      const result = createUserSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should require email", () => {
      const invalidInput = {
        password: "Password123",
      };
      const result = createUserSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should validate email format", () => {
      const invalidInput = {
        email: "invalid-email",
        password: "Password123",
      };
      const result = createUserSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should require password with at least 8 characters", () => {
      const invalidInput = {
        email: "test@example.com",
        password: "Pass1",
      };
      const result = createUserSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should require password with uppercase, lowercase, and number", () => {
      const invalidInput = {
        email: "test@example.com",
        password: "password123", // no uppercase
      };
      const result = createUserSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should allow optional name", () => {
      const validInput = {
        email: "test@example.com",
        password: "Password123",
      };
      const result = createUserSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe("updateUserSchema", () => {
    it("should validate valid update input", () => {
      const validInput = {
        name: "Jane Doe",
        username: "janedoe",
        bio: "Hello world",
        language: "es" as const,
        theme: "dark" as const,
      };
      const result = updateUserSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should validate username format", () => {
      const invalidInput = {
        username: "invalid username!", // contains space and special char
      };
      const result = updateUserSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should enforce username minimum length", () => {
      const invalidInput = {
        username: "ab", // too short
      };
      const result = updateUserSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should validate avatar URL format", () => {
      const invalidInput = {
        avatarUrl: "not-a-url",
      };
      const result = updateUserSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should enforce bio max length", () => {
      const invalidInput = {
        bio: "x".repeat(501),
      };
      const result = updateUserSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("userPreferencesSchema", () => {
    it("should have default values", () => {
      const result = userPreferencesSchema.parse({});
      expect(result.language).toBe("en");
      expect(result.theme).toBe("system");
      expect(result.defaultVisibility).toBe("private");
      expect(result.emailNotifications).toBe(true);
    });

    it("should validate language enum", () => {
      const invalidInput = {
        language: "fr", // not supported
      };
      const result = userPreferencesSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("userResponseSchema", () => {
    it("should validate a complete user response", () => {
      const validResponse = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        email: "test@example.com",
        name: "John Doe",
        username: "johndoe",
        bio: "Hello",
        avatarUrl: "https://example.com/avatar.png",
        language: "en" as const,
        theme: "light" as const,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = userResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it("should require valid UUID for id", () => {
      const invalidResponse = {
        id: "not-a-uuid",
        email: "test@example.com",
        name: null,
        username: null,
        bio: null,
        avatarUrl: null,
        language: "en",
        theme: "system",
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = userResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });
  });

  describe("publicUserSchema", () => {
    it("should validate public user data", () => {
      const validPublic = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        username: "johndoe",
        name: "John Doe",
        bio: null,
        avatarUrl: null,
        createdAt: new Date(),
      };
      const result = publicUserSchema.safeParse(validPublic);
      expect(result.success).toBe(true);
    });
  });
});

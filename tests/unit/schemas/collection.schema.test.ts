import { describe, expect, it } from "vitest";
import {
  collectionBookmarksSchema,
  collectionResponseSchema,
  collectionShareSchema,
  createCollectionSchema,
  updateCollectionSchema,
} from "@/schemas/collection.schema";

describe("Collection Schemas", () => {
  describe("createCollectionSchema", () => {
    it("should validate valid collection creation", () => {
      const validInput = {
        name: "My Collection",
        description: "A collection of bookmarks",
        isPublic: false,
      };
      const result = createCollectionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should require name", () => {
      const invalidInput = {
        description: "No name provided",
      };
      const result = createCollectionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should have default isPublic value", () => {
      const input = {
        name: "Test Collection",
      };
      const result = createCollectionSchema.parse(input);
      expect(result.isPublic).toBe(false);
    });

    it("should enforce name max length", () => {
      const invalidInput = {
        name: "x".repeat(101),
      };
      const result = createCollectionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should enforce description max length", () => {
      const invalidInput = {
        name: "Test",
        description: "x".repeat(501),
      };
      const result = createCollectionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should validate parentId as UUID", () => {
      const invalidInput = {
        name: "Nested Collection",
        parentId: "not-a-uuid",
      };
      const result = createCollectionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should accept valid parentId", () => {
      const validInput = {
        name: "Nested Collection",
        parentId: "550e8400-e29b-41d4-a716-446655440000",
      };
      const result = createCollectionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should accept null parentId", () => {
      const validInput = {
        name: "Root Collection",
        parentId: null,
      };
      const result = createCollectionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe("updateCollectionSchema", () => {
    it("should allow partial updates", () => {
      const validInput = {
        name: "Updated Name",
      };
      const result = updateCollectionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should allow empty object", () => {
      const result = updateCollectionSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should allow updating isPublic", () => {
      const validInput = {
        isPublic: true,
      };
      const result = updateCollectionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe("collectionBookmarksSchema", () => {
    it("should validate bookmark IDs array", () => {
      const validInput = {
        bookmarkIds: [
          "550e8400-e29b-41d4-a716-446655440000",
          "550e8400-e29b-41d4-a716-446655440001",
        ],
      };
      const result = collectionBookmarksSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should require at least one bookmark ID", () => {
      const invalidInput = {
        bookmarkIds: [],
      };
      const result = collectionBookmarksSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should validate UUIDs", () => {
      const invalidInput = {
        bookmarkIds: ["not-a-uuid"],
      };
      const result = collectionBookmarksSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("collectionShareSchema", () => {
    it("should accept empty object", () => {
      const result = collectionShareSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should coerce date string", () => {
      const input = {
        expiresAt: "2025-12-31",
      };
      const result = collectionShareSchema.parse(input);
      expect(result.expiresAt).toBeInstanceOf(Date);
    });
  });

  describe("collectionResponseSchema", () => {
    it("should validate complete collection response", () => {
      const validResponse = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        userId: "550e8400-e29b-41d4-a716-446655440001",
        name: "My Collection",
        description: "A test collection",
        parentId: null,
        isPublic: false,
        shareToken: null,
        shareExpiresAt: null,
        bookmarkCount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = collectionResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it("should allow null description", () => {
      const validResponse = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        userId: "550e8400-e29b-41d4-a716-446655440001",
        name: "Minimal Collection",
        description: null,
        parentId: null,
        isPublic: false,
        shareToken: null,
        shareExpiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = collectionResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });
});

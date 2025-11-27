import { describe, expect, it } from "vitest";
import {
  bookmarkFiltersSchema,
  createBookmarkSchema,
  listBookmarksSchema,
  paginationSchema,
  updateBookmarkSchema,
} from "@/schemas/bookmark.schema";

describe("Bookmark Schemas", () => {
  describe("createBookmarkSchema", () => {
    it("should validate a valid bookmark creation", () => {
      const validInput = {
        url: "https://example.com",
        title: "Example Site",
      };
      const result = createBookmarkSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should allow URL without title (will be auto-extracted)", () => {
      const validInput = {
        url: "https://example.com",
      };
      const result = createBookmarkSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should reject invalid URLs", () => {
      const invalidInput = {
        url: "not-a-url",
      };
      const result = createBookmarkSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should reject non-http/https URLs", () => {
      const invalidInput = {
        url: "ftp://example.com",
      };
      const result = createBookmarkSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should have default values", () => {
      const input = {
        url: "https://example.com",
      };
      const result = createBookmarkSchema.parse(input);
      expect(result.isPublic).toBe(false);
      expect(result.isPinned).toBe(false);
      expect(result.tagIds).toEqual([]);
      expect(result.collectionIds).toEqual([]);
    });

    it("should validate tag IDs as UUIDs", () => {
      const invalidInput = {
        url: "https://example.com",
        tagIds: ["not-a-uuid"],
      };
      const result = createBookmarkSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should enforce description max length", () => {
      const invalidInput = {
        url: "https://example.com",
        description: "x".repeat(2001),
      };
      const result = createBookmarkSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("updateBookmarkSchema", () => {
    it("should allow partial updates", () => {
      const validInput = {
        title: "Updated Title",
      };
      const result = updateBookmarkSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should allow empty object", () => {
      const result = updateBookmarkSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should validate isArchived boolean", () => {
      const validInput = {
        isArchived: true,
      };
      const result = updateBookmarkSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });
  });

  describe("bookmarkFiltersSchema", () => {
    it("should accept empty filters", () => {
      const result = bookmarkFiltersSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should validate category ID as UUID", () => {
      const invalidInput = {
        categoryId: "not-a-uuid",
      };
      const result = bookmarkFiltersSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should coerce date strings to dates", () => {
      const input = {
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      };
      const result = bookmarkFiltersSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.startDate).toBeInstanceOf(Date);
        expect(result.data.endDate).toBeInstanceOf(Date);
      }
    });
  });

  describe("paginationSchema", () => {
    it("should have default values", () => {
      const result = paginationSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.sortBy).toBe("createdAt");
      expect(result.sortOrder).toBe("desc");
    });

    it("should coerce string numbers", () => {
      const input = {
        page: "2",
        limit: "50",
      };
      const result = paginationSchema.parse(input);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(50);
    });

    it("should enforce max limit", () => {
      const invalidInput = {
        limit: 101,
      };
      const result = paginationSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should enforce min page", () => {
      const invalidInput = {
        page: 0,
      };
      const result = paginationSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("listBookmarksSchema", () => {
    it("should merge filters and pagination", () => {
      const input = {
        categoryId: "550e8400-e29b-41d4-a716-446655440000",
        page: 2,
        limit: 10,
      };
      const result = listBookmarksSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.categoryId).toBe(
          "550e8400-e29b-41d4-a716-446655440000",
        );
        expect(result.data.page).toBe(2);
      }
    });
  });
});

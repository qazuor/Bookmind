import { describe, expect, it } from "vitest";
import {
  searchQuerySchema,
  searchSuggestionsSchema,
  semanticSearchSchema,
} from "@/schemas/search.schema";

describe("Search Schemas", () => {
  describe("searchQuerySchema", () => {
    it("should validate valid search query", () => {
      const validInput = {
        q: "javascript tutorials",
      };
      const result = searchQuerySchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should trim query", () => {
      const input = {
        q: "  javascript  ",
      };
      const result = searchQuerySchema.parse(input);
      expect(result.q).toBe("javascript");
    });

    it("should require query", () => {
      const invalidInput = {};
      const result = searchQuerySchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should reject empty query", () => {
      const invalidInput = {
        q: "",
      };
      const result = searchQuerySchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should enforce max query length", () => {
      const invalidInput = {
        q: "x".repeat(201),
      };
      const result = searchQuerySchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should have default pagination values", () => {
      const input = {
        q: "test",
      };
      const result = searchQuerySchema.parse(input);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it("should parse tagIds from comma-separated string", () => {
      const input = {
        q: "test",
        tagIds:
          "550e8400-e29b-41d4-a716-446655440000,550e8400-e29b-41d4-a716-446655440001",
      };
      const result = searchQuerySchema.parse(input);
      expect(result.tagIds).toHaveLength(2);
    });

    it("should coerce boolean values", () => {
      const input = {
        q: "test",
        isPublic: true,
        isArchived: false,
      };
      const result = searchQuerySchema.parse(input);
      expect(result.isPublic).toBe(true);
      expect(result.isArchived).toBe(false);
    });

    it("should coerce date strings", () => {
      const input = {
        q: "test",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      };
      const result = searchQuerySchema.parse(input);
      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);
    });
  });

  describe("semanticSearchSchema", () => {
    it("should validate valid semantic search", () => {
      const validInput = {
        query: "What are the best React tutorials?",
      };
      const result = semanticSearchSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should require minimum query length", () => {
      const invalidInput = {
        query: "ab",
      };
      const result = semanticSearchSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should enforce max query length", () => {
      const invalidInput = {
        query: "x".repeat(501),
      };
      const result = semanticSearchSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should have default values", () => {
      const input = {
        query: "test query",
      };
      const result = semanticSearchSchema.parse(input);
      expect(result.limit).toBe(10);
      expect(result.threshold).toBe(0.5);
    });

    it("should validate threshold range", () => {
      const invalidInputs = [
        { query: "test", threshold: -0.1 },
        { query: "test", threshold: 1.1 },
      ];
      for (const input of invalidInputs) {
        const result = semanticSearchSchema.safeParse(input);
        expect(result.success).toBe(false);
      }
    });

    it("should accept valid threshold", () => {
      const validInputs = [
        { query: "test", threshold: 0 },
        { query: "test", threshold: 0.5 },
        { query: "test", threshold: 1 },
      ];
      for (const input of validInputs) {
        const result = semanticSearchSchema.safeParse(input);
        expect(result.success).toBe(true);
      }
    });
  });

  describe("searchSuggestionsSchema", () => {
    it("should validate suggestions query", () => {
      const validInput = {
        query: "java",
      };
      const result = searchSuggestionsSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should have default limit", () => {
      const input = {
        query: "test",
      };
      const result = searchSuggestionsSchema.parse(input);
      expect(result.limit).toBe(5);
    });

    it("should enforce max limit", () => {
      const invalidInput = {
        query: "test",
        limit: 11,
      };
      const result = searchSuggestionsSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });
});

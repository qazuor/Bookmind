import { describe, expect, it } from "vitest";
import {
  createTagSchema,
  tagAutocompleteSchema,
  tagResponseSchema,
  updateTagSchema,
} from "@/schemas/tag.schema";

describe("Tag Schemas", () => {
  describe("createTagSchema", () => {
    it("should validate valid tag creation", () => {
      const validInput = {
        name: "javascript",
        color: "#f7df1e",
      };
      const result = createTagSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should transform name to lowercase", () => {
      const input = {
        name: "JavaScript",
      };
      const result = createTagSchema.parse(input);
      expect(result.name).toBe("javascript");
    });

    it("should trim whitespace", () => {
      const input = {
        name: "  react  ",
      };
      const result = createTagSchema.parse(input);
      expect(result.name).toBe("react");
    });

    it("should require name", () => {
      const invalidInput = {
        color: "#ff0000",
      };
      const result = createTagSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should enforce name max length", () => {
      const invalidInput = {
        name: "x".repeat(31),
      };
      const result = createTagSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should reject special characters", () => {
      const invalidNames = ["tag@name", "tag#name", "tag!name", "tag.name"];
      for (const name of invalidNames) {
        const result = createTagSchema.safeParse({ name });
        expect(result.success).toBe(false);
      }
    });

    it("should allow hyphens and underscores", () => {
      const validNames = ["my-tag", "my_tag", "my-tag_name"];
      for (const name of validNames) {
        const result = createTagSchema.safeParse({ name });
        expect(result.success).toBe(true);
      }
    });

    it("should allow spaces", () => {
      const input = { name: "my tag" };
      const result = createTagSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("updateTagSchema", () => {
    it("should allow partial updates", () => {
      const validInput = {
        color: "#00ff00",
      };
      const result = updateTagSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should transform name if provided", () => {
      const input = {
        name: "  UPDATED  ",
      };
      const result = updateTagSchema.parse(input);
      expect(result.name).toBe("updated");
    });
  });

  describe("tagAutocompleteSchema", () => {
    it("should validate autocomplete query", () => {
      const validInput = {
        query: "java",
      };
      const result = tagAutocompleteSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should have default limit", () => {
      const input = {
        query: "test",
      };
      const result = tagAutocompleteSchema.parse(input);
      expect(result.limit).toBe(10);
    });

    it("should enforce max limit", () => {
      const invalidInput = {
        query: "test",
        limit: 25,
      };
      const result = tagAutocompleteSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should require query", () => {
      const invalidInput = {};
      const result = tagAutocompleteSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("tagResponseSchema", () => {
    it("should validate complete tag response", () => {
      const validResponse = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        userId: "550e8400-e29b-41d4-a716-446655440001",
        name: "typescript",
        color: "#3178c6",
        bookmarkCount: 15,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = tagResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it("should allow null color", () => {
      const validResponse = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        userId: "550e8400-e29b-41d4-a716-446655440001",
        name: "generic",
        color: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = tagResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });
});

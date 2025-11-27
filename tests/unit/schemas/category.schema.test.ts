import { describe, expect, it } from "vitest";
import {
  categoryResponseSchema,
  createCategorySchema,
  defaultCategories,
  updateCategorySchema,
} from "@/schemas/category.schema";

describe("Category Schemas", () => {
  describe("createCategorySchema", () => {
    it("should validate valid category creation", () => {
      const validInput = {
        name: "Development",
        color: "#3b82f6",
        icon: "code",
      };
      const result = createCategorySchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should have default color", () => {
      const input = {
        name: "Test Category",
      };
      const result = createCategorySchema.parse(input);
      expect(result.color).toBe("#6366f1");
    });

    it("should require name", () => {
      const invalidInput = {
        color: "#ff0000",
      };
      const result = createCategorySchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should enforce name max length", () => {
      const invalidInput = {
        name: "x".repeat(51),
      };
      const result = createCategorySchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should validate hex color format", () => {
      const invalidColors = ["red", "#fff", "123456", "#gggggg"];
      for (const color of invalidColors) {
        const input = { name: "Test", color };
        const result = createCategorySchema.safeParse(input);
        expect(result.success).toBe(false);
      }
    });

    it("should accept valid hex colors", () => {
      const validColors = ["#000000", "#FFFFFF", "#3b82f6", "#FF5733"];
      for (const color of validColors) {
        const input = { name: "Test", color };
        const result = createCategorySchema.safeParse(input);
        expect(result.success).toBe(true);
      }
    });
  });

  describe("updateCategorySchema", () => {
    it("should allow partial updates", () => {
      const validInput = {
        name: "Updated Name",
      };
      const result = updateCategorySchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should allow empty object", () => {
      const result = updateCategorySchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe("categoryResponseSchema", () => {
    it("should validate complete category response", () => {
      const validResponse = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        userId: "550e8400-e29b-41d4-a716-446655440001",
        name: "Technology",
        color: "#3b82f6",
        icon: "cpu",
        description: "Tech stuff",
        isDefault: true,
        bookmarkCount: 42,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = categoryResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });

  describe("defaultCategories", () => {
    it("should have expected default categories", () => {
      expect(defaultCategories).toHaveLength(7);
      expect(defaultCategories.map((c) => c.name)).toContain("Technology");
      expect(defaultCategories.map((c) => c.name)).toContain("Other");
    });

    it("should have valid colors for all defaults", () => {
      const colorRegex = /^#[0-9A-Fa-f]{6}$/;
      for (const category of defaultCategories) {
        expect(category.color).toMatch(colorRegex);
      }
    });
  });
});

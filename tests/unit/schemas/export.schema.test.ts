import { describe, expect, it } from "vitest";
import {
  exportFormatSchema,
  exportOptionsSchema,
  importOptionsSchema,
} from "@/schemas/export.schema";

describe("Export Schemas", () => {
  describe("exportFormatSchema", () => {
    it("should accept valid formats", () => {
      const validFormats = ["html", "json", "csv"];
      for (const format of validFormats) {
        const result = exportFormatSchema.safeParse(format);
        expect(result.success).toBe(true);
      }
    });

    it("should reject invalid formats", () => {
      const invalidFormats = ["pdf", "xml", "txt"];
      for (const format of invalidFormats) {
        const result = exportFormatSchema.safeParse(format);
        expect(result.success).toBe(false);
      }
    });
  });

  describe("exportOptionsSchema", () => {
    it("should validate valid export options", () => {
      const validInput = {
        format: "json" as const,
        includeNotes: true,
        includeAiSummary: true,
      };
      const result = exportOptionsSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should require format", () => {
      const invalidInput = {
        includeNotes: true,
      };
      const result = exportOptionsSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should have default values", () => {
      const input = {
        format: "html" as const,
      };
      const result = exportOptionsSchema.parse(input);
      expect(result.includeNotes).toBe(true);
      expect(result.includeAiSummary).toBe(true);
      expect(result.includeTags).toBe(true);
      expect(result.includeCollections).toBe(false);
    });

    it("should validate filter UUIDs", () => {
      const invalidInput = {
        format: "json" as const,
        categoryId: "not-a-uuid",
      };
      const result = exportOptionsSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should coerce date strings", () => {
      const input = {
        format: "json" as const,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      };
      const result = exportOptionsSchema.parse(input);
      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);
    });
  });

  describe("importOptionsSchema", () => {
    it("should validate import options with content", () => {
      const validInput = {
        content: "<html>...</html>",
        duplicateHandling: "skip" as const,
      };
      const result = importOptionsSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should have default values", () => {
      const input = {
        content: "test",
      };
      const result = importOptionsSchema.parse(input);
      expect(result.duplicateHandling).toBe("skip");
      expect(result.importTags).toBe(true);
      expect(result.importFolders).toBe(true);
    });

    it("should validate duplicateHandling enum", () => {
      const validOptions = ["skip", "update", "create"];
      for (const option of validOptions) {
        const input = {
          content: "test",
          duplicateHandling: option,
        };
        const result = importOptionsSchema.safeParse(input);
        expect(result.success).toBe(true);
      }
    });

    it("should reject invalid duplicateHandling", () => {
      const invalidInput = {
        content: "test",
        duplicateHandling: "invalid",
      };
      const result = importOptionsSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should validate defaultCategoryId as UUID", () => {
      const invalidInput = {
        content: "test",
        defaultCategoryId: "not-a-uuid",
      };
      const result = importOptionsSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });
});

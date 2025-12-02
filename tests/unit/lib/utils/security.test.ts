/**
 * Security Utilities Tests (P10-002)
 *
 * Tests for URL sanitization, HTML escaping, and XSS prevention.
 */

import { describe, expect, it } from "vitest";
import {
  escapeAttribute,
  escapeHtml,
  extractDomain,
  isUrlSafe,
  isValidDomain,
  sanitizeHref,
  sanitizeInput,
  sanitizeUrl,
  stripHtml,
} from "@/lib/utils/security";

describe("Security Utilities", () => {
  describe("isUrlSafe", () => {
    it("should return true for valid HTTP URLs", () => {
      expect(isUrlSafe("http://example.com")).toBe(true);
      expect(isUrlSafe("https://example.com")).toBe(true);
      expect(isUrlSafe("https://example.com/path?query=1")).toBe(true);
    });

    it("should return false for mailto URLs (only http/https allowed)", () => {
      expect(isUrlSafe("mailto:test@example.com")).toBe(false);
    });

    it("should return false for javascript URLs", () => {
      expect(isUrlSafe("javascript:alert(1)")).toBe(false);
      expect(isUrlSafe("JAVASCRIPT:alert(1)")).toBe(false);
      expect(isUrlSafe("  javascript:void(0)  ")).toBe(false);
    });

    it("should return false for data URLs", () => {
      expect(isUrlSafe("data:text/html,<script>alert(1)</script>")).toBe(false);
    });

    it("should return false for vbscript URLs", () => {
      expect(isUrlSafe("vbscript:msgbox(1)")).toBe(false);
    });

    it("should return false for file URLs", () => {
      expect(isUrlSafe("file:///etc/passwd")).toBe(false);
    });

    it("should return false for empty or invalid input", () => {
      expect(isUrlSafe("")).toBe(false);
      expect(isUrlSafe("   ")).toBe(false);
      // @ts-expect-error Testing invalid input
      expect(isUrlSafe(null)).toBe(false);
      // @ts-expect-error Testing invalid input
      expect(isUrlSafe(undefined)).toBe(false);
    });

    it("should handle relative URLs safely", () => {
      expect(isUrlSafe("/path/to/page")).toBe(true);
      expect(isUrlSafe("./relative")).toBe(true);
    });
  });

  describe("sanitizeUrl", () => {
    it("should return normalized URL for valid URLs", () => {
      expect(sanitizeUrl("https://example.com/path")).toBe(
        "https://example.com/path",
      );
      expect(sanitizeUrl("  https://example.com  ")).toBe(
        "https://example.com/",
      );
    });

    it("should return null for unsafe URLs", () => {
      expect(sanitizeUrl("javascript:alert(1)")).toBeNull();
      expect(sanitizeUrl("data:text/html,test")).toBeNull();
    });

    it("should preserve query strings and hashes", () => {
      const url = "https://example.com/path?q=test#section";
      expect(sanitizeUrl(url)).toBe(url);
    });

    it("should return trimmed relative URLs", () => {
      expect(sanitizeUrl("  /path/to/page  ")).toBe("/path/to/page");
    });
  });

  describe("sanitizeHref", () => {
    it("should return safe URL unchanged", () => {
      expect(sanitizeHref("https://example.com")).toBe("https://example.com/");
    });

    it("should return # for unsafe URLs", () => {
      expect(sanitizeHref("javascript:alert(1)")).toBe("#");
      expect(sanitizeHref("data:text/html,test")).toBe("#");
    });

    it("should return # for empty input", () => {
      expect(sanitizeHref("")).toBe("#");
    });
  });

  describe("escapeHtml", () => {
    it("should escape HTML special characters", () => {
      expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
      expect(escapeHtml('a & b "c"')).toBe("a &amp; b &quot;c&quot;");
      expect(escapeHtml("'test'")).toBe("&#x27;test&#x27;");
    });

    it("should escape forward slashes", () => {
      expect(escapeHtml("</script>")).toBe("&lt;&#x2F;script&gt;");
    });

    it("should escape backticks and equals", () => {
      expect(escapeHtml("`=")).toBe("&#x60;&#x3D;");
    });

    it("should return empty string for invalid input", () => {
      expect(escapeHtml("")).toBe("");
      // @ts-expect-error Testing invalid input
      expect(escapeHtml(null)).toBe("");
      // @ts-expect-error Testing invalid input
      expect(escapeHtml(undefined)).toBe("");
    });

    it("should not modify safe strings", () => {
      expect(escapeHtml("Hello World")).toBe("Hello World");
      expect(escapeHtml("123")).toBe("123");
    });
  });

  describe("escapeAttribute", () => {
    it("should escape HTML and newlines", () => {
      expect(escapeAttribute("<test\nvalue>")).toBe("&lt;test&#10;value&gt;");
      expect(escapeAttribute("line1\r\nline2")).toBe("line1&#13;&#10;line2");
    });
  });

  describe("stripHtml", () => {
    it("should remove HTML tags", () => {
      expect(stripHtml("<p>Hello</p>")).toBe("Hello");
      expect(stripHtml("<b>Bold</b> and <i>italic</i>")).toBe(
        "Bold and italic",
      );
    });

    it("should convert HTML entities", () => {
      expect(stripHtml("&nbsp;test&amp;")).toBe(" test&");
      expect(stripHtml("&lt;not a tag&gt;")).toBe("<not a tag>");
    });

    it("should handle empty input", () => {
      expect(stripHtml("")).toBe("");
      // @ts-expect-error Testing invalid input
      expect(stripHtml(null)).toBe("");
    });

    it("should handle nested tags", () => {
      expect(stripHtml("<div><span>Nested</span></div>")).toBe("Nested");
    });
  });

  describe("sanitizeInput", () => {
    it("should escape HTML and trim whitespace", () => {
      expect(sanitizeInput("  <script>  ")).toBe("&lt;script&gt;");
    });

    it("should respect maxLength parameter", () => {
      expect(sanitizeInput("Hello World", 5)).toBe("Hello");
    });

    it("should handle empty input", () => {
      expect(sanitizeInput("")).toBe("");
      // @ts-expect-error Testing invalid input
      expect(sanitizeInput(null)).toBe("");
    });
  });

  describe("isValidDomain", () => {
    it("should return true for valid domains", () => {
      expect(isValidDomain("example.com")).toBe(true);
      expect(isValidDomain("sub.example.com")).toBe(true);
      expect(isValidDomain("a.b.c.example.com")).toBe(true);
    });

    it("should return false for invalid domains", () => {
      expect(isValidDomain("")).toBe(false);
      expect(isValidDomain("-invalid.com")).toBe(false);
      expect(isValidDomain("invalid-.com")).toBe(false);
      // @ts-expect-error Testing invalid input
      expect(isValidDomain(null)).toBe(false);
    });
  });

  describe("extractDomain", () => {
    it("should extract domain from valid URLs", () => {
      expect(extractDomain("https://example.com/path")).toBe("example.com");
      expect(extractDomain("http://sub.domain.com:8080/")).toBe(
        "sub.domain.com",
      );
    });

    it("should return null for invalid URLs", () => {
      expect(extractDomain("javascript:alert(1)")).toBeNull();
      expect(extractDomain("not-a-url")).toBeNull();
    });
  });
});

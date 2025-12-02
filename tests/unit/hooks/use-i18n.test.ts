/**
 * useI18n Hook Tests (P10-003)
 *
 * Tests for internationalization hook.
 */

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useI18n } from "@/hooks/use-i18n";

// Mock i18next
const mockChangeLanguage = vi.fn();
const mockT = vi.fn((key: string) => key);

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
    i18n: {
      language: "en",
      changeLanguage: mockChangeLanguage,
    },
    ready: true,
  }),
}));

// Mock i18n config
vi.mock("@/lib/i18n", () => ({
  DEFAULT_LANGUAGE: "en",
  SUPPORTED_LANGUAGES: ["en", "es"],
  LANGUAGE_NAMES: {
    en: "English",
    es: "Español",
  },
  LANGUAGE_FLAGS: {
    en: "🇺🇸",
    es: "🇪🇸",
  },
}));

describe("useI18n", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChangeLanguage.mockResolvedValue(undefined);
  });

  it("should return current language", () => {
    const { result } = renderHook(() => useI18n());

    expect(result.current.language).toBe("en");
  });

  it("should return translation function", () => {
    const { result } = renderHook(() => useI18n());

    const translated = result.current.t("test.key");

    expect(mockT).toHaveBeenCalledWith("test.key");
    expect(translated).toBe("test.key");
  });

  it("should pass options to translation function", () => {
    const { result } = renderHook(() => useI18n());

    result.current.t("test.key", { count: 5 });

    expect(mockT).toHaveBeenCalledWith("test.key", { count: 5 });
  });

  it("should change language", async () => {
    const { result } = renderHook(() => useI18n());

    await act(async () => {
      await result.current.changeLanguage("es");
    });

    expect(mockChangeLanguage).toHaveBeenCalledWith("es");
  });

  it("should not change to unsupported language", async () => {
    const { result } = renderHook(() => useI18n());

    await act(async () => {
      await result.current.changeLanguage("fr" as "en" | "es");
    });

    expect(mockChangeLanguage).not.toHaveBeenCalled();
  });

  it("should toggle language", async () => {
    const { result } = renderHook(() => useI18n());

    await act(async () => {
      await result.current.toggleLanguage();
    });

    // Current is 'en' (index 0), next should be 'es' (index 1)
    expect(mockChangeLanguage).toHaveBeenCalledWith("es");
  });

  it("should check if language is supported", () => {
    const { result } = renderHook(() => useI18n());

    expect(result.current.isSupported("en")).toBe(true);
    expect(result.current.isSupported("es")).toBe(true);
    expect(result.current.isSupported("fr")).toBe(false);
    expect(result.current.isSupported("de")).toBe(false);
  });

  it("should return list of languages with metadata", () => {
    const { result } = renderHook(() => useI18n());

    expect(result.current.languages).toEqual([
      { code: "en", name: "English", flag: "🇺🇸", isActive: true },
      { code: "es", name: "Español", flag: "🇪🇸", isActive: false },
    ]);
  });

  it("should return isReady status", () => {
    const { result } = renderHook(() => useI18n());

    expect(result.current.isReady).toBe(true);
  });
});

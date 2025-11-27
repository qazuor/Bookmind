/**
 * useTheme Hook (P5-022)
 *
 * Theme management hook that integrates with UI store and system preferences.
 */

import { useCallback, useEffect } from "react";
import { type Theme, useUIStore } from "@/stores";

/**
 * Get resolved theme (handles 'system' preference)
 */
function getResolvedTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  }
  return theme;
}

/**
 * Apply theme to document
 */
function applyTheme(resolvedTheme: "light" | "dark") {
  if (typeof document !== "undefined") {
    const root = document.documentElement;

    if (resolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }
}

/**
 * Hook for theme management
 */
export function useTheme() {
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);

  // Get resolved theme (light or dark)
  const resolvedTheme = getResolvedTheme(theme);

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  // Listen for system theme changes when in 'system' mode
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      applyTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [theme]);

  /**
   * Toggle between light and dark (skipping system)
   */
  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);

  /**
   * Cycle through all theme options
   */
  const cycleTheme = useCallback(() => {
    const themes: Theme[] = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    if (nextTheme) {
      setTheme(nextTheme);
    }
  }, [theme, setTheme]);

  return {
    /** Current theme setting (light, dark, or system) */
    theme,
    /** Resolved theme (always light or dark) */
    resolvedTheme,
    /** Is dark mode active */
    isDark: resolvedTheme === "dark",
    /** Is light mode active */
    isLight: resolvedTheme === "light",
    /** Is using system preference */
    isSystem: theme === "system",
    /** Set theme */
    setTheme,
    /** Toggle between light and dark */
    toggleTheme,
    /** Cycle through all theme options */
    cycleTheme,
  };
}

/**
 * ThemeProvider Component (P6-006)
 *
 * Provides theme context and applies theme to document.
 * Supports light, dark, and system themes.
 */

import { useEffect } from "react";
import { type Theme, useUIStore } from "@/stores/ui-store";

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Get the effective theme based on system preference
 */
function getEffectiveTheme(theme: Theme): "light" | "dark" {
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
 * Apply theme to document element
 */
function applyTheme(theme: "light" | "dark") {
  const root = window.document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useUIStore((state) => state.theme);

  useEffect(() => {
    // Apply initial theme
    const effectiveTheme = getEffectiveTheme(theme);
    applyTheme(effectiveTheme);

    // Listen for system theme changes if using system preference
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? "dark" : "light");
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  return <>{children}</>;
}

/**
 * Hook to get the current effective theme
 */
export function useEffectiveTheme(): "light" | "dark" {
  const theme = useUIStore((state) => state.theme);
  return getEffectiveTheme(theme);
}

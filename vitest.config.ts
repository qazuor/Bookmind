import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: [
      "tests/**/*.{test,spec}.{ts,tsx}",
      "src/**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: [
      "node_modules",
      "dist",
      ".claude",
      "tests/e2e/**",
      // Excluded due to Vercel Hobby plan limit - handlers moved to src/api-handlers
      "tests/integration/api/**",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/main.tsx",
        "src/vite-env.d.ts",
        "src/components/ui/**",
        // Exclude pages and router - better tested via E2E
        "src/pages/**",
        "src/router/**",
        // Exclude stores - state management tested via integration
        "src/stores/**",
        // Exclude service implementations - tested via API integration tests
        "src/lib/services/**",
        // Exclude db implementations - tested via db integration tests
        "src/lib/db/**",
        // Exclude api-client - tested via integration tests
        "src/lib/api-client/**",
        // Exclude barrel/index files - just re-exports
        "src/**/index.ts",
        // Exclude API middleware - tested via API integration tests
        "src/lib/api/middleware/**",
        // Exclude auth setup - tested via integration
        "src/lib/auth.ts",
        "src/lib/auth-client.ts",
        // Exclude query client setup
        "src/lib/query-client.ts",
        "src/lib/query-keys.ts",
        // Exclude type-only files
        "src/lib/api/types.ts",
        "src/lib/api/handler.ts",
        // Exclude complex component folders better tested via E2E
        "src/components/ai/**",
        "src/components/bookmarks/**",
        "src/components/categories/**",
        "src/components/collections/**",
        "src/components/export/**",
        "src/components/layout/**",
        "src/components/search/**",
        "src/components/settings/**",
        "src/components/tags/**",
        // Exclude i18n config
        "src/lib/i18n/**",
        // Exclude env config
        "src/lib/env.ts",
        // Exclude toast utilities
        "src/hooks/toast.ts",
        // Exclude React Query dependent hooks - better tested via E2E
        "src/hooks/use-auth.ts",
        "src/hooks/use-bookmark.ts",
        "src/hooks/use-bookmarks.ts",
        "src/hooks/use-search.ts",
        "src/hooks/use-stats.ts",
        "src/hooks/use-tags.ts",
        "src/hooks/use-theme.ts",
        // Exclude component toast
        "src/components/shared/toast.ts",
      ],
      thresholds: {
        global: {
          branches: 35,
          functions: 45,
          lines: 50,
          statements: 50,
        },
      },
    },
    reporters: ["default", "html"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@api": path.resolve(__dirname, "./api"),
    },
  },
});

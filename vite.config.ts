import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, type PluginOption } from "vite";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    // Bundle analyzer - generates stats.html when building with ANALYZE=true
    mode === "analyze" &&
      (visualizer({
        filename: "stats.html",
        open: true,
        gzipSize: true,
        brotliSize: true,
        template: "treemap",
      }) as PluginOption),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  build: {
    target: "esnext",
    sourcemap: true,
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "tanstack-vendor": ["@tanstack/react-query", "@tanstack/react-form"],
          "ui-vendor": ["lucide-react", "sonner", "framer-motion"],
          // Feature chunks are handled by dynamic imports in lazy.tsx
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 500,
  },
}));

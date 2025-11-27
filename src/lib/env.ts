import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

// biome-ignore lint/style/useNamingConvention: Environment variables use SCREAMING_SNAKE_CASE by convention
export const env = createEnv({
  server: {
    // Database
    DATABASE_URL: z.string().url().startsWith("postgres"),

    // Auth
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
    GITHUB_CLIENT_ID: z.string().min(1).optional(),
    GITHUB_CLIENT_SECRET: z.string().min(1).optional(),

    // AI
    GROQ_API_KEY: z.string().startsWith("gsk_"),

    // Rate Limiting
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

    // Environment
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  clientPrefix: "VITE_",
  client: {
    VITE_APP_URL: z.string().url(),
    VITE_API_URL: z.string().url(),
  },
  runtimeEnv: {
    // Server
    DATABASE_URL: import.meta.env.DATABASE_URL,
    BETTER_AUTH_SECRET: import.meta.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: import.meta.env.BETTER_AUTH_URL,
    GOOGLE_CLIENT_ID: import.meta.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: import.meta.env.GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID: import.meta.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: import.meta.env.GITHUB_CLIENT_SECRET,
    GROQ_API_KEY: import.meta.env.GROQ_API_KEY,
    UPSTASH_REDIS_REST_URL: import.meta.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: import.meta.env.UPSTASH_REDIS_REST_TOKEN,
    NODE_ENV: import.meta.env.MODE,
    // Client
    VITE_APP_URL: import.meta.env.VITE_APP_URL,
    VITE_API_URL: import.meta.env.VITE_API_URL,
  },
  skipValidation: import.meta.env.MODE === "test",
  emptyStringAsUndefined: true,
});

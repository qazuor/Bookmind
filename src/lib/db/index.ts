import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL ?? "";

// Detect if we're using Neon (has sslmode=require or neon.tech in URL)
const isNeon =
  databaseUrl.includes("neon.tech") || databaseUrl.includes("sslmode=require");

/**
 * Database client that supports both:
 * - Local development: postgres.js driver
 * - Production (Neon): @neondatabase/serverless driver
 */
export const db = isNeon
  ? drizzleNeon(neon(databaseUrl), { schema })
  : drizzlePostgres(postgres(databaseUrl), { schema });

export type Database = typeof db;

// Re-export schema for convenience
export * from "./schema";

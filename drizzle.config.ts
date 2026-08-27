import type { Config } from "drizzle-kit";
// Use a relative path so the drizzle CLI can resolve it
import { env } from "./lib/env.mjs";

export default {
    schema: "./lib/db/schema/**/*.ts",   // <- glob to actual .ts schema files
    dialect: "postgresql",
    out: "./lib/db/migrations",
    dbCredentials: {
        url: env.DATABASE_URL,             // must be set in your .env
        // If your DATABASE_URL doesn't include sslmode=require (e.g. Neon), add it there.
        // Example: postgres://user:pass@host/db?sslmode=require
    },
} satisfies Config;
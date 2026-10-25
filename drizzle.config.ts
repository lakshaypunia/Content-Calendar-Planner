import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// override: project files beat any DATABASE_URL left in the OS environment.
config({ path: [".env.local", ".env"], quiet: true, override: true });

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
  strict: true,
});

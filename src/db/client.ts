import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type Db = NeonHttpDatabase<typeof schema>;

let instance: Db | undefined;

/**
 * Created on first use so builds, tests and template-only dev runs work
 * without DATABASE_URL; neon() throws on an empty connection string.
 */
export function getDb(): Db {
  if (!instance) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    instance = drizzle({ client: neon(url), schema });
  }
  return instance;
}

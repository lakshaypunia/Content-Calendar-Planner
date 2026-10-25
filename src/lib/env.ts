import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseEnv } from "node:util";

const FILES = [".env.development.local", ".env.local", ".env.development", ".env"];

/**
 * In `next dev`, settings come only from the project's .env files, so a
 * variable left in the OS or shell environment (e.g. an old GEMINI_API_KEY)
 * never leaks into local runs. Next.js itself lets process.env win, hence
 * reading the files directly. In production (Vercel injects env vars into
 * process.env, no files) and in tests (which stub process.env) process.env
 * is used.
 */
export function serverEnv(name: string): string | undefined {
  if (process.env.NODE_ENV !== "development") return process.env[name];
  for (const file of FILES) {
    let contents: string;
    try {
      contents = readFileSync(join(process.cwd(), file), "utf8");
    } catch {
      continue;
    }
    const value = parseEnv(contents)[name];
    if (value !== undefined) return value;
  }
  return undefined;
}

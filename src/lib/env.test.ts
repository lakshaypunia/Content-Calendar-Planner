import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { serverEnv } from "./env";

describe("serverEnv", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "env-"));
    vi.spyOn(process, "cwd").mockReturnValue(dir);
    vi.stubEnv("GEMINI_API_KEY", "from-os");
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    rmSync(dir, { recursive: true, force: true });
  });

  it("in development ignores OS variables and reads only .env files", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(serverEnv("GEMINI_API_KEY")).toBeUndefined();
    writeFileSync(join(dir, ".env"), "GEMINI_API_KEY=from-env\n");
    expect(serverEnv("GEMINI_API_KEY")).toBe("from-env");
    writeFileSync(join(dir, ".env.local"), "GEMINI_API_KEY=from-local\n");
    expect(serverEnv("GEMINI_API_KEY")).toBe("from-local");
  });

  it("in production reads process.env", () => {
    vi.stubEnv("NODE_ENV", "production");
    writeFileSync(join(dir, ".env.local"), "GEMINI_API_KEY=from-local\n");
    expect(serverEnv("GEMINI_API_KEY")).toBe("from-os");
  });
});

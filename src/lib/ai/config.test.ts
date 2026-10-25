import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { aiConfig } from "./config";

const account = { type: "service_account", project_id: "proj-1", client_email: "sa@proj-1.iam", private_key: "KEY" };

describe("aiConfig", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "ai-"));
    for (const k of ["GEMINI_API_KEY", "GOOGLE_CREDENTIALS_JSON", "GOOGLE_APPLICATION_CREDENTIALS", "GEMINI_MODEL"]) {
      vi.stubEnv(k, "");
    }
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    rmSync(dir, { recursive: true, force: true });
  });

  it("is unavailable with nothing configured", () => {
    expect(aiConfig()).toMatchObject({ available: false, mode: null, model: "gemini-3.5-flash-lite" });
  });

  it("prefers a Gemini API key", () => {
    vi.stubEnv("GEMINI_API_KEY", "k");
    vi.stubEnv("GOOGLE_CREDENTIALS_JSON", JSON.stringify(account));
    expect(aiConfig()).toMatchObject({ available: true, mode: "api-key", clientOptions: { apiKey: "k" } });
  });

  it("uses Vertex AI with service account JSON from env", () => {
    vi.stubEnv("GOOGLE_CREDENTIALS_JSON", JSON.stringify(account));
    const cfg = aiConfig();
    expect(cfg).toMatchObject({ available: true, mode: "vertex" });
    expect(cfg.clientOptions).toMatchObject({ vertexai: true, project: "proj-1", location: "global" });
  });

  it("reads the service account from a file path", () => {
    writeFileSync(join(dir, "sa.json"), JSON.stringify(account));
    vi.stubEnv("GOOGLE_APPLICATION_CREDENTIALS", join(dir, "sa.json"));
    expect(aiConfig().mode).toBe("vertex");
  });

  it("ignores malformed credentials", () => {
    vi.stubEnv("GOOGLE_CREDENTIALS_JSON", "{not json");
    expect(aiConfig().available).toBe(false);
    vi.stubEnv("GOOGLE_CREDENTIALS_JSON", JSON.stringify({ project_id: "x" }));
    expect(aiConfig().available).toBe(false);
  });
});

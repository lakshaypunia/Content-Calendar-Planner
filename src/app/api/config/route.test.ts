import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/server", () => ({ connection: vi.fn(async () => {}) }));

const { GET } = await import("./route");

describe("GET /api/config", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("reports AI unavailable without a key", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    expect(await (await GET()).json()).toEqual({ aiAvailable: false });
  });

  it("reports AI available with a key", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    expect(await (await GET()).json()).toEqual({ aiAvailable: true });
  });
});

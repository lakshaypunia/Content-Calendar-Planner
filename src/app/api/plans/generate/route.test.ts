import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetRateLimits } from "@/lib/rate-limit";
import { POST } from "./route";

const today = new Date().toISOString().slice(0, 10);
const brief = {
  brand: "Chai Point",
  niche: "Tea cafés",
  audience: "Office workers",
  goal: "leads",
  postsPerWeek: 3,
  startDate: today,
  platforms: ["instagram", "linkedin"],
  useAi: false,
};

function post(body: unknown, ip = "1.1.1.1") {
  return POST(
    new Request("http://test/api/plans/generate", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": `${ip}, 10.0.0.1` },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

describe("POST /api/plans/generate", () => {
  it("returns a 13-post template plan for 3 per week", async () => {
    const res = await post(brief);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.posts).toHaveLength(13);
    expect(json.meta).toEqual({ source: "template", warnings: [] });
    expect(json.posts[0]).toMatchObject({ position: 0, date: today, platform: "instagram", source: "template" });
  });

  it("returns field errors for an invalid brief", async () => {
    const res = await post({ ...brief, brand: "", startDate: "2026-02-30", platforms: [] });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("validation_error");
    expect(Object.keys(json.error.fields)).toEqual(expect.arrayContaining(["brand", "startDate", "platforms"]));
  });

  it("rejects malformed JSON", async () => {
    const res = await post("{nope");
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("bad_json");
  });
});

describe("rate limit", () => {
  beforeEach(() => {
    resetRateLimits();
    vi.stubEnv("RATE_LIMIT_PER_MIN", "2");
    vi.stubEnv("GEMINI_API_KEY", "");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("limits AI requests per IP with a 429 and Retry-After", async () => {
    const ai = { ...brief, useAi: true };
    expect((await post(ai)).status).toBe(200);
    expect((await post(ai)).status).toBe(200);
    const limited = await post(ai);
    expect(limited.status).toBe(429);
    expect(limited.headers.get("retry-after")).toMatch(/^\d+$/);
    expect((await limited.json()).error.code).toBe("rate_limited");
    expect((await post(ai, "2.2.2.2")).status).toBe(200);
  });

  it("does not limit template-only requests", async () => {
    for (let i = 0; i < 5; i++) expect((await post(brief)).status).toBe(200);
  });
});

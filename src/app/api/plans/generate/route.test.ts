import { describe, expect, it } from "vitest";
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

function post(body: unknown) {
  return POST(
    new Request("http://test/api/plans/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
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

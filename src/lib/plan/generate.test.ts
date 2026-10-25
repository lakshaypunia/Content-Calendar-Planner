import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PlanInput } from "@/lib/validation";

const requestGemini = vi.fn();
vi.mock("@/lib/ai/gemini", () => ({ requestGemini }));

const { generatePlan, mergeAiItems, WARN_NOT_CONFIGURED, WARN_UNAVAILABLE } = await import("./generate");
const { buildSchedule } = await import("@/lib/generator/schedule");

const input: PlanInput = {
  brand: "Chai Point",
  niche: "Tea cafés",
  audience: "Office workers",
  goal: "leads",
  postsPerWeek: 3,
  startDate: "2026-11-01",
  platforms: ["instagram", "linkedin"],
  useAi: true,
};
const slots = buildSchedule(input);
const aiItems = slots.map((s) => ({ position: s.position, topic: `AI topic ${s.position}`, videoIdea: `AI idea ${s.position}` }));

describe("generatePlan decision path", () => {
  beforeEach(() => {
    requestGemini.mockReset();
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("AI off: templates, no Gemini call", async () => {
    const result = await generatePlan({ ...input, useAi: false });
    expect(result.meta).toEqual({ source: "template", warnings: [] });
    expect(requestGemini).not.toHaveBeenCalled();
    expect(result.posts.every((p) => p.source === "template")).toBe(true);
  });

  it("AI on without a key: templates with a warning", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const result = await generatePlan(input);
    expect(result.meta).toEqual({ source: "template", warnings: [WARN_NOT_CONFIGURED] });
    expect(requestGemini).not.toHaveBeenCalled();
  });

  it("AI success: every slot written by AI", async () => {
    requestGemini.mockResolvedValue(aiItems);
    const result = await generatePlan(input);
    expect(result.meta).toEqual({ source: "ai", warnings: [] });
    expect(result.posts[3]).toMatchObject({ topic: "AI topic 3", videoIdea: "AI idea 3", source: "ai" });
    expect(result.posts).toHaveLength(slots.length);
  });

  it("AI failure: templates for all with a warning, error logged without details", async () => {
    requestGemini.mockRejectedValue(new Error("Gemini timed out after 20000ms"));
    const result = await generatePlan(input);
    expect(result.meta).toEqual({ source: "template", warnings: [WARN_UNAVAILABLE] });
    expect(result.posts).toHaveLength(slots.length);
    expect(console.error).toHaveBeenCalledOnce();
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain("test-key");
  });
});

describe("mergeAiItems", () => {
  it("keeps valid items and fills missing, duplicated and empty ones with templates", () => {
    const items = [
      ...aiItems.filter((i) => ![1, 2, 3].includes(i.position)), // 1, 2 and 3 missing
      { position: 2, topic: "dup a", videoIdea: "x" },
      { position: 2, topic: "dup b", videoIdea: "y" }, // 2 duplicated
      { position: 3, topic: "  ", videoIdea: "x" }, // 3 empty
      { position: 99, topic: "ghost", videoIdea: "x" }, // unknown position
    ];
    const result = mergeAiItems(slots, input, items);
    expect(result.meta.source).toBe("mixed");
    expect(result.meta.warnings[0]).toMatch(/skipped 3 of 13/);
    expect(result.posts.map((p) => p.source).slice(0, 5)).toEqual(["ai", "template", "template", "template", "ai"]);
    expect(result.posts[2].topic).not.toMatch(/dup/);
  });

  it("falls back fully when nothing is usable", () => {
    const result = mergeAiItems(slots, input, []);
    expect(result.meta).toEqual({ source: "template", warnings: [WARN_UNAVAILABLE] });
  });

  it("clips over-long AI text to slot limits", () => {
    const long = aiItems.map((i) => ({ ...i, topic: "t".repeat(300), videoIdea: "v".repeat(900) }));
    const result = mergeAiItems(slots, input, long);
    expect(result.posts[0].topic.length).toBe(200);
    expect(result.posts[0].videoIdea.length).toBe(600);
  });
});

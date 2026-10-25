import { describe, expect, it } from "vitest";
import { buildSchedule } from "@/lib/generator/schedule";
import { PILLARS, type PlanInput } from "@/lib/validation";
import { fillWithTemplates, PATTERNS } from "./index";

const input: PlanInput = {
  brand: "Chai Point",
  niche: "Tea cafés",
  audience: "Office workers in Bengaluru",
  goal: "engagement",
  postsPerWeek: 7,
  startDate: "2026-11-01",
  platforms: ["instagram", "youtube"],
  useAi: false,
};

describe("PATTERNS", () => {
  it.each(PILLARS)("has 5 to 8 topic and video patterns for %s", (pillar) => {
    for (const list of [PATTERNS[pillar].topics, PATTERNS[pillar].videoIdeas]) {
      expect(list.length).toBeGreaterThanOrEqual(5);
      expect(list.length).toBeLessThanOrEqual(8);
    }
  });
});

describe("fillWithTemplates", () => {
  const filled = fillWithTemplates(buildSchedule(input), input);

  it("fills every slot and marks it as template", () => {
    for (const slot of filled) {
      expect(slot.topic.length).toBeGreaterThan(0);
      expect(slot.videoIdea.length).toBeGreaterThan(0);
      expect(slot.source).toBe("template");
    }
  });

  it("replaces every placeholder", () => {
    for (const slot of filled) expect(`${slot.topic} ${slot.videoIdea}`).not.toMatch(/\{\w+\}/);
  });

  it("gives adjacent posts different topics", () => {
    for (let i = 1; i < filled.length; i++) expect(filled[i].topic).not.toBe(filled[i - 1].topic);
  });

  it("is deterministic", () => {
    expect(fillWithTemplates(buildSchedule(input), input)).toEqual(filled);
  });

  it("clips long text to the slot limits", () => {
    const long = { ...input, niche: "x".repeat(80), audience: "y".repeat(300) };
    for (const slot of fillWithTemplates(buildSchedule(long), long)) {
      expect(slot.topic.length).toBeLessThanOrEqual(200);
      expect(slot.videoIdea.length).toBeLessThanOrEqual(600);
    }
  });
});

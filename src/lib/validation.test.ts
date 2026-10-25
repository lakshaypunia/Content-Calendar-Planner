import { describe, expect, it } from "vitest";
import { isRealDate, isStartDateInRange, PlanInput, Slot } from "./validation";

const today = new Date().toISOString().slice(0, 10);

const valid = {
  brand: "Chai Point",
  niche: "Tea cafés",
  audience: "Office workers in Bengaluru",
  goal: "leads",
  postsPerWeek: 3,
  startDate: today,
  platforms: ["instagram", "linkedin"],
};

describe("isRealDate", () => {
  it.each(["2026-01-31", "2028-02-29", "2026-12-31"])("accepts %s", (s) => {
    expect(isRealDate(s)).toBe(true);
  });

  it.each(["2026-02-30", "2027-02-29", "2026-13-01", "2026-00-10", "2026-1-01", "not-a-date"])(
    "rejects %s",
    (s) => {
      expect(isRealDate(s)).toBe(false);
    },
  );
});

describe("isStartDateInRange", () => {
  const now = new Date("2026-10-26T15:00:00Z");

  it("allows up to 7 days in the past and 365 days ahead", () => {
    expect(isStartDateInRange("2026-10-19", now)).toBe(true);
    expect(isStartDateInRange("2027-10-26", now)).toBe(true);
  });

  it("rejects dates outside the window", () => {
    expect(isStartDateInRange("2026-10-18", now)).toBe(false);
    expect(isStartDateInRange("2027-10-27", now)).toBe(false);
  });
});

describe("PlanInput", () => {
  it("parses a valid brief and defaults useAi to false", () => {
    const parsed = PlanInput.parse(valid);
    expect(parsed.useAi).toBe(false);
  });

  it("coerces postsPerWeek from a string", () => {
    expect(PlanInput.parse({ ...valid, postsPerWeek: "5" }).postsPerWeek).toBe(5);
  });

  it("rejects empty fields, impossible dates and zero platforms", () => {
    const result = PlanInput.safeParse({
      ...valid,
      brand: "  ",
      startDate: "2026-02-30",
      platforms: [],
    });
    expect(result.success).toBe(false);
    const paths = result.error!.issues.map((i) => i.path[0]);
    expect(paths).toEqual(expect.arrayContaining(["brand", "startDate", "platforms"]));
  });

  it("rejects postsPerWeek outside 1..14", () => {
    expect(PlanInput.safeParse({ ...valid, postsPerWeek: 0 }).success).toBe(false);
    expect(PlanInput.safeParse({ ...valid, postsPerWeek: 15 }).success).toBe(false);
  });
});

describe("Slot", () => {
  it("rejects an unknown platform", () => {
    const result = Slot.safeParse({
      position: 0,
      date: today,
      weekday: "Mon",
      platform: "tiktok",
      pillar: "educational",
      format: "Reel",
      postTime: "12:30",
      topic: "t",
      videoIdea: "v",
      source: "template",
    });
    expect(result.success).toBe(false);
  });
});

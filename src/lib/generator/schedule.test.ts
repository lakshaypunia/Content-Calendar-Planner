import { describe, expect, it } from "vitest";
import type { PlanInput } from "@/lib/validation";
import { buildSchedule, postingOffsets, rotatePlatforms, totalPosts } from "./schedule";

const base: PlanInput = {
  brand: "Chai Point",
  niche: "Tea cafés",
  audience: "Office workers",
  goal: "leads",
  postsPerWeek: 3,
  startDate: "2026-11-01",
  platforms: ["instagram", "linkedin", "x"],
  useAi: false,
};

describe("totalPosts", () => {
  it.each([
    [1, 4],
    [3, 13],
    [7, 30],
    [14, 60],
  ])("%i per week gives %i posts", (perWeek, expected) => {
    expect(totalPosts(perWeek)).toBe(expected);
    expect(buildSchedule({ ...base, postsPerWeek: perWeek })).toHaveLength(expected);
  });
});

describe("postingOffsets", () => {
  it("spreads posts across the 30 days starting on day 0", () => {
    const offsets = postingOffsets(13);
    expect(offsets[0]).toBe(0);
    expect(offsets.at(-1)).toBeLessThan(30);
    expect([...offsets].sort((a, b) => a - b)).toEqual(offsets);
  });
});

describe("rotatePlatforms", () => {
  it("rotates in the order given", () => {
    expect(rotatePlatforms([0, 2, 4, 6, 8], ["instagram", "linkedin", "x"])).toEqual([
      "instagram",
      "linkedin",
      "x",
      "instagram",
      "linkedin",
    ]);
  });

  it("never repeats a platform on the same day when another is free", () => {
    const schedule = buildSchedule({ ...base, postsPerWeek: 14, platforms: ["instagram", "linkedin"] });
    const byDay = new Map<string, string[]>();
    for (const slot of schedule) byDay.set(slot.date, [...(byDay.get(slot.date) ?? []), slot.platform]);
    for (const platforms of byDay.values()) expect(new Set(platforms).size).toBe(platforms.length);
  });

  it("uses the single platform for every post", () => {
    const schedule = buildSchedule({ ...base, platforms: ["youtube"] });
    expect(new Set(schedule.map((s) => s.platform))).toEqual(new Set(["youtube"]));
  });
});

describe("buildSchedule dates", () => {
  it("crosses month end in UTC", () => {
    const schedule = buildSchedule({ ...base, postsPerWeek: 7, startDate: "2026-01-31" });
    expect(schedule[0].date).toBe("2026-01-31");
    expect(schedule[1].date).toBe("2026-02-01");
    expect(schedule.at(-1)!.date).toBe("2026-03-01");
  });

  it("handles a leap-year start", () => {
    const schedule = buildSchedule({ ...base, postsPerWeek: 7, startDate: "2028-02-28" });
    expect(schedule.slice(0, 3).map((s) => s.date)).toEqual(["2028-02-28", "2028-02-29", "2028-03-01"]);
    expect(schedule[0].weekday).toBe("Mon");
  });

  it("is deterministic", () => {
    expect(buildSchedule(base)).toEqual(buildSchedule(base));
  });
});

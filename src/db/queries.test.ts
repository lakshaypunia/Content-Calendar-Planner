import { describe, expect, it } from "vitest";
import type { Slot } from "@/lib/validation";
import { planSource, planTitle } from "./queries";

const slot = { source: "template" } as Slot;

describe("planTitle", () => {
  it("formats month, year and goal", () => {
    expect(planTitle({ startDate: "2026-11-03", goal: "leads" })).toBe("Nov 2026 · Leads");
  });
});

describe("planSource", () => {
  it("derives the plan source from its posts", () => {
    const ai = { ...slot, source: "ai" } as Slot;
    expect(planSource([slot, slot])).toBe("template");
    expect(planSource([ai, ai])).toBe("ai");
    expect(planSource([ai, slot])).toBe("mixed");
    expect(planSource([ai, { ...slot, source: "edited" }])).toBe("edited");
  });
});

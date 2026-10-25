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
  it("keeps the generation source until a post is edited", () => {
    expect(planSource([slot, slot], "ai")).toBe("ai");
    expect(planSource([slot, { ...slot, source: "edited" }], "mixed")).toBe("edited");
  });
});

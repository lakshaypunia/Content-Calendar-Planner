import { describe, expect, it } from "vitest";
import { GOALS, PILLARS } from "@/lib/validation";
import { assignPillars } from "./pillars";
import { GOAL_WEIGHTS } from "./rules";

const TOTALS = [1, 4, 9, 13, 17, 26, 30, 43, 60];

describe("assignPillars", () => {
  it("weights for every goal sum to 100", () => {
    for (const goal of GOALS) {
      expect(PILLARS.reduce((acc, p) => acc + GOAL_WEIGHTS[goal][p], 0)).toBe(100);
    }
  });

  for (const goal of GOALS) {
    it(`keeps each pillar within one post of the target for ${goal}`, () => {
      for (const total of TOTALS) {
        const pillars = assignPillars(goal, total);
        expect(pillars).toHaveLength(total);
        for (const p of PILLARS) {
          const count = pillars.filter((x) => x === p).length;
          const target = (total * GOAL_WEIGHTS[goal][p]) / 100;
          expect(Math.abs(count - target), `${goal} ${total} ${p}`).toBeLessThanOrEqual(1);
        }
      }
    });

    it(`never opens with or repeats a promotional post for ${goal}`, () => {
      for (const total of TOTALS) {
        const pillars = assignPillars(goal, total);
        expect(pillars[0]).not.toBe("promotional");
        pillars.forEach((p, i) => {
          if (i > 0 && p === "promotional") expect(pillars[i - 1]).not.toBe("promotional");
        });
      }
    });
  }

  it("is deterministic", () => {
    expect(assignPillars("sales", 30)).toEqual(assignPillars("sales", 30));
  });
});

import { describe, expect, it } from "vitest";
import { buildSchedule } from "@/lib/generator/schedule";
import { fillWithTemplates } from "@/lib/templates";
import type { PlanInput } from "@/lib/validation";
import { initialPlannerState, plannerReducer } from "./planner-provider";

const input: PlanInput = {
  brand: "Chai Point",
  niche: "Tea",
  audience: "Office workers",
  goal: "leads",
  postsPerWeek: 3,
  startDate: "2026-11-01",
  platforms: ["instagram"],
  useAi: false,
};
const posts = fillWithTemplates(buildSchedule(input), input);

describe("plannerReducer", () => {
  it("moves through generate start and success", () => {
    const started = plannerReducer(initialPlannerState, { type: "generate/start", input });
    expect(started.status).toBe("generating");
    const done = plannerReducer(started, { type: "generate/success", posts, source: "template", warnings: [] });
    expect(done).toMatchObject({ status: "ready", isDirty: true, savedPlanId: null, source: "template" });
    expect(done.posts).toHaveLength(13);
  });

  it("marks an edited cell and the plan dirty", () => {
    const loaded = plannerReducer(initialPlannerState, { type: "plan/loaded", id: "p1", input, posts, source: "template" });
    expect(loaded.isDirty).toBe(false);
    const edited = plannerReducer(loaded, { type: "post/edit", position: 2, field: "topic", value: "New topic" });
    expect(edited.isDirty).toBe(true);
    expect(edited.posts[2]).toMatchObject({ topic: "New topic", source: "edited" });
    expect(edited.posts[1]).toBe(loaded.posts[1]);
  });

  it("ignores an edit that changes nothing", () => {
    const loaded = plannerReducer(initialPlannerState, { type: "plan/loaded", id: "p1", input, posts, source: "template" });
    const same = plannerReducer(loaded, { type: "post/edit", position: 0, field: "topic", value: posts[0].topic });
    expect(same).toBe(loaded);
  });

  it("clears dirty state after saving", () => {
    const done = plannerReducer(initialPlannerState, { type: "generate/success", posts, source: "template", warnings: [] });
    expect(plannerReducer(done, { type: "plan/saved", id: "p9" })).toMatchObject({ isDirty: false, savedPlanId: "p9" });
  });
});

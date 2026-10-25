import { buildSchedule } from "@/lib/generator/schedule";
import { fillWithTemplates } from "@/lib/templates";
import type { PlanInput, PlanSource, Slot } from "@/lib/validation";

export interface GenerateResult {
  posts: Slot[];
  meta: { source: Exclude<PlanSource, "edited">; warnings: string[] };
}

export async function generatePlan(input: PlanInput): Promise<GenerateResult> {
  const slots = buildSchedule(input);
  return { posts: fillWithTemplates(slots, input), meta: { source: "template", warnings: [] } };
}

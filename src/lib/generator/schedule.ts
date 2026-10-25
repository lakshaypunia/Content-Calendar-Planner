import type { PlanInput, Platform, Slot } from "@/lib/validation";
import { addDays, weekdayOf } from "./dates";

export const PLAN_DAYS = 30;

export function totalPosts(postsPerWeek: number): number {
  return Math.round((postsPerWeek * PLAN_DAYS) / 7);
}

/** Day offset from the start date for each post, spread evenly over 30 days. */
export function postingOffsets(total: number): number[] {
  return Array.from({ length: total }, (_, i) => Math.floor((i * PLAN_DAYS) / total));
}

/**
 * Round-robin over platforms in the order given. When several posts share a
 * day, skip platforms already used that day (unless every platform is used).
 */
export function rotatePlatforms(offsets: number[], platforms: readonly Platform[]): Platform[] {
  const result: Platform[] = [];
  let next = 0;
  let usedToday = new Set<Platform>();
  offsets.forEach((offset, i) => {
    if (i > 0 && offsets[i - 1] !== offset) usedToday = new Set();
    let pick = next;
    for (let step = 0; step < platforms.length; step++) {
      const candidate = (next + step) % platforms.length;
      if (!usedToday.has(platforms[candidate])) {
        pick = candidate;
        break;
      }
    }
    result.push(platforms[pick]);
    usedToday.add(platforms[pick]);
    next = (pick + 1) % platforms.length;
  });
  return result;
}

/** Pure and deterministic: same input, same schedule. Topic and video idea are left empty. */
export function buildSchedule(input: PlanInput): Slot[] {
  const offsets = postingOffsets(totalPosts(input.postsPerWeek));
  const platforms = rotatePlatforms(offsets, input.platforms);

  return offsets.map((offset, position) => {
    const date = addDays(input.startDate, offset);
    return {
      position,
      date,
      weekday: weekdayOf(date),
      platform: platforms[position],
      pillar: "educational",
      format: "",
      postTime: "",
      topic: "",
      videoIdea: "",
      source: "template",
    };
  });
}

import type { PlanInput, Platform, Slot } from "@/lib/validation";
import { addDays, isWeekend, weekdayOf } from "./dates";
import { assignPillars } from "./pillars";
import { BEST_TIMES, FORMATS } from "./rules";

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
  const pillars = assignPillars(input.goal, offsets.length);
  const formatUses = new Map<string, number>();
  const timeUses = new Map<string, number>();

  return offsets.map((offset, position) => {
    const date = addDays(input.startDate, offset);
    const platform = platforms[position];
    const pillar = pillars[position];

    const formatKey = `${platform}:${pillar}`;
    const formatIndex = formatUses.get(formatKey) ?? 0;
    formatUses.set(formatKey, formatIndex + 1);
    const formats = FORMATS[platform][pillar];

    const dayType = isWeekend(date) ? "weekend" : "weekday";
    const timeKey = `${platform}:${dayType}`;
    const timeIndex = timeUses.get(timeKey) ?? 0;
    timeUses.set(timeKey, timeIndex + 1);
    const times = BEST_TIMES[platform][dayType];

    return {
      position,
      date,
      weekday: weekdayOf(date),
      platform,
      pillar,
      format: formats[formatIndex % formats.length],
      postTime: times[timeIndex % times.length],
      topic: "",
      videoIdea: "",
      source: "template",
    };
  });
}

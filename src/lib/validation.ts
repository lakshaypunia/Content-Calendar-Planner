import { z } from "zod";

export const PLATFORMS = ["instagram", "linkedin", "facebook", "x", "youtube"] as const;
export const GOALS = ["awareness", "leads", "engagement", "sales"] as const;
export const PILLARS = ["educational", "behind_the_scenes", "social_proof", "promotional", "entertaining"] as const;
export const SLOT_SOURCES = ["ai", "template", "edited"] as const;
export const PLAN_SOURCES = ["ai", "template", "mixed", "edited"] as const;

export type Platform = (typeof PLATFORMS)[number];
export type Goal = (typeof GOALS)[number];
export type Pillar = (typeof PILLARS)[number];
export type SlotSource = (typeof SLOT_SOURCES)[number];
export type PlanSource = (typeof PLAN_SOURCES)[number];

const DAY_MS = 24 * 60 * 60 * 1000;

/** True only for a YYYY-MM-DD string that names a real calendar day (rejects 2026-02-30). */
export function isRealDate(s: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!match) return false;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** Start date may be at most 7 days in the past and 365 days ahead of `now`. */
export function isStartDateInRange(s: string, now: Date = new Date()): boolean {
  const start = Date.parse(`${s}T00:00:00Z`);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return start >= today - 7 * DAY_MS && start <= today + 365 * DAY_MS;
}

export const PlanInput = z.object({
  brand: z.string().trim().min(1, "Required").max(80),
  niche: z.string().trim().min(1, "Required").max(80),
  audience: z.string().trim().min(1, "Required").max(300),
  goal: z.enum(GOALS),
  postsPerWeek: z.coerce.number<number>().int().min(1, "At least 1").max(14, "At most 14"),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .refine(isRealDate, "Not a real date")
    .refine((s) => isStartDateInRange(s), "Must be within 7 days ago and a year ahead"),
  platforms: z.array(z.enum(PLATFORMS)).min(1, "Pick at least one platform"),
  useAi: z.boolean().default(false),
});
export type PlanInput = z.infer<typeof PlanInput>;
export type PlanInputForm = z.input<typeof PlanInput>;

export const Slot = z.object({
  position: z.number().int().min(0),
  date: z.string(),
  weekday: z.string(),
  platform: z.enum(PLATFORMS),
  pillar: z.enum(PILLARS),
  format: z.string(),
  postTime: z.string(),
  topic: z.string().max(200),
  videoIdea: z.string().max(600),
  source: z.enum(SLOT_SOURCES),
});
export type Slot = z.infer<typeof Slot>;

export const Slots = z.array(Slot).min(1).max(200);

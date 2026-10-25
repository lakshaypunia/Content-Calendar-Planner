import { aiConfig } from "@/lib/ai/config";
import { requestGemini, type AiItem } from "@/lib/ai/gemini";
import { buildSchedule } from "@/lib/generator/schedule";
import { fillWithTemplates, templateFor } from "@/lib/templates";
import type { PlanInput, PlanSource, Slot } from "@/lib/validation";

export interface GenerateResult {
  posts: Slot[];
  meta: { source: Exclude<PlanSource, "edited">; warnings: string[] };
}

export const WARN_NOT_CONFIGURED = "AI is not configured, used templates";
export const WARN_UNAVAILABLE = "AI unavailable, used templates";

const clip = (s: string, max: number) => (s.length <= max ? s : `${s.slice(0, max - 1).trimEnd()}…`);

/** Keeps items whose position exists exactly once and whose text is non-empty. */
function validItems(items: AiItem[], slots: Slot[]): Map<number, AiItem> {
  const counts = new Map<number, number>();
  for (const item of items) counts.set(item.position, (counts.get(item.position) ?? 0) + 1);
  const positions = new Set(slots.map((s) => s.position));
  const valid = new Map<number, AiItem>();
  for (const item of items) {
    if (!positions.has(item.position) || counts.get(item.position) !== 1) continue;
    if (!item.topic.trim() || !item.videoIdea.trim()) continue;
    valid.set(item.position, item);
  }
  return valid;
}

/** Merges AI text into the slots; templates fill any position the AI got wrong. */
export function mergeAiItems(slots: Slot[], input: PlanInput, items: AiItem[]): GenerateResult {
  const valid = validItems(items, slots);
  if (valid.size === 0) {
    return { posts: fillWithTemplates(slots, input), meta: { source: "template", warnings: [WARN_UNAVAILABLE] } };
  }

  const posts = slots.map((slot): Slot => {
    const item = valid.get(slot.position);
    if (!item) return { ...slot, ...templateFor(slot, input), source: "template" };
    return { ...slot, topic: clip(item.topic.trim(), 200), videoIdea: clip(item.videoIdea.trim(), 600), source: "ai" };
  });

  const missing = slots.length - valid.size;
  return missing === 0
    ? { posts, meta: { source: "ai", warnings: [] } }
    : {
        posts,
        meta: {
          source: "mixed",
          warnings: [`AI skipped ${missing} of ${slots.length} posts, templates filled them`],
        },
      };
}

/**
 * Every branch returns a complete plan:
 * AI off → templates; AI on without a key → templates + warning;
 * AI error → templates + warning; partial AI output → mixed.
 */
export async function generatePlan(input: PlanInput): Promise<GenerateResult> {
  const slots = buildSchedule(input);
  const templated = (warnings: string[]): GenerateResult => ({
    posts: fillWithTemplates(slots, input),
    meta: { source: "template", warnings },
  });

  if (!input.useAi) return templated([]);
  if (!aiConfig().available) return templated([WARN_NOT_CONFIGURED]);

  try {
    return mergeAiItems(slots, input, await requestGemini(slots, input));
  } catch (err) {
    console.error("[generate] Gemini failed, using templates:", err instanceof Error ? err.message : "unknown");
    return templated([WARN_UNAVAILABLE]);
  }
}

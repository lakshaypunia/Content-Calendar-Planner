import type { Goal, Pillar, Platform } from "@/lib/validation";

/** Target share (percent) of each content pillar per goal. Rows sum to 100. */
export const GOAL_WEIGHTS: Record<Goal, Record<Pillar, number>> = {
  awareness: { educational: 30, behind_the_scenes: 20, social_proof: 10, promotional: 10, entertaining: 30 },
  leads: { educational: 35, behind_the_scenes: 10, social_proof: 25, promotional: 20, entertaining: 10 },
  engagement: { educational: 20, behind_the_scenes: 25, social_proof: 15, promotional: 5, entertaining: 35 },
  sales: { educational: 20, behind_the_scenes: 10, social_proof: 30, promotional: 30, entertaining: 10 },
};

/**
 * Two format options per platform + pillar; the generator alternates between
 * them each time the pair repeats.
 */
export const FORMATS: Record<Platform, Record<Pillar, readonly [string, string]>> = {
  instagram: {
    educational: ["Carousel", "Reel"],
    behind_the_scenes: ["Reel", "Static + Story"],
    social_proof: ["Carousel", "Static + Story"],
    promotional: ["Reel", "Carousel"],
    entertaining: ["Reel", "Static + Story"],
  },
  linkedin: {
    educational: ["Document carousel", "Text + image"],
    behind_the_scenes: ["Short video", "Text + image"],
    social_proof: ["Text + image", "Document carousel"],
    promotional: ["Text + image", "Short video"],
    entertaining: ["Short video", "Text + image"],
  },
  facebook: {
    educational: ["Video", "Link post"],
    behind_the_scenes: ["Video", "Image post"],
    social_proof: ["Image post", "Video"],
    promotional: ["Link post", "Image post"],
    entertaining: ["Video", "Image post"],
  },
  x: {
    educational: ["Thread", "Text + image"],
    behind_the_scenes: ["Text + image", "Thread"],
    social_proof: ["Text + image", "Thread"],
    promotional: ["Text + image", "Thread"],
    entertaining: ["Text + image", "Thread"],
  },
  youtube: {
    educational: ["Short", "Short"],
    behind_the_scenes: ["Short", "Short"],
    social_proof: ["Short", "Short"],
    promotional: ["Short", "Short"],
    entertaining: ["Short", "Short"],
  },
};

/** Best posting times in the agency's local time (IST), cycled in order. */
export const BEST_TIMES: Record<Platform, { weekday: readonly string[]; weekend: readonly string[] }> = {
  instagram: { weekday: ["12:30", "19:00"], weekend: ["11:00"] },
  linkedin: { weekday: ["09:00", "12:30"], weekend: ["10:00"] },
  facebook: { weekday: ["13:00", "19:30"], weekend: ["12:00"] },
  x: { weekday: ["09:30", "17:00"], weekend: ["11:00"] },
  youtube: { weekday: ["18:00"], weekend: ["11:00"] },
};

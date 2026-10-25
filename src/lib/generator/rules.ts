import type { Goal, Pillar } from "@/lib/validation";

/** Target share (percent) of each content pillar per goal. Rows sum to 100. */
export const GOAL_WEIGHTS: Record<Goal, Record<Pillar, number>> = {
  awareness: { educational: 30, behind_the_scenes: 20, social_proof: 10, promotional: 10, entertaining: 30 },
  leads: { educational: 35, behind_the_scenes: 10, social_proof: 25, promotional: 20, entertaining: 10 },
  engagement: { educational: 20, behind_the_scenes: 25, social_proof: 15, promotional: 5, entertaining: 35 },
  sales: { educational: 20, behind_the_scenes: 10, social_proof: 30, promotional: 30, entertaining: 10 },
};

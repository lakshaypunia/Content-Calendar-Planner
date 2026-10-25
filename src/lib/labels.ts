import type { Goal, Pillar, Platform, PlanSource } from "@/lib/validation";

export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  x: "X",
  youtube: "YouTube",
};

export const PILLAR_LABELS: Record<Pillar, string> = {
  educational: "Educational",
  behind_the_scenes: "Behind the scenes",
  social_proof: "Social proof",
  promotional: "Promotional",
  entertaining: "Entertaining",
};

export const GOAL_LABELS: Record<Goal, string> = {
  awareness: "Awareness",
  leads: "Leads",
  engagement: "Engagement",
  sales: "Sales",
};

export const SOURCE_LABELS: Record<PlanSource, string> = {
  ai: "AI",
  template: "Template",
  mixed: "Mixed",
  edited: "Edited",
};

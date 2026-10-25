import { asc, desc, eq } from "drizzle-orm";
import { GOAL_LABELS } from "@/lib/labels";
import type { PlanInput, PlanSource, Slot } from "@/lib/validation";
import { weekdayOf } from "@/lib/generator/dates";
import { getDb, type Db } from "./client";
import { clients, plans, posts } from "./schema";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Nov 2026 · Leads" */
export function planTitle(input: Pick<PlanInput, "startDate" | "goal">): string {
  const [y, m] = input.startDate.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y} · ${GOAL_LABELS[input.goal]}`;
}

function postRows(planId: string, slots: Slot[]) {
  return slots.map((s) => ({
    planId,
    position: s.position,
    date: s.date,
    platform: s.platform,
    pillar: s.pillar,
    format: s.format,
    postTime: s.postTime,
    topic: s.topic,
    videoIdea: s.videoIdea,
    source: s.source,
  }));
}

/** Plan-level source: the generation source, or "edited" once any post was edited. */
export function planSource(slots: Slot[], generated: PlanSource): PlanSource {
  return slots.some((s) => s.source === "edited") ? "edited" : generated;
}

/**
 * Upserts the client by name, then writes plan + posts in one batch (Neon
 * runs a batch as a single transaction). The plan id is generated here so
 * both inserts fit in that batch.
 */
export async function savePlan(
  input: PlanInput,
  slots: Slot[],
  source: PlanSource,
  db: Db = getDb(),
): Promise<{ id: string }> {
  const [client] = await db
    .insert(clients)
    .values({ name: input.brand, niche: input.niche, audience: input.audience })
    .onConflictDoUpdate({ target: clients.name, set: { niche: input.niche, audience: input.audience } })
    .returning({ id: clients.id });

  const id = crypto.randomUUID();
  await db.batch([
    db.insert(plans).values({
      id,
      clientId: client.id,
      title: planTitle(input),
      goal: input.goal,
      postsPerWeek: input.postsPerWeek,
      startDate: input.startDate,
      platforms: input.platforms,
      useAi: input.useAi,
      source: planSource(slots, source),
    }),
    db.insert(posts).values(postRows(id, slots)),
  ]);
  return { id };
}

/** Replaces all posts of a plan atomically. Returns null when the plan does not exist. */
export async function updatePlanPosts(
  planId: string,
  slots: Slot[],
  db: Db = getDb(),
): Promise<{ updatedAt: Date } | null> {
  const existing = await db.query.plans.findFirst({ where: eq(plans.id, planId), columns: { source: true } });
  if (!existing) return null;

  const updatedAt = new Date();
  await db.batch([
    db.delete(posts).where(eq(posts.planId, planId)),
    db.insert(posts).values(postRows(planId, slots)),
    db
      .update(plans)
      .set({ updatedAt, source: planSource(slots, existing.source) })
      .where(eq(plans.id, planId)),
  ]);
  return { updatedAt };
}

export interface ClientWithPlans {
  id: string;
  name: string;
  plans: { id: string; title: string; createdAt: string }[];
}

export async function listClientsWithPlans(db: Db = getDb()): Promise<ClientWithPlans[]> {
  const rows = await db.query.clients.findMany({
    orderBy: [asc(clients.name)],
    columns: { id: true, name: true },
    with: {
      plans: { columns: { id: true, title: true, createdAt: true }, orderBy: [desc(plans.createdAt)] },
    },
  });
  return rows
    .filter((c) => c.plans.length > 0)
    .map((c) => ({
      ...c,
      plans: c.plans.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() })),
    }));
}

export interface StoredPlan {
  input: PlanInput;
  posts: Slot[];
  source: PlanSource;
}

export async function getPlan(planId: string, db: Db = getDb()): Promise<StoredPlan | null> {
  const plan = await db.query.plans.findFirst({
    where: eq(plans.id, planId),
    with: { client: true, posts: { orderBy: [asc(posts.position)] } },
  });
  if (!plan) return null;
  return {
    input: {
      brand: plan.client.name,
      niche: plan.client.niche,
      audience: plan.client.audience,
      goal: plan.goal,
      postsPerWeek: plan.postsPerWeek,
      startDate: plan.startDate,
      platforms: plan.platforms,
      useAi: plan.useAi,
    },
    posts: plan.posts.map((p) => ({
      position: p.position,
      date: p.date,
      weekday: weekdayOf(p.date),
      platform: p.platform as Slot["platform"],
      pillar: p.pillar as Slot["pillar"],
      format: p.format,
      postTime: p.postTime,
      topic: p.topic,
      videoIdea: p.videoIdea,
      source: p.source === "mixed" ? "template" : p.source,
    })),
    source: plan.source,
  };
}

/** Deletes the plan; its posts cascade. The client row stays for the next plan. */
export async function deletePlan(planId: string, db: Db = getDb()): Promise<boolean> {
  const deleted = await db.delete(plans).where(eq(plans.id, planId)).returning({ id: plans.id });
  return deleted.length > 0;
}

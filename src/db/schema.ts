import { boolean, date, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { Platform } from "@/lib/validation";

export const goalEnum = pgEnum("goal", ["awareness", "leads", "engagement", "sales"]);
export const sourceEnum = pgEnum("content_source", ["ai", "template", "mixed", "edited"]);

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  niche: text("niche").notNull(),
  audience: text("audience").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const plans = pgTable(
  "plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    title: text("title").notNull(), // "Nov 2026 · Leads"
    goal: goalEnum("goal").notNull(),
    postsPerWeek: integer("posts_per_week").notNull(),
    startDate: date("start_date").notNull(),
    platforms: jsonb("platforms").$type<Platform[]>().notNull(),
    useAi: boolean("use_ai").notNull(),
    source: sourceEnum("source").notNull(), // ai | template | mixed
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("plans_client_created_idx").on(t.clientId, t.createdAt)],
);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    date: date("date").notNull(),
    platform: text("platform").notNull(),
    pillar: text("pillar").notNull(),
    format: text("format").notNull(),
    postTime: text("post_time").notNull(), // "18:30"
    topic: text("topic").notNull(),
    videoIdea: text("video_idea").notNull(),
    source: sourceEnum("source").notNull(), // ai | template | edited
  },
  (t) => [index("posts_plan_position_idx").on(t.planId, t.position)],
);

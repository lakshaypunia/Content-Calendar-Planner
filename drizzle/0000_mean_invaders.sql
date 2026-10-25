CREATE TYPE "public"."goal" AS ENUM('awareness', 'leads', 'engagement', 'sales');--> statement-breakpoint
CREATE TYPE "public"."content_source" AS ENUM('ai', 'template', 'mixed', 'edited');--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"niche" text NOT NULL,
	"audience" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clients_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"title" text NOT NULL,
	"goal" "goal" NOT NULL,
	"posts_per_week" integer NOT NULL,
	"start_date" date NOT NULL,
	"platforms" jsonb NOT NULL,
	"use_ai" boolean NOT NULL,
	"source" "content_source" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"date" date NOT NULL,
	"platform" text NOT NULL,
	"pillar" text NOT NULL,
	"format" text NOT NULL,
	"post_time" text NOT NULL,
	"topic" text NOT NULL,
	"video_idea" text NOT NULL,
	"source" "content_source" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "plans_client_created_idx" ON "plans" USING btree ("client_id","created_at");--> statement-breakpoint
CREATE INDEX "posts_plan_position_idx" ON "posts" USING btree ("plan_id","position");
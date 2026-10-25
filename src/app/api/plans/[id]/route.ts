import type { NextRequest } from "next/server";
import { z } from "zod";
import { deletePlan, getPlan, updatePlanPosts } from "@/db/queries";
import { jsonError, readJson, serverError, validationError } from "@/lib/api";
import { Slots } from "@/lib/validation";

type Ctx = RouteContext<"/api/plans/[id]">;

const PlanId = z.uuid();
const UpdateBody = z.object({ posts: Slots });

async function planId(ctx: Ctx) {
  return PlanId.safeParse((await ctx.params).id);
}

export async function GET(_request: NextRequest, ctx: Ctx) {
  const id = await planId(ctx);
  if (!id.success) return jsonError(400, "validation_error", "Plan id must be a UUID");
  try {
    const plan = await getPlan(id.data);
    return plan ? Response.json(plan) : jsonError(404, "not_found", "Plan not found");
  } catch (err) {
    return serverError(err, "get plan");
  }
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const id = await planId(ctx);
  if (!id.success) return jsonError(400, "validation_error", "Plan id must be a UUID");

  const body = await readJson(request);
  if (!body.ok) return body.response;
  const parsed = UpdateBody.safeParse(body.data);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const result = await updatePlanPosts(id.data, parsed.data.posts);
    return result
      ? Response.json({ updatedAt: result.updatedAt.toISOString() })
      : jsonError(404, "not_found", "Plan not found");
  } catch (err) {
    return serverError(err, "update plan");
  }
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  const id = await planId(ctx);
  // A malformed id can never exist, so it is a 404 like any missing plan.
  if (!id.success) return jsonError(404, "not_found", "Plan not found");
  try {
    return (await deletePlan(id.data))
      ? new Response(null, { status: 204 })
      : jsonError(404, "not_found", "Plan not found");
  } catch (err) {
    return serverError(err, "delete plan");
  }
}

import { readJson, validationError } from "@/lib/api";
import { generatePlan } from "@/lib/plan/generate";
import { PlanInput } from "@/lib/validation";

// No `runtime` export: with cacheComponents enabled Next 16 rejects it and
// always uses the Node.js runtime.
export const maxDuration = 60;

/** Builds a plan without touching the database. */
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body.ok) return body.response;

  const parsed = PlanInput.safeParse(body.data);
  if (!parsed.success) return validationError(parsed.error);

  return Response.json(await generatePlan(parsed.data));
}

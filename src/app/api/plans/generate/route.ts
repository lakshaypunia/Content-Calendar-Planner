import { jsonError, readJson, validationError } from "@/lib/api";
import { generatePlan } from "@/lib/plan/generate";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
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

  // Only AI requests cost money, so only they are limited.
  if (parsed.data.useAi) {
    const limit = checkRateLimit(clientIp(request));
    if (!limit.ok) {
      return jsonError(429, "rate_limited", "Too many AI requests, try again in a minute", undefined, {
        headers: { "retry-after": String(limit.retryAfterSec) },
      });
    }
  }

  return Response.json(await generatePlan(parsed.data));
}

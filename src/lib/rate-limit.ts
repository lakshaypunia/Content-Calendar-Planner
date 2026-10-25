/**
 * Fixed-window, in-memory limiter keyed by client IP.
 * NOTE: per server instance only. On Vercel each lambda instance keeps its
 * own counts, so this is a cost guard, not a hard global limit.
 */
import { serverEnv } from "@/lib/env";

const WINDOW_MS = 60_000;
const buckets = new Map<string, { count: number; resetAt: number }>();

export function limitPerMinute(): number {
  return Number(serverEnv("RATE_LIMIT_PER_MIN")) || 10;
}

export function checkRateLimit(
  key: string,
  limit = limitPerMinute(),
  now = Date.now(),
): { ok: true } | { ok: false; retryAfterSec: number } {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    if (buckets.size > 10_000) sweep(now);
    return { ok: true };
  }
  if (bucket.count >= limit) return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  bucket.count++;
  return { ok: true };
}

function sweep(now: number) {
  for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

/** Test helper. */
export function resetRateLimits() {
  buckets.clear();
}

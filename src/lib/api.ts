import type { z } from "zod";

export type ErrorCode = "validation_error" | "bad_json" | "not_found" | "rate_limited" | "internal_error";

export interface ApiError {
  error: { code: ErrorCode; message: string; fields?: Record<string, string> };
}

export function jsonError(
  status: number,
  code: ErrorCode,
  message: string,
  fields?: Record<string, string>,
  init?: ResponseInit,
): Response {
  const body: ApiError = { error: { code, message, ...(fields ? { fields } : {}) } };
  return Response.json(body, { ...init, status });
}

/** First message per top-level field, e.g. { brand: "Required" }. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.map(String).join(".") : "_";
    fields[key] ??= issue.message;
  }
  return fields;
}

export function validationError(error: z.ZodError): Response {
  return jsonError(400, "validation_error", "Some fields are invalid", fieldErrors(error));
}

/** Maps unexpected failures (e.g. database down or not configured) to a 500 without leaking details. */
export function serverError(err: unknown, context: string): Response {
  const message = err instanceof Error ? err.message : "unknown";
  console.error(`[${context}]`, message);
  const notConfigured = message.includes("DATABASE_URL");
  return jsonError(
    500,
    "internal_error",
    notConfigured ? "Database is not configured" : "Something went wrong, please try again",
  );
}

/** Parses the JSON body, or returns a 400 response. */
export async function readJson(request: Request): Promise<{ ok: true; data: unknown } | { ok: false; response: Response }> {
  try {
    return { ok: true, data: await request.json() };
  } catch {
    return { ok: false, response: jsonError(400, "bad_json", "Body must be valid JSON") };
  }
}

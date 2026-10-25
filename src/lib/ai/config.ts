import { readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import type { GoogleGenAIOptions } from "@google/genai";
import { serverEnv } from "@/lib/env";

interface ServiceAccount {
  project_id: string;
  client_email: string;
  private_key: string;
}

export interface AiConfig {
  available: boolean;
  /** "api-key" = Gemini API (AI Studio key); "vertex" = Vertex AI with a service account. */
  mode: "api-key" | "vertex" | null;
  model: string;
  timeoutMs: number;
  clientOptions: GoogleGenAIOptions | null;
}

/**
 * Service account JSON, from GOOGLE_CREDENTIALS_JSON (the file contents; use
 * this on Vercel) or, outside production builds only, GOOGLE_APPLICATION_CREDENTIALS
 * (a file path). The file read is compiled out of production so Vercel's file
 * tracer does not pull the whole project (or a local secrets.json) into the bundle.
 */
function serviceAccount(): ServiceAccount | null {
  let raw = serverEnv("GOOGLE_CREDENTIALS_JSON")?.trim();
  try {
    if (!raw && process.env.NODE_ENV !== "production") {
      const path = serverEnv("GOOGLE_APPLICATION_CREDENTIALS")?.trim();
      if (path) raw = readFileSync(isAbsolute(path) ? path : join(process.cwd(), path), "utf8");
    }
    if (!raw) return null;
    const json = JSON.parse(raw) as Partial<ServiceAccount>;
    if (!json.project_id || !json.client_email || !json.private_key) throw new Error("missing fields");
    return json as ServiceAccount;
  } catch (err) {
    console.error("[ai] Ignoring Google service account credentials:", (err as Error).message);
    return null;
  }
}

/** Server-only view of the AI settings; the model id stays in env because Google retires ids often. */
export function aiConfig(): AiConfig {
  const model = serverEnv("GEMINI_MODEL")?.trim() || "gemini-3.5-flash-lite";
  const timeoutMs = Number(serverEnv("AI_TIMEOUT_MS")) || 20_000;

  const apiKey = serverEnv("GEMINI_API_KEY")?.trim();
  if (apiKey) return { available: true, mode: "api-key", model, timeoutMs, clientOptions: { apiKey } };

  const account = serviceAccount();
  if (account) {
    return {
      available: true,
      mode: "vertex",
      model,
      timeoutMs,
      clientOptions: {
        vertexai: true,
        project: serverEnv("GOOGLE_CLOUD_PROJECT")?.trim() || account.project_id,
        location: serverEnv("GOOGLE_CLOUD_LOCATION")?.trim() || "global",
        googleAuthOptions: {
          credentials: { client_email: account.client_email, private_key: account.private_key },
          scopes: ["https://www.googleapis.com/auth/cloud-platform"],
        },
      },
    };
  }

  return { available: false, mode: null, model, timeoutMs, clientOptions: null };
}

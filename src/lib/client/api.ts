import type { ApiError } from "@/lib/api";

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

/** fetch + JSON with the API's error shape turned into ApiClientError. */
export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const err = (body as ApiError | null)?.error;
    throw new ApiClientError(res.status, err?.code ?? "unknown", err?.message ?? "Something went wrong", err?.fields);
  }
  return body as T;
}

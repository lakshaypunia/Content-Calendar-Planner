/** Server-only view of the AI settings; the model id stays in env because Google retires ids often. */
export function aiConfig() {
  const apiKey = process.env.GEMINI_API_KEY?.trim() ?? "";
  return {
    apiKey,
    available: apiKey.length > 0,
    model: process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash-lite",
    timeoutMs: Number(process.env.AI_TIMEOUT_MS) || 20_000,
  };
}

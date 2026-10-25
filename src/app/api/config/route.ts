import { connection } from "next/server";
import { aiConfig } from "@/lib/ai/config";

export async function GET() {
  // Read env at request time; otherwise Cache Components would prerender the value at build.
  await connection();
  return Response.json({ aiAvailable: aiConfig().available });
}

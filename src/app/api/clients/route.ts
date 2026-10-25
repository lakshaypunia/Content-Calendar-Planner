import { connection } from "next/server";
import { listClientsWithPlans } from "@/db/queries";
import { serverError } from "@/lib/api";

export async function GET() {
  await connection();
  try {
    return Response.json(await listClientsWithPlans());
  } catch (err) {
    return serverError(err, "list clients");
  }
}

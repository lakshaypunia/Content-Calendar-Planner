import { z } from "zod";
import { savePlan } from "@/db/queries";
import { readJson, serverError, validationError } from "@/lib/api";
import { PlanInput, Slots } from "@/lib/validation";

const SaveBody = z.object({ input: PlanInput, posts: Slots });

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body.ok) return body.response;

  const parsed = SaveBody.safeParse(body.data);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const { id } = await savePlan(parsed.data.input, parsed.data.posts);
    return Response.json({ id }, { status: 201 });
  } catch (err) {
    return serverError(err, "save plan");
  }
}

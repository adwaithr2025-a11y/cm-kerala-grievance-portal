import { runSeed } from "@/lib/seed";
import { prisma } from "@/lib/db";
import { handleRouteError, jsonError, jsonOk } from "@/lib/api";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    if (process.env.ALLOW_DEMO_SEED !== "true") {
      return jsonError("Demo seeding is disabled.", 403);
    }
    const expected = process.env.SEED_TOKEN?.trim();
    if (!expected) {
      return jsonError("SEED_TOKEN is not configured on the server.", 500);
    }
    const provided = request.headers.get("x-seed-token")?.trim();
    if (!provided || provided !== expected) {
      return jsonError("Invalid seed token.", 401);
    }

    const result = await runSeed(prisma);
    return jsonOk(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

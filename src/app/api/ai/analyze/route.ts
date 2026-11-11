import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/auth";
import { handleRouteError, jsonError, jsonOk, readJson } from "@/lib/api";
import { aiAnalyzeSchema } from "@/lib/validation";
import { analyzeGrievance } from "@/lib/ai";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const user = await requireApiUser(["CITIZEN", "CMO_ADMIN"]);
    const limit = rateLimit(`ai:${user.id}`, 30, 60 * 60 * 1000);
    if (!limit.ok) {
      return jsonError("AI assistant limit reached for this hour. You can still submit the grievance manually.", 429);
    }

    const input = aiAnalyzeSchema.parse(await readJson(request));

    const since = new Date();
    since.setDate(since.getDate() - 180);

    const candidates = await prisma.grievance.findMany({
      where: {
        createdAt: { gte: since },
        ...(input.district ? { district: input.district } : {}),
        status: { not: "RESOLVED" },
      },
      orderBy: { createdAt: "desc" },
      take: 80,
      select: {
        referenceNo: true,
        subject: true,
        description: true,
        category: true,
        status: true,
        createdAt: true,
      },
    });

    const analysis = await analyzeGrievance(
      {
        subject: input.subject,
        description: input.description,
        district: input.district,
        category: input.category,
      },
      candidates,
    );

    return jsonOk({ analysis });
  } catch (error) {
    return handleRouteError(error);
  }
}

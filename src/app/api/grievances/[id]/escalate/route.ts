import { requireApiUser } from "@/lib/auth";
import { handleRouteError, jsonOk, readJson } from "@/lib/api";
import { escalateSchema } from "@/lib/validation";
import { escalateGrievance } from "@/lib/grievance-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireApiUser(["CMO_ADMIN"]);
    const { id } = await params;
    const input = escalateSchema.parse(await readJson(request));
    const result = await escalateGrievance(user, id, input.reason);
    return jsonOk({
      ...result,
      message: `Escalated to Level ${result.level}. Priority is now ${result.priority}.`,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

import { requireApiUser } from "@/lib/auth";
import { handleRouteError, jsonOk, readJson } from "@/lib/api";
import { remarkSchema } from "@/lib/validation";
import { addRemark } from "@/lib/grievance-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireApiUser(["CMO_ADMIN", "OFFICER"]);
    const { id } = await params;
    const input = remarkSchema.parse(await readJson(request));
    const result = await addRemark(user, id, input.note, input.visibleToCitizen);
    return jsonOk({
      ...result,
      message: result.internal ? "Internal note added." : "Remark shared with the citizen.",
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

import { requireApiUser } from "@/lib/auth";
import { handleRouteError, jsonOk, readJson } from "@/lib/api";
import { assignSchema } from "@/lib/validation";
import { assignGrievance } from "@/lib/grievance-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireApiUser(["CMO_ADMIN"]);
    const { id } = await params;
    const input = assignSchema.parse(await readJson(request));
    const result = await assignGrievance(user, id, {
      departmentId: input.departmentId,
      officerId: input.officerId || undefined,
      note: input.note || undefined,
      dueAt: input.dueAt || undefined,
    });
    return jsonOk({ ...result, message: "Grievance forwarded successfully." });
  } catch (error) {
    return handleRouteError(error);
  }
}

import { requireApiUser } from "@/lib/auth";
import { handleRouteError, jsonOk, readJson } from "@/lib/api";
import { statusUpdateSchema } from "@/lib/validation";
import { updateGrievanceStatus } from "@/lib/grievance-service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireApiUser(["CMO_ADMIN", "OFFICER"]);
    const { id } = await params;
    const input = statusUpdateSchema.parse(await readJson(request));
    await updateGrievanceStatus(user, id, input.status, input.note || undefined);
    return jsonOk({ message: "Status updated successfully." });
  } catch (error) {
    return handleRouteError(error);
  }
}

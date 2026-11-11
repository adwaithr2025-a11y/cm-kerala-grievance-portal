import { requireApiUser } from "@/lib/auth";
import { handleRouteError, jsonOk, readJson } from "@/lib/api";
import { reopenSchema } from "@/lib/validation";
import { reopenByCitizen } from "@/lib/grievance-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireApiUser(["CITIZEN"]);
    const { id } = await params;
    const input = reopenSchema.parse(await readJson(request));
    await reopenByCitizen(user, id, input.reason);
    return jsonOk({
      message: "Grievance reopened. The CMO office will review your reason and take further action.",
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
